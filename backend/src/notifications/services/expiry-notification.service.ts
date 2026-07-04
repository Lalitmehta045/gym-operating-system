import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IntegrationSettingsService } from '../../settings/services/integration-settings.service.js';
import { SubscriptionStatus } from '../../../generated/prisma/client.js';

@Injectable()
export class ExpiryNotificationService {
  private readonly logger = new Logger(ExpiryNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationSettingsService: IntegrationSettingsService,
  ) {}

  // Called by cron job every day at 9:00 AM IST
  async processExpiringSubscriptions(): Promise<void> {
    this.logger.log('Running expiry notification cron job...');

    // 1. Batch fetch ALL active tenants
    const tenants = await this.prisma.tenant.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true }
    });
    const tenantIds = tenants.map(t => t.id);

    if (tenantIds.length === 0) return;

    // Batch fetch all integration settings
    const allSettings = await this.prisma.tenantIntegrationSettings.findMany({
      where: { tenantId: { in: tenantIds } }
    });
    const settingsMap = new Map(allSettings.map(s => [s.tenantId, s]));

    // 2. Build OR conditions to batch fetch expiring subscriptions
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    const orConditions: any[] = [];

    for (const tenantId of tenantIds) {
      const settings = settingsMap.get(tenantId);
      // Skip if WhatsApp not configured or disabled
      if (!settings?.whatsappEnabled || !settings?.whatsappPhoneNumberId || !settings?.whatsappAccessToken) {
        continue;
      }
      
      const notifyDays = settings.notifyExpiringDays || 7;
      const targetDate = new Date(nowIST);
      targetDate.setDate(targetDate.getDate() + notifyDays);
      const targetDateStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const targetDateEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

      orConditions.push({
        tenantId,
        endDate: { gte: targetDateStart, lte: targetDateEnd }
      });
    }

    if (orConditions.length === 0) {
      this.logger.log('No tenants have WhatsApp configured for expiry notifications.');
      return;
    }

    const expiringSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        deletedAt: null,
        OR: orConditions
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, phone: true }
        },
        membershipPlan: {
          select: { name: true, price: true }
        }
      }
    });

    const expiringSubsWithPhone = expiringSubscriptions.filter(s => s.member?.phone);
    if (expiringSubsWithPhone.length === 0) {
      this.logger.log('No expiring subscriptions with phone numbers found.');
      return;
    }

    this.logger.log(`Found ${expiringSubsWithPhone.length} expiring subscriptions across all tenants`);

    // 3. Batch fetch notification logs for all relevant subscriptions
    const startOfDay = new Date(nowIST);
    startOfDay.setHours(0, 0, 0, 0);

    const memberIds = expiringSubsWithPhone.map(s => s.memberId);

    const logs = await this.prisma.whatsAppLog.findMany({
      where: {
        memberId: { in: memberIds },
        type: 'EXPIRING_REMINDER',
        createdAt: { gte: startOfDay }
      },
      select: { memberId: true }
    });
    
    const logSet = new Set(logs.map(l => l.memberId));

    // 4. Execute individual notification jobs in memory
    const jobs = expiringSubsWithPhone
      .filter(sub => !logSet.has(sub.memberId))
      .map(sub => ({
        tenantId: sub.tenantId,
        subscription: sub,
        settings: settingsMap.get(sub.tenantId)
      }));

    if (jobs.length > 0) {
      this.logger.log(`Processing ${jobs.length} expiry notifications`);
      Promise.allSettled(
        jobs.map(job => 
          this.sendExpiryNotification(job.tenantId, job.subscription, job.settings)
        )
      ).then(results => {
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          this.logger.error(`Failed to send ${failed.length} expiry notifications`);
        }
      });
    } else {
      this.logger.log('All expiring subscriptions have already been notified today.');
    }
  }

  private async sendExpiryNotification(
    tenantId: string,
    subscription: any,
    settings: any,
  ): Promise<void> {
    const member = subscription.member;
    if (!member?.phone) return;

    // Generate Razorpay payment link if Razorpay enabled
    let paymentLink: string | null = null;
    if (settings.razorpayEnabled && settings.razorpayKeyId && settings.razorpayKeySecret) {
      try {
        paymentLink = await this.createRazorpayPaymentLink(
          settings,
          subscription,
          member,
          tenantId
        );
      } catch (err) {
        this.logger.error('Failed to create Razorpay payment link:', err);
      }
    }

    // Format phone number for WhatsApp (add 91 prefix for India)
    const phone = member.phone.replace(/\D/g, '');
    const whatsappPhone = phone.startsWith('91') ? phone : `91${phone}`;

    // Build message
    const planName = subscription.membershipPlan?.name || 'membership';
    const expiryDate = new Date(subscription.endDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const amount = Number(subscription.membershipPlan?.price || subscription.amount);

    let message = `Hi ${member.firstName}! \n\n`;
    message += `Your *${planName}* membership is expiring on *${expiryDate}*.\n\n`;
    message += `Renew now to continue enjoying our services! \n\n`;
    
    if (paymentLink) {
      message += ` *Pay ₹${amount.toLocaleString('en-IN')} online:*\n${paymentLink}\n\n`;
    }
    
    message += `_Thank you for being a valued member!_`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let response: Response;

    try {
      response = await fetch(
        `https://graph.facebook.com/v19.0/${settings.whatsappPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${settings.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: whatsappPhone,
            type: 'text',
            text: { body: message },
          }),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    const result = await response.json();

    // Log the WhatsApp message
    await this.prisma.whatsAppLog.create({
      data: {
        tenantId,
        memberId: member.id,
        messageId: result?.messages?.[0]?.id || null,
        type: 'EXPIRING_REMINDER',
        status: response.ok ? 'SENT' : 'FAILED',
        metadata: {
          subscriptionId: subscription.id,
          expiryDate: subscription.endDate,
          paymentLink,
          response: result,
        }
      }
    });

    this.logger.log(
      `Sent expiry notification to ${member.firstName} (${whatsappPhone}): ${response.ok ? 'SUCCESS' : 'FAILED'}`
    );
  }

  private async createRazorpayPaymentLink(
    settings: any,
    subscription: any,
    member: any,
    tenantId: string,
  ): Promise<string | null> {
    const Razorpay = (await import('razorpay')).default;
    
    const razorpay = new Razorpay({
      key_id: settings.razorpayKeyId,
      key_secret: settings.razorpayKeySecret,
    });

    const amount = Number(subscription.membershipPlan?.price || subscription.amount);
    const planName = subscription.membershipPlan?.name || 'Membership Renewal';
    const phone = member.phone.replace(/\D/g, '');

    const paymentLinkData = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      description: `${planName} Renewal`,
      customer: {
        name: `${member.firstName} ${member.lastName}`,
        contact: phone.startsWith('91') ? phone : `91${phone}`,
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      notes: {
        tenantId,
        memberId: member.id,
        subscriptionId: subscription.id,
        type: 'MEMBERSHIP_RENEWAL',
      },
      callback_url: `${process.env.FRONTEND_URL}/payment/success`,
      callback_method: 'get',
    });

    return (paymentLinkData as any).short_url;
  }
}
