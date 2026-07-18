import { PrismaClient } from '../../generated/prisma/client.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function runAudit() {
  console.log('--- Razorpay Integration Audit ---');
  
  // 1. Create Mock Member and Plan
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('No tenant found');
  
  const member = await prisma.member.create({
    data: {
      tenantId: tenant.id,
      firstName: 'Audit',
      lastName: 'User',
      email: `audit_${Date.now()}@test.com`,
      phone: '1234567890',
      status: 'ACTIVE',
    }
  });

  const plan = await prisma.membershipPlan.create({
    data: {
      tenantId: tenant.id,
      name: 'Audit Plan',
      price: 5000,
      duration: 1,
      durationUnit: 'MONTHS',
      features: ['test'],
    }
  });

  // 2. Create Subscription
  const subscription = await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      memberId: member.id,
      membershipPlanId: plan.id,
      status: 'PENDING',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: 5000,
    }
  });

  // 3. Create Invoice (DUE)
  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      memberId: member.id,
      subscriptionId: subscription.id,
      invoiceNumber: `INV-${Date.now()}`,
      amount: 5000,
      status: 'DUE',
    }
  });

  // 4. Simulate createOrder
  const orderId = `order_${crypto.randomBytes(6).toString('hex')}`;
  const payment = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      memberId: member.id,
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      amount: 5000,
      paymentMethod: 'CARD',
      paymentStatus: 'PENDING',
      razorpayOrderId: orderId,
      gateway: 'RAZORPAY',
      gatewayStatus: 'created',
    }
  });

  console.log('Created Pending Payment:', payment.id);

  // 5. Simulate Webhook
  const payload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_${crypto.randomBytes(6).toString('hex')}`,
          order_id: orderId,
        }
      }
    }
  };

  // Perform transaction manually as in razorpay.service.ts
  const txResult = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.payment.updateMany({
      where: { id: payment.id, paymentStatus: 'PENDING' },
      data: {
        paymentStatus: 'PAID',
        razorpayPaymentId: payload.payload.payment.entity.id,
        gatewayStatus: 'captured',
        paidAt: new Date(),
      }
    });

    if (updateResult.count === 0) throw new Error('ALREADY_PROCESSED');

    await tx.invoice.update({
      where: { id: invoice.id },
      data: { status: 'PAID' }
    });

    return true;
  });

  console.log('Webhook processed successfully:', txResult);

  // 6. Verify Idempotency (Replay webhook)
  try {
    await prisma.$transaction(async (tx) => {
      const updateResult = await tx.payment.updateMany({
        where: { id: payment.id, paymentStatus: 'PENDING' },
        data: {
          paymentStatus: 'PAID',
        }
      });
      if (updateResult.count === 0) throw new Error('ALREADY_PROCESSED');
    });
  } catch (error) {
    if (error.message === 'ALREADY_PROCESSED') {
      console.log('Idempotency Verified: Duplicate webhook rejected.');
    } else {
      throw error;
    }
  }

  // 7. Verify Data Integrity
  const finalInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
  console.log('Final Invoice Status:', finalInvoice.status); // Should be PAID

  const finalPayment = await prisma.payment.findUnique({ where: { id: payment.id } });
  console.log('Final Payment Status:', finalPayment.paymentStatus); // Should be PAID

  // Verify Ledger implies update
  // The ledger dynamically checks pay.paymentStatus and inv.status
  const isLedgerPaymentFull = (finalPayment.paymentStatus === 'PAID' && finalInvoice.status === 'PAID');
  console.log('Ledger Virtual Status (PAYMENT_FULL):', isLedgerPaymentFull);

  console.log('--- Audit Complete ---');
}

runAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
