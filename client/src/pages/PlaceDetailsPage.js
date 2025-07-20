// src/pages/PlaceDetailsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modal from '../components/Modal';             // Modal genérico
import StarRating from '../components/StarRating';   // Componente de estrellas
import { useAuth } from '../hooks/useAuth';
import '../styles/global.css';
import '../styles/PlaceDetailsPage.css';
import { environment } from '../environments/environment';

const containerStyle = { width: '100%', height: '400px' };

export default function PlaceDetailsPage() {
  const { id: placeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    rampas: false,
    banos: false,
    estacionamiento: false,
    accessibleFor: []
  });
  const serviceRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: environment.googleMapsApiKey,
    libraries: ['places']
  });

  // 1) Inicializa la PlacesService cuando la API esté lista
  useEffect(() => {
    if (isLoaded && !serviceRef.current) {
      serviceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    }
  }, [isLoaded]);

  // 2) Carga detalles del lugar y reseñas
  useEffect(() => {
    if (!isLoaded) return;

    // Detalles de Google Places
    serviceRef.current.getDetails(
      { placeId, fields: ['name','formatted_address','geometry','photos'] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setDetails(place);
        } else {
          setError('No se pudieron cargar los detalles');
        }
      }
    );
    // Reseñas desde nuestra API
    fetch(`/api/reviews?placeId=${placeId}`, { credentials:'include' })
      .then(r => r.json())
      .then(setReviews)
      .catch(console.error);
  }, [isLoaded, placeId]);

  // 3) Manejador de cambios en el formulario del modal
  const handleFeedbackChange = e => {
    const { name, type, checked, value, options } = e.target;
    if (type === 'checkbox') {
      setFeedback(f => ({ ...f, [name]: checked }));
    } else if (name === 'accessibleFor') {
      const arr = Array.from(options)
        .filter(o => o.selected)
        .map(o => o.value);
      setFeedback(f => ({ ...f, accessibleFor: arr }));
    } else {
      setFeedback(f => ({ ...f, [name]: value }));
    }
  };

  // 4) Envía la reseña a nuestro endpoint /api/place-feedback
  const submitFeedback = async e => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (feedback.rating === 0) {
      alert('Selecciona una calificación.');
      return;
    }
    const payload = {
      placeId,
      rating: feedback.rating,
      comment: feedback.comment,
      rampas: feedback.rampas ? 1 : 0,
      banos: feedback.banos ? 1 : 0,
      estacionamiento: feedback.estacionamiento ? 1 : 0,
      accessible_for: feedback.accessibleFor
    };
    try {
      const res = await fetch('/api/place-feedback', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error enviando datos');
      const newReview = await res.json();
      setReviews(r => [newReview, ...r]);
      setShowModal(false);
      setFeedback({
        rating: 0, comment: '',
        rampas: false, banos: false, estacionamiento: false,
        accessibleFor: []
      });
    } catch(err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loadError) return <p className="center red">Error cargando Google Maps</p>;
  if (!isLoaded)  return <p className="center">Cargando mapa…</p>;
  if (error)      return <p className="center red">{error}</p>;
  if (!details)   return <p className="center">Cargando detalles…</p>;

  const center = {
    lat: details.geometry.location.lat(),
    lng: details.geometry.location.lng()
  };

  return (
    <>
      <Navbar />

      <div className="place-page container">
        <div className="place-header">
          <h1>{details.name}</h1>
          <p>{details.formatted_address}</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Agregar reseña
          </button>
        </div>

        <div className="place-body">
          <div className="map-box">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={17}
            >
              <Marker position={center} />
            </GoogleMap>
          </div>

          {details.photos?.length > 0 && (
            <div className="photos-grid">
              {details.photos.map((p,i) => (
                <img
                  key={i}
                  src={p.getUrl({ maxWidth: 400 })}
                  alt={details.name}
                  className="photo-item"
                />
              ))}
            </div>
          )}

          <section className="reviews-section">
            <h3>Reseñas de usuarios</h3>
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((rev,i) => {
                  const full = Math.floor(rev.rating);
                  const half = rev.rating - full === 0.5;
                  const empty = 5 - full - (half ? 1 : 0);
                  return (
                    <div key={i} className="review-card">
                      <div className="reviewer">
                        {rev.photoUrl && (
                          <img
                            src={process.env.PUBLIC_URL + rev.photoUrl}
                            alt={`${rev.nameP} ${rev.lastName}`}
                            className="avatar"
                          />
                        )}
                        <div>
                          <strong>{rev.nameP} {rev.lastName}</strong>
                          <small>
                            {new Date(rev.created_at).toLocaleDateString('es-ES',{
                              year:'numeric', month:'long', day:'numeric'
                            })}
                          </small>
                        </div>
                      </div>
                      <div className="rating">
                        {[...Array(full)].map((_,j)=>(
                          <span key={j} className="star filled">★</span>
                        ))}
                        {half && <span className="star half">★</span>}
                        {[...Array(empty)].map((_,j)=>(
                          <span key={j} className="star">☆</span>
                        ))}
                      </div>
                      {rev.comment && <p className="comment">{rev.comment}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No hay reseñas aún. ¡Sé el primero!</p>
            )}
          </section>
        </div>
      </div>

      {showModal && (
        <Modal
          show={true}
          title="Agregar reseña"
          onClose={() => setShowModal(false)}
        >
          {!user ? (
            <div className="not-auth">
              <p>Debes iniciar sesión para dejar una reseña.</p>
              <div className='modal-buttons'>
            <button className="btn btn-secondary" onClick={() => {
              setShowModal(false);
              navigate('/login');
            }}
          >
            Iniciar Sesión
          </button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </button>
          </div>
            </div>
          ) : (
            <form className="feedback-form" onSubmit={submitFeedback}>
              <label>Calificación *</label>
              <StarRating
                value={feedback.rating}
                onChange={val =>
                  setFeedback(f => ({ ...f, rating: val }))
                }
                half={true}
              />

              <label>Comentario (opcional)</label>
              <textarea
                name="comment"
                value={feedback.comment}
                onChange={handleFeedbackChange}
              />

              <fieldset className="checkbox-group">
                <legend>Instalaciones</legend>
                <label>
                  <input
                    type="checkbox"
                    name="rampas"
                    checked={feedback.rampas}
                    onChange={handleFeedbackChange}
                  /> Rampas
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="banos"
                    checked={feedback.banos}
                    onChange={handleFeedbackChange}
                  /> Baños adaptados
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="estacionamiento"
                    checked={feedback.estacionamiento}
                    onChange={handleFeedbackChange}
                  /> Estacionamiento
                </label>
              </fieldset>

              <label>Accesible para (Ctrl+Click múltiple)</label>
              <select
                name="accessibleFor"
                multiple
                value={feedback.accessibleFor}
                onChange={handleFeedbackChange}
              >
                <option value="motora">Motora</option>
                <option value="visual">Visual</option>
                <option value="auditiva">Auditiva</option>
                <option value="cognitiva">Cognitiva</option>
              </select>

              <button type="submit" className="btn btn-primary">
                Enviar reseña
              </button>
            </form>
          )}
        </Modal>
      )}

      <Footer />
    </>
  );
}
