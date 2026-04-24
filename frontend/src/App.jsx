import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Teacher from './pages/Teacher'; 
import StudentMap from './pages/Map';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Teacher" element={<Teacher />} />
       <Route path="/map/:teacherId" element={<StudentMap />} />
      </Routes>
    </Router>
  );
}

export default App;