import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3001/is_logged_in');
        setIsAuthenticated(response.data.logged_in);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsAuthenticated(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
