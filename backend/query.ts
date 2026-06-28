import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT 
      a.id as attendance_id,
      a.member_id,
      a.tenant_id,
      m.id as member_id_in_members,
      m.first_name,
      m.last_name
    FROM attendances a
    LEFT JOIN members m ON m.id = a.member_id AND m.tenant_id = a.tenant_id
    WHERE a.notes = 'Kiosk self check-in'
    ORDER BY a.created_at DESC
    LIMIT 5;
  `);
  console.log("QUERY RESULT:");
  console.log(result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
