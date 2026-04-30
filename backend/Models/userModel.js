
import db from '../Config/db.js';

const User = {
    newuser: async (userData) => {
       const { id, firstname, lastname, class_id, role, lat, lon } = userData;
        
        await db.execute(
            'INSERT INTO users (id, first_name, last_name, class_id, role) VALUES (?, ?, ?, ?, ?)',
            [id, firstname, lastname, class_id, role]
        );
        if (lat !== undefined && lon !== undefined) {
            await db.execute(
                'INSERT INTO locations (user_id, latitude, longitude, recorded_at) VALUES (?, ?, ?, NOW())',
                [id, lat, lon]
            );
        }
    },
    findStudents: async (teacherId) => {
        const query = `
            SELECT * FROM users 
            WHERE role = 'student' 
            AND class_id = (SELECT class_id FROM users WHERE id = ?)
        `;
        const [rows] = await db.execute(query, [teacherId]);
        return rows;
    },

findLocations: async (teacherId) => {
    const query = `
        SELECT 
            u.id, u.first_name, u.last_name, u.class_id, u.role,
            l.latitude, l.longitude, l.recorded_at,
            IF(u.class_id = (SELECT class_id FROM (SELECT * FROM users) AS temp WHERE id = ?), 1, 0) AS is_my_student
        FROM users u
        LEFT JOIN (
            SELECT l1.* FROM locations l1
            JOIN (
                SELECT user_id, MAX(id) as max_id 
                FROM locations 
                GROUP BY user_id
            ) l2 ON l1.id = l2.max_id
        ) l ON u.id = l.user_id
    `;
    const [locations] = await db.execute(query, [teacherId]);
    return locations;
}, 
    findByid: async (id) => {
        const [byid] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return byid[0];
    },
    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM users');
        return rows;
    },
saveLocation : async (id, lat, lng, time) => {
    const query = 'INSERT INTO locations (user_id, latitude, longitude, recorded_at) VALUES (?, ?, ?, ?)';
    const formattedTime = time ? time.replace('T', ' ').replace('Z', '') : new Date();
    await db.execute(query, [id, lat, lng, formattedTime]);
},


getTeacherLocationByClass: async (classId) => {
        const query = `
            SELECT l.latitude, l.longitude 
            FROM users u 
            JOIN locations l ON u.id = l.user_id 
            WHERE u.class_id = ? AND u.role = 'teacher' 
            ORDER BY l.recorded_at DESC LIMIT 1
        `;
        const [rows] = await db.execute(query, [classId]);
        return rows.length > 0 ? rows[0] : null;
    }



    
};


export default User;