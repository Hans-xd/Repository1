import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiLogOut, FiXCircle } from "react-icons/fi";
import "./cssComponent/Navbar.css";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Inicializa Autocomplete…
  useEffect(() => {
    if (!window.google || !inputRef.current) return;
    const initAutocomplete = (bounds) => {
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment", "geocode"],
        ...(bounds ? { bounds, strictBounds: false } : {}),
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place.place_id) navigate(`/place/${place.place_id}`);
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const o = 0.08;
          const bounds = new window.google.maps.LatLngBounds(
            { lat: coords.latitude - o, lng: coords.longitude - o },
            { lat: coords.latitude + o, lng: coords.longitude + o }
          );
          initAutocomplete(bounds);
        },
        () => initAutocomplete()
      );
    } else {
      initAutocomplete();
    }
  }, [navigate]);

  const confirmLogout = () => setShowLogoutModal(true);
  const cancelLogout = () => setShowLogoutModal(false);
  const doLogout = async () => {
    await logout();
    navigate("/");
    setShowLogoutModal(false);
  };

  return (
    <>
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
              <button className="btn-link" onClick={() => navigate("/profile")}>
                {user.name} {user.lastName}
              </button>
              <button className="btn-link red" onClick={confirmLogout}>
                <FiLogOut /> Cerrar Sesión
              </button>
            </>
          ) : (
            <button className="btn-link" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </nav>

      {showLogoutModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="modal-close" onClick={cancelLogout}>
              <FiXCircle size={24} />
            </button>
            <div className="modal-icon">
              <FiLogOut size={48} />
            </div>
            <h2>¿Estás seguro?</h2>
            <p>Al cerrar sesión perderás tu progreso actual.</p>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={cancelLogout}>
                No, cancelar
              </button>
              <button className="btn btn-primary" onClick={doLogout}>
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
