// src/components/ReviewModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import StarRating from './StarRating';
import { useAuth } from '../hooks/useAuth';
import './cssComponent/ReviewModal.css'; // Asegúrate de tener estilos para el modal de reseñas

export default function ReviewModal({ show, onClose, placeId, onReviewSubmitted }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (rating === 0) {
      return setError('Por favor selecciona una calificación.');
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, rating, comment })
      });
      if (!res.ok) throw new Error('No se pudo enviar la reseña.');
      onReviewSubmitted(); // recarga reseñas en la página padre
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} title="Agregar reseña" onClose={onClose}>
      {!user ? (
        <div className="not-auth">
          <p>Debes iniciar sesión para dejar una reseña.</p>
          <div className='modal-buttons'>
            <button className="btn btn-secondary" onClick={() => {
              onClose();
              navigate('/login');
            }}
          >
            Iniciar Sesión
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          </div>
        </div>
      ) : (
        <form className="review-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          <label>Tu calificación *</label>
          <StarRating value={rating} onChange={setRating} />
          <label>Comentario (opcional)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escribe tu opinión..."
          />
          <button type="submit" className="btn btn-primary">
            Enviar reseña
          </button>
        </form>
      )}
    </Modal>
  );
}
