import axios from 'axios';
import parseYoutubeTitle from '../helpers/parseYoutubeTitle.js';
import { parseArtistName } from '../helpers/parseArtistName.js';
import youtubeAuth from '../helpers/youtubeAuth.js';
import { YOUTUBE_API, CLIENT_URL, YOUTUBE_API_KEY } from '../config/index.js';

const { oauth2Client } = youtubeAuth;
const YT_BASE_URL = YOUTUBE_API;
const key = YOUTUBE_API_KEY;

export const getYoutubePlaylistSongs = async (req, res, next) => {
  try {
    const playlistId = req.params.playlistId;
    if (playlistId) {
      const ytRes = await axios.get(
        `${YT_BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&key=${key}`
      );
      const songs = [];
      ytRes.data.items.forEach((i) => {
          let songData = parseYoutubeTitle(i.snippet.title);
          if (!songData.artist) songData.artist = parseArtistName(i.snippet.videoOwnerChannelTitle);
          songs.push(songData);
        });

      
      res.json(songs);
    }
  } catch (e) {
    res.json(e.status);
    next(e);
  }
};

export const searchYoutubeSongs = async (req, res, next) => {
  try {
    const ytVideoIds = [];
    const notFound = [];
    const songData = req.body.songData;
    for (let song of songData) {
      const query = `${song.artist} - ${song.songTitle}`;
      console.log('yt key: ',key)
      const ytRes = await axios.get(`${YT_BASE_URL}/search`, {
        params: {
          key: key,
          q: query,
          part: 'snippet',
          type: 'video',
          limit: 5,
          videoCategoryId: '10',
        },
      });
      for (let [index, item] of ytRes.data.items.entries()) {
        const title = item.snippet.title;
        //if no artist in youtube video title, artist name is take from channel title
        let { songTitle, artist } = parseYoutubeTitle(title);
        if (!artist) artist = parseArtistName(item.snippet.channelTitle);
        
        if (songTitle?.toLowerCase().trim() === song.songTitle?.toLowerCase().trim() && artist?.toLowerCase().trim() === song.artist?.toLowerCase().trim()) {
          ytVideoIds.push(item.id.videoId);
          break;
        }
        if (index === ytRes.data.items.length - 1) {
          notFound.push(song);
        }
      }
    }
    res.json({ ytVideoIds, notFound });
  } catch (e) {
    console.log(e.response)
    next(e);
  }
};

export const createYoutubePlaylist = async (req, res, next) => {
  try {
    const token = oauth2Client.credentials.access_token;
    const playlistData = {
      snippet: {
        title: 'New Playlist',
        description: 'Converted using PlaylistSwap',
      },
      status: {
        privacyStatus: 'public',
      },
    };
    const ytRes = await axios.post(
      `${YT_BASE_URL}/playlists?part=snippet,status`,
      playlistData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    res.json(ytRes.data.id);
  } catch (e) {
    res.json(null);
  }
};

export const addSongsToYoutubePlaylist = async (req, res, next) => {
  try {
    const token = oauth2Client.credentials.access_token;
    const { playlistId, ytVideoIds } = req.body;
    const responses = [];
    for (let id of ytVideoIds) {
      const ytRes = await axios.post(
        `${YT_BASE_URL}/playlistItems?part=snippet`,
        {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: id,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      responses.push(ytRes.data);
    }
    res.json(responses);
  } catch (e) {
    next(e);
  }
};

export const getYoutubeAuthUrl = async (req, res, next) => {
  try {
    // console.log(oauth2Client);
    // console.log('youtubeAuth.state: ', youtubeAuth.state);
    req.session.state = youtubeAuth.state;
    // console.log('req.session.state: ', req.session.state);
    res.json(youtubeAuth.authorizationUrl);
  } catch (e) {
    next(e);
  }
};

export const handleYoutubeAuthCallback = async (req, res, next) => {
  try {
    const q = new URL(req.url, 'http://localhost').searchParams;

    if (q.get('error')) return res.redirect(`${CLIENT_URL}`);
    const qState = q.get('state');
    const code = q.get('code');

    if (qState !== req.session.state) {
      // console.log('qState: ', qState);
      // console.log('req.session.state: ', req.session.state);
      // console.log('State mismatch. Possible CSRF attack');
      return res.redirect(`${CLIENT_URL}/`);
    } else {
      let { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
    }
    res.redirect(`${CLIENT_URL}/playlist/youtube`);
  } catch (e) {
    next(e);
  }
};

