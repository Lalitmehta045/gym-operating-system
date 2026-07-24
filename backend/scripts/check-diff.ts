import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkAllDifferences() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const tablesToCheck = ['media', 'audit_logs', 'tenant_storage', 'tenant_integration_settings'];
  for (const table of tablesToCheck) {
    const res = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`, [table]);
    console.log(`Table ${table} exists:`, res.rows[0].exists);
  }

  const columnsToCheck = [
    { table: 'members', column: 'assigned_trainer_id' },
    { table: 'members', column: 'experience_level' },
    { table: 'members', column: 'fitness_notes' },
    { table: 'members', column: 'medical_notes' },
    { table: 'members', column: 'preferred_time' },
    { table: 'members', column: 'whatsapp_number' }
  ];
  for (const col of columnsToCheck) {
    const res = await client.query(`SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2)`, [col.table, col.column]);
    console.log(`Column ${col.table}.${col.column} exists:`, res.rows[0].exists);
  }

  await client.end();
}

checkAllDifferences().catch(console.error);
