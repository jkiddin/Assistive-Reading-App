import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Reader() {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1); 

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages); // Set total number of pages
    }, []);

    const fetchAPI = useCallback(async () => {
        try {
            const response = await axios.get("http://127.0.0.1:3001/pdf/AppTest.pdf", {
                responseType: 'blob',
                withCredentials: true
            });
            
            // Create a URL for the PDF Blob and update state
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setFile(fileURL);
        } catch (error) {
            console.error("Error fetching the PDF: ", error);
        }
    }, []);

    useEffect(() => {
        fetchAPI(); // Fetch PDF upon component mount
    }, []);

    // Function to go to the previous page
    const goToPrevPage = useCallback(() => setPageNumber(prevPage => prevPage - 1), []);

    // Function to go to the next page
    const goToNextPage = useCallback(() => setPageNumber(prevPage => prevPage + 1), []);

    return (
        <div>
            {file && (
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <Page pageNumber={pageNumber} /> {/* Render the current page */}
                </Document>
            )}
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
