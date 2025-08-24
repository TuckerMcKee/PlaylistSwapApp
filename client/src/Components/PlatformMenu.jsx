import React from "react";
import PlatformButton from "./PlatformButton";
import '../Styles/PlatformMenu.css';

const PlatformMenu = () => {
    return (
        <>
        <h1>Choose your destination platform</h1>
        <div className="platform-buttons-container">
            <PlatformButton platform={'youtube'}/>
            <PlatformButton platform={'spotify'}/>
        </div>
        </>
    )
}

export default PlatformMenu;