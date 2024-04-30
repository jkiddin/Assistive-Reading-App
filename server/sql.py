import mysql.connector
from mysql.connector import Error
import bcrypt

def create_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db_name
        )
        print("MySQL Database connection successful")
    except Error as e:
        print(f"Error: '{e}'")
    return connection

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())

def check_user_credentials(connection, username, password):
    try:
        cursor = connection.cursor()
        query = "SELECT password FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        record = cursor.fetchone()
        cursor.close()
        if record:
            stored_password = record[0]
            return bcrypt.checkpw(password.encode(), stored_password.encode())
        return False
    except Error as e:
        print(f"Error: '{e}'")
        return False

def add_user(connection, username, password):
    try:
        cursor = connection.cursor()
        hashed_password = hash_password(password)
        query = "INSERT INTO users (username, password) VALUES (%s, %s)"
        cursor.execute(query, (username, hashed_password))
        connection.commit()
        cursor.close()
        return cursor.lastrowid
    except Error as e:
        print(f"Error: '{e}'")
        if e.errno == 1062:  # Duplicate entry
            return "duplicate"
