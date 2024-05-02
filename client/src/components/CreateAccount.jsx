import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Account.css';
import { motion } from 'framer-motion'

export default function CreateAccount() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUppercase && hasSpecialChar;
    };

    const handleCreateAccount = async (event) => {
        event.preventDefault();
        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long, include an uppercase letter, and a special character.');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:3001/create-account', { username, password });
            if (response.status === 201) {
                setSuccess('Account successfully created!');
                setUsername('');
                setPassword('');
                setError('');
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setError('Account already exists.');
            } else if (error.response && error.response.status === 500) {
                setError('Failed to create account. Please try again.');
            } else {
                setError('Failed to connect to the server.');
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
            <h1>Create Account</h1>
            <form onSubmit={handleCreateAccount} className="account-form">
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
                <button type="submit">Create Account</button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
      </motion.div>
    );
}
