import axios from "axios";
const VITE_YOUTUBE_BACKEND = import.meta.env.VITE_YOUTUBE_BACKEND;


async function youtubeAuth() {
    try {
        const res = await axios.get(`${VITE_YOUTUBE_BACKEND}/auth`,{withCredentials:true});
        console.log('in youtubeAuth, res.data: ',res.data)
        return res.data
    } catch (e) {
        console.log('in youtubeAuth.js: ',e)
    }
}

async function redirectToYoutubeLogin() {
    try {
        const authUrl = await youtubeAuth();
        window.location.href = authUrl;
    } catch (e) {
        console.log('in redirectToYoutubeLogin, e: ',e)
    }
}
export default redirectToYoutubeLogin;