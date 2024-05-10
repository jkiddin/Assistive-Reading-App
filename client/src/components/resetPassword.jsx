import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Account.css';
import { motion } from 'framer-motion';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailPattern.test(email);
      };

    const handleReset = async (event) => {
        event.preventDefault();

        if (!validateEmail(email)) {
            setMessage("That email doesn't look right. Please check it and try again.")
            return;
        }
        
        try {
            const response = await axios.post('http://127.0.0.1:3001/send-reset-email', { email });
            if (response.status === 200) {
            setMessage('Email sent. Check your inbox for instructions.')
            }
        } catch (error) {
            setMessage('Failed to send reset email. An account with that email may not exist. Please try again.');
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
            <h1>Reset Password</h1>
            <form onSubmit={handleReset} className="account-form">
            <label>
                Email:
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className='resetButton' type='submit'>Send Reset Link</button>
            <p>{message}</p>
            </form>
        </div>
        </motion.div>
    );
}
