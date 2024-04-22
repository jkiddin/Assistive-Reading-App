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
    const { title } = useParams();
    const [file, setFile] = useState(null);
    const [simplifiedPage, setSimplifiedPage] = useState(null);
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

    const fetchPage = async () => {
        try {
            // Fetch the simplified text data for the specified page
            const response = await axios.get(`http://127.0.0.1:3001/pdf/${encodeURIComponent(title)}/${pageNumber}`);
            // console.log(response.data);
            const paragraphs = response.data; // Assuming the API returns an array of paragraphs
            console.log(paragraphs);

            // Create a new PDF with jsPDF and add text
            const doc = new jsPDF();
            doc.setFont('Helvetica'); // Set the font to Helvetica, which is a standard PDF font similar to system sans-serif fonts
            doc.setFontSize(12); // Set a standard font size, adjust as needed
            let yPos = 40; // Vertical position for the first line of text
            const margin = 10; // Margin for the sides
            const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin; // Maximum width of text
        
            paragraphs.forEach(para => {
            // Split the paragraph into lines considering the maximum width
            let lines = doc.splitTextToSize(para, maxWidth);
        
            lines = lines.map(line => line.trim()); // Trim any potential extra whitespace from each line

            lines.forEach(line => {
                // Ensure we don't write beyond the bottom of the page
                if (yPos > doc.internal.pageSize.getHeight() - 10) {
                console.warn('Not enough space for this line, text may be cut off.');
                // Handle this situation, perhaps by creating a new page or truncating text
                return;
                }
                doc.text(line, margin, yPos);
                yPos += 10; // Adjust line height spacing if needed
            });

            // Add extra space after each paragraph if desired
            yPos += 10; // Adjust paragraph spacing
            });
            // Generate a blob URL from the PDF
            const pdfBlob = doc.output('blob');
            
            const pdfObjectUrl = URL.createObjectURL(pdfBlob);
            setSimplifiedPage(pdfObjectUrl); // Store the URL of the generated PDF blob in state

        } catch (error) {
            console.error("Error fetching or generating PDF: ", error);
        }
    };

    useEffect(() => {
        const encodedTitle = decodeURIComponent(title);
        // Fetch original PDF
        fetchPDF(`http://127.0.0.1:3001/pdf/${encodedTitle}`);
    }, [title]);


    useEffect(() => {
        const encodedTitle = decodeURIComponent(title);
       
       // Fetch simplified PDF
        fetchPage(`http://127.0.0.1:3001/pdf/${encodedTitle}/${pageNumber}`);
    }, [title, pageNumber]);
    

    

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
                {/* Display the simplified PDF generated by jsPDF */}
                {simplifiedPage && (
                   <Document
                   file={simplifiedPage}  // Here we pass the blob URL to the 'file' prop
                 >
                   <Page pageNumber={1} />
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