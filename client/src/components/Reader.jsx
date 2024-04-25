import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useParams } from 'react-router-dom';
import {  Link } from 'react-router-dom';
import jsPDF from 'jspdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Reader() {
    const { title } = useParams(); // title of file
    const [file, setFile] = useState(null); // file with original pdf
    const [simplifiedPage, setSimplifiedPage] = useState(null); // file with simplified page
    const [numPages, setNumPages] = useState(null); // number of pages
    const [pageNumber, setPageNumber] = useState(1); // reader's progress
    const [isLoaded, setIsLoaded] = useState(false); // whether reader's progress has been fetched yet

    const onDocumentLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages); 
    }, []);

    // fetch original pdf
    const fetchPDF = async (url) => {
        try {
            const response = await axios.get(url, {
                responseType: 'blob',
                withCredentials: true
            });
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setFile(fileURL);
        } catch (error) {
            console.error("Error fetching the PDF: ", error);
        }
    };

    // fetch simplified page for the pdf
    const fetchPage = async (title, pageNumber, setSimplifiedPage, source) => {
        try {
            const response = await axios.get(`http://127.0.0.1:3001/pdf/${encodeURIComponent(title)}/${pageNumber}`, {
                cancelToken: source.token,  // Use the cancellation token
                responseType: 'json'  // Ensure you're expecting the correct response type
            });
    
            const paragraphs = response.data;
            const doc = new jsPDF();
            doc.setFont('Helvetica');
            doc.setFontSize(12);
            let yPos = 40;
            const margin = 10;
            const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin;
    
            paragraphs.forEach(para => {
                let lines = doc.splitTextToSize(para, maxWidth).map(line => line.trim());
                lines.forEach(line => {
                    doc.text(line, margin, yPos);
                    yPos += 10;
                });
                yPos += 5;
            });
    
            const pdfBlob = doc.output('blob');
            const pdfObjectUrl = URL.createObjectURL(pdfBlob);
            setSimplifiedPage(pdfObjectUrl);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Fetch for page was cancelled:', pageNumber);
            } else {
                console.error("Error fetching or generating PDF: ", error);
            }
        }
    };

    // fetch pdf on load or if title changes
    useEffect(() => {
        const encodedTitle = decodeURIComponent(title);
        // Fetch original PDF
        fetchPDF(`http://127.0.0.1:3001/pdf/${encodedTitle}`);
    }, [title]);


      // fetch simplfied page only after page number has been loaded
    useEffect(() => {
        const source = axios.CancelToken.source();  // Create a new token for this effect cycle
    
        if (isLoaded) {
            setSimplifiedPage(null);  // Reset the simplified page state
            fetchPage(title, pageNumber, setSimplifiedPage, source);  // Pass the cancellation token source
        }
    
        return () => {
            source.cancel('Cancelled by next render');  // Cleanup function cancels ongoing request
        };
    }, [title, pageNumber, isLoaded]);  // Dependencies include all used in fetchPage
    
    // load reading progress
    useEffect(() => {
        const loadProgress = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/get-progress/${encodeURIComponent(title)}`);
                setPageNumber(response.data.progress || 1);
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to load progress:', error);
                setPageNumber(1);
                setIsLoaded(true);
            }
        };
        setIsLoaded(false);
        loadProgress();
    }, [title]);

    // only save progress once page number is fetched
    useEffect(() => {
        if (isLoaded) { 
            const saveProgress = async () => {
                try {
                    await axios.post(`http://localhost:3001/update-progress/${encodeURIComponent(title)}`, {
                        page_number: pageNumber
                    });
                } catch (error) {
                    console.error('Failed to update progress:', error);
                }
            };
        

            saveProgress();
        }
    }, [pageNumber, title]);  
    
   
    // Function to go to the previous page
    const goToPrevPage = useCallback(() => 
    setPageNumber(prevPage => prevPage - 1),
     []);

    // Function to go to the next page
    const goToNextPage = useCallback(() => setPageNumber(prevPage => prevPage + 1), []);

    // return links and the pdf with simplification by its side
    return (
        <div>
            <div className="header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                marginTop: '-30px',           // Reduces top margin
                marginBottom: '5px',     
                backgroundColor: '#f5f5f5', // Light gray background
                padding: '5px 0',        
                width: '100%',            
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'sticky', // Makes the header sticky
                top: '0', // Define the top boundary for the sticky element
                zIndex: '1000' // Ensure the header is on top of other content
            }}>
                <Link to="/" className="home-button">App</Link>
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
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {simplifiedPage ? (
                        <Document file={simplifiedPage}>
                            <Page pageNumber={1} />
                        </Document>
                    ) : (
                        <div style={{
                            padding: '300px 220px', // More padding on the top and bottom, less on the sides
                            fontSize: '16px',
                            color: '#888',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%', 
                            width: '100%' 
                        }}>
                            Loading Simplification...
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
}

export default Reader;