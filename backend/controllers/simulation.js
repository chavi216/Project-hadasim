import db from '../Config/db.js';
import user from '../Models/userModel.js';

const simulateMovement = async () => {
    try {
        const allUsers = await user.findAll(); 
        const students = allUsers.filter(u => u.role === 'student');

        if (students.length === 0) {
            console.log("--- Simulation: No students found ---");
            return;
        }

        for (let student of students) {
            const [rows] = await db.execute(
                'SELECT latitude, longitude FROM locations WHERE user_id = ? ORDER BY id DESC LIMIT 1',
                [student.id]
            );

            if (rows && rows.length > 0) {
                const currentLat = parseFloat(rows[0].latitude);
                const currentLng = parseFloat(rows[0].longitude);

                const nextLat = currentLat + (Math.random() * 2 - 1) * 0.001;
                const nextLng = currentLng + (Math.random() * 2 - 1) * 0.001;

                await user.saveLocation(student.id, nextLat, nextLng);
                console.log(`✅ Moved student ${student.id} to ${nextLat}, ${nextLng}`);
            }
        }
    } catch (err) {
        console.error("🔥 Simulation Error:", err.message);
    }
};

setInterval(simulateMovement, 10000);