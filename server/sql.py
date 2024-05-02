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
        query = "SELECT password, is_active FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        record = cursor.fetchone()
        if record and record[1]:  # Check if user is active
            stored_password = record[0]
            if bcrypt.checkpw(password.encode(), stored_password.encode()):
                update_query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE username = %s"
                cursor.execute(update_query, (username,))
                connection.commit()
                cursor.close()
                return True
            else:
                cursor.close()
                return False
        cursor.close()
        return False
    except Error as e:
        print(f"Error: '{e}'")
        return False

def add_user(connection, username, password, email, is_active=True):
    try:
        cursor = connection.cursor()
        hashed_password = hash_password(password)
        query = """
        INSERT INTO users (username, password, email, is_active, created_on, failed_attempts)
        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, 0)
        """
        cursor.execute(query, (username, hashed_password, email, is_active))
        connection.commit()
        user_id = cursor.lastrowid
        cursor.close()
        return user_id
    except Error as e:
        print(f"Error: '{e}'")
        if e.errno == 1062:  # Duplicate entry
            return "duplicate"

def update_user_password(connection, email, new_password):
    try:
        cursor = connection.cursor()
        hashed_password = hash_password(new_password)  # Assuming hash_password function is available
        query = "UPDATE users SET password = %s WHERE email = %s"
        cursor.execute(query, (hashed_password, email))
        connection.commit()
        cursor.close()
        return True
    except Error as e:
        print(f"Error: '{e}'")
        return False
    
def email_exists(connection, email):
    try: 
        cursor = connection.cursor()
        query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = %s LIMIT 1)'
        cursor.execute(query, (email,))
        exists = cursor.fetchone()[0]  # Fetch the result (0 or 1)
        return exists == 1  # Return True if email exists, False otherwise
    except Error as e:
        print(f"Error: '{e}'")
        return False

def user_exists(connection, username):
    try: 
        cursor = connection.cursor()
        query = 'SELECT EXISTS(SELECT 1 FROM users WHERE username = %s LIMIT 1)'
        cursor.execute(query, (username,))
        exists = cursor.fetchone()[0]  # Fetch the result (0 or 1)
        return exists == 1  # Return True if iser exists, False otherwise
    except Error as e:
        print(f"Error: '{e}'")
        return False
    
def lockout(connection, username):
    try: 
        cursor = connection.cursor()
        query = "UPDATE users SET is_active = FALSE WHERE username = %s"
        cursor.execute(query, (username,))
        connection.commit()
        cursor.close()
        return True
    except Error as e:
        print(f"Error: '{e}'")
        return False

def unlock(connection, email):
    try: 
        cursor = connection.cursor()
        query = "UPDATE users SET is_active = TRUE, failed_attempts = 0 WHERE email = %s"
        cursor.execute(query, (email,))
        connection.commit()
        cursor.close()
        return True
    except Error as e:
        print(f"Error: '{e}'")
        return False

def add_attempt(connection, username):
    try: 
        cursor = connection.cursor()
        query = "UPDATE users SET failed_attempts = failed_attempts + 1 WHERE username = %s"
        cursor.execute(query, (username,))
        connection.commit()
        cursor.close()
        return True
    except Error as e:
        print(f"Error: '{e}'")
        return False

def retrieve_attempts(connection, username):
    try: 
        cursor = connection.cursor()
        query = "SELECT failed_attempts FROM users WHERE username = %s"
        cursor.execute(query, (username,))
        attempts = cursor.fetchone()[0]  # Assuming the first column is failed_attempts
        cursor.close()
        return attempts
    except Error as e:
        print(f"Error: '{e}'")
        return False
    
def reset_attempts(connection, username):
    try: 
        cursor = connection.cursor()
        query = "UPDATE users SET failed_attempts = 0 WHERE username = %s"
        cursor.execute(query, (username,))
        connection.commit()
        cursor.close()
        return True
    except Error as e:
        print(f"Error: '{e}'")
        return False