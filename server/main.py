from flask import Flask, jsonify, request, make_response, session, Response
from flask import send_from_directory
from flask_cors import CORS, cross_origin
from werkzeug.utils import safe_join, secure_filename
import json
import os
from simplification import simplify_pdf, simplify_text
from sql import create_connection, check_user_credentials, add_user
from functools import wraps
from pdfminer.high_level import extract_text
from datetime import timedelta


app = Flask(__name__)
simplified_cache = {} # this will hold simplified text so api calls don't have to be repeated

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True) # change later
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SESSION_COOKIE_NAME'] = 'authToken'
app.config['SESSION_COOKIE_HTTPONLY'] = False
app.config['SESSION_COOKIE_SECURE'] = True
app.config['REMEMBER_COOKIE_DURATION'] = 86400
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # 'Strict', 'Lax', or 'None'

# API Key
app.secret_key = os.environ.get('SECRET_KEY', 'default_key_for_development')


# MySQL database configuration
db_host = "localhost"
db_user = "super"
db_password = os.environ.get("SQL_PASS")
db_name = "schemo"

# Create database connection
db_connection = create_connection(db_host, db_user, db_password, db_name)

@app.route('/')
def home():
    return jsonify(
        {
            "group_members": [
                'Joshua Kats',
                'Andrew Thomas',
                'Hannah Varughese'
            ]
        }
    )

# Path to database and files. Will not need this after Mongo is implemented
PDF_STORAGE_FOLDER = './database'
METADATA_FILE = './database/metadata.json'

# reading and writing to metadata file. Won't need this after Mongo
def read_metadata():
    if not os.path.isfile(METADATA_FILE):
        return {}
    with open(METADATA_FILE, 'r') as file:
        return json.load(file)

def write_metadata(metadata):
    with open(METADATA_FILE, 'w') as file:
        json.dump(metadata, file, indent=2)


# This route updates list of files in Metadata and uploads the PDF
@app.route('/upload-files', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'No file part'})
    file = request.files['file']
    title = request.form.get('title')  
    if file.filename == '':
        return jsonify({'status': 'No selected file'})
    if file:
        
        # Should store original PDF in database here.
        filename = secure_filename(file.filename)
        file_path = os.path.join(PDF_STORAGE_FOLDER, filename)
        file.save(file_path)

        # Should update the update the title table in database and progress should have default value of 1
        metadata = read_metadata()
        metadata[title] = {}
        metadata[title]['filename'] = filename
        metadata[title]['progress'] = 1
        write_metadata(metadata)
        return jsonify({'status': 'ok', 'title': title, 'filename': filename})


# POST route to simplify the text using API CALL
@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    data = request.json
    filename = data.get('filename')
    title = data.get('title')

    # Should get original PDF from database here
    file_path = os.path.join(PDF_STORAGE_FOLDER, filename)
    
    # API call to create a pdf. Storing the simplified pdf should be done there.
    simplify_pdf(file_path)

    return jsonify({'status': 'Processing started', 'title': title}), 202

# POST route to save reader's progress
@app.route('/update-progress/<title>', methods=['POST'])
def update_progress(title):
    
    page_number = request.json.get('page_number')
    
    # UPDATE the progress in database table here
    metadata = read_metadata()
    
    if title in metadata:
        metadata[title]['progress'] = page_number
    
    write_metadata(metadata)
    return jsonify({"message": "Progress updated successfully"}), 200

# GET route to retrieve list of titles to display in dashboard
@app.route('/get-files', methods=['GET'])
def get_files():
    # wont need this later
    if not os.path.exists(METADATA_FILE):
        return jsonify({}), 200  

    # SELECT statement to retrieve list of titles from database here
    with open(METADATA_FILE, 'r') as file:
        metadata = json.load(file)
    
    # May need to change this to fit database call
    filtered_metadata = {key: {'filename': value['filename']} for key, value in metadata.items() if 'filename' in value}

    return jsonify(filtered_metadata), 200 

