import { PrismaClient } from '../generated/prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const explainResult = await prisma.$queryRawUnsafe(`
      EXPLAIN ANALYZE SELECT * FROM "Payment" WHERE "tenantId" = 'some-tenant' AND "razorpayPaymentId" = 'some-payment' LIMIT 1;
    `);
    console.log("EXPLAIN ANALYZE result:");
    console.log(explainResult);

    const indexResult = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'Payment';
    `);
    console.log("\nIndexes on Payment table:");
    console.log(indexResult);

  } catch (error) {
    console.error("Error executing queries:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
