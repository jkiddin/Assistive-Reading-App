import { useState, useEffect } from 'react';
import reactLogo from '../assets/react.svg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

function App() {
  const [count, setCount] = useState(0);
  const [members, setMembers] = useState([]);

  const fetchAPI = async () => {
      const response = await axios.get("http://127.0.0.1:3001/");
      console.log(response.data.group_members);
      setMembers(response.data.group_members);
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      <div className="header">
      <div className="home-links">
        <Link to="/dashboard" className="dashboard-button">Dashboard</Link>
      </div>
      <div className="logo-container">
        <img src={reactLogo} className="logo" alt="React logo" />
      </div>
      <div className="account-links">
        <Link to="/login" className="login-button">Login</Link>
        <Link to="/create-account" className="create-button">New Here?</Link>
      </div>
    </div>
      <h1>Assistive Reading App</h1>
      <div className="card">
        <button onClick={() => setCount(count + 1)}>
          Count is {count}
        </button>
        <div>
          <h2>Group Members</h2>
          <ol>
            {members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

export default App;
