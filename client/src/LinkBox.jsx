import React,{useState} from "react";

const LinkBox = ({link}) => {
    const [copied,setCopied] = useState(false);
    const goToPlaylist = () => {
        window.open(link, '_blank');
      };
    const handleCopy = async (e) => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
    }
    return (
        <>
        <h1>Your New Playlist:</h1>
        <div className="linkbox-container">
            <button className="copy-btn" onClick={handleCopy}>
                {copied ? '✅' : '📋'}
            </button>
            <div className="playlistLink">{link}</div>
        </div>
        <button className="playlistLink-btn" onClick={() => goToPlaylist()}>Open Playlist</button>
        </>
    )
}

export default LinkBox;