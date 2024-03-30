from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile
import os

app = Flask(__name__)
cors = CORS(app, origins='*')

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

@app.route('/upload-files', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'No file part'})

    file = request.files['file']
    title = request.form['title']

    if file.filename == '':
        return jsonify({'status': 'No selected file'})

    if file:
        # Create a temporary directory
        temp_dir = tempfile.mkdtemp()
        filename = secure_filename(file.filename)
        
        # Save the file to the temporary directory
        file_path = os.path.join(temp_dir, filename)
        file.save(file_path)

        return jsonify({'status': 'ok', 'title': title, 'filename': filename, 'temp_dir': temp_dir}) 

if __name__ == '__main__':
    app.run(debug=True, port=3001)  