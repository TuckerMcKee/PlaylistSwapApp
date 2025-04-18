import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const client_id = process.env.SPOTIFY_CLIENT_ID;      
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;  

// Base64 encode the client_id and client_secret
const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

const getToken = async () => {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const token = response.data.access_token;
    return token;
  } catch (error) {
    console.error('Error getting Spotify token:', error.response?.data || error.message);
  }
};

export default getToken;
