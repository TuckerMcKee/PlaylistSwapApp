import express from 'express';
import ytRefreshToken from '../middleware/ytRefreshToken.js';
import {
    getYoutubePlaylistSongs,
    searchYoutubeSongs,
    createYoutubePlaylist,
    addSongsToYoutubePlaylist,
    getYoutubeAuthUrl,
    handleYoutubeAuthCallback,
  } from '../controllers/youtubeController.js';
  
  const router = express.Router();
  
  router.get('/songs/:playlistId', getYoutubePlaylistSongs);
  router.post('/search', searchYoutubeSongs);
  router.post('/playlist', ytRefreshToken, createYoutubePlaylist);
  router.post('/playlist/add-songs', ytRefreshToken, addSongsToYoutubePlaylist);
  router.get('/auth', getYoutubeAuthUrl);
  router.get('/auth/callback', handleYoutubeAuthCallback);

export default router;

