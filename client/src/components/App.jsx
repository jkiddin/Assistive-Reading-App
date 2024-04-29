import { useState, useEffect } from 'react';
import reactLogo from '../assets/react.svg';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';
import pfp from '../styles/pfp.png';

axios.defaults.withCredentials = true;

function App() {
  const [count, setCount] = useState(0);
  const [members, setMembers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const fetchAPI = async () => {
      const response = await axios.get("http://127.0.0.1:3001/");
      setMembers(response.data.group_members);

      try {
        const user = await axios.get("http://127.0.0.1:3001/is_logged_in");
        setLoggedIn(user.data.logged_in);
        setUsername(user.data.user_id);
        console.log(user) /* debug */
      } catch (error) {
        console.log(error.response.data);
      }
  };

  const handleLogout = async () => {
    axios.post('http://127.0.0.1:3001/logout', {}, { withCredentials: true })
         .then(response => {
             console.log('Logout successful:', response.data);
             window.location = '/';
         })
         .catch(error => {
             console.error('Logout failed:', error);
         });
};


  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      <div className="header">
      <div className="home-links">
      {loggedIn ? 
          <Link to="/dashboard" className="dashboard-button">Dashboard</Link> :
          <span className="dashboard-button-disabled">Login to Access</span>
          }
      </div>
      <div className="logo-container">
        <img src={reactLogo} className="logo" alt="React logo" />
      </div>
      <div className="account-links">
        {loggedIn ? (
          <>
            <div className="PFP-container">
              <img src={pfp} alt="Profile" className="PFP"/>
            </div>
            <button className="logout-button" onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-button">Login</Link>
            <Link to="/create-account" className="create-button">New Here?</Link>
          </>
        )}
      </div>
    </div>
      {loggedIn ? 
          <h1>Hey, {username}!</h1> : /* Implement "Hey, <user!>"*/
          <h1>Assistive Reading App</h1> 
        }
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
