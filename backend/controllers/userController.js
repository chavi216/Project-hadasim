const user = require('../Models/userModel');
const handleError = (res, error, status = 500) => {
    return res.status(status).json({ success: false, error: error.message || error });
};


const verifyTeacher = async (req) => {
    const requesterId = req.headers['user-id']; 
    if (!requesterId) return false;
    const requester = await user.findByid(requesterId);
    return requester && requester.role === 'teacher';
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


exports.getMapData = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const students = await user.findStudents(teacherId);
        const locations = await user.findLocations(teacherId);

        // הדפסת בדיקה לטרמינל - ככה תדעי אם ה-DB בכלל מחזיר מיקומים
        console.log(`--- Map Data Debug ---`);
        console.log(`Teacher ID: ${teacherId}`);
        console.log(`Students found: ${students.length}`);
        console.log(`Locations found: ${locations.length}`);

        // 2. חיבור הנתונים
        const combinedData = students.map(s => {
            // טיפ חשוב: המרה ל-String כדי לוודא שההשוואה תצליח גם אם אחד מהם הוא מספר
            const loc = locations.find(l => String(l.user_id) === String(s.id));
            
            if (loc) {
                console.log(`✅ Match found for student: ${s.first_name}`);
            }

            return {
                ...s,
                lat: loc ? loc.latitude : null,
                lng: loc ? loc.longitude : null,
                time: loc ? loc.recorded_at : null
            };
        });

        res.json(combinedData);
    } catch (err) {
        console.error("Error in getMapData:", err);
        handleError(res, err);
    }
};