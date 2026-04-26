import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import Map from './Map'; // וודאי שהשם תואם לשם הקובץ שלך

const Teacher = () => {
    const [data, setData] = useState([]);
    const [searchid, setSearchid] = useState('');
    const [tableTitle, setTableTitle] = useState('אנא בחרי פעולה');
    
    // --- הגדרות חסרות שגרמו לשגיאה ---
    const [showMap, setShowMap] = useState(false); 
    const [mapData, setMapData] = useState([]);
    // --------------------------------

    const teacherid = localStorage.getItem('teacherid');
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('teacherName');

    // הגנת נתיב
    useEffect(() => {
        if (role !== 'teacher') { 
            alert("עצור! הדף הזה מיועד למורות בלבד.");
            navigate('/'); 
        }
    }, [role, navigate]);

    // פונקציה שמושכת את נתוני המפה (תלמידות + מיקומים)
    const fetchMapUpdate = async () => {
        try {
            // וודאי שהנתיב הזה קיים ב-Backend שלך (map-data)
            const res = await api.get(`/map-data/${teacherid}`);
            setMapData(res.data);
        } catch (err) {
            console.error("שגיאה בעדכון המפה");
        }
    };

    // מנגנון ריענון המפה (סעיף ב')
    useEffect(() => {
        if (role === 'teacher' && showMap) {
            fetchMapUpdate(); 
            const interval = setInterval(fetchMapUpdate, 60000); // ריענון כל דקה
            return () => clearInterval(interval); 
        }
    }, [showMap, teacherid, role]);

    if (role !== 'teacher') return null;

    const fetchAll = async () => {
        try {
            const res = await api.get('/?role=teacher'); 
            setData(res.data);
            setTableTitle("כל הרשומות במערכת");
            setShowMap(false); // סגירת מפה כשעוברים לטבלה
        } catch (err) {
            alert("שגיאה בשליפת נתונים");
        }
    };

    const fetchMyClass = async () => {
        try {
            const res = await api.get(`/my-students/${teacherid}`);
            setData(res.data);
            setTableTitle("התלמידות הכיתה");
            setShowMap(false);
        } catch (err) {
            alert("שגיאה בשליפת הכיתה");
        }
    };

    const handleSearch = async () => {
        if (searchid.length !== 9) return alert("תעודת זהות לא תקינה!");
        try {
            const res = await api.get(`/${searchid}`);
            setData(Array.isArray(res.data) ? res.data : [res.data]);
            setTableTitle(`תוצאת חיפוש : ${searchid}`);
            setShowMap(false);
        } catch (err) {
            alert("לא נמצאו תוצאות");
        }
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="user-info">
                    <h1>שלום, <span>{name}</span></h1>
                    <p> ניהול טיול שנתי </p>
                </div>
                <button onClick={logout} className="logout-btn">התנתקות</button>
            </header>

            <main className="dashboard-main">
                <section className="actions-bar">
                    <div className="btn-group">
                        <button onClick={fetchAll} className="btn-secondary">הצג את כולם</button>
                        <button onClick={fetchMyClass} className="btn-primary">הכיתה שלי</button>
                        {/* כפתור למעבר למפה בתוך הדף */}
                        <button onClick={() => setShowMap(!showMap)} className="btn-map">
                            {showMap ? "חזרה לטבלה" : "צפייה במפה חיה"}
                        </button>
                    </div>
                    
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="חיפוש לפי תז"
                            value={searchid}
                            onChange={(e) => setSearchid(e.target.value)} 
                        />
                        <button onClick={handleSearch}>חפשי</button>
                    </div>
                </section>

                <section className="table-section">
                    <h2>{showMap ? "מפת מיקומים בזמן אמת" : tableTitle}</h2>
                    
                    {showMap ? (
                        /* הצגת המפה */
                        <Map studentsLocation={mapData} />
                    ) : (
                        /* הצגת הטבלה */
                        <div className="table-wrapper">
                            {data.length > 0 ? (
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>ת"ז</th>
                                            <th>שם מלא</th>
                                            <th>כיתה</th>
                                            <th>תפקיד</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>{u.first_name} {u.last_name}</td>
                                                <td className="class-badge">{u.class_id}</td>
                                                <td>
                                                    <span className={`role-tag ${u.role}`}>
                                                        {u.role === 'teacher' ? 'מורה' : 'תלמידה'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <p>אין נתונים להצגה. בחרי "הכיתה שלי" או "הצג את כולם".</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Teacher;