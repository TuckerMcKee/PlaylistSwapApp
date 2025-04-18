import React from "react";
import {redirectToSpotifyLogin} from "./spotifyAuth";
import redirectToYoutubeLogin from "./youtubeAuth";

const PlatformButton = ({platform}) => {
   
    if (platform === 'spotify') {
        
        return (
            <button className='platform-btn' onClick={() => redirectToSpotifyLogin()}><img src='/assets/SpotifyIcon.svg'/></button>
        )
    }
    else if (platform === 'youtube') {
       
        return (
            <button className='platform-btn' onClick={() => redirectToYoutubeLogin()}><img src='/assets/YoutubeIcon.svg' /></button>
        )
    }
}

export default PlatformButton;