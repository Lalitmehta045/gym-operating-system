import 'dotenv/config';
import { PrismaClient, PaymentStatus, SubscriptionStatus } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const memberId = '64f8d111-e832-4f84-944b-5a636bf8030f';

  // Get pending subscription
  const sub = await prisma.subscription.findFirst({
    where: { memberId, status: SubscriptionStatus.PENDING, deletedAt: null }
  });

  if (!sub) {
    console.log('No pending subscription found for Lalit Mehta');
    return;
  }

  // Get recent payments
  const payments = await prisma.payment.findMany({
    where: { memberId, paymentStatus: PaymentStatus.PAID, deletedAt: null },
    orderBy: { createdAt: 'desc' }
  });

  if (payments.length >= 2) {
    // There are at least two payments. 
    // The most recent one is index 0. The older one is index 1.
    // Let's link the OLDER one (index 1) to the subscription and delete the NEWER one (index 0).
    // (Actually both were created today by accident)
    
    // 1. Link older payment
    await prisma.payment.update({
      where: { id: payments[1].id },
      data: { subscriptionId: sub.id }
    });
    
    // 2. Activate subscription
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.ACTIVE }
    });

    // 3. Delete duplicate payment and its invoice
    // First, find the invoice for the duplicate payment
    const invoice = await prisma.invoice.findFirst({
      where: { payments: { some: { id: payments[0].id } } }
    });
    
    if (invoice) {
      await prisma.invoice.delete({ where: { id: invoice.id } });
    }
    await prisma.payment.delete({ where: { id: payments[0].id } });

    console.log('Fixed! Linked payment to subscription, activated it, and deleted duplicate.');
  } else {
    console.log('Could not find duplicate payments.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
