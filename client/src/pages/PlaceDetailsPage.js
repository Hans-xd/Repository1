// src/pages/PlaceDetailsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';  

import '../styles/global.css';
import '../styles/PlaceDetailsPage.css';
import { environment } from '../environments/environment'; // Asegúrate de que este archivo exista y contenga tu API key


const containerStyle = { width: '100%', height: '100%' };
const googleMapsApiKey = environment.googleMapsApiKey;


export default function PlaceDetailsPage() {
  const { id: placeId } = useParams();
  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const serviceRef = useRef(null);
  

  // Carga la API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey:googleMapsApiKey,
    libraries: ['places']
  });

  // Inicializa PlacesService
  useEffect(() => {
    if (isLoaded && !serviceRef.current) {
      serviceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    }
  }, [isLoaded]);

  // Trae detalles y reviews
  useEffect(() => {
    if (!isLoaded) return;

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

    fetch(`/api/reviews?placeId=${placeId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(setReviews)
      .catch(() => {/* opcional: setError('No se pudieron cargar reseñas') */});
  }, [isLoaded, placeId]);

  if (loadError) return <p className="center red">Error cargando Google Maps</p>;
  if (!isLoaded) return <p className="center">Cargando mapa…</p>;
  if (error) return <p className="center red">{error}</p>;
  if (!details) return <p className="center">Cargando detalles…</p>;

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
        </div>

        <div className="place-body">
          <div className="map-box">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={19}
            >
              <Marker
                position={center}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            </GoogleMap>
          </div>

          {details.photos?.length > 0 && (
            <div className="photos-grid">
              {details.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo.getUrl({ maxWidth: 400 })}
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
                {reviews.map((rev, i) => {
                  // calcula estrellas completas, media estrella y vacías
                  const fullStars = Math.floor(rev.rating);
                  const hasHalf = rev.rating - fullStars === 0.5;
                  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
                  return (
                    <div key={i} className="review-card">

                      <div className="review-content">
                         {/* Foto de perfil del usuario */}
                  <div className="reviewer" style={{ display: "flex", alignItems: "center" }}>

                    {/* Foto de perfil del usuario */}
                    {rev.photoUrl && (
                      <img
                        src={process.env.PUBLIC_URL + rev.photoUrl}
                        alt={`${rev.nameP} ${rev.lastName}`}
                        style={{
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          marginRight: "10px"
                        }}
                      />
                    )}
                    <p className="user" style={{ fontSize: "0.9em", color: "#555" }}>
                      <strong>
                        {rev.nameP} {rev.lastName}
                      </strong>
                    </p>
                    <p
                      className="date"
                      style={{ fontSize: "0.8em", color: "#999", marginLeft: "10px", marginTop: "7px" }}
                    >
                      {new Date(rev.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>

                  <div className="rating">
                    {(() => {
                      const fullStars = Math.floor(rev.rating);
                      const hasHalf = rev.rating - fullStars === 0.5;
                      const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
                            return (
                              <>
                                {/* Estrellas llenas */}
                                {[...Array(fullStars)].map((_, i) => (
                                  <span key={`full-${i}`} className="star filled">★</span>
                                ))}
                                {/* Media estrella */}
                                {hasHalf && <span className="star half">★</span>}
                                {/* Estrellas vacías */}
                                {[...Array(emptyStars)].map((_, i) => (
                                  <span key={`empty-${i}`} className="star">☆</span>
                                ))}
                              </>
                            );
                          })()}
                        </div>

                        <p>{rev.comment}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No hay reseñas aún.</p>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
