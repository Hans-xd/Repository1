// src/components/StarRating.jsx
import React, { useState } from 'react';
import './cssComponent/StarRating.css'; // Asegúrate de tener estilos para las estrellas

export default function StarRating({ value = 0, onChange }) {
  // hoverValue almacena el valor temporal al pasar el ratón
  const [hoverValue, setHoverValue] = useState(0);

  // calcula lo que se pinta: si estás haciendo hover, muestra hoverValue; sino el value real
  const displayValue = hoverValue || value;

  const handleMouseMove = (e, starIndex) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    // si pinchas en la mitad izquierda → .5, sino → entero
    const floatVal = percent <= 0.5 ? starIndex - 0.5 : starIndex;
    setHoverValue(floatVal);
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const handleClick = (e, starIndex) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    const floatVal = percent <= 0.5 ? starIndex - 0.5 : starIndex;
    onChange(floatVal);
  };

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave}>
      {[1,2,3,4,5].map(i => {
        // determina si este bloque debe pintarse lleno, medio o vacío
        let className = 'star';
        if (displayValue >= i) {
          className += ' filled';
        } else if (displayValue >= i - 0.5) {
          className += ' half';
        }
        return (
          <span
            key={i}
            className={className}
            onMouseMove={e => handleMouseMove(e, i)}
            onClick={e => handleClick(e, i)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
