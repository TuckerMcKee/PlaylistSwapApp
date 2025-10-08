const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

const scope = 'playlist-modify-public playlist-modify-private';
const authUrl = new URL("https://accounts.spotify.com/authorize");

const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
const redirectToSpotifyLogin = async () => {
  const codeVerifier  = generateRandomString(64); 
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);

  window.localStorage.setItem('code_verifier', codeVerifier); //storing code verifier
  console.log('redirect uri: ',redirectUri)
  const params =  {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }
  
  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}




const getSpotifyToken = async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // stored in the previous step
    const codeVerifier = window.localStorage.getItem('code_verifier');
    
    const url = "https://accounts.spotify.com/api/token";
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    }
  
    const body = await fetch(url, payload);
    const response = await body.json();
    if (response.access_token !== undefined) {
      localStorage.setItem('spotify_token', response.access_token);
    }
  }
  

export {redirectToSpotifyLogin,getSpotifyToken};
