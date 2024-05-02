from flask import Flask, jsonify, request, make_response, session, Response
from flask import send_from_directory
from flask_cors import CORS, cross_origin
from werkzeug.utils import safe_join, secure_filename
import datetime
import json
import os
import mongodb
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from simplification import simplify_pdf, simplify_text
from sql import create_connection, check_user_credentials, add_user, update_user_password, email_exists, user_exists, lockout, unlock, retrieve_attempts, add_attempt, reset_attempts
from functools import wraps
from pdfminer.high_level import extract_text
from datetime import timedelta

app = Flask(__name__)
simplified_cache = {} # this will hold simplified text so api calls don't have to be repeated

collection = mongodb.get_mongodb_collection('uploads')

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SESSION_COOKIE_NAME'] = 'authToken'
app.config['SESSION_COOKIE_HTTPONLY'] = False
app.config['SESSION_COOKIE_SECURE'] = True
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

otp_store = {}

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
PDF_STORAGE_FOLDER = './database'

# This route updates uploads PDF to filesystem and updates metadata in Atlas
@app.route('/upload-files', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'No file part'})
    file = request.files['file']
    title = request.form.get('title')
    if file.filename == '':
        return jsonify({'status': 'No selected file'})
    if file:
        
        # Metadata
        filename = secure_filename(file.filename)
        file_path = os.path.abspath(os.path.join(PDF_STORAGE_FOLDER, filename))
        file.save(file_path)
        filedata = {}
        filedata['title'] = title
        filedata['progress'] = 1
        filedata['filename'] = filename
        user_id = session.get('user_id')
        filedata['uploaded_by'] = user_id
        filedata['uploaded_timestamp'] = datetime.datetime.now(tz=datetime.timezone.utc).strftime('%Y-%m-%d T%H:%M:%S')
        filedata['filesystem_path'] = file_path
        collection.insert_one(filedata)
        return jsonify({'status': 'ok', 'title': title, 'filename': filename})

# POST route to simplify the text using API CALL
@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    data = request.json
    filename = secure_filename(data.get('filename'))
    title = data.get('title')
    doc = collection.find_one({'filename':filename})
    file_path = doc['filesystem_path']
    
    # API call to create a pdf. Storing the simplified pdf should be done there.
    simplify_pdf(file_path)
    return jsonify({'status': 'Processing started', 'title': title}), 202

# POST route to save reader's progress
@app.route('/update-progress/<title>', methods=['POST'])
def update_progress(title):
    
    page_number = request.json.get('page_number')
    user_id = session.get('user_id')

    doc = collection.find_one_and_update({'title' : title, 'uploaded_by' : user_id}, {'$set':{'progress' : page_number}})
    return jsonify({"message": "Progress updated successfully"}), 200

# GET route to retrieve list of titles to display in dashboard
@app.route('/get-files', methods=['GET'])
def get_files():
    # Get metadata for all uploads from MongoDB
    user_id = session.get('user_id')
    uploads = list(collection.find({'uploaded_by': user_id}))  
    filtered_metadata = {}
    for upload in uploads:
        filtered_metadata[upload['title']] = { 'filename': upload['filename'] }
    
    return jsonify(filtered_metadata), 200 

