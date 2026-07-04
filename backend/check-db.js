const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.whatsAppLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('WhatsAppLogs:', JSON.stringify(logs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
