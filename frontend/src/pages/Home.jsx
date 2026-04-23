import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
const Home = () => {
    const [id, setid] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (id.length !== 9) return alert("תעודת זהות לא תקינה!");
        try {
            const res = await api.post('/login', { id: id });
            localStorage.setItem('teacherid', id);
            localStorage.setItem('teacherName', res.data.teacher.first_name);
            navigate('/Teacher');
        } catch (err) {
            alert(err.response?.data?.error || "גישה נדחתה!");
        }
    };

    return (
        <div className="container">
            <h1>מערכת לניהול טיול שנתי</h1>
            <div className="login-box">
                <h2>כניסת מורות</h2>
                <input type="text" placeholder="הזיני תעודת זהות" value={id} onChange={(e) => setid(e.target.value)} />
                <button onClick={handleLogin}>כניסה למערכת-למורות בלבד!</button>
            </div>
            <hr />
            <p>רישום לטיול</p>
            <Link to="/register"><button className="secondary-btn">מעבר לדף הרשמה</button></Link>
        </div>
    );
};

export default Home;