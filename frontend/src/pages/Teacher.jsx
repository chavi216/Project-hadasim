import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import Map from './Map';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // רדיוס כדור הארץ בק"מ
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const Teacher = () => {
    const [data, setData] = useState([]);
    const [searchid, setSearchid] = useState('');
    const [tableTitle, setTableTitle] = useState('אנא בחרי פעולה');
    
    const [showMap, setShowMap] = useState(false); 
    const [mapData, setMapData] = useState([]);

    const [teacherPos, setTeacherPos] = useState(null); 
    const [farStudents, setFarStudents] = useState([]); 


    const teacherid = localStorage.getItem('teacherid');
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('teacherName');


    useEffect(() => {
        if (role !== 'teacher') { 
            alert("עצור! הדף הזה מיועד למורות בלבד.");
            navigate('/'); 
        }
    }, [role, navigate]);

    useEffect(() => {
        if (role === 'teacher') {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setTeacherPos({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => console.error("שגיאה בקבלת GPS של המורה", err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [role]);


    const fetchMapUpdate = async () => {
        try {
            const res = await api.get(`/map-data/${teacherid}`);
            console.log("Data from Server:", res.data);
            setMapData(res.data);


            if (teacherPos) {
                const tooFar = res.data.filter(student => {
                    if (!student.latitude || !student.longitude) return false;
                    const dist = calculateDistance(
                        teacherPos.lat, teacherPos.lng,
                        student.latitude, student.longitude
                    );
                    return dist > 3; 
                });
                setFarStudents(tooFar);
            }
        } catch (err) {
            console.error("שגיאה בעדכון המפה");
        }
    };

    useEffect(() => {
        if (role === 'teacher' && showMap) {
            let isMounted = true;
            let timeoutId;

            const safeUpdate = async () => {
                await fetchMapUpdate(); 
                if (isMounted) {
                    timeoutId = setTimeout(safeUpdate, 60000);
                }
            };

            safeUpdate(); 

            return () => {
                isMounted = false;
                clearTimeout(timeoutId); 
            };
        }
    }, [showMap, teacherid, role, teacherPos]);


    if (role !== 'teacher') return null;

    const fetchAll = async () => {
        try {
            const res = await api.get('/?role=teacher'); 
            setData(res.data);
            setTableTitle("כל הרשומות במערכת");
            setShowMap(false); 
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
                {farStudents.length > 0 && (
                    <div style={{ backgroundColor: '#ffcccc', padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '2px solid red', textAlign: 'center' }}>
                        <h3 style={{ color: 'red', margin: 0 }}>⚠️ זהירות! {farStudents.length} תלמידות התרחקו מעל 3 ק"מ!</h3>
                        <p>{farStudents.map(s => `${s.first_name} ${s.last_name}`).join(', ')}</p>
                    </div>
                )}

                <section className="actions-bar">
                    <div className="btn-group">
                        <button onClick={fetchAll} className="btn-secondary">הצג את כולם</button>
                        <button onClick={fetchMyClass} className="btn-primary">הכיתה שלי</button>
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
                        <Map studentsLocation={mapData} teacherLocation={teacherPos} />
                    ) : (
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