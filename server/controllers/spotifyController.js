import axios from 'axios';
import getToken from '../helpers/spotifyAuth.js';
import { SPOTIFY_API } from '../config/index.js';

const SPOTIFY_BASE_URL = SPOTIFY_API;

const ensureSpotifyToken = async (req, res, next) => {
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
};

const getSpotifyPlaylistSongs = async (req, res, next) => {
  try {
    const playlistId = req.params.playlistId;
    if (playlistId) {
      const token = req.session.spotifyToken;
      const headers = { Authorization: `Bearer ${token}` };
      const spotifyRes = await axios.get(`${SPOTIFY_BASE_URL}/playlists/${playlistId}`, {
        headers,
      });
      const songData = [];
      for (let item of spotifyRes.data.tracks.items) {
        if (item.track.type === 'track') {
          const songTitle = item.track.name;
          const artist = item.track.artists[0].name;
          songData.push({ songTitle, artist });
        }
      }
      res.json(songData);
    }
  } catch (e) {
    console.log('in spotify/songs/:playlistId, e: ', e);
    next(e);
  }
};

export default {ensureSpotifyToken,getSpotifyPlaylistSongs};
