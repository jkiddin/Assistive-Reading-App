import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Account.css';

export default function CreateAccount() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCreateAccount = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:3001/create-account', { username, password });
            if (response.data.status === 'Success') {
                setSuccess('Account successfully created!');
                setUsername('');
                setPassword('');
                setError('');
            } else {
                setError('Failed to create account. Please try again.');
                setSuccess('');
            }
        } catch (error) {
            setError('Failed to connect to the server.');
            setSuccess('');
            console.log(error);
        }
    };

    return (
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
    );
}
