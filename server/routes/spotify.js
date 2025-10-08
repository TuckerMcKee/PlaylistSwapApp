import express from 'express';
import { ensureSpotifyToken, getSpotifyPlaylistSongs } from '../controllers/spotifyController.js';

const router = new express.Router();

router.use(ensureSpotifyToken);
router.get('/songs/:playlistId', getSpotifyPlaylistSongs)

export default router;

