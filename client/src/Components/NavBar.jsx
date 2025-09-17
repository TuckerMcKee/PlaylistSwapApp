import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/NavBar.css'; 

const NavBar = ({ token, onLogout, user}) => {
  return (
    <nav className="navbar">
        <h1>PlaylistSwap</h1>
      {token ? (
        <>
          <Link className='home-link' to="/">Home</Link>
          <button className='home-link' onClick={onLogout}>Logout</button>
          <h2>Welcome, {user}</h2>
        </>
      ) : (
        <>
          <Link className='home-link' to="/login">Login</Link>
          <Link className='home-link' to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default NavBar;
