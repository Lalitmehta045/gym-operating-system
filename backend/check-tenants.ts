import { PrismaClient } from './generated/prisma/client.js';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: { users: true }
  });
  console.log(JSON.stringify(tenants, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
