import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null); // Initialize file state as null
  const [fileArray, setFileArray] = useState([]);

  const showUploadPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]); // Set the selected file to state
  };

  const fetchFiles = async () => {
    try {
      // Make a GET request to your backend to fetch the files
      const response = await axios.get('http://localhost:3001/get-files');
      setFileArray(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);
  
  

  // Function to handle the form submission and send the POST request
  const handleSubmit = async () => {
    if (!file || !title) {
      alert('Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const response = await axios.post(
        'http://localhost:3001/upload-files', 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log(response.data); 
      closePopup(); 
    } catch (error) {
      console.error('Error uploading document:', error);
    }
    fetchFiles();
  };

  return (
    <div>
      <button onClick={showUploadPopup}>Upload Document</button>
      {showPopup && (
        <div className="upload-popup">
          <h2>Title of Document</h2>
          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={handleTitleChange}
          />
          <input type="file" accept="application/pdf" onChange={handleFileUpload} />
          <button onClick={handleSubmit}>Submit</button> 
          <button onClick={closePopup}>Close</button>
        </div>
      )}
      {/* Render a colored, rounded div for each document */}
      <div style={{ marginTop: '20px' }}>
        {fileArray.map((file, index) => (
          <div key={index} style={{
            backgroundColor: '#f0f0f0', // Light grey background
            borderRadius: '10px', // Rounded corners
            padding: '10px 200px',
            margin: '10px 0', // Margin for top and bottom
            color: '#333', // Text color
            display: 'flex',
            justifyContent: 'space-between', // Space out the title and any buttons or icons you might add later
            alignItems: 'center',
            width: '100%' // Make divs stretch to full container width
          }}>
            <span>{file.title}</span>
            {/* Add a "Read Document" button */}
            <button style={{
              padding: '5px 10px', // Add some padding
              borderRadius: '5px', // Slightly rounded corners
              cursor: 'pointer', // Change cursor on hover
              backgroundColor: '#F5F5DC',
              border: 'none' // Remove default button border
            }}>Read Document</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;