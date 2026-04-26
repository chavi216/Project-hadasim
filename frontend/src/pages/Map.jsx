import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- יצירת אייקון אדום מותאם אישית ---
const redIcon = new L.Icon({
    // שימוש באייקון אדום ממאגר ציבורי אמין
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapComponent = ({ studentsLocation = [] }) => {
  // נקודת המרכז תהיה התלמידה הראשונה ברשימה, או ירושלים כברירת מחדל
  const center = studentsLocation.length > 0 && studentsLocation[0].lat 
    ? [parseFloat(studentsLocation[0].lat), parseFloat(studentsLocation[0].lng)] 
    : [31.7683, 35.2137];

  return (
    <div style={{ 
        height: "500px", 
        width: "100%", 
        borderRadius: "15px", 
        overflow: "hidden", 
        border: "2px solid #e74c3c" // מסגרת אדומה עדינה תואמת
    }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {studentsLocation?.map((student) => {
          const lat = parseFloat(student.lat);
          const lng = parseFloat(student.lng);

          if (!isNaN(lat) && !isNaN(lng)) {
            return (
              <Marker 
                key={student.id} 
                position={[lat, lng]} 
                icon={redIcon} // שימוש באייקון האדום שהגדרנו
              >
                <Popup>
                  <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <strong style={{ color: '#e74c3c' }}>{student.first_name} {student.last_name}</strong> <br />
                    <span>עדכון אחרון: {student.time ? new Date(student.time).toLocaleTimeString() : 'אין מידע'}</span>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;