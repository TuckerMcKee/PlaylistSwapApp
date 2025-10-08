import axios from "axios";
import SpotifyApi from "./SpotifyApi";
import parseUgPlaylistId from "../Helpers/parseUgPlaylistId";
const UG_BACKEND = import.meta.env.VITE_ULTIMATEGUITAR_BACKEND;
const BASE_URL = import.meta.env.VITE_YOUTUBE_BACKEND;

class YoutubeApi { 
    //takes in youtube playlistId and return array of [{songTitle,artist}]
    static getSongData = async (playlistId) => {
        try {
            const res = await axios.get(`${BASE_URL}/songs/${playlistId}`);
            return res.data
        } catch (e) {
            throw new Error(e.message)
        }
    }

    static getVideoIds = async (songData) => { //returns obj of {[ytVideoIds],[notFoundSongObjects]}
        try {
            const body = {songData};
            const res = await axios.post(`${BASE_URL}/search`,body);
            return res.data
        } catch (e) {
            throw new Error(e.message)
        }
    }

    static createPlaylist = async () => { //creates yt playlist, return playlist id
        const res = await axios.post(`${BASE_URL}/playlist`);
        return res.data
    }

    static addSongsToPlaylist = async (playlistId,ytVideoIds) => { //adds songs to yt playlist
        const body = {playlistId,ytVideoIds};
        const res = await axios.post(`${BASE_URL}/playlist/add-songs`,body);
        return res.data
    }

    static parseIdFromUrl = (url) => {
        try {
            const playlistUrl = new URL(url); 
            const playlistId = playlistUrl.searchParams.get('list'); 
            if (!playlistId || playlistId.substring(0,2) !== 'PL') throw new Error('Invalid URL');

            else return playlistId
            
        } catch (e) {
            throw new Error('Invalid URL')
        }
    }

    static handleConversion = async (url) => { //handles entire process of spotify => youtube conversion
        try {
            let songData;
            if (url.includes('ultimate-guitar.com')) {
                const ugPlaylistId = parseUgPlaylistId(url);
                const ugRes = await axios.get(`${UG_BACKEND}/${ugPlaylistId}`);
                songData = ugRes.data;
            }
            else {
                const playlistId = SpotifyApi.parseIdFromUrl(url);
                songData = await SpotifyApi.getSongData(playlistId);
            }
            if (!songData) throw new Error('Unauthorized.');
            if (songData.length === 0) throw new Error('No valid songs in playlist.');
            const {ytVideoIds,notFound}= await YoutubeApi.getVideoIds(songData);
            if (ytVideoIds.length === 0) throw new Error('Unable to find songs on Youtube.');
            const newPlaylistId = await YoutubeApi.createPlaylist();
            if (!newPlaylistId) throw new Error('Youtube playlist creation failed. Youtube account required.');
            const addSongsRes = await YoutubeApi.addSongsToPlaylist(newPlaylistId,ytVideoIds);
            if (addSongsRes)  {
                const playlistUrl = `https://www.youtube.com/playlist?list=${newPlaylistId}`;
                return {playlistUrl,notFound}
            }
        } catch (e) {
            console.log(e)
            throw new Error(e.message);
        }
    }
    
}

export default YoutubeApi;