import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const Register = ({setToken,setUser}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errMsg, setErrMsg] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(formData => ({ ...formData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrMsg(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/register`, formData);
      const token = res.data?.token;
      const currUser = res.data?.user;
      if (token) {
        localStorage.setItem('token', token);
        if (setToken) setToken(token);
      }
      if (currUser) {
        localStorage.setItem('user', currUser);
        if (setUser) setUser(currUser);
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      setErrMsg(msg);
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {errMsg ? <p className="error">{errMsg}</p> : null}
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;