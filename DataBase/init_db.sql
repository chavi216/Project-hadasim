CREATE DATABASE IF NOT EXISTS school;
USE school;


CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(9) PRIMARY KEY,     
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,  
    role ENUM('teacher', 'student') NOT NULL 
);

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(9) NOT NULL,           
    latitude DECIMAL(10, 8) NOT NULL,      
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at DATETIME NOT NULL,        
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);