CREATE DATABASE IF NOT EXISTS school;
USE school;

CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    tz_number VARCHAR(9) PRIMARY KEY,     
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    class_id INT,
    FOREIGN KEY (class_id) REFERENCES classes(id),   
    role ENUM('teacher', 'student') NOT NULL 
);

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(9) NOT NULL,           
    latitude DECIMAL(10, 8) NOT NULL,      
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at DATETIME NOT NULL,        
    FOREIGN KEY (user_id) REFERENCES users(tz_number) ON DELETE CASCADE
);