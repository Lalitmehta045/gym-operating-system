import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      tenantId: true,
    }
  });
  console.log(users);
}
main();
