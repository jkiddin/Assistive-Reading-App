import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; 
import '../styles/Dashboard.css'
import { motion } from 'framer-motion'

function Dashboard() {
  const [showPopup, setShowPopup] = useState(false); // whether to display popup to add file
  const [title, setTitle] = useState(''); // title of document to be added
  const [file, setFile] = useState(null); // title of file to be added
  const [fileDict, setFileDict] = useState({}); // dictionary of files to display

  const navigate = useNavigate();

  // open link to read document
  const handleReadDocument = (title) => {
    navigate(`/reader/${encodeURIComponent(title)}`);
  };

  // delete Document from list of books and fetch updated list
  const deleteDocument = async (title) => {
    try {
        const response = await axios.delete(`http://127.0.0.1:3001/delete-document/${encodeURIComponent(title)}`);
        console.log(response.data);
        alert('Document deleted successfully!');
        await fetchFiles();  
    } catch (error) {
        console.error('Error deleting the document:', error);
        alert('Failed to delete the document.');
    }
}
  
  // fetch list of files on Load
  useEffect(() => {
    fetchFiles();
  }, []);

  const showUploadPopup = () => {
    setShowPopup(!showPopup);
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

  // retrieve list of files
  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:3001/get-files');
      console.log(response.data);
      setFileDict({ ...response.data });
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  // submit the new file
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
            'http://127.0.0.1:3001/upload-files', 
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log(uploadResponse.data);
        
        // If upload is successful, proceed to process the PDF for API simplification
        if (uploadResponse.status === 200) {
          closePopup(); 
          fetchFiles();
            const processResponse = await axios.post(
                'http://127.0.0.1:3001/process-pdf', 
                { filename: uploadResponse.data.filename, title: title }
            );
            console.log(processResponse.data);
        }
    } catch (error) {
        console.error('Error handling document:', error);
    }
};
  
// display Links to other pages, upload document method, and list of documents for the user
  return (
    <motion.div className='content'
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    transition={{ duration: 0.5, ease: 'easeIn' }}
    >
      <div className="header">
          <Link to="/" className="home-button">App</Link>
      </div>
      <button onClick={showUploadPopup}>Upload Document</button>
      {showPopup && (
        <div className='upload-container'>
        <div className="upload-popup">
          <h2 className='titleD'>Title of Document</h2>
          <input
            className='document-title'
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={handleTitleChange}
          />
          <input type="file" accept="application/pdf" onChange={handleFileUpload} />
          <button onClick={handleSubmit}>Submit</button> 
          <button onClick={closePopup}>Close</button>
        </div>
        </div>
      )}
      <div className='dash-holder' style={{ marginTop: '20px' }}>
        {Object.entries(fileDict).map(([title, fileName], index) => (
          <div className='dash-row' key={index} style={{ /* styling code */ }}>
            <span>{title}</span>
            <button 
              onClick={() => handleReadDocument(title)}
              style={{ /* styling code for button */ }}
            >
            Read Document
            </button>
            <button 
              onClick={() => deleteDocument(title)}
              style={{ /* styling code for button */ }}
            >
            Delete Document
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Dashboard;