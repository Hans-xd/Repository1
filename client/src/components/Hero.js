// src/components/Hero.js
import React from 'react';
import { Link } from 'react-router-dom';
import './cssComponent/Hero.css';


export default function Hero() {

  const handleFocusNavbarSearch = () => {
    window.dispatchEvent(new Event('focusNavSearch'));
  };
  return (
    <section className="hero-container">
      <div className="hero-content">
        <h1>Accesibilidad y Movilidad</h1>
        <p>
          Descubre lugares y rutas diseñadas para personas con discapacidad motora. 
          Filtra por nivel de accesibilidad y revisa opiniones reales.
        </p>
        <div className="hero-buttons">
          <a
            onClick={handleFocusNavbarSearch}
            className="btn btn-primary" href='#'>
            Buscar lugares
          </a>
          <Link to="/mapa" className="btn btn-secondary">
            Ver mapa de accesibilidad
          </Link>
        </div>
      </div>
    </section>
  );
}
