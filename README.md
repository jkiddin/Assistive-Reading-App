# A Reading App Set up in React and Vite frontend and a Flask backend.

Step 1: Clone the repository and open project in VS Code

Backend:

Navigate to the server folder in terminal, and run these commands.

Step 2: Create the virtual environment

python3 -m venv venv

source venv/bin/activate 

Step 3: Install Flask and Flask-CORS 

pip install Flask

pip install Flask-CORS

Step 4: Launch the backend server

OPENAI_API_KEY=<openai_api_key> MONGO_DB_USER=<user> MONGO_DB_PASSWORD=<password> python3 server/main.py

Front End

Keep the backend server running, and open a split terminal.
Navigate to the client folder in terminal, and run these commands.

Step 5: Install Node (using Homebrew)

brew install node

Step 6: Install Vite

npm install vite --save-dev

Step 7: Launch the frontend

npm run dev

Click on the given link

# Everything installed after
npm install pdfjs-dist

npm install @react-pdf

npm install react-router-dom
pip install PyPDF2
pip install python-dotenv
pip install openai
pip install reportlab
pip install pdfminer.six

# New Update!
npm install jspdf


The server/venv files and any node_modules files should not be committed to Github, as well as any test pdfs. Use git status to check before committing.

# Setting up Atlas MongoDB Cluster

* Create free account on Atlas
* Create cluster "assistive-reading-app-cluster"
* Create database within the cluster "assistive-reading-app-db"
* Create collection "uploads"
* Ensure your IP address is added to Network Access List (Security > Network Access > IP Access List)
