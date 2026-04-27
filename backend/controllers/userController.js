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
    const { id, first_name, last_name, class_id, role } = req.body;
    
    try {
        await user.newuser({ id, first_name, last_name, class_id, role });
        if (role === 'student') {
            let baseLat = 31.7683; 
            let baseLng = 35.2137;
            const teacherLoc = await user.getTeacherLocationByClass(class_id);    
            if (teacherLoc && teacherLoc.latitude && teacherLoc.longitude) {
                baseLat = teacherLoc.latitude;
                baseLng = teacherLoc.longitude;
            }
            const offsetLat = (Math.random() * 2 - 1) * 0.027;
            const offsetLng = (Math.random() * 2 - 1) * 0.027;
            const finalLat = baseLat + offsetLat;
            const finalLng = baseLng + offsetLng;
            await user.saveLocation(id, finalLat, finalLng);
        }
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error("Registration SQL Error:", err);
        res.status(500).json({ error: "Error during registration process", details: err.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await user.findStudents(); 
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
        const locations = await user.findLocations(teacherId);
        console.log(`--- Map Data Debug ---`);
        console.log(`Teacher ID: ${teacherId}`);
        console.log(`Locations found: ${locations.length}`);
        res.json(locations);
    } catch (err) {
        console.error("Error in getMapData:", err);
        handleError(res, err);
    }
};