# GET Route that retrieves the original pdf
@app.route('/pdf/<title>', methods=['GET'])
def get_pdf_by_title(title):
    # Match the ID of the title with the database file table to retrieve the file and send it to frontend.
    metadata = read_metadata()
    
    filename = metadata.get(title, {}).get('filename') 
    if not filename:
        return jsonify({'error': 'Title not found'}), 404
    
    secure_filename_path = secure_filename(filename)
    try:
        if not os.path.exists(safe_join(PDF_STORAGE_FOLDER, secure_filename_path)):
            raise FileNotFoundError
        return send_from_directory(PDF_STORAGE_FOLDER, secure_filename_path, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

# GET Route that simplifies each page of PDF
@app.route('/pdf/<title>/<int:page>', methods=['GET'])
def get_simplified_pdf_page(title, page):
    
    # Check if file exists in database using SELECT statement
    metadata = read_metadata()
    og_filename = metadata.get(title, {}).get('filename') 

    if not og_filename:
        return jsonify({'error': 'Title not found'}), 404
    

    filename = f"{os.path.splitext(og_filename)[0]}_simplified.pdf"
    
    # Look for filename_simplified.pdf in database simplified file table here
    secure_filename_path = secure_filename(filename)
    secure_filename_path = safe_join(PDF_STORAGE_FOLDER, secure_filename_path)

    if os.path.exists(secure_filename_path):
        try:
            extracted_text = extract_text(secure_filename_path, page_numbers=[page-1]) 
            single_newline_fixed_text = extracted_text.replace('\n', ' ')
            paragraphs = single_newline_fixed_text.split('  ')  
            
            
            return jsonify(paragraphs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
         # Retrieve original PDF file from database file table
        secure_filename_path = secure_filename(og_filename)
        secure_filename_path = safe_join(PDF_STORAGE_FOLDER, secure_filename_path)
        extracted_text = extract_text(secure_filename_path, page_numbers=[page-1])
        simplified_text = simplify_text(extracted_text)
        # simplified_cache[title][page-1] = simplified_text // need to check if title exists first
        single_newline_fixed_text = simplified_text.replace('\n', ' ')
        paragraphs = single_newline_fixed_text.split('  ')  
        return jsonify(paragraphs)

# GET route that retrieves the progress so reader can pick up where they left off
@app.route('/get-progress/<title>', methods=['GET'])
def get_progress(title):
    
    # SELECT statement to retrieve progress based on title from database table here
    metadata = read_metadata()
    progress = metadata.get(title, {}).get('progress') 
    if not progress:
        return jsonify({"error": "Progress not found for the specified title"}), 404

    return jsonify({"title": title, "progress": progress}), 200

# DELETE route to remove document from dashboard
@app.route('/delete-document/<title>', methods=['DELETE'])
def delete_document(title):

    # Check if file exists in database here
    metadata = read_metadata()
    og_filename = metadata.get(title, {}).get('filename') 

    
    # delete title, filename, and progress from database table here. You can do this after deleting the files
    if og_filename:
        del metadata[title]
        write_metadata(metadata)

    secure_filename_path = secure_filename(og_filename)
    secure_filename_path = safe_join(PDF_STORAGE_FOLDER, secure_filename_path)

    # delete file from database table of files here.
    if os.path.exists(secure_filename_path):
        os.remove(secure_filename_path)
    
    simp_filename = f"{os.path.splitext(og_filename)[0]}_simplified.pdf"
    secure_filename_path = secure_filename(simp_filename)
    secure_filename_path = safe_join(PDF_STORAGE_FOLDER, secure_filename_path)

    # delete simplified file from database table of files here.
    if os.path.exists(secure_filename_path):
        os.remove(secure_filename_path)

    return jsonify({"message": "Document deleted successfully", "title": title}), 200
    
def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

@app.route('/create-account', methods=['POST', 'OPTIONS'])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def create_account():
    data = request.get_json()
    username = data['username']
    password = data['password']
    result = add_user(db_connection, username, password)
    if result == "duplicate":
        return jsonify({'status': 'Account already exists'}), 409
    elif result:
        return jsonify({'status': 'Account created successfully', 'user_id': result}), 201
    else:
        return jsonify({'status': 'Failed to create account'}), 500

@app.route('/login', methods=['POST'])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    if check_user_credentials(db_connection, username, password):
        resp = make_response(jsonify({'status': 'Login successful'}), 200)
        session['user_id'] = username  
        session.permanent = True
        return resp
    else:
        return jsonify({'status': 'Invalid username or password'}), 401

@app.route('/is_logged_in', methods=['GET'])
@cross_origin(methods=['GET'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def is_logged_in():
    if 'user_id' in session:
        return jsonify({'logged_in': True}), 200
    else:
        return jsonify({'logged_in': False}), 401

@app.route('/logout', methods=['POST'])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def logout():
    print("Logout Called!")
    session.permanent = False
    session.pop('user_id', None)
    response = jsonify({'status': 'Logged out successfully'})
    return response, 200


if __name__ == '__main__':
    app.run(debug=True, port=3001)