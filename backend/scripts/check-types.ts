import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkAllTypes() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const types = ['MediaType', 'MediaCategory', 'AuditEntity', 'AuditAction'];
  for (const t of types) {
    const res = await client.query(`SELECT EXISTS (SELECT FROM pg_type WHERE typname = $1)`, [t]);
    console.log(`Type ${t} exists:`, res.rows[0].exists);
  }

  await client.end();
}

checkAllTypes().catch(console.error);
