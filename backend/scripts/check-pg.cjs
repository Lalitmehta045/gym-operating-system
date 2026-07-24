const { Client } = require('pg');

async function main() {
  // Use the connection string from .env
  const client = new Client({
    connectionString: 'postgresql://postgres:Lalit_45@localhost:5432/gymos_db'
  });
  
  await client.connect();
  
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log("Tables in public schema:");
  const tables = res.rows.map(r => r.table_name);
  console.log(tables);
  
  const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'whatsapp_logs'");
  console.log("Columns in whatsapp_logs:");
  console.log(cols.rows.map(r => r.column_name));
  
  const idx = await client.query("SELECT indexname FROM pg_indexes WHERE tablename = 'whatsapp_logs'");
  console.log("Indexes in whatsapp_logs:");
  console.log(idx.rows.map(r => r.indexname));
  
  await client.end();
}

main().catch(console.error);
