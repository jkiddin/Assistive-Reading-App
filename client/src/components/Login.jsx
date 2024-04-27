import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Account.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:3001/login', { username, password });
            if (response.data.status === 'Success') {
                setSuccess('Logged in!');
                setError('');
                console.log("Logged in successfully!");
            } else {
                setError('Login failed. Please check your username and password.');
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
    );
}
