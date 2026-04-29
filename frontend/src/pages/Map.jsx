import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateDistance } from '../Service/Service';

const createIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const icons = {
    me: createIcon('green'),
    myStudent: createIcon('gold'),
    alert: createIcon('violet'),
    teacher: createIcon('blue'),
    otherStudent: createIcon('red')
};



const MapComponent = ({ studentsLocation = [], teacherLocation = null }) => {
    const myId = String(localStorage.getItem('teacherid') || '').trim();

    const processedData = useMemo(() => {
        const uniqueMap = new Map();
        studentsLocation.forEach(item => {
            const lat = parseFloat(item.latitude);
            const lng = parseFloat(item.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                uniqueMap.set(String(item.id), { ...item, lat, lng });
            }
        });
        return Array.from(uniqueMap.values());
    }, [studentsLocation]);

    const center = teacherLocation ? [teacherLocation.lat, teacherLocation.lng] : [31.7683, 35.2137];

    return (
        <div style={{ height: '550px', width: '100%', position: 'relative', border: '2px solid #ddd', borderRadius: '15px', overflow: 'hidden' }}>
            <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {teacherLocation && (
                    <Circle 
                        center={[teacherLocation.lat, teacherLocation.lng]}
                        radius={3000} 
                        pathOptions={{ color: '#2ecc71', fillColor: '#2ecc71', fillOpacity: 0.1 }}
                    />
                )}

                {processedData.map((loc) => {
                    const isMe = String(loc.id) === myId;
                    const isMyStudent = loc.is_my_student === 1;
                    const role = String(loc.role || '').toLowerCase().trim();
                    
                    let currentIcon = icons.otherStudent;
                    let label = "תלמידה (כיתה אחרת)";
                    let isTooFar = false;
                    let dist = 0;

                    if (teacherLocation && isMyStudent && role === 'student') {
                        dist = calculateDistance(teacherLocation.lat, teacherLocation.lng, loc.lat, loc.lng);
                        if (dist > 3) isTooFar = true;
                    }

                    if (isMe) {
                        currentIcon = icons.me;
                        label = "אני (המורה המחוברת)";
                    } else if (role === 'teacher') {
                        currentIcon = icons.teacher;
                        label = "מורה עמיתה";
                    } else if (isMyStudent) {
                        currentIcon = isTooFar ? icons.alert : icons.myStudent;
                        label = isTooFar ? "⚠️ תלמידה שלי (חריגה!)" : "תלמידה שלי";
                    }

                    return (
                        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={currentIcon} zIndexOffset={isMe ? 1000 : 0}>
                            <Popup>
                                <div style={{ direction: 'rtl', textAlign: 'right', minWidth: '170px' }}>
                                    <strong style={{ fontSize: '16px' }}>{loc.first_name} {loc.last_name}</strong><br />
                                    <span style={{ color: '#666' }}>{label}</span>
                                    <hr style={{ margin: '8px 0', border: '0', borderTop: '1px solid #eee' }} />
                                    <div style={{ fontSize: '13px', marginBottom: '10px' }}>
                                        <b>כיתה:</b> {loc.class_id || '---'}<br />
                                        <b>מיקום:</b> {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                                        {isTooFar && <div style={{ color: 'red', fontWeight: 'bold' }}>חריגה: {dist.toFixed(2)} ק"מ</div>}
                                    </div>
                                    <a 
                                        href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'block', backgroundColor: '#3498db', color: 'white',
                                            textAlign: 'center', padding: '7px', borderRadius: '5px',
                                            textDecoration: 'none', fontSize: '12px', fontWeight: 'bold'
                                        }}
                                    >
                                        ניווט ב-Google Maps 📍
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <div style={{
                position: 'absolute', bottom: '25px', right: '20px', zIndex: 1000, 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px', borderRadius: '10px', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)', direction: 'rtl', fontSize: '13px'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', borderBottom: '1px solid #eee' }}>מקרא:</div>
                <div><span style={{ color: '#2ecc71' }}>●</span> אני</div>
                <div><span style={{ color: '#f1c40f' }}>●</span> תלמידה שלי</div>
                <div><span style={{ color: '#9b59b6' }}>●</span> ⚠️ חריגת מרחק</div>
                <div><span style={{ color: '#3498db' }}>●</span> מורה עמיתה</div>
                <div><span style={{ color: '#e74c3c' }}>●</span> תלמידה אחרת</div>
            </div>
        </div>
    );
};

export default MapComponent;