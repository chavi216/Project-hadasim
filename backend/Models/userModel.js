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
            SELECT s.* FROM users s
            WHERE s.class_id = (SELECT class_id FROM users WHERE id = ? AND role = 'teacher')
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
    }
};

module.exports = User;