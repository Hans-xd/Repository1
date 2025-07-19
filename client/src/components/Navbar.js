// client/src/components/Navbar.js

import React, { useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import "./cssComponent/Navbar.css";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  // 1) Inicializa Autocomplete como antes
  useEffect(() => {
    const initAutocomplete = bounds => {
      const opts = {
        types: ["establishment", "geocode"],
        ...(bounds ? { bounds, strictBounds: false } : {})
      };
      const ac = new window.google.maps.places.Autocomplete(
        inputRef.current,
        opts
      );
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place.place_id) {
          navigate(`/place/${place.place_id}`);
        }
      });
    };

    if (window.google && inputRef.current) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const offset = 0.08;
            const b = new window.google.maps.LatLngBounds(
              { lat: coords.latitude - offset, lng: coords.longitude - offset },
              { lat: coords.latitude + offset, lng: coords.longitude + offset }
            );
            initAutocomplete(b);
          },
          () => initAutocomplete()
        );
      } else {
        initAutocomplete();
      }
    }
  }, [navigate]);

  // 2) ENFOCAR el input cuando la ruta sea /search

  useEffect(() => {
    const handler = () => inputRef.current?.focus();
    window.addEventListener('focusNavSearch', handler);
    return () => window.removeEventListener('focusNavSearch', handler);
  }, []);


  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        <h1>Accesibilidad</h1>
      </div>

      <div className="nav-links">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Buscar lugares..."
          />
        </div>

        {user ? (
          <>
            <button onClick={() => navigate("/profile")}>
              {user.name} {user.lastName}
            </button>
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </>
        ) : (
          <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