# GET Route that retrieves the original pdf
@app.route('/pdf/<title>', methods=['GET'])
def get_pdf_by_title(title):
    user_id = session.get('user_id')
    # Match the ID of the title with the database file table to retrieve the file and send it to frontend.
    doc = collection.find_one({'title': title, 'uploaded_by' : user_id})
    if not doc:
        return jsonify({'error': 'Title not found'}), 404
    filename = doc['filename']
    filesystem_path = doc['filesystem_path']
    directory = os.path.dirname(filesystem_path)
    try:
        if not os.path.exists(filesystem_path):
            raise FileNotFoundError
        return send_from_directory(directory, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    
# GET Route that simplifies each page of PDF
@app.route('/pdf/<title>/<int:page>', methods=['GET'])
def get_simplified_pdf_page(title, page):
    user_id = session.get('user_id')
    doc = collection.find_one({'title':title, 'uploaded_by' : user_id})
    filename = doc['filename']
    filesystem_path = doc['filesystem_path']
    if not filename:
        return jsonify({'error': 'Title not found'}), 404
    
    directory = os.path.dirname(filesystem_path)
    simplified_filename = f"{os.path.splitext(filename)[0]}_simplified.pdf"
    simplified_filesystem_path = f"{directory}/{simplified_filename}"
    if os.path.exists(simplified_filesystem_path):
        try:
            extracted_text = extract_text(simplified_filesystem_path, page_numbers=[page-1]) 
            single_newline_fixed_text = extracted_text.replace('\n', ' ')
            paragraphs = single_newline_fixed_text.split('  ')  
            
            
            return jsonify(paragraphs)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        
        extracted_text = extract_text(filesystem_path, page_numbers=[page-1])
        simplified_text = simplify_text(extracted_text)
      
        single_newline_fixed_text = simplified_text.replace('\n', ' ')
        paragraphs = single_newline_fixed_text.split('  ')  
        return jsonify(paragraphs)
    
# GET route that retrieves the progress so reader can pick up where they left off
@app.route('/get-progress/<title>', methods=['GET'])
def get_progress(title):
    user_id = session.get('user_id')
    
    doc = collection.find_one({'title':title, 'uploaded_by' : user_id})
    progress = doc['progress']
    if not progress:
        return jsonify({"error": "Progress not found for the specified title"}), 404
    return jsonify({"title": title, "progress": progress}), 200

# DELETE route to remove document from dashboard
@app.route('/delete-document/<title>', methods=['DELETE'])
def delete_document(title):
    user_id = session.get('user_id')
    doc = collection.find_one({'title':title, 'uploaded_by' : user_id})
    filename = doc['filename']
    filesystem_path = doc['filesystem_path']
    if doc:
        collection.delete_one({'title':title})
    # delete file from filesystem
    if os.path.exists(filesystem_path):
        os.remove(filesystem_path)
    
    simplified_filename = f"{os.path.splitext(filename)[0]}_simplified.pdf"
    directory = os.path.dirname(filesystem_path)
    simplified_filesystem_path = f"{directory}/{simplified_filename}"
    
    # delete simplified file from filesystem
    if os.path.exists(simplified_filesystem_path):
        os.remove(simplified_filesystem_path)
    return jsonify({"message": "Document deleted successfully", "title": title}), 200

@app.route('/create-account', methods=['POST', 'OPTIONS'])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def create_account():
    data = request.get_json()
    username = data['username']
    password = data['password']
    email = data['email']
    result = add_user(db_connection, username, password, email)
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
        session.permanent = True
        session['user_id'] = username
        reset_attempts(db_connection, username)
        return resp
    elif (user_exists(db_connection, username)):
        if (retrieve_attempts(db_connection, username) >= 5):
            lockout(db_connection, username)
            return jsonify({'status': 'User locked out'}), 423
        else:
            add_attempt(db_connection, username)
            return jsonify({'status': 'Invalid username or password'}), 401
    else:
        return jsonify({'status': 'Invalid username or password'}), 401

@app.route('/is_logged_in', methods=['GET'])
@cross_origin(methods=['GET'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def is_logged_in():
    if 'user_id' in session:
        return jsonify({'logged_in': True, 'user_id': session['user_id']}), 200
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

@app.route('/send-reset-email', methods=['POST'])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def send_reset_email():
    print("Email Called!")
    data = request.get_json()
    email = data['email']
    if email_exists(db_connection, email):
        print("Email: User Exists!")
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        otp_store[email] = otp

        message = MIMEMultipart()
        message['From'] = os.environ['SMTP-email']
        message['To'] = email
        message['Subject'] = 'Password Reset OTP'
        
        body = f"Your OTP is: {otp}. Head to http://127.0.0.1:5173/reset-password-verify to reset it."
        message.attach(MIMEText(body, 'plain'))

        try:
            server = smtplib.SMTP(os.environ['SMTP-server'], 587)
            server.ehlo()
            server.starttls()
            server.login(os.environ['SMTP-login'], os.environ['SMTP-password'])
            server.sendmail(os.environ['SMTP-email'], email, message.as_string())
            server.quit()
            print("Email sent!")
            return jsonify({'status': 'Email sent'}), 200
        except smtplib.SMTPException as e:
            print(e)
            return jsonify({'status': 'Failed to send email', 'error': str(e)}), 500
    else:
        print("Email: User does not exist. No email sent.")
        return jsonify({'status': 'Failed to send email'}), 500
    
@app.route('/verify-otp', methods=['POST'])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def verify_otp():
    data = request.get_json()
    email = data['email']
    user_otp = data['otp']
    if otp_store.get(email) == user_otp:
        return jsonify({'status': 'OTP verified'}), 200
    else:
        return jsonify({'status': 'Invalid OTP'}), 401

@app.route('/update-password', methods=['POST'])
@cross_origin(methods=['POST'], supports_credentials=True, headers=['Content-Type', 'Authorization'])
def update_password():
    data = request.get_json()
    email = data['email']
    new_password = data['newPassword']

    if update_user_password(db_connection, email, new_password):
        unlock(db_connection, email)
        otp_store.pop(email, None)
        return jsonify({'status': 'Password updated successfully'}), 200
    else:
        return jsonify({'status': 'Failed to update password'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)
