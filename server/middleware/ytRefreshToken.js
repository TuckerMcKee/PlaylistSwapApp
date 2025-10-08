import youtubeAuth from '../helpers/youtubeAuth.js';
const {oauth2Client} = youtubeAuth;

const ytRefreshToken = async (req,res,next) => {
    // Check if the token is expiring
    if (oauth2Client.isTokenExpiring()) {
        try {
            // Refresh the token
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);
        } catch (error) {
            console.log('Error refreshing token: ', error);
            next(error);
        }
    }
    next();
}

export default ytRefreshToken;