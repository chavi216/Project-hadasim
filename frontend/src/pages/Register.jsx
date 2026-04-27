import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [user, setUser] = useState({ id: '', first_name: '', last_name: '', class_id: '', role: 'student' });
    const navigate = useNavigate();
   const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.id.length !== 9) return alert("תעודת זהות לא תקינה!");
    
    try {
        // שימי לב: אנחנו שולחים את אובייקט ה-user שכולל 
        // id, first_name, last_name, class_id, role
        const res = await api.post('/register', user); 
        
        alert("נרשמת בהצלחה!");
        
        if (user.role === 'teacher') {
            localStorage.setItem('teacherid', user.id);
            localStorage.setItem('teacherName', user.first_name);
            localStorage.setItem('userRole', 'teacher'); // חשוב עבור הגנת הנתיבים ב-Teacher.jsx
            navigate('/Teacher');
        } else {
            navigate('/');
        }
    } catch (err) {
        // הדפסת השגיאה המדויקת מהשרת כדי שתדעי מה חסר ב-DB
        console.error("Server Error:", err.response?.data);
        alert("שגיאה בהרשמה: " + (err.response?.data?.error || "נסה שוב"));
    }
};

    return (
        <div className="container">
            <h1>רישום למערכת</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="תעודת זהות" required onChange={(e) => setUser({...user, id: e.target.value})} />
                <input type="text" placeholder="שם פרטי" required onChange={(e) => setUser({...user, first_name: e.target.value})} />
                <input type="text" placeholder="שם משפחה" required onChange={(e) => setUser({...user, last_name: e.target.value})} />
                <select required onChange={(e) => setUser({...user, class_id: e.target.value})}>
                    <option value=""> כיתה</option>
                    {['א','ב','ג','ד','ה','ו'].map(c => <option key={c} value={c}>כיתה {c}'</option>)}
                </select>
                <select onChange={(e) => setUser({...user, role: e.target.value})}>
                    <option value="student">תלמידה</option>
                    <option value="teacher">מורה</option>
                </select>
                <button type="submit"> רישום</button>
            </form>
        </div>
    );
};

export default Register;