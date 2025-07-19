// client/src/pages/SearchPage.js

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import '../styles/SearchPage.css';
import '../components/cssComponent/Navbar.css'; // para .search-container, .search-input


export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const navigate = useNavigate();

  const inputRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(!!queryParam);
  const [error, setError] = useState(null);

  // 1) Texto → resultados
  useEffect(() => {
    if (!queryParam) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`/api/places?search=${encodeURIComponent(queryParam)}`)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        setPlaces(data);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('No fue posible obtener resultados. Intenta nuevamente.');
      })
      .finally(() => setLoading(false));
  }, [queryParam]);

  // 2) Autocomplete de Google con bias geográfico
  useEffect(() => {
    if (!(window.google && inputRef.current)) return;

    const initAutocomplete = bounds => {
      const opts = { types: ['establishment','geocode'], ...(bounds ? { bounds, strictBounds: false } : {}) };
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, opts);
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place.place_id) {
          navigate(`/place/${place.place_id}`);
        }
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const offset = 0.08;
          const b = new window.google.maps.LatLngBounds(
            { lat: coords.latitude - offset, lng: coords.longitude - offset },
            { lat: coords.latitude + offset, lng: coords.longitude + offset }
          );
          initAutocomplete(b);
        },
        () => initAutocomplete()
      );
    } else {
      initAutocomplete();
    }
  }, [navigate]);

  // 3) Manejar "Enter" para búsqueda de texto
  const onKeyDown = e => {
    if (e.key === 'Enter') {
      const v = inputRef.current.value.trim();
      setSearchParams(v ? { query: v } : {});
    }
  };

  return (
    <main className="search-page main-container">
      <h1>Buscar lugares</h1>

      <div className="search-container">
        <FiSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Ingresa tu búsqueda..."
          defaultValue={queryParam}
          onKeyDown={onKeyDown}
        />
      </div>

      {loading && <p className="info">Cargando resultados…</p>}

      {!loading && error && <p className="error">{error}</p>}

      {!loading && !error && queryParam && places.length === 0 && (
        <p className="info">No se encontraron lugares para “{queryParam}”.</p>
      )}

      {!loading && !error && places.length > 0 && (
        <ul className="place-list">
          {places.map(place => (
            <li key={place.id} className="place-item">
              <Link to={`/place/${place.id}`}>
                <h3>{place.name}</h3>
                {place.access_level && <p>Nivel: {place.access_level}</p>}
                {(place.city || place.region) && (
                  <small>
                    {place.city}{place.city && place.region ? ', ' : ''}{place.region}
                  </small>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
