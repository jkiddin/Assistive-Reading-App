import React, { useState } from 'react';



function PDFViewer() {
 
  return (
    <div>
        <input type="file" accept=".pdf" onChange={(event) => this.setState({ selectedFile: event.target.files[0] })} />
    </div>
  );
}

export default PDFViewer;
