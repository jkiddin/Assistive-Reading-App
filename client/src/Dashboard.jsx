import React, { useState } from 'react';
import axios from 'axios'; // Make sure to import axios

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null); // Initialize file state as null

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
    </div>
  );
}

export default Dashboard;