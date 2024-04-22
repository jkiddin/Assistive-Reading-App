import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useParams } from 'react-router-dom';
import {  Link } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Reader() {
    const { title } = useParams();
    const [file, setFile] = useState(null);
    const [simplifiedFile, setSimplifiedFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1); 

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages); // Set total number of pages
    }, []);

    const fetchPDF = async (url, isSimplified = false) => {
        try {
            const response = await axios.get(url, {
                responseType: 'blob',
                withCredentials: true
            });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            isSimplified ? setSimplifiedFile(fileURL) : setFile(fileURL);
        } catch (error) {
            console.error("Error fetching the PDF: ", error);
        }
    };

    useEffect(() => {
        const encodedTitle = decodeURIComponent(title);
        // Fetch original PDF
        fetchPDF(`http://127.0.0.1:3001/pdf/${encodedTitle}`);
        // Fetch simplified PDF
        fetchPDF(`http://127.0.0.1:3001/pdf/${encodedTitle}_simplified`, true);
    }, [title]);

    // Function to go to the previous page
    const goToPrevPage = useCallback(() => setPageNumber(prevPage => prevPage - 1), []);

    // Function to go to the next page
    const goToNextPage = useCallback(() => setPageNumber(prevPage => prevPage + 1), []);

    const onRenderSuccess = useCallback((page) => {
        page.getTextContent().then((textContent) => {
          // Log the structure of textContent to the console
          console.log('Text content object:', textContent);
          
          const textItems = textContent.items;
          if (textItems && Array.isArray(textItems)) {
            const pageText = textItems.map(item => item.str).join(' ');
            console.log(pageText);
          }
        });
      }, []);
    return (
        <div>
            <div className="header">
                <Link to="/" className="home-button">App</Link>
            </div>
            <div className="header">
                <Link to="/dashboard" className="dashboard-button">Dashboard</Link>
            </div>
            <div className="pdf-viewer" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div>
                    {file && (
                        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                            <Page pageNumber={pageNumber} />
                        </Document>
                    )}
                </div>
                <div>
                    {simplifiedFile && (
                        <Document file={simplifiedFile} onLoadSuccess={onDocumentLoadSuccess}>
                            <Page pageNumber={pageNumber} />
                        </Document>
                    )}
                </div>
            </div>
            {numPages && (
                <div className="pagination">
                    <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
                        Prev
                    </button>
                    <span>Page {pageNumber} of {numPages}</span>
                    <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default Reader;