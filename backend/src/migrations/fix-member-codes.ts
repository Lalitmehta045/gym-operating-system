import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client.js';

async function fixMemberCodes() {
  const prisma = new PrismaClient();
  
  try {
    // Fetch all members with M- prefix codes
    const members = await prisma.member.findMany({
      where: {
        memberCode: {
          startsWith: 'M-'
        }
      },
      select: { id: true, memberCode: true, tenantId: true }
    });

    console.log(`Found ${members.length} members to fix`);

    for (const member of members) {
      // Extract number: "M-1" -> "1", "M-12" -> "12"
      const newCode = member.memberCode.replace(/^M-/i, '').trim();
      
      await prisma.member.update({
        where: { id: member.id },
        data: { memberCode: newCode }
      });
      
      console.log(`Updated: ${member.memberCode} -> ${newCode}`);
    }

    console.log('✅ All member codes fixed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMemberCodes();
