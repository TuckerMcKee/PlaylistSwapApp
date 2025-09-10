import pkg from 'pg';
import { DATABASE_URL } from '../config/index.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export default pool;
