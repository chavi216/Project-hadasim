const db = require('../Config/db');

const User = {
    newuser: async (newStudent) => {
        const { id, first_name, last_name, class_id, role } = newStudent;
      return db.execute(
    'INSERT INTO users (id, first_name, last_name, class_id, role) VALUES (?, ?, ?, ?, ?)',
    [id, first_name, last_name, class_id, role]
);
    },
findLocations: async (teacherId) => {
    const query = `
        SELECT 
            u.id,           -- הוספתי u.id כדי שיהיה קל לזהות את "אני"
            l.user_id, 
            l.latitude, 
            l.longitude, 
            l.recorded_at AS Time, 
            u.first_name, 
            u.last_name,
            u.class_id,
            u.role,          -- חשוב מאוד: כדי שהפרונטנד ידע אם זו מורה או תלמידה
            -- בדיקה אם התלמידה שייכת למורה (אופציונלי, כי את עושה זאת גם בפרונט)
            CASE WHEN u.class_id = (SELECT class_id FROM users WHERE id = ?) THEN 1 ELSE 0 END AS is_my_student
        FROM locations l
        INNER JOIN users u ON l.user_id = u.id
        INNER JOIN (
            -- שליפת הזמן האחרון לכל משתמש
            SELECT user_id, MAX(recorded_at) as max_time
            FROM locations
            GROUP BY user_id
        ) last_loc ON l.user_id = last_loc.user_id AND l.recorded_at = last_loc.max_time
        -- הסרנו את ה-WHERE u.role = 'student' כדי שכולם יופיעו
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
  saveLocation: async (userId, lat, lng) => {
    return db.execute(
        // הוספת NOW() כדי שהזמן יתעדכן אוטומטית
        'INSERT INTO locations (user_id, latitude, longitude, recorded_at) VALUES (?, ?, ?, NOW())',
        [userId, lat, lng]
    );
}
,
// בתוך userModel.js
findLocations: async (teacherId) => {
    const query = `
        SELECT 
            l.user_id, 
            l.latitude, 
            l.longitude, 
            l.recorded_at AS Time, 
            u.first_name, 
            u.last_name,
            u.class_id,
            -- בדיקה אם התלמידה שייכת למורה
            CASE WHEN u.class_id = (SELECT class_id FROM users WHERE id = ?) THEN 1 ELSE 0 END AS is_my_student
        FROM locations l
        INNER JOIN users u ON l.user_id = u.id
        INNER JOIN (
            -- שליפת הזמן האחרון לכל משתמש
            SELECT user_id, MAX(recorded_at) as max_time
            FROM locations
            GROUP BY user_id
        ) last_loc ON l.user_id = last_loc.user_id AND l.recorded_at = last_loc.max_time
        WHERE u.role = 'student'
    `;
    const [locations] = await db.execute(query, [teacherId]);
    return locations;
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





module.exports = User;