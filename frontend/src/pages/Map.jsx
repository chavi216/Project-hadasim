import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ studentsLocation }) => {
  const center = [32.0853, 34.7818];

  return (
    <MapContainer center={center} zoom={13} style={{ height: "400px", width: "100%" }}>
      {/* TileLayer הוא השירות שמספק את תמונות המפה (OpenStreetMap) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {studentsLocation.map((student) => (
        <Marker key={student.id} position={[student.lat, student.lng]}>
          <Popup>
            תלמידה: {student.name} <br />
            מיקום אחרון: {student.time}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;