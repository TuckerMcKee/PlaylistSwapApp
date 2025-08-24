import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SpotifyApi from "../Apis/SpotifyApi";
import YoutubeApi from "../Apis/YoutubeApi";
import LinkBox from "./LinkBox";
import "../Styles/PlaylistForm.css";
let token;

const PlaylistForm = () => {
  const { platform } = useParams();
  const navigate = useNavigate();
  token = localStorage.getItem("access_token");
  const [errMsg, setErrMsg] = useState(null);
  const [notFoundSongs, setNotFoundSongs] = useState([]);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState(null);

  useEffect(() => {
    if (platform !== "youtube" && platform !== "spotify") navigate("/");
    if (platform === "spotify") {
        token = localStorage.getItem("access_token");
      if (!token) navigate("/");
    }
  }, []);

  const INITIAL_STATE = { playlistUrl: "" };
  const [formData, setFormData] = useState(INITIAL_STATE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!formData.playlistUrl) return setErrMsg("URL required!");
      else if (platform === "spotify") {
        const res = await SpotifyApi.handleConversion(
          formData.playlistUrl,
          token
        );
        setNewPlaylistUrl(res.spotifyUrl);
        if (res.notFound[0]) setNotFoundSongs(res.notFound);
      } else if (platform === "youtube") {
        const { playlistUrl, notFound } = await YoutubeApi.handleConversion(
          formData.playlistUrl
        );
        setNewPlaylistUrl(playlistUrl);
        if (notFound[0]) setNotFoundSongs(notFound);
      }
      return setFormData(INITIAL_STATE);
    } catch (e) {
      setErrMsg(e.message);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="playlistUrl">Playlist URL</label>
        <input
          type="text"
          name="playlistUrl"
          onChange={handleChange}
          value={formData.playlistUrl}
        />
        <button className={`${platform}-convert-btn`} type="submit">
            Convert
          {/* Convert to {platform.charAt(0).toUpperCase() + platform.slice(1)} */}
        </button>
      </form>
      {/* <button className="home-btn" onClick={() => navigate('/')}>Home</button> */}
      <p id="err-container">{errMsg ? errMsg : null}</p>
      {newPlaylistUrl ? <LinkBox link={newPlaylistUrl} /> : null}
      <section>
        {notFoundSongs[0] && platform === "spotify" ? (
          <div>
            <h2>Unable find these on Spotify:</h2>
            <ul>
              {notFoundSongs.map((s, i) => {
                return <li key={s.ytTitle + i}>{s.ytTitle}</li>;
              })}
            </ul>
          </div>
        ) : null}
        {notFoundSongs[0] && platform === "youtube" ? (
          <div>
            <h2>Unable find these on Youtube:</h2>
            <ul className='notFound-ul'>
              {notFoundSongs.map((s, i) => {
                return (
                  <li key={s.songTitle + i}>
                    {s.songTitle} - {s.artist}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>
    </>
  );
};

export default PlaylistForm;
