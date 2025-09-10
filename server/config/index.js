import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  SPOTIFY_API,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  YOUTUBE_API,
  CLIENT_URL,
  YOUTUBE_API_KEY,
  YOUTUBE_REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIS_URL,
  SECRET_KEY,
  DATABASE_URL
} = process.env;

export {
  SPOTIFY_API,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  YOUTUBE_API,
  CLIENT_URL,
  YOUTUBE_API_KEY,
  YOUTUBE_REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIS_URL,
  SECRET_KEY,
  DATABASE_URL
};