// src/components/RecentPlaces.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function RecentPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/places/recent')
      .then(res => res.json())
      .then(data => {
        setPlaces(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando lugares recientes:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando lugares recientes…</p>;

  return (
    <section className="recent-places">
      <h2>Lugares recién agregados</h2>
      <ul className="place-list">
        {places.map(place => (
          <li key={place.id} className="place-item">
            <Link to={`/place/${place.id}`}>
              <h3>{place.name}</h3>
              <p>Nivel: {place.access_level}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
