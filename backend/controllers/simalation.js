const db = require('../config/db');
const simulateMovement = async () => {
    try {
        // 1. בדיקה אם יש בכלל משתמשים
        const allUsers = await user.findAll();
        const students = allUsers.filter(u => u.role === 'student');

        if (students.length === 0) {
            console.log("--- Simulation: No students found in DB. Go register some! ---");
            return;
        }

        console.log(`--- Starting Movement for ${students.length} students ---`);

        for (let student of students) {
            // 2. שליפת מיקום אחרון
            const [rows] = await db.execute(
                'SELECT latitude, longitude FROM locations WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
                [student.id]
            );

            if (rows && rows.length > 0) {
                const currentLat = parseFloat(rows[0].latitude);
                const currentLng = parseFloat(rows[0].longitude);

                // 3. יצירת תזוזה (קצת יותר גדולה כדי שנראה אותה בבירור)
                const moveLat = (Math.random() * 2 - 1) * 0.005; 
                const moveLng = (Math.random() * 2 - 1) * 0.005;

                const nextLat = currentLat + moveLat;
                const nextLng = currentLng + moveLng;

                // 4. שמירה
                await user.saveLocation(student.id, nextLat, nextLng);
                console.log(`✅ Moved student ${student.first_name} (ID: ${student.id}) to ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`);
            } else {
                console.log(`❌ No location history found for student ${student.id}`);
            }
        }
    } catch (err) {
        console.error("🔥 Simulation CRASHED:", err);
    }
};

// הפעלה כל 10 שניות (אל תעשי כל שנייה, זה חונק את ה-SQL)
setInterval(simulateMovement, 10000);
