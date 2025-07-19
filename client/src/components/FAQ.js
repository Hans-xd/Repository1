// src/pages/FAQ.js
import React from 'react';
import './FAQ.css';

const faqs = [
  {
    q: '¿Cómo creo una cuenta?',
    a: 'Ve a “Iniciar sesión” y luego haz clic en “Registrarse”. Ingresa tu correo y una contraseña segura.'
  },
  {
    q: '¿Qué significan A11, A12, A13?',
    a: 'Son niveles de accesibilidad. A11 = totalmente accesible; A12 = parcialmente accesible; A13 = no accesible. Lee más en nuestra sección “Niveles de accesibilidad”.'
  },
  {
    q: '¿Cómo agrego una reseña?',
    a: 'Ingresa a la página de detalles de un lugar (haz clic en “Ver más”). Debajo de la descripción, encontrarás un formulario para dejar tu calificación y comentario.'
  },
  {
    q: '¿Cómo reporto un error en un lugar?',
    a: 'Dentro de la página de detalles, haz clic en “Reportar incidencia”.'
  },
  {
    q: '¿La app funciona en mi celular?',
    a: 'Sí, el diseño es responsive. En dispositivos móviles encontrarás un menú flotante para navegar rápidamente entre “Mapa” y “Buscar”.'
  }
];

export default function FAQ() {
  return (
    <main className="faq-page">
      <h1>Preguntas Frecuentes</h1>
      {faqs.map((item, i) => (
        <details key={i} className="faq-item">
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </main>
  );
}
