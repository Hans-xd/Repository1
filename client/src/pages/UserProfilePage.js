// src/pages/UserProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth'; 
import '../styles/UserProfilePage.css';
import Navbar from "../components/Navbar";

function UserProfilePage() {
  const { user, updateProfile /* ahora disponible */ } = useAuth();
  const [newName, setNewName] = useState(user.name);
  const [newLastName, setNewLastName] = useState(user.lastName);
  const [newEmail, setNewEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [userReviews, setUserReviews] = useState([]);
  const carouselRef = useRef(null);
  const serviceRef  = useRef(null);
  const [detailedReviews, setDetailedReviews] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/me', { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      if (err.response?.status !== 401) console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Trae reseñas crudas del usuario
  useEffect(() => {
    fetch(`/api/reviews?userId=${user.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setUserReviews(data);
      })
      .catch(console.error);
  }, [user.id]);

   useEffect(() => {
    if (!userReviews.length) return;

    // Inicializa PlacesService una sola vez
    if (window.google && !serviceRef.current) {
      const div = document.createElement('div');
      serviceRef.current = new window.google.maps.places.PlacesService(div);
    }

    // Lanza las peticiones getDetails
    const promises = userReviews.map(r => new Promise(resolve => {
      serviceRef.current.getDetails(
        { placeId: r.placeId, fields: ['name'] },
        (place, status) => {
          resolve({
            ...r,
           name: status === window.google.maps.places.PlacesServiceStatus.OK 
                   ? place.name 
                   : 'Lugar no disponible'
          });
        }
      );
    }));

    Promise.all(promises)
      .then(data => {
        setDetailedReviews(data);
        setLoadingDetails(false);
      })
      .catch(err => {
        console.error('Error cargando detalles de lugares:', err);
        setDetailedReviews(userReviews);
        setLoadingDetails(false);
      });
  }, [userReviews]);

  

  const handleSaveProfile = async () => {

    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, lastName: newLastName, email: newEmail }),
      });

      if (!response.ok) throw new Error('Error al actualizar el perfil');

      // ————— Aquí aplicas el cambio en el contexto —————
      updateProfile({ name: newName, email: newEmail, lastName: newLastName });

      setSuccessMessage('Perfil actualizado con éxito.');
      setIsEditing(false);

      // Opcional: si prefieres recargar todo el usuario desde el servidor
      await fetchUser();
    } catch (error) {
      console.error('Error actualizando el perfil:', error);
    }
  };

  // Control de scroll: salta una tarjeta
  const scroll = direction => {
    if (!carouselRef.current) return;
    const itemHeight = carouselRef.current.firstChild?.clientHeight || 0;
    carouselRef.current.scrollBy({
      top: direction * itemHeight,
      behavior: 'smooth'
    });
  };

  return (

    <div className="user-profile-page">
      <Navbar />

      <header><h1>Perfil de Usuario</h1></header>
      <main>
        <section className="profile-details">
          <h2>Tu Perfil</h2>

          {isEditing ? (
            <>
            <div className="profile-row">
              <label>
                
                  Nombre:
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
                
              </label>
              <label>
                
                  Apellido:
                  <input
                  type="text"
                  value={newLastName}
                  onChange={e => setNewLastName(e.target.value)}
                />
                
                
                
              </label>
            </div>
              <label>
                Correo:
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
              </label>
              <div className="button-group">
              <button onClick={handleSaveProfile}>Guardar Cambios</button>
              <button onClick={() => setIsEditing(false)}>Cancelar</button>
              </div>
            </>
          ) : (
            <>
              <p>Nombre: {user.name} {user.lastName}</p> 
              <p>Correo: {user.email}</p>
              <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
            </>
          )}

          {successMessage && <p className="success-message">{successMessage}</p>}
        </section>

        <section className="user-reviews">
        <h2>Tus Reseñas</h2>

        {!loadingDetails && detailedReviews.length > 0 ? (
          <>
            <div className="carousel-controls">
              <button onClick={() => scroll(-1)} aria-label="Subir">↑</button>
              <button onClick={() => scroll(1)} aria-label="Bajar">↓</button>
            </div>
            <div className="reviews-carousel-user" ref={carouselRef}>
              {detailedReviews.map(review => (
                <div key={review.id} className="carousel-item">
                  <div className="review-card">
                    <h4 className="place-name">{review.name}</h4>
                    <div className="rating">
                        {(() => {
                          const fullStars = Math.floor(review.rating);
                          const hasHalf = review.rating - fullStars === 0.5;
                          const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
                          return (
                            <>
                              {[...Array(fullStars)].map((_, i) => (
                                <span key={i} className="star filled">★</span>
                              ))}
                              {hasHalf && <span className="star half">★</span>}
                              {[...Array(emptyStars)].map((_, i) => (
                                <span key={`e${i}`} className="star">☆</span>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    <p className="comment">{review.comment}</p>
                    <small className="date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="no-reviews">Aún no tienes reseñas.</p>
        )}
      </section>
      </main>

    </div>
  );
}

export default UserProfilePage;
