import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore as ConnectRedisStore } from 'connect-redis';
import { SECRET_KEY, NODE_ENV, REDIS_URL } from '../config/index.js';

const redisUrl = REDIS_URL; // Heroku Key-Value Store sets this

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || (NODE_ENV === 'production' ? 'ps.sid' : 'ps.sid.dev');
const KEY_PREFIX  = process.env.SESSION_PREFIX       || (NODE_ENV === 'production' ? 'ps:prd:' : 'ps:stg:');

let store; // undefined => MemoryStore fallback

if (redisUrl) {
  try {
    const redisClient = createClient({
      url: redisUrl,
      socket: {
        tls: true, // KVS uses TLS
        rejectUnauthorized: false,
        connectTimeout: 5000,                  // fail fast, don’t hang requests
      },
      maxRetriesPerRequest: 2,
    });

    redisClient.on('error', (e) => console.error('Redis error:', e.message));

    // wait for connection so store operations don’t block
    await redisClient.connect();

    store = new ConnectRedisStore({
      client: redisClient,
      prefix: KEY_PREFIX,
      // optional: disableTouch: true  // uncomment if you don’t want TTL extend on every hit
    });

    console.log('Redis session store: connected');
  } catch (err) {
    console.error('Redis connect failed:', err.message, '— using MemoryStore temporarily');
  }
} else {
  console.warn('REDIS_URL not set — using MemoryStore (NOT for production).');
}

const redisSession = session({
  name: COOKIE_NAME,
  store,                         // undefined -> MemoryStore
  secret: SECRET_KEY || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production', // requires trust proxy
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24,
  },
});

export default redisSession;
