-- File used to setup the MySQL enviornment.
-- Ensure to add "SQL_PASS" to your .env with the password you chose.

CREATE DATABASE schemo;

USE schemo;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE USER 'super'@'loUserscalhost' IDENTIFIED BY "PASSWORDGOESHERE";
GRANT ALL PRIVILEGES ON schemo.* TO 'super'@'localhost';
FLUSH PRIVILEGES;