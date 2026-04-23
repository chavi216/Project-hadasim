const mysql = require('mysql2/promise'); 
require('dotenv').config(); // טוען את הסיסמה מהקובץ שמעל

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: process.env.DB_PASSWORD, 
    database: 'school',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;