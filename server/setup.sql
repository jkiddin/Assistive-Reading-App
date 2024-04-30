-- File used to setup the MySQL enviornment.
-- Ensure to add "SQL_PASS" to your .env with the password you chose.

CREATE DATABASE IF NOT EXISTS schemo;

USE schemo;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE USER 'super'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON schemo.* TO 'super'@'localhost';
FLUSH PRIVILEGES;