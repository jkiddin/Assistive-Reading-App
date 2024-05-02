import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Account.css';
import { motion } from 'framer-motion'

export default function ResetPasswordWithOTP() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailPattern.test(email);
    };

    const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUppercase && hasSpecialChar;
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();

        if (!validateEmail(email)) {
            setMessage("That email doesn't look right. Please check it and try again.")
            return;
        } 

        if (!validatePassword(newPassword)) {
            setMessage('Password must be at least 8 characters long, include an uppercase letter, and a special character.');
            return;
          }

        try {
            const verifyResponse = await axios.post('http://127.0.0.1:3001/verify-otp', { email, otp });
            if (verifyResponse.status === 200) {
                const updateResponse = await axios.post('http://127.0.0.1:3001/update-password', { email, newPassword });
                if (updateResponse.status === 200) {
                    setMessage('Password has been reset successfully.');
                } else {
                    setMessage('Failed to reset password.');
                }
            } else {
                setMessage('Invalid OTP. Please try again.');
            }
        } catch (error) {
            setMessage('Error processing your request.');
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
            <form onSubmit={handleResetPassword} className="account-form">
                <label>Email:
            <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </label>
            <label>
                OTP:
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
            />
            </label>
            <label>
                Password:
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            </label>
            <button className='buttonResetPassword' type='submit'>Reset Password</button>
            <p>{message}</p>
            </form>
        </div>
        </motion.div>
    );
}
