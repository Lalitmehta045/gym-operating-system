import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkEnums() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const res = await client.query(`
    SELECT enumlabel 
    FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE typname = 'MemberSource';
  `);
  console.log('MemberSource enum values:', res.rows.map(r => r.enumlabel));
  
  await client.end();
}

checkEnums().catch(console.error);
