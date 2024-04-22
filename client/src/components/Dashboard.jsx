import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; 

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null); // Initialize file state as null
  const [fileDict, setFileDict] = useState({});

  const navigate = useNavigate();

  const handleReadDocument = (title) => {
    navigate(`/reader/${encodeURIComponent(title)}`);
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
      setFileDict(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleSubmit = async () => {
    if (!file || !title) {
        alert('Please fill in all fields.');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    // First, upload the file and update metadata
    try {
        const uploadResponse = await axios.post(
            'http://localhost:3001/upload-files', 
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log(uploadResponse.data);
        
        // If upload is successful, proceed to process the PDF
        if (uploadResponse.status === 200) {
          closePopup(); 
          fetchFiles();
            const processResponse = await axios.post(
                'http://localhost:3001/process-pdf', 
                { filename: uploadResponse.data.filename, title: title }
            );
            console.log(processResponse.data);
        }
    } catch (error) {
        console.error('Error handling document:', error);
    }
};
  
  return (
    <div>
       <div className="header">
    <Link to="/" className="home-button">App</Link>
    </div>
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
        {Object.entries(fileDict).map(([title, fileName], index) => (
          <div key={index} style={{ /* styling code */ }}>
            <span>{title}</span>
            <button 
              onClick={() => handleReadDocument(title)}
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