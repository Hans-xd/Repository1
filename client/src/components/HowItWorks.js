// client/src/components/HowItWorks.js

import React from 'react';
import './cssComponent/HowItWorks.css';
import { FiChevronDown } from 'react-icons/fi';

export default function HowItWorks() {
  return (
    <section className="how-it-works mt-5">
      <h2>¿Cómo funciona?</h2>
      <div className="steps-container">
        <div className="step">
          <span className="step-number">1</span>
          <h5>Busca un lugar</h5>
          <p>Ingresa a “Buscar lugares” y filtra por categoría o nivel de accesibilidad.</p>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <h5>Revisa el mapa</h5>
          <p>Ve la ubicación del lugar en el mapa y comprueba si cumple tus necesidades.</p>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <h5>Lee reseñas</h5>
          <p>Consulta opiniones de otros usuarios para validar la accesibilidad real.</p>
        </div>
        <div className="step">
          <span className="step-number">4</span>
          <h5>Comparte tu experiencia</h5>
          <p>Si te registras, podrás dejar tu propia reseña y ayudar a la comunidad.</p>
        </div>
      </div>

      {/* Flecha que anima hacia abajo */}
      <div className="scroll-down" onClick={() => window.scrollBy({ top: 500, behavior: 'smooth' })}>
        <FiChevronDown size={32} />
      </div>
    </section>
  );
}
