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
    <Link to="/dashboard" className="dashboard-button">Dashboard</Link>
    </div>
      <div>
        <a href="https://vitejs.dev" target="_blank">
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Assistive Reading App</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
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

