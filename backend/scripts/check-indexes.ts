import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkIndexes() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const res = await client.query("SELECT indexname FROM pg_indexes WHERE tablename = 'members'");
  console.log('Members indexes:', res.rows.map(r => r.indexname));

  await client.end();
}

checkIndexes().catch(console.error);
