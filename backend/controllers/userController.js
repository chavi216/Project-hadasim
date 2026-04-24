const user = require('../Models/userModel');
const handleError = (res, error, status = 500) => {
    return res.status(status).json({ success: false, error: error.message || error });
};

exports.register = async (req, res) => {
    try {
        await user.newuser(req.body);
        res.status(201).json({ success: true, message: "נרשמת בהצלחה" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return handleError(res, "...תעודת זהות כבר קיימת", 400);
        handleError(res, err);
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await user.findStudents(req.params.teacherId);
        res.json(students);
    } catch (err) {
        console.error("SQL Error Details:", err);
        handleError(res, err);
    }
};

exports.getUserByid = async (req, res) => {
    try {
        const user1 = await user.findByid(req.params.id);
        if (!user1) return handleError(res, "משתמש לא קיים", 404);
        res.json(user1);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getAllUsers = async (req, res) => {
    const { role } = req.query; 
    try {
        const users = await user.findAll();
        res.json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.login = async (req, res) => {
    const { id } = req.body;
    console.log("ניסיון התחברות");
    try {
        console.log("User found in DB:", user);
        const user1 = await user.findByid(id);
        if (!user1 || user1.role !== 'teacher') {
            return handleError(res, "גישה נדחתה", 401);
        }
        res.json({ success: true, message: "נכנסת בהצלחה! ", teacher: user1 });
    } catch (err) {
        handleError(res, err);
    }
};

exports.update = async (req, res) => {{
    const { id, location } = req.body;
    try {
        const user1 = await user.findByid(id);
        if (!user1) return handleError(res, "משתמש לא קיים", 404);
        await user.updateLocation(id, location);
        res.json({ success: true, message: "מיקום עודכן" });
    } catch (err) {
        handleError(res, err);
    }
}};

exports.updateLocation = async (req, res) => {
    const { user_id, latitude, longitude } = req.body;
    try {
        await user.saveLocation(user_id, latitude, longitude);
        res.status(200).json({ success: true, message: "Location updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};