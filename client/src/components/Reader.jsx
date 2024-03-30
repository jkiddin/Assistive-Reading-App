import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { pdfjs, Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Reader() {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const fetchAPI = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:3001/pdf/AppTest.pdf", {
                responseType: 'blob',
                withCredentials: true
            });
            console.log('PDF fetched successfully:');
            console.log('Blob size:', response.data.size, 'bytes');
            console.log('Blob type:', response.data.type); 
            // Create a URL for the PDF Blob
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setFile(fileURL);

        } catch (error) {
            console.error("Error fetching the PDF: ", error);
        }
    };

    useEffect(() => {
        fetchAPI();
    }, []);

    return (
        <div>
            {file && (
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    {Array.from(
                        new Array(numPages),
                        (el, index) => (
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                            />
                        ),
                    )}
                </Document>
            )}
        </div>
    );
}

export default Reader;
