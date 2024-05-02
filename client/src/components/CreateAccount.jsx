import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Account.css';
import { motion } from 'framer-motion';

export default function CreateAccount() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validatePassword = (password) => {
        const minLength = 10;
        const hasUppercase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUppercase && hasSpecialChar;
    };

    const validateEmail = (email) => {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return emailPattern.test(email);
    };

    const handleCreateAccount = async (event) => {
        event.preventDefault();

        if (!validatePassword(password)) {
          setError('Password must be at least 10 characters long, include an uppercase letter, and a special character.');
          return;
        }
        if (!validateEmail(email)) {
          setError("That email doesn't look right. Please check it and try again.")
          return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:3001/create-account', { username, password, email });
            if (response.status === 201) {
                setSuccess('Account successfully created!');
                setUsername('');
                setPassword('');
                setEmail('');
                setError('');
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setError('Account already exists.');
                setSuccess('');
            } else if (error.response && error.response.status === 500) {
                setError('Failed to create account. Please try again.');
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
                <label>
                    Email:
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <button type="submit">Create Account</button>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
      </motion.div>
    );
}
