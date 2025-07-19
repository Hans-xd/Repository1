// client/src/components/FeaturedPlaces.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './cssComponent/FeaturedPlaces.css';

export default function FeaturedPlaces() {
  const [places, setPlaces] = useState([]);
  const navigate = useNavigate();
  const serviceRef = useRef(null);

  // 1) Inicializa PlacesService
  useEffect(() => {
    if (window.google && !serviceRef.current) {
      const div = document.createElement('div');
      serviceRef.current = new window.google.maps.places.PlacesService(div);
    }
  }, []);

  // 2) Fetch + fotos
  useEffect(() => {
    const API = process.env.REACT_APP_API_URL || '';
    fetch(`${API}/api/places`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(async data => {
        const parsed = data.map(p => ({
          ...p,
          rating: p.rating != null ? parseFloat(p.rating) : 0
        }));
        const top4 = parsed.sort((a,b) => b.rating - a.rating).slice(0,4);

        if (!serviceRef.current) {
          setPlaces(top4);
          return;
        }

        const withPhotos = await Promise.all(
          top4.map(place => {
            const pid = place.google_place_id;
            if (!pid) return Promise.resolve({ ...place, placePhotoUrl: '' });
            return new Promise(resolve => {
              serviceRef.current.getDetails(
                { placeId: pid, fields: ['photos'] },
                (detail, status) => {
                  let placePhotoUrl = '';
                  if (
                    status === window.google.maps.places.PlacesServiceStatus.OK &&
                    detail.photos?.length > 0
                  ) {
                    placePhotoUrl = detail.photos[0].getUrl({ maxWidth: 400 });
                  }
                  resolve({ ...place, placePhotoUrl });
                }
              );
            });
          })
        );
        setPlaces(withPhotos);
      })
      .catch(err => console.error('Error al cargar lugares destacados:', err));
  }, []);

  // 3) Opciones del slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,

    // ★ Autoplay ★
    autoplay: true,          // activa el deslizamiento automático
    autoplaySpeed: 3000,     // cada 3000 ms (3 s)
    pauseOnHover: true,      // pausa si el usuario pasa el ratón por encima

    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768,  settings: { slidesToShow: 2 } },
      { breakpoint: 480,  settings: { slidesToShow: 1 } },
    ]
  };

  return (
    <section className="featured-places">
      <h2 className="section-title">Lugares Destacados</h2>
      <Slider {...settings}>
        {places.map(place => (
          <div
            key={place.id}
            className="place-card"
            onClick={() => navigate(`/place/${place.google_place_id}`)}
          >
            <img
              src={place.placePhotoUrl || '/assets/default-place.png'}
              alt={place.name}
              className="place-image"
            />
            <div className="place-content">
              <h3 className="place-name">{place.name}</h3>
              <p className="rating">⭐ {place.rating.toFixed(1)}</p>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}
