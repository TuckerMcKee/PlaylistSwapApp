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

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) setToken(stored);
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
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken}/>} />
          <Route path='/callback' element={token ? <FetchToken /> : <Navigate to="/login" />}/>
          <Route path='/playlist/:platform' element={token ? <PlaylistForm /> : <Navigate to="/login" />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
