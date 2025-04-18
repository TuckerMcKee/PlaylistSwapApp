import axios from "axios";
import YoutubeApi from "./YoutubeApi";
const BASE_URL = import.meta.env.VITE_SPOTIFY_API;
const SPOTIFY_BACKEND = import.meta.env.VITE_SPOTIFY_BACKEND;

class SpotifyApi { 
    //takes in spotify playlistId and returns [{songTitle,artist}]
    static getSongData = async (playlistId) => {
        try {
            const res = await axios.get(`${SPOTIFY_BACKEND}/songs/${playlistId}`);
            return res.data;
        } catch (e) {
            console.log('in SpotifyApi getSongData, e:  ',e)
        }
    }

    //sample url: 
    //https://open.spotify.com/playlist/5ndyyY7Uy7fzyLNOnNlAl5?si=1fadafec688a4d09
    static parseIdFromUrl = (url) => {
        try {
            const playlistUrl = new URL(url); 
            if (!playlistUrl || playlistUrl.pathname.substring(0,9) !== '/playlist') return alert('invalid playlist url');
            const playlistId = playlistUrl.pathname.substring(10);
            return playlistId
            
        } catch (e) {
            throw new Error('Invalid URL');
        }
    }

    //accepts array of songData objects {songTitle,artist} and auth token returns array of Spotify Uris (these are needed for adding tracks to spotify playlists)
    static getSpotifyUris = async (songData,token) => {
        try {
            if (!token) throw new Error('Unauthorized');
            const spotifyNotFound = [];
            const spotifyUris = [];
            for (let data of songData) { 
                const title = data.songTitle;
                const artist = data.artist;
                const params = {q:title,type:'track',artist:artist,limit:'1'};
                const headers = {Authorization:`Bearer ${token}`};
                const res = await axios.get(`${BASE_URL}/search`,{params,headers});
                const song = res.data.tracks.items[0];
                if (song.artists[0].name.toLowerCase() === artist.toLowerCase() && 
                song.name.toLowerCase() === title.toLowerCase()) {
                    spotifyUris.push(song.uri);
                }
                else {
                    spotifyNotFound.push(data);
                }
            }
            return {spotifyUris,spotifyNotFound}
        } catch (e) {
            console.log('in SpotifyApi getSpotifyUris, e:  ',e)
        }
    }

    // takes spotify user id and auth token and makes post req to create new empty playlist
    // returns object of {id, url} for new playlist
    static createPlaylist = async (userId,token) => {
        try {
            const headers = {Authorization:`Bearer ${token}`}
            const body = {
                "name": "New Playlist",
                "description": "Converted to Spotify using PlaylistSwap",
                "public": true
            }
            const res = await axios.post(`${BASE_URL}/users/${userId}/playlists`,body,{headers});
            const id = res.data.id;
            const url = res.data.external_urls.spotify;
            return {id,url};
        } catch (e) {
            console.log('in SpotifyApi.createPlaylist: ',e)
        }
        
    }

    static addSongsToPlaylist = async (spotifyUris,playlistId,token) => {
        try {
            const headers = {Authorization:`Bearer ${token}`}
            const res = await axios.post(`${BASE_URL}/playlists/${playlistId}/tracks`,{uris:spotifyUris},{headers});
            return res.data
        } catch (e) {
            console.log('in SpotifyApi.addSongsToPlaylist, e: ',e)
        }
        
    }

    static getUserId = async (token) => {
        try {
            const headers = {Authorization:`Bearer ${token}`}
            const res = await axios.get(`${BASE_URL}/me`,{headers});
            return res.data.id;
        } catch (e) {
            console.log('in SpotifyApi.getUserId, e: ',e)
        }
    }

    static handleConversion = async (url,token) => { //handles entire process of youtube => spotify conversion
        try {
            const notFound = [];
            if (!token) throw new Error('Invalid token');
            const playlistId = YoutubeApi.parseIdFromUrl(url);
            if (!playlistId) throw new Error('Invalid URL');
            const songData = await YoutubeApi.getSongData(playlistId);
            if (songData === 404) throw new Error('Playlist not found or is private');
            songData.forEach(s => {
                if (!s.artist && !s.songTitle) {
                    notFound.push(s);}
            })
            
            const filteredSongData = songData.filter(s => s.title !== null);
            if (filteredSongData.length === 0) throw new Error('No valid songs found in YouTube playlist.');
            const {spotifyUris,spotifyNotFound} = await SpotifyApi.getSpotifyUris(filteredSongData,token);
            
            spotifyNotFound.forEach(s => notFound.push(s));
            
            const userId = await SpotifyApi.getUserId(token); 
            const newPlaylistData = await SpotifyApi.createPlaylist(userId,token);
            if (!newPlaylistData || !newPlaylistData.id) throw new Error('Failed to create Spotify playlist.');
            const addSongsRes = await SpotifyApi.addSongsToPlaylist(spotifyUris,newPlaylistData.id,token);
            if (!addSongsRes) throw new Error('Failed to add songs to the Spotify playlist.');
            
            const notFoundCopy = [...notFound];
            return {spotifyUrl:newPlaylistData.url,notFound:notFoundCopy}
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

export default SpotifyApi;