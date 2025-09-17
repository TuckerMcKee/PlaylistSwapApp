import React,{useEffect,useState} from 'react';
import { BrowserRouter,Routes,Route,Navigate } from 'react-router';
import PlatformMenu from './PlatformMenu';
import PlaylistForm from './PlaylistForm';
import FetchToken from './FetchToken';
import '../Styles/App.css';
import NavBar from './NavBar';
import Login from './Login';
import Register from './Register';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

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
        <NavBar token={token} onLogout={handleLogout} />
        <Routes>
          <Route path='/' element={token ? <PlatformMenu /> : <Navigate to="/login" />}/>
          <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
          <Route path="/register" element={<Register setToken={setToken}/>} setUser={setUser}/>
          <Route path='/callback' element={token ? <FetchToken /> : <Navigate to="/login" />}/>
          <Route path='/playlist/:platform' element={token ? <PlaylistForm /> : <Navigate to="/login" />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
