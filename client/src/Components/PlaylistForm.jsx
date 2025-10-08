import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {ScaleLoader} from "react-spinners";
import SpotifyApi from "../Apis/SpotifyApi";
import YoutubeApi from "../Apis/YoutubeApi";
import LinkBox from "./LinkBox";
import "../Styles/PlaylistForm.css";
let spotifyToken;

const PlaylistForm = () => {
  const { platform } = useParams();
  const navigate = useNavigate();
  spotifyToken = localStorage.getItem("spotify_token");
  const [errMsg, setErrMsg] = useState(null);
  const [isLoading,setIsLoading] = useState(false);
  const [notFoundSongs, setNotFoundSongs] = useState([]);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState(null);

  useEffect(() => {
    if (platform !== "youtube" && platform !== "spotify") navigate("/");
    if (platform === "spotify") {
        spotifyToken = localStorage.getItem("spotify_token");
      if (!spotifyToken) navigate("/");
    }
  }, []);

  const INITIAL_STATE = { playlistUrl: "" };
  const [formData, setFormData] = useState(INITIAL_STATE);

  const handleChange = (event) => {
    const { name, value } = event.target;
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
        setIsLoading(true);
        const res = await SpotifyApi.handleConversion(
          formData.playlistUrl,
          spotifyToken
        );
        setIsLoading(false);
        setNewPlaylistUrl(res.spotifyUrl);
        if (res.notFound[0]) setNotFoundSongs(res.notFound);
      } else if (platform === "youtube") {
        setIsLoading(true);
        const { playlistUrl, notFound } = await YoutubeApi.handleConversion(
          formData.playlistUrl
        );
        setIsLoading(false);
        setNewPlaylistUrl(playlistUrl);
        if (notFound[0]) setNotFoundSongs(notFound);
      }
      return setFormData(INITIAL_STATE);
    } catch (err) {
      setIsLoading(false);
      setErrMsg(err.message);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="playlistUrl">Playlist URL</label>
        <input
          type="text"
          name="playlistUrl"
          id="playlistUrl"
          onChange={handleChange}
          value={formData.playlistUrl}
        />
        <button className={`${platform}-convert-btn`} type="submit" disabled={isLoading}>
            Convert
        </button>
      </form>
      <p id="err-container">{errMsg ? errMsg : null}</p>
      <ScaleLoader loading={isLoading} color={'#FFFFFF'} width={10}/>
      {newPlaylistUrl ? <LinkBox link={newPlaylistUrl} /> : null}
      <section>
        {notFoundSongs[0] && platform === "spotify" ? (
          <div>
            <h2>Unable find these on Spotify:</h2>
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
