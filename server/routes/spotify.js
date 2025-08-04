import express from 'express';
import session from 'express-session';
import axios from 'axios';
import getToken from '../helpers/spotifyAuth.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {RedisStore} from "connect-redis"
import {createClient} from "redis"

// Initialize client.
let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SPOTIFY_BASE_URL = process.env.SPOTIFY_API;
const router = new express.Router();

router.use(session({
    store: redisStore,
    secret: process.env.SECRET_KEY || 'default-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Secure should be true in production (HTTPS)
  }));

router.use(async (req, res, next) => {
try {
    if (!req.session.spotifyToken) {
    const token = await getToken();
    req.session.spotifyToken = token;
    }
    next();
} catch (err) {
    console.error('Spotify token middleware error:', err);
    res.status(500).json({ error: 'Failed to get Spotify token' });
}
});

router.get('/songs/:playlistId', async (req,res,next) => {
    try { 
        // recieve spotify playlist id
        // request playlist info from spotify
        //respond with array of [{title,artist},...]
        const playlistId = req.params.playlistId;
        if (playlistId) {
            const token = req.session.spotifyToken;
            const headers = {Authorization:`Bearer ${token}`}
            const spotifyRes = await axios.get(`${SPOTIFY_BASE_URL}/playlists/${playlistId}`,{headers});
            const songData = [];
            console.log(spotifyRes.data.tracks.items[0].track.type)
            console.log(spotifyRes.data.tracks.items[1].track.type)
            for (let item of spotifyRes.data.tracks.items) {
                if (item.track.type === 'track') {
                    const songTitle = item.track.name;
                    const artist = item.track.artists[0].name;
                    songData.push({songTitle,artist});
                }
            }
            res.json(songData);
        }
        

    } catch (e) {
        console.log('in spotify/songs/:playlistId, e: ',e)
        next(e);
    }
})

export default router;

