import { PrismaClient } from './generated/prisma/client.js';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    where: { status: 'TRIAL' }
  });
  
  for (const tenant of tenants) {
    console.log(`Fixing tenant ${tenant.name}...`);
    // Delete their trial subscriptions
    await prisma.tenantSubscription.deleteMany({
      where: { tenantId: tenant.id }
    });
    // Set tenant to PENDING
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: 'PENDING', isActive: false }
    });
    console.log(`Tenant ${tenant.name} is now PENDING.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
