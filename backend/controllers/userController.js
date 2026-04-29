const user = require('../Models/userModel');
const handleError = (res, error, status = 500) => {
    return res.status(status).json({ success: false, error: error.message || error });
};

const convertToDecimal = (coord) => {
    if (!coord || coord.Degrees === undefined) return 0;
    return parseFloat(coord.Degrees) + 
           (parseFloat(coord.Minutes) / 60) + 
           (parseFloat(coord.Seconds) / 3600);
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
        let baseLat = 31.7683; 
        let baseLng = 35.2137;

        if (role === 'student') {
            const teacherLoc = await user.getTeacherLocationByClass(class_id);    
            if (teacherLoc && teacherLoc.latitude) {
                baseLat = parseFloat(teacherLoc.latitude);
                baseLng = parseFloat(teacherLoc.longitude);
            }
        }

        const offset = () => (Math.random() * 2 - 1) * 0.01;
        await user.saveLocation(id, baseLat + offset(), baseLng + offset());

        res.status(201).send('User registered successfully');
    } catch (err) {
        res.status(500).json({ error: "Error during registration", details: err.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { ID, Coordinates } = req.body;
        
        if (!ID || !Coordinates) {
            return res.status(400).json({ error: "Missing ID or Coordinates" });
        }

        const lat = convertToDecimal(Coordinates.Latitude);
        const lng = convertToDecimal(Coordinates.Longitude);

        await user.saveLocation(ID, lat, lng);
        res.status(200).json({ success: true, message: "Location updated" });
    } catch (err) {
        console.error("Error in updateLocation controller:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getStudents = async (req, res) => {
    try {
        const teacherId = req.params.teacherId; 
        
        if (!teacherId) {
            return res.status(400).json({ error: "Missing teacher ID" });
        }
        const students = await user.findStudents(teacherId); 
        
        res.json(students);
    } catch (err) {
        console.error("SQL Error Details:", err);
        res.status(500).json({ error: "שגיאה בשליפת התלמידות", details: err.message });
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



