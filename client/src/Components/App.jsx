import React,{useEffect,useState} from 'react';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router';
import PlatformMenu from './PlatformMenu';
import PlaylistForm from './PlaylistForm';
import FetchSpotifyToken from './FetchSpotifyToken';
import '../Styles/App.css';
import NavBar from './NavBar';
import Login from './Login';
import Register from './Register';

function App() {
  const getStoredValue = (key) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  };

  const [token, setToken] = useState(() => getStoredValue('token'));
  const [user, setUser] = useState(() => getStoredValue('user'));

  useEffect(() => {
    const stored = localStorage.getItem('token');
    const currUser = localStorage.getItem('user');
    if (stored) setToken(stored);
    if (currUser) setUser(currUser);
  }, []);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <>
      <BrowserRouter>
        <NavBar token={token} onLogout={handleLogout} user={user}/>
        <Routes>
          <Route path='/' element={token ? <PlatformMenu /> : <Navigate to="/login" />}/>
          <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
          <Route path="/register" element={<Register setToken={setToken}/>} setUser={setUser}/>
          <Route path='/callback' element={token ? <FetchSpotifyToken /> : <Navigate to="/login" />}/>
          <Route path='/playlist/:platform' element={token ? <PlaylistForm /> : <Navigate to="/login" />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
