import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { member: true }
  });
  console.log('Latest 5 payments:');
  console.log(JSON.stringify(payments, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
