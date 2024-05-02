import { useState, useEffect } from 'react';
import Soar from '../styles/Soar3.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';
import pfp from '../styles/pfp.png';
import emoji from 'emoji-dictionary'
import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion'

axios.defaults.withCredentials = true;

const COLORS = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

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
  const color = useMotionValue(COLORS[0]);
  const backgroundImage = useMotionTemplate`radial-gradient(120% 120% at 50% 0%, #121212 70%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  useEffect(() => {
    fetchAPI();
    animate(color, COLORS, {
      ease: "easeInOut",
      duration: 30,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  
  return (      
    <motion.body
    style={{backgroundImage}}
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{ duration: 0.5, ease: 'easeIn' }}
    className="relative grid min-h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
    >
      <div className='content'>
    <>
      <div className="header">
      <div className="home-links">
      {loggedIn ? 
          <Link to="/dashboard" className="dashboard-button">Dashboard</Link> :
          <span className="dashboard-button-disabled"></span>
          }
      </div>
      <div className="logo-container">
        <img src={Soar} className="logo" alt="Soar logo" />
      </div>
      <div className="account-links">
        {loggedIn ? (
          <>
            <div className="PFP-container">
              <img src={pfp} alt="Profile" className="PFP"/>
              <p className='underPFP'>{username}</p>
            </div>
            <button className="logout-button" onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-button">Login</Link>
            <Link to="/create-account" className="create-button">Sign Up</Link>
          </>
        )}
      </div>
    </div>
      
      <motion.div className="card" style={{
        boxShadow,
        border,
        }}>
      {loggedIn ? (
        <>
          <h1>Hey, {username}! {emoji.getUnicode("wave")}</h1> 
          <h2>Thanks for using our app.</h2>
          <h2>Go ahead and click Dashboard to begin your journey.</h2>
          </>
        ) : ( <>
          <h1>Assistive Reading App</h1> 
          </>
        )}
        <div>
        </div>
      </motion.div>
      {loggedIn ? <></> : ( <>
        <h3 className='appe'>The application leverages artificial intelligence to 
        simplify complex texts into clear, easily understandable sentences, 
        enhancing readability for users. It accepts documents, 
        processes them to reduce linguistic complexity, and outputs simplified versions. 
        All documents are securely stored in the cloud, ensuring easy access and management for users. 
        </h3>
        <h2>Please create an account for access.</h2>
        </>
        )}
    </>
    </div>
    <div className='footer'>
  <p>
    {members.map((member, index) => (
    <span key={index}>
      {member}
      {index !== members.length - 1 && " | "}
    </span>
    ))}
  </p>
</div>
    </motion.body>
  );
}

export default App;
