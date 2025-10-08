import React from "react";
import {redirectToSpotifyLogin} from "../Auth/spotifyAuth";
import redirectToYoutubeLogin from "../Auth/youtubeAuth";

const PlatformButton = ({platform}) => {
   
    if (platform === 'spotify') {
        
        return (
            <button className='platform-btn' onClick={(e) => {e.preventDefault(); redirectToSpotifyLogin()}}><img src='/assets/SpotifyIcon.svg'/></button>
        )
    }
    else if (platform === 'youtube') {
       
        return (
            <button className='platform-btn' onClick={(e) => {e.preventDefault(); redirectToYoutubeLogin()}}><img src='/assets/YoutubeIcon.svg' /></button>
        )
    }
}

export default PlatformButton;