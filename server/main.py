from flask import Flask, jsonify, request, session
from flask import send_from_directory
from flask_cors import CORS
from werkzeug.utils import safe_join, secure_filename
import tempfile
import json
import os
import base64
from simplification import simplify_pdf, simplify_text
from pdfminer.high_level import extract_text


app = Flask(__name__)
simplified_cache = {}
simplifying_docs = {}

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
METADATA_FILE = './database/metadata.json'

def read_metadata():
    if not os.path.isfile(METADATA_FILE):
        return {}
    with open(METADATA_FILE, 'r') as file:
        return json.load(file)

def write_metadata(metadata):
    with open(METADATA_FILE, 'w') as file:
        json.dump(metadata, file, indent=2)

@app.route('/upload-files', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'No file part'})
    file = request.files['file']
    title = request.form.get('title', 'Untitled')  # Default title to 'Untitled' if not provided
    if file.filename == '':
        return jsonify({'status': 'No selected file'})
    if file:
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(PDF_STORAGE_FOLDER, filename)
        file.save(file_path)
        metadata = read_metadata()
        metadata[title] = filename
        write_metadata(metadata)
        return jsonify({'status': 'ok', 'title': title, 'filename': filename})


@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    data = request.json
    filename = data.get('filename')
    title = data.get('title')

    file_path = os.path.join(PDF_STORAGE_FOLDER, filename)
 
    # Call the processing function with both file_path and output_path
    simplify_pdf(file_path)

    return jsonify({'status': 'Processing started', 'title': title}), 202


@app.route('/pdf/<title>', methods=['GET'])
def get_pdf_by_title(title):
    metadata = read_metadata()
    
    # Determine if the request is for a simplified version based on the title
    is_simplified = title.endswith('_simplified')
    if is_simplified:
        title = title[:-11]  # Remove '_simplified' from the end

    filename = metadata.get(title)
    if not filename:
        return jsonify({'error': 'Title not found'}), 404
    
    # Add '_simplified' to the filename for simplified versions
    if is_simplified:
        filename = f"{os.path.splitext(filename)[0]}_simplified.pdf"

    secure_filename_path = secure_filename(filename)
    try:
        if not os.path.exists(safe_join(PDF_STORAGE_FOLDER, secure_filename_path)):
            raise FileNotFoundError
        return send_from_directory(PDF_STORAGE_FOLDER, secure_filename_path, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/pdf/<title>/<int:page>', methods=['GET'])
def get_simplified_pdf_page(title, page):
    
    metadata = read_metadata()
    og_filename = metadata.get(title)

    if not og_filename:
        return jsonify({'error': 'Title not found'}), 404
    
    filename = f"{os.path.splitext(og_filename)[0]}_simplified.pdf"
    
    
    secure_filename_path = secure_filename(filename)
    secure_filename_path = safe_join(PDF_STORAGE_FOLDER, secure_filename_path)

    if os.path.exists(secure_filename_path):
        try:
            print(secure_filename_path)
            # pdfminer's extract_text function can take page numbers as a list of zero-indexed integers
            extracted_text = extract_text(secure_filename_path, page_numbers=[page-1])  # page_number is 1-based, adjust for zero-based index
            single_newline_fixed_text = extracted_text.replace('\n', ' ')
            paragraphs = single_newline_fixed_text.split('  ')  # Two spaces
            print("hello") 
            
            
            return jsonify(paragraphs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        secure_filename_path = secure_filename(og_filename)
        secure_filename_path = safe_join(PDF_STORAGE_FOLDER, secure_filename_path)
        extracted_text = extract_text(secure_filename_path, page_numbers=[page-1])
        simplified_text = simplify_text(extracted_text)
        simplified_cache[title][page-1] = simplified_text
        single_newline_fixed_text = simplified_text.replace('\n', ' ')
        paragraphs = single_newline_fixed_text.split('  ')  # Two spaces
        return jsonify(paragraphs)

    
# Get list of files
@app.route('/get-files', methods=['GET'])
def get_files():
    # Check if the metadata file exists
    if not os.path.exists(METADATA_FILE):
        return jsonify({}), 200  # Return an empty dictionary

    # Read the contents of the metadata file
    with open(METADATA_FILE, 'r') as file:
        metadata = json.load(file)
        return jsonify(metadata), 200  # Return the contents of the metadata file as JSON
    

if __name__ == '__main__':
    app.run(debug=True, port=3001)  