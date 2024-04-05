import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null); // Initialize file state as null
  const [fileArray, setFileArray] = useState([]);

  const navigate = useNavigate();

  const handleReadDocument = (fileName) => {
    // console.log(fileArray);
    // console.log(fileName);
    navigate(`/reader/${encodeURIComponent(fileName)}`);
  };

  
  useEffect(() => {
    fetchFiles();
  }, []);
  
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
          <div key={index} style={{ /* styling code */ }}>
            <span>{file.title}</span>
            <button 
              onClick={() => handleReadDocument(file.fileName)}
              style={{ /* styling code for button */ }}
            >
              Read Document
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;