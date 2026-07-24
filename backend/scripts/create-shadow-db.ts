import { Client } from 'pg';

async function createShadowDB() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Lalit_45@localhost:5432/postgres',
  });
  
  try {
    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS gymos_shadow;`);
    await client.query(`CREATE DATABASE gymos_shadow;`);
    console.log('Shadow DB created.');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

createShadowDB();
