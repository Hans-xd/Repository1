// src/index.js
import 'leaflet/dist/leaflet.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { AuthProvider } from './hooks/useAuth';

// ───────────── Añadir esto arriba ─────────────
const mapsKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
if (mapsKey) {
  const s = document.createElement('script');
  s.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
} else {
  console.warn('⚠️ No se encontró REACT_APP_GOOGLE_MAPS_API_KEY en .env');
}
// ────────────────────────────────────────────────

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
