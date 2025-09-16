import React from 'react';
import { BrowserRouter,Routes,Route } from 'react-router';
import PlatformMenu from './PlatformMenu';
import PlaylistForm from './PlaylistForm';
import FetchToken from './FetchToken';
import '../Styles/App.css'
import NavBar from './NavBar';

function App() {

  return (
    <>
    <BrowserRouter>
    <NavBar />
    <Routes>
      <Route path='/' element={<PlatformMenu />}/>
      <Route path='/callback' element={<FetchToken />}/>
      <Route path='/playlist/:platform' element={<PlaylistForm />}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
