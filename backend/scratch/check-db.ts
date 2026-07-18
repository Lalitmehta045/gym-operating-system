import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  console.log('Tenants:', tenants.map(t => ({ id: t.id, name: t.name, status: t.status })));
  
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ email: u.email, role: u.role, tenantId: u.tenantId })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
