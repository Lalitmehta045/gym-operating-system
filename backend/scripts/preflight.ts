import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function runPreFlight() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  let allPassed = true;
  const errors: string[] = [];

  try {
    // 1. Every referenced enum exists
    const enums = ['MediaType', 'MediaCategory', 'AuditEntity', 'AuditAction'];
    for (const enm of enums) {
      const res = await client.query(`SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = $1)`, [enm]);
      if (!res.rows[0].exists) {
        errors.push(`Enum ${enm} does NOT exist.`);
        allPassed = false;
      }
    }

    // 2. Every referenced table exists
    const tables = ['members', 'users', 'tenants', 'notifications'];
    for (const tbl of tables) {
      const res = await client.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`, [tbl]);
      if (!res.rows[0].exists) {
        errors.push(`Referenced table ${tbl} does NOT exist.`);
        allPassed = false;
      }
    }

    // 4. Every UNIQUE constraint required by composite FKs exists
    // We need a unique constraint on members(tenant_id, id).
    // Let's check pg_index for a unique index covering these two columns.
    const uniqueCheck = await client.query(`
      SELECT
        ix.relname AS index_name,
        a.attname AS column_name
      FROM
        pg_class t,
        pg_class ix,
        pg_index i,
        pg_attribute a
      WHERE
        t.oid = i.indrelid
        AND ix.oid = i.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY(i.indkey)
        AND t.relkind = 'r'
        AND t.relname = 'members'
        AND i.indisunique = true
    `);
    
    // Group by index name
    const indexes: Record<string, string[]> = {};
    for (const row of uniqueCheck.rows) {
      if (!indexes[row.index_name]) indexes[row.index_name] = [];
      indexes[row.index_name].push(row.column_name);
    }
    
    let hasCompositeUnique = false;
    for (const [idxName, cols] of Object.entries(indexes)) {
      if (cols.includes('tenant_id') && cols.includes('id') && cols.length === 2) {
        hasCompositeUnique = true;
        console.log(`Found composite unique index: ${idxName} on columns ${cols.join(', ')}`);
        break;
      }
    }
    
    if (!hasCompositeUnique) {
      errors.push(`UNIQUE constraint required for composite FK members(tenant_id, id) does NOT exist!`);
      allPassed = false;
    }

    // 5. Every index name is unused
    const indexNamesToCheck = [
      'idx_media_tenant_deleted',
      'idx_media_tenant_member_category',
      'idx_media_tenant_category',
      'media_uploaded_by_id_idx',
      'idx_audit_log_tenant',
      'idx_audit_log_user',
      'idx_audit_log_member',
      'idx_audit_log_entity',
      'audit_logs_action_idx',
      'idx_audit_log_created_at',
      'idx_audit_log_tenant_created',
      'idx_audit_log_tenant_member_created',
      'idx_audit_log_tenant_user_created',
      'tenant_storage_tenant_id_key',
      'idx_tenant_storage_used',
      'tenant_integration_settings_tenant_id_key',
      'idx_tenant_integration_tenant',
      'idx_member_assigned_trainer'
    ];
    for (const idx of indexNamesToCheck) {
      const res = await client.query(`SELECT EXISTS (SELECT 1 FROM pg_class WHERE relname = $1 AND relkind = 'i')`, [idx]);
      if (res.rows[0].exists) {
        errors.push(`Index name ${idx} is ALREADY IN USE.`);
        allPassed = false;
      }
    }

    if (allPassed) {
      console.log('PRE-FLIGHT VALIDATION PASSED.');
    } else {
      console.log('PRE-FLIGHT VALIDATION FAILED:');
      errors.forEach(e => console.log(' -', e));
    }

  } catch (e) {
    console.error('ERROR during pre-flight:', e);
  } finally {
    await client.end();
  }
}

runPreFlight();
