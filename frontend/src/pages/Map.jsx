import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    teacher: createIcon('blue'),  
    myStudent: createIcon('gold'),
    other: createIcon('red'),     
    alert: createIcon('violet')   
};

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const MapComponent = ({ studentsLocation = [], teacherLocation = null }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const myId = String(user.id || '').trim();
    const myClassId = String(user.class_id || '').trim();

    const center = teacherLocation ? [teacherLocation.lat, teacherLocation.lng] : [31.7683, 35.2137];

    return (
        <div style={{ height: '500px', width: '100%', position: 'relative', border: '1px solid #ccc', borderRadius: '10px' }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />


                {teacherLocation && (
                    <Circle 
                        center={[teacherLocation.lat, teacherLocation.lng]}
                        radius={3000} 
                        pathOptions={{ color: '#2ecc71', fillColor: '#2ecc71', fillOpacity: 0.1 }}
                    />
                )}

                {studentsLocation?.map((loc, index) => {
                    const lat = parseFloat(loc.latitude);
                    const lng = parseFloat(loc.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    const currentId = String(loc.id || loc.user_id || '').trim();
                    const currentRole = String(loc.role || '').toLowerCase().trim();
                    const currentClass = String(loc.class_id || '').trim();

                    let currentIcon = icons.other; 
                    let label = "תלמידה אחרת";
                    let isTooFar = false;
                    if (teacherLocation) {
                        const dist = getDistance(teacherLocation.lat, teacherLocation.lng, lat, lng);
                        if (dist > 3) isTooFar = true;
                    }
                    if (currentId === myId) {
                        currentIcon = icons.me;
                        label = "אני (מורה)";
                    } else if (currentRole === 'teacher') {
                        currentIcon = icons.teacher;
                        label = "מורה נוספת";
                    } else if (currentClass === myClassId && myClassId !== "") {
                        currentIcon = isTooFar ? icons.alert : icons.myStudent;
                        label = isTooFar ? "⚠️ תלמידה שלי (רחוקה!)" : "תלמידה שלי";
                    }

                    return (
                        <Marker key={index} position={[lat, lng]} icon={currentIcon}>
                            <Popup>
                                <div style={{ direction: 'rtl', textAlign: 'right' }}>
                                    <strong style={{ color: isTooFar ? 'red' : 'black' }}>
                                        {loc.first_name} {loc.last_name}
                                    </strong><br />
                                    {label}<br />
                                    כיתה: {loc.class_id || 'לא ידוע'}<br />
                                    {isTooFar && <b style={{ color: 'red' }}>מרחק: מעל 3 ק"מ!</b>}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <div style={{
                position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'white',
                padding: '10px', zIndex: 1000, borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                direction: 'rtl', fontSize: '13px', border: '2px solid #333'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>מקרא מפה:</div>
                <div><span style={{ color: '#2ecc71' }}>●</span> אני / רדיוס בטוח</div>
                <div><span style={{ color: '#f1c40f' }}>●</span> תלמידות שלי (בטווח)</div>
                <div><span style={{ color: '#9b59b6' }}>●</span> ⚠️ תלמידה רחוקה מהמורה</div>
                <div><span style={{ color: '#e74c3c' }}>●</span> תלמידות אחרות</div>
                <div><span style={{ color: '#3498db' }}>●</span> מורות אחרות</div>
            </div>
        </div>
    );
};

export default MapComponent;