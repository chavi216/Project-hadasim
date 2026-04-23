import React, { useState } from 'react';
import api from '../api/axios';

const Teacher = () => {
    const [data, setData] = useState([]);
    const [searchid, setSearchid] = useState('');
    const [tableTitle, setTableTitle] = useState('אנא בחרי פעולה');
    const name = localStorage.getItem('teacherName');
    const fetchAll = async () => {
        try {
            const res = await api.get('/?role=teacher'); 
            setData(res.data);
            setTableTitle("כל הרשומות במערכת");
        } catch (err) {
            alert("שגיאה בשליפת נתונים");
        }
    };

    const fetchMyClass = async () => {
        const id= localStorage.getItem('teacherid');
        try {
            const res = await api.get(`/my-students/${id}`);
            setData(res.data);
            setTableTitle("התלמידות הכיתה ");
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
                    </div>
                    
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="חיפוש לפי תז"
                            value={searchid}
                            onChange={(e) => setSearchid  (e.target.value)} 
                        />
                        <button onClick={handleSearch}>חפשי</button>
                    </div>
                </section>

                <section className="table-section">
                    <h2>{tableTitle}</h2>
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
                                <p>אין נתונים להצגה.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Teacher;