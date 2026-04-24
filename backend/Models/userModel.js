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
    updateLocation: async (id, location) => {
        await db.execute('UPDATE users SET location = ? WHERE id = ?', [location, id]);
    },
    saveLocation: async (userId, lat, lng) => {
    return db.execute(
        'INSERT INTO locations (user_id, latitude, longitude) VALUES (?, ?, ?)',
        [userId, lat, lng]
    );
}
};


module.exports = User;