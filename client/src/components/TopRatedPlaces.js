// src/components/TopRatedPlaces.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function TopRatedPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/places/top-rated')
      .then(res => res.json())
      .then(data => {
        setPlaces(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando lugares mejor calificados:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando lugares destacados…</p>;

  return (
    <section className="top-rated-places">
      <h2>Lugares mejor calificados</h2>
      <ul className="place-list">
        {places.map(place => (
          <li key={place.id} className="place-item">
            <Link to={`/place/${place.id}`}>
              <h3>{place.name}</h3>
              <p>⭐ {place.avg_rating} / 5</p>
              <p>Nivel: {place.access_level}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
