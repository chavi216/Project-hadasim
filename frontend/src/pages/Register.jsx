import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [user, setUser] = useState({ 
        id: '', 
        firstname: '', 
        lastname: '', 
        class_id: '', 
        role: 'student' 
    });
    const navigate = useNavigate();
   const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.id.length !== 9) return alert("תעודת זהות לא תקינה!"); 
    try {
        const res = await api.post('/register', user);
        
        alert("נרשמת בהצלחה!");
        
        if (user.role === 'teacher') {
            localStorage.setItem('teacherid', user.id);
            localStorage.setItem('teacherName', user.firstname);
            localStorage.setItem('userRole', 'teacher'); 
            navigate('/Teacher');
        } else {
            navigate('/');
        }
    } catch (err) {
        console.error("Server Error:", err.response?.data);
        alert("שגיאה בהרשמה: " + (err.response?.data?.error || "נסה שוב"));
    }
};
    return (
        <div className="container">
            <h1>רישום למערכת</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="תעודת זהות" required onChange={(e) => setUser({...user, id: e.target.value})} />
                <input type="text" placeholder="שם פרטי" required onChange={(e) => setUser({...user, firstname: e.target.value})} />
                <input type="text" placeholder="שם משפחה" required onChange={(e) => setUser({...user, lastname: e.target.value})} />
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