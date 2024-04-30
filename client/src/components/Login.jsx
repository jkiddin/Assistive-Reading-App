import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Account.css';
import { motion } from 'framer-motion'

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:3001/login', { username, password });
            if (response.status === 200) {
              setSuccess('Logged in!');
              setError('');
              navigate('/', { replace: true });
            } else if (response.status === 401) {
              console.log('debug wording yay yippee!');
            } else {
              setError('Something went wrong. Please try again.');
              setSuccess('');
            }
        } catch (error) {
          if (error.response.status === 401) {
            setError('Login failed. Please check your username and password.');
            setSuccess('');
          } else {
            setError('Failed to connect to the server.');
            setSuccess('');
          }
          console.log(error);
        }
    };

    return (
      <motion.div className='content'
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{ duration: 0.5, ease: 'anticipate' }}
      >
        <div className="account-container">
            <Link to="/" className="home-link">Home</Link>
            <h1>Login</h1>
            <form onSubmit={handleLogin} className="account-form">
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <button type="submit">Log In</button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
      </motion.div>
    );
}
