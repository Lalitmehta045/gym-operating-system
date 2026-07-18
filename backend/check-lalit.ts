import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const memberId = '64f8d111-e832-4f84-944b-5a636bf8030f';

  const subs = await prisma.subscription.findMany({
    where: { memberId }
  });
  console.log('Subscriptions for Lalit:', JSON.stringify(subs, null, 2));

  const payments = await prisma.payment.findMany({
    where: { memberId }
  });
  console.log('Payments for Lalit:', JSON.stringify(payments, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
