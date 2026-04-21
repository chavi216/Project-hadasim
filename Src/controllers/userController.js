const db = require('../config/db');
exports.registerUser = async (req, res) => {
    try {
        const { tz_number, first_name, last_name, class_id, role } = req.body;
        if (tz_number.length !== 9) {
            return res.status(400).json({ message: "תעודת זהות חייבת להכיל 9 ספרות" });
        }
        const sql = `INSERT INTO users (tz_number, first_name, last_name, class_id, role) 
                     VALUES (?, ?, ?, ?, ?)`;

        await db.query(sql, [tz_number, first_name, last_name, class_id, role]);
        res.status(201).json({ message: "המשתמש נרשם בהצלחה!" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "תעודת הזהות הזו כבר רשומה במערכת" });
        }
        res.status(500).json({ message: "שגיאת שרת פנימית" });
    }
};