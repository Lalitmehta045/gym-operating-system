const { Client } = require('pg');
async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:Lalit_45@localhost:5432/postgres' });
  await client.connect();
  const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
  console.log(res.rows.map(r => r.datname));
  await client.end();
}
main().catch(console.error);
