import {RedisStore} from "connect-redis";
import session from 'express-session';
import {createClient} from "redis";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env from server folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize client.
let redisClient = createClient({
    url: process.env.REDIS_URL 
  })
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

const redisSession = session({
    store: redisStore,
    secret: process.env.SECRET_KEY || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true } // Secure should be true in production (HTTPS)
  })

  export default redisSession;