// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import PlaceDetailsPage from "./pages/PlaceDetailsPage";
import UserProfilePage from "./pages/UserProfilePage";
import AccessibilityMap from "./pages/AccessibilityMap";
import GoogleMapView from './components/GoogleMapView';
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
   const destino = { lat: -33.4372, lng: -70.6506 }; 
  return (
    <Router>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<HomePage />} />


        {/* Otras rutas */}
        <Route path="/mapa" element={<GoogleMapView destination={destino} />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/place/:id" element={<PlaceDetailsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/map" element={<AccessibilityMap />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/register" element={<Register />} />

        {/* Cualquiera otra ruta redirige al Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    
  );
}

export default App;