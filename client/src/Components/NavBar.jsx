import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/NavBar.css'; 

function NavBar() {
  return (
    <nav className="navbar">
        <h1>PlaylistSwap</h1>
      <Link className='home-link' to="/">Home</Link>
    </nav>
  );
}

export default NavBar;
