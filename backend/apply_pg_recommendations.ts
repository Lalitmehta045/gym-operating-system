import { PrismaClient } from './generated/prisma/client.js';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('ALTER DATABASE gymos_db SET log_min_duration_statement = 100;');
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_stat_statements;');
  console.log('Successfully applied PostgreSQL recommendations.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
