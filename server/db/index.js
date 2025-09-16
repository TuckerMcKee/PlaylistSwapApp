import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import { DATABASE_URL } from '../config/index.js';

const { Pool } = pkg;

const shouldEnableSSL =
  process.env.NODE_ENV === 'production' ||
  (DATABASE_URL && !/localhost|127\.0\.0\.1/.test(DATABASE_URL));

const pool = new Pool({
  connectionString: DATABASE_URL,
  ...(shouldEnableSSL
    ? {
        ssl: { rejectUnauthorized: false },
      }
    : {}),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, 'schema.sql');

let initializationPromise;

export async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const schema = await readFile(schemaPath, 'utf-8');
      await pool.query(schema);
    })();
  }

  return initializationPromise;
}


export default pool;
