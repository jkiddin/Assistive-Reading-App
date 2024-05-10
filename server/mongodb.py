import certifi
import os
from flask_pymongo import MongoClient

MONGO_DB_USER = os.environ.get('MONGO_DB_USER')
MONGO_DB_PASSWORD = os.environ.get('MONGO_DB_PASSWORD')
MONGO_URI = f"mongodb+srv://{MONGO_DB_USER}:{MONGO_DB_PASSWORD}@assistive-reading-app-c.df7brqs.mongodb.net/?retryWrites=true&w=majority"

# Get the CA certificates path
ca_file = certifi.where()

def get_mongodb_collection(collection_name):
   client = MongoClient(MONGO_URI, tlsCAFile=ca_file)
   db = client['assistive-reading-app-db']
   collection = db[collection_name]          
   return collection
