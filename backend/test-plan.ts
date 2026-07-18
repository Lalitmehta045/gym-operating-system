import { PrismaClient } from './generated/prisma/client.js';
const p = new PrismaClient();
p.membershipPlan.findFirst().then(x => console.log(x?.id)).finally(() => p.$disconnect());
