// src/components/Modal.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import './cssComponent/Modal.css'; // Asegúrate de tener estilos para el modal

export default function Modal({ show, title, children, onClose }) {
  if (!show) return null;
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
