import React, { useState } from 'react';
import axios from 'axios';

export default function CreateAccount() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCreateAccount = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:3001/create-account', { username, password });
            if (response.data.status === 'Account created') {
                setSuccess('Account successfully created!');
                setUsername('');
                setPassword('');
                setError('');
            } else if (response.data.status === 'Failed') {
                setError('Account already exists.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } catch (error) {
            setError('Failed to connect to the server.');
            console.log(error);
            
        }
    };

    return (
        <div>
            <h1>Create Account</h1>
            <form onSubmit={handleCreateAccount}>
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
                {error && <p>{error}</p>}
                {success && <p>{success}</p>}
            </form>
        </div>
    );
}
