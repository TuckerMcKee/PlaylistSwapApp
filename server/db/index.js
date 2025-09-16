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

export default pool;
