import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function simulateProduction() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('Simulating production state by dropping unsynchronized objects...');
    
    await client.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS "media" CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS "tenant_storage" CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS "tenant_integration_settings" CASCADE;`);
    
    await client.query(`ALTER TABLE "members" DROP COLUMN IF EXISTS "assigned_trainer_id" CASCADE;`);
    await client.query(`ALTER TABLE "members" DROP COLUMN IF EXISTS "experience_level" CASCADE;`);
    await client.query(`ALTER TABLE "members" DROP COLUMN IF EXISTS "fitness_notes" CASCADE;`);
    await client.query(`ALTER TABLE "members" DROP COLUMN IF EXISTS "medical_notes" CASCADE;`);
    await client.query(`ALTER TABLE "members" DROP COLUMN IF EXISTS "preferred_time" CASCADE;`);
    await client.query(`ALTER TABLE "members" DROP COLUMN IF EXISTS "whatsapp_number" CASCADE;`);
    
    // We don't drop Enums because Enum values cannot be dropped easily in Postgres without recreating the type.
    // For Enum values (GOOGLE, etc.) we leave them or assume they don't exist.
    // Let's also restore the 'NOT NULL' on notifications.member_id if it was dropped.
    await client.query(`ALTER TABLE "notifications" ALTER COLUMN "member_id" SET NOT NULL;`).catch(e => console.log('Notice on notifications:', e.message));

    console.log('Successfully reverted local database to match production state (drifted).');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

simulateProduction();
