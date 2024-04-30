# A Reading App Set up in React and Vite frontend and a Flask backend.

## After cloning the repository in your IDE enviornment, following these steps:

### To set up the back end:

1. Create the virtual environment.
```
python3 -m venv venv
source venv/bin/activate 
```

2. Install all required dependencies for the server.
```
pip install -r requirements.txt
```
3. Ensure you have [MySQL](https://www.mysql.com/) up and running. Run [setup.sql](server/setup.sql) with your own chosen password. Feel free to mess around with the naming of the database and users, just ensure to change it [in the main file](server/main.py#L31-L35).


4. To set up your [Atlas MongoDB](https://www.mongodb.com/products/platform/atlas-database) Cluster:
* Create free account on Atlas
* Create cluster "assistive-reading-app-cluster"
* Create database within the cluster "assistive-reading-app-db"
* Create collection "uploads"
* Ensure your IP address is added to Network Access List (Security > Network Access > IP Access List)

5. Configure a .env file with your keys in the `/server` folder with your keys.

```
OPENAI_API_KEY = <openai_api_key> 
SQL_PASS = <password>
MONGO_DB_USER = <user> 
MONGO_DB_PASSWORD = <password> 
```

6. Run the server with `python3 main.py`.

### With the backend up and running, set up the frontend:

1. Ensure `node` is already installed. If not, you can install it with `brew install node` or likewise applications.

2. Install Vite with
```
npm install vite --save-dev
```
3. Install all `npm` dependencies by checking out [this file](client/npm-packages.txt). `npm` doesn't provide a mass install form like `pip`, sorry about that. To install the packages, simply run 
```
npm install <package>
```

4. Run the front end with
```
npm run dev
```

If done correctly, your terminal should print something like
```
VITE v5.2.10  ready in 273 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help 
```

Go ahead and visit the site running on port 5173.