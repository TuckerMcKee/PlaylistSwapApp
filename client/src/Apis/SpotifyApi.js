import axios from "axios";
import YoutubeApi from "./YoutubeApi";
import parseUgPlaylistId from "../Helpers/parseUgPlaylistId";
import matchSongData from "../Helpers/matchSongData";
const BASE_URL = import.meta.env.VITE_SPOTIFY_API;
const SPOTIFY_BACKEND = import.meta.env.VITE_SPOTIFY_BACKEND;
const UG_BACKEND = import.meta.env.VITE_ULTIMATEGUITAR_BACKEND;

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
            console.log('songData in spotify URIs: ',songData)
            if (!token) throw new Error('Unauthorized');
            const spotifyNotFound = [];
            const spotifyUris = [];
            for (let data of songData) { 
                console.log('song data: ',data)
                const title = data.songTitle;
                const artist = data.artist;
                const params = {q:title,type:'track',artist:artist,limit:'30'};
                const headers = {Authorization:`Bearer ${token}`};
                const res = await axios.get(`${BASE_URL}/search`,{params,headers});
                const tracks = res.data.tracks.items;
                console.log('getSpotifyUris, tracks res: ',tracks)
                const songMatches = tracks.filter(song => {
                    return matchSongData(song.name,song.artists[0].name,title,artist);
                    // return song.artists[0].name?.toLowerCase().trim() === artist?.toLowerCase().trim() && song.name?.toLowerCase().trim() === title?.toLowerCase().trim()
                })
                if (songMatches.length > 0) {
                    spotifyUris.push(songMatches[0].uri);
                }
                else {
                    spotifyNotFound.push(data);
                }
            }
            return {spotifyUris,spotifyNotFound}
        } catch (e) {
            console.log('in SpotifyApi getSpotifyUris, e:  ',e)
            throw new Error(e.message);
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
    //TO DO: handle req with more than 100 songs
    static addSongsToPlaylist = async (spotifyUris,playlistId,token) => {
        const headers = {Authorization:`Bearer ${token}`}
        let res = null;
        if (spotifyUris.length < 100) {
            try {
                res = await axios.post(`${BASE_URL}/playlists/${playlistId}/tracks`,{uris:spotifyUris},{headers});
                return res.data
            } catch (e) {
                console.log('in SpotifyApi.addSongsToPlaylist, e: ',e)
            }
        }
        else {
            for (let i = 0; i < spotifyUris.length; i += 99) {
                const uriBatch = spotifyUris.slice(i, i + 99);
                res = await axios.post(`${BASE_URL}/playlists/${playlistId}/tracks`,{uris:uriBatch},{headers});
            }
            return res.data
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

    static handleConversion = async (url,token) => { //handles entire process of youtube/ultimate-guitar => spotify conversion
        try {
            const notFound = [];
            let songData;
            if (!token) throw new Error('Invalid token');
            if (url.includes('ultimate-guitar.com')) {
                const ugPlaylistId = parseUgPlaylistId(url);
                const ugRes = await axios.get(`${UG_BACKEND}/${ugPlaylistId}`);
                songData = ugRes.data;
            }
            else {
                const playlistId = YoutubeApi.parseIdFromUrl(url);
                if (!playlistId) throw new Error('Invalid URL');
                songData = await YoutubeApi.getSongData(playlistId);
                if (songData === 404) throw new Error('Playlist not found or is private');
            }
            songData.forEach(s => {
                if (!s.artist && !s.songTitle) {
                    notFound.push(s);}
            })
            
            const filteredSongData = songData.filter(s => s.songTitle !== null);
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