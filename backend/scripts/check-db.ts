import { Client } from 'pg';

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    await client.connect();
    
    const auditLogsQuery = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
      );
    `);
    
    const assignedTrainerQuery = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'members' 
        AND column_name = 'assigned_trainer_id'
      );
    `);

    console.log('Audit Logs Table Exists:', auditLogsQuery.rows[0].exists);
    console.log('Assigned Trainer ID Column Exists:', assignedTrainerQuery.rows[0].exists);
    
    const migrationsQuery = await client.query(`
      SELECT migration_name FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;
    `);
    console.log('Recent Migrations:', migrationsQuery.rows);

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

import * as dotenv from 'dotenv';
dotenv.config();
checkSchema();
