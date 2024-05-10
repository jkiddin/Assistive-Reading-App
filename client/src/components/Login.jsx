import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Account.css';
import { motion } from 'framer-motion';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:3001/login', { username, password });
            if (response.status === 200) {
                navigate('/', { replace: true });
            } else {
                setError('Something went wrong. Please try again.');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Login failed. Please check your username and password.');
            } else if (error.response.status == 423) {
              setError('User is locked out. Please reset your password.')
            }
            else {
                setError('Failed to connect to the server.');
            }
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
                <button className='loginButton' type="submit">Login</button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <Link to="/reset-password" className="reset-password-link">Forgot Password?</Link>
        </div>
      </motion.div>
    );
}
