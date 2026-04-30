import User from '../Models/userModel.js'; 

const handleError = (res, error, status = 500) => {
    return res.status(status).json({ success: false, error: error.message || error });
};

const convertToDecimal = (coord) => {
    if (!coord || coord.Degrees === undefined) return 0;
    return parseFloat(coord.Degrees) + 
           (parseFloat(coord.Minutes) / 60) + 
           (parseFloat(coord.Seconds) / 3600);
};

export const verifyTeacher = async (req, res, next) => {
    try {
        const requesterId = req.headers['user-id']; 
        if (!requesterId) return res.status(401).json({ message: "Missing authorization ID" });
        
        const requester = await User.findByid(requesterId);
        if (requester && requester.role === 'teacher') {
            next(); 
        } else {
            res.status(403).json({ error: "Access denied. Teachers only." });
        }
    } catch (err) {
        handleError(res, err);
    }
};

export const register = async (req, res) => {
    try {
        const { id, firstname, lastname, class_id, role, coordinates } = req.body;
        const existingUser = await User.findByid(id);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        let lat = 31.7683; 
        let lon = 35.2137;
        if (coordinates && coordinates.Latitude) {
            lat = convertToDecimal(coordinates.Latitude);
            lon = convertToDecimal(coordinates.Longitude);
        } else {
            const randomOffset = () => (Math.random() - 0.5) * 0.02; 
            lat += randomOffset();
            lon += randomOffset();
        }
       
        await User.newuser({
            id,
            firstname,
            lastname,
            class_id,
            role,
            lat, 
            lon  
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("🔥 Error in register:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const { ID, Coordinates, Time } = req.body;
        
        if (!ID || !Coordinates || !Time) {
            return res.status(400).json({ error: "Missing ID, Coordinates or Time" });
        }
        if (String(ID).length !== 9) {
            return res.status(400).json({ error: "ID must be exactly 9 digits" });
        }
        
        const lat = convertToDecimal(Coordinates.Latitude);
        const lng = convertToDecimal(Coordinates.Longitude);
        
        await User.saveLocation(ID, lat, lng, Time);
        res.status(200).json({ success: true, message: "Location updated" });
    } catch (err) {
        console.error("Error in updateLocation controller:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getStudents = async (req, res) => {
    try {
        const teacherId = req.params.teacherId; 
        if (!teacherId) return res.status(400).json({ error: "Missing teacher ID" });
        
        const students = await User.findStudents(teacherId); 
        res.json(students);
    } catch (err) {
        handleError(res, err);
    }
};

export const getUserByid = async (req, res) => {
    try {
        const user1 = await User.findByid(req.params.id);
        if (!user1) return handleError(res, "משתמש לא קיים", 404);
        res.json(user1);
    } catch (err) {
        handleError(res, err);
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        handleError(res, err);
    }
};

export const login = async (req, res) => {
    const { id } = req.body;
    try {
        const user1 = await User.findByid(id);
        if (!user1 || user1.role !== 'teacher') {
            return handleError(res, "גישה נדחתה", 401);
        }
        res.json({ success: true, message: "נכנסת בהצלחה!", teacher: user1 });
    } catch (err) {
        handleError(res, err);
    }
};

export const getMapData = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const locations = await User.findLocations(teacherId);
        res.json(locations);
    } catch (err) {
        handleError(res, err);
    }
};