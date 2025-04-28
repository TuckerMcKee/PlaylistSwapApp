import React from "react";
import { useEffect } from "react";
import {useNavigate} from 'react-router-dom';
import {getToken} from "./spotifyAuth";

const FetchToken = () => {
    const navigate = useNavigate();
    useEffect(() => {
        try {
            getToken()
        } catch (e) {
            console.log('in getToken, e:',e)
        }
        navigate('/playlist/spotify');
    },[])
    return <h1>Redirecting...</h1>
}

export default FetchToken;