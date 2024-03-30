from flask import Flask, jsonify, request, session
from flask import send_from_directory
from flask_cors import CORS
from werkzeug.utils import safe_join, secure_filename
import tempfile
import os
import base64


app = Flask(__name__)
CORS(app, supports_credentials=True, origins="http://localhost:5173")# change later

app.secret_key = os.environ.get('SECRET_KEY', 'default_key_for_development')

@app.route('/')
def group_names():
    return jsonify(
        {
            "group_members": [
                'Joshua Kats',
                'Andrew Thomas',
                'Hannah Varughese'
            ]
        }
    )

PDF_STORAGE_FOLDER = './database'

@app.route('/upload-files', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'No file part'})

    file = request.files['file']
    title = request.form.get('title', 'Untitled')  # Default title to 'Untitled' if not provided

    # Check if a file was selected
    if file.filename == '':
        return jsonify({'status': 'No selected file'})

    if file:
        # Secure the filename to ensure it's safe to use in file system paths
        filename = secure_filename(file.filename)
        
        # Generate the full file path
        file_path = os.path.join(PDF_STORAGE_FOLDER, filename)
        
        # Save the file to the designated directory
        file.save(file_path)

        print("Received POST request")  # Log that a POST request was received
        print(f"File {filename} saved successfully in {PDF_STORAGE_FOLDER}")  # Log saved file

        # Respond with the status, title, and filename
        return jsonify({'status': 'ok', 'title': title, 'filename': filename})

# Get uploaded file   
@app.route('/pdf/<filename>', methods=['GET'])
def get_pdf(filename):
    # Secure the filename 
    secure_filename_path = secure_filename(filename)

    try:
        # Construct a secure file path and verify the file exists
        file_path = safe_join(PDF_STORAGE_FOLDER, secure_filename_path)
        
        # Send the file if it exists
        return send_from_directory(PDF_STORAGE_FOLDER, secure_filename_path, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404


if __name__ == '__main__':
    app.run(debug=True, port=3001)  