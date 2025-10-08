import React from "react";
import { useEffect } from "react";
import {useNavigate} from 'react-router-dom';
import {getSpotifyToken} from "../Auth/spotifyAuth";

const FetchSpotifyToken = () => {
    const navigate = useNavigate();
    useEffect(() => {
        try {
            const waitForToken = async () => {
                try {
                    await getSpotifyToken();
                    navigate('/playlist/spotify');
                } catch (error) {
                    console.error('Error fetching Spotify token:', error);
                    navigate('/');
                }
            };
            waitForToken();
        } catch (e) {
            console.log('in getSpotifyToken, e:',e)
        }
    },[navigate])
    return <h1>Redirecting...</h1>
}

export default FetchSpotifyToken;