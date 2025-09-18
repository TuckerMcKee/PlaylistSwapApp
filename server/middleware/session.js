import {RedisStore} from "connect-redis";
import session from 'express-session';
import {createClient} from "redis";
import { REDIS_URL, SECRET_KEY, NODE_ENV } from '../config/index.js';

// Initialize client.
let redisClient = createClient({
    url: REDIS_URL 
  })
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

const redisSession = session({
    store: redisStore,
    secret: SECRET_KEY || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: NODE_ENV === 'production' } // Secure should be true in production (HTTPS)
  })

  export default redisSession;