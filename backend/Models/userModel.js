const db = require('../Config/db');

const User = {
    newuser: async (newStudent) => {
        const { id, first_name, last_name, class_id, role } = newStudent;
      return db.execute(
    'INSERT INTO users (id, first_name, last_name, class_id, role) VALUES (?, ?, ?, ?, ?)',
    [id, first_name, last_name, class_id, role]
);
    },
   findStudents: async (teacherId) => {
    const query = `
        SELECT s.* FROM users AS s
        JOIN users AS t ON s.class_id = t.class_id
        WHERE t.id = ? 
          AND t.role = 'teacher'
          AND s.role = 'student'
    `;
    const [students] = await db.execute(query, [teacherId]);
    return students;
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
findLocations: async (teacherId) => {
        const query = `
            SELECT l.user_id, l.latitude, l.longitude, l.recorded_at
            FROM locations l
            JOIN users u ON l.user_id = u.id
            JOIN users t ON u.class_id = t.class_id
            WHERE t.id = ? AND t.role = 'teacher'
            AND (l.user_id, l.recorded_at) IN (
                SELECT user_id, MAX(recorded_at)
                FROM locations GROUP BY user_id
            )
        `;
        const [locations] = await db.execute(query, [teacherId]);
        return locations;
    }



};





module.exports = User;