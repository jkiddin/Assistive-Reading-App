import mysql.connector
from mysql.connector import Error

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

def check_user_credentials(connection, username, password):
    try:
        cursor = connection.cursor()
        query = "SELECT * FROM users WHERE username = %s AND password = %s"
        cursor.execute(query, (username, password))
        records = cursor.fetchall()
        cursor.close()
        return len(records) > 0
    except Error as e:
        print(f"Error: '{e}'")

def add_user(connection, username, password):
    try:
        cursor = connection.cursor()
        query = "INSERT INTO users (username, password) VALUES (%s, %s)"
        cursor.execute(query, (username, password))
        connection.commit()
        cursor.close()
        return cursor.lastrowid
    except Error as e:
        print(f"Error: '{e}'")
        if e.errno == 1062: 
            return "duplicate"
