import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
  console.log('Tables:', tables);

  const whatsappColumns = await prisma.$queryRaw`SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'whatsapp_logs'`;
  console.log('WhatsAppLog columns:', whatsappColumns);

  const indexes = await prisma.$queryRaw`SELECT indexname FROM pg_indexes WHERE tablename = 'whatsapp_logs'`;
  console.log('WhatsAppLog indexes:', indexes);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
