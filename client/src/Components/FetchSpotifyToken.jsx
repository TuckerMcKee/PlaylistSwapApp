import React from "react";
import { useEffect } from "react";
import {useNavigate} from 'react-router-dom';
import {getSpotifyToken} from "../Auth/spotifyAuth";

const FetchSpotifyToken = () => {
    const navigate = useNavigate();
    useEffect(() => {
        try {
            const waitForToken = async () => {
                await getSpotifyToken();
            };
            waitForToken();
        } catch (e) {
            console.log('in getSpotifyToken, e:',e)
        }
        navigate('/playlist/spotify');
    },[])
    return <h1>Redirecting...</h1>
}

export default FetchSpotifyToken;