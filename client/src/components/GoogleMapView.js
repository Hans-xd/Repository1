// client/src/components/GoogleMapView.js

import React, {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Polyline
} from '@react-google-maps/api';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWheelchair,
  faToilet,
  faParking,
  faStar,
  faMapMarkerAlt,
  faRoute,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';

// colocar css local
import './cssComponent/GoogleMapView.css';


const DEFAULT_CENTER = { lat: -33.4489, lng: -70.6693 };

export default function GoogleMapView() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
  
  

  // Estado para la ruta (overview_path)
  const [routePath, setRoutePath] = useState([]);

  const mapRef = useRef(null);
  const onLoad = useCallback(map => { mapRef.current = map; }, []);

  const [places, setPlaces] = useState([]);
  const [filters, setFilters] = useState({
    rampas: true,
    banos: true,
    estacionamiento: true
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  // 1) Fetch y parseo de datos
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/places`)
      .then(res => res.json())
      .then(data => {
        const parsed = data.map(p => ({
          ...p,
          lat: parseFloat(p.lat),
          lng: parseFloat(p.lng),
          rating: p.rating !== null ? parseFloat(p.rating) : 0,
          rampas: Boolean(p.rampas),
          banos: Boolean(p.banos),
          estacionamiento: Boolean(p.estacionamiento)
        }));
        setPlaces(parsed);
      })
      .catch(err => console.error('Error cargando places:', err));
  }, []);

  // 2) Calcular ruta y extraer overview_path
  useEffect(() => {
    if (!origin || !destination) return;
    const service = new window.google.maps.DirectionsService();
    service.route({
      origin,
      destination,
      travelMode: window.google.maps.TravelMode.WALKING,
      avoidTolls: true
    }, (result, status) => {
      if (status === 'OK') {
        const path = result.routes[0].overview_path.map(p => ({
          lat: p.lat(),
          lng: p.lng()
        }));
        setRoutePath(path);
      } else {
        console.error('Error al calcular ruta:', status);
      }
    });
  }, [origin, destination]);

  if (loadError) return <div>Error al cargar Google Maps</div>;
  if (!isLoaded) return <div>Cargando mapa…</div>;

  // 3) Filtrado de lugares
  const visiblePlaces = places.filter(p =>
    (filters.rampas && p.rampas) ||
    (filters.banos && p.banos) ||
    (filters.estacionamiento && p.estacionamiento)
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar de filtros y ruta */}
      <aside style={{
        width: 280,
        padding: 16,
        background: '#fff',
        boxShadow: '2px 0 6px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        zIndex: 10
      }}>
        <h3>Filtros</h3>
        <div style={{ marginBottom: 16 }}>
          {[
            { key: 'rampas', icon: faWheelchair, label: 'Rampas' },
            { key: 'banos', icon: faToilet, label: 'Baños' },
            { key: 'estacionamiento', icon: faParking, label: 'Estacionamiento' }
          ].map(({ key, icon, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}>
              <input
                type="checkbox"
                name={key}
                checked={filters[key]}
                onChange={e => setFilters(f => ({ ...f, [key]: e.target.checked }))}
                style={{ marginRight: 8 }}
              />
              <FontAwesomeIcon icon={icon} fixedWidth /> {label}
            </label>
          ))}
        </div>

        <h3>Ruta</h3>
        <select
          onChange={e => {
            const p = places.find(x => x.id === +e.target.value);
            setOrigin(p ? { lat: p.lat, lng: p.lng } : null);
          }}
          style={{ width: '100%', marginBottom: 8 }}
          defaultValue=""
        >
          <option value="">Selecciona origen</option>
          {places.map(p =>
            <option key={p.id} value={p.id}>{p.name}</option>
          )}
        </select>
        <select
          onChange={e => {
            const p = places.find(x => x.id === +e.target.value);
            setDestination(p ? { lat: p.lat, lng: p.lng } : null);
          }}
          style={{ width: '100%', marginBottom: 12 }}
          defaultValue=""
        >
          <option value="">Selecciona destino</option>
          {places.map(p =>
            <option key={p.id} value={p.id}>{p.name}</option>
          )}
        </select>
        <button
          onClick={() => {
            setRoutePath([]);
            setOrigin(null);
            setDestination(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <FontAwesomeIcon icon={faTrashAlt} fixedWidth style={{ marginRight: 8 }} />
          Limpiar ruta
        </button>
      </aside>

      {/* Mapa */}
      <div style={{ flex: 1, position: 'relative' }}>
        <GoogleMap
          onLoad={onLoad}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={DEFAULT_CENTER}
          zoom={13}
          onClick={() => setSelectedPlace(null)}
        >
          {/* Origen y Destino */}
          {origin && (
            <Marker
              position={origin}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#28a745',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#fff'
              }}
            />
          )}
          {destination && (
            <Marker
              position={destination}
              icon={{
                path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: '#dc3545',
                fillOpacity: 1,
                strokeWeight: 1
              }}
            />
          )}

          {/* Marcadores de lugares */}
          {visiblePlaces.map(place => (
            <Marker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.name}
              onClick={() => setSelectedPlace(place)}
            />
          ))}

          {/* InfoWindow con detalles */}
          {selectedPlace && (
            <InfoWindow
              position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div style={{ maxWidth: 220 }}>
                <h4 style={{ margin: '0 0 4px' }}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} fixedWidth />{' '}
                  {selectedPlace.name}
                </h4>
                <p style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                  {selectedPlace.description}
                </p>
                <p style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                  <FontAwesomeIcon icon={faWheelchair} fixedWidth /> Rampas:{' '}
                  {selectedPlace.rampas ? 'Sí' : 'No'}<br/>
                  <FontAwesomeIcon icon={faToilet} fixedWidth /> Baños:{' '}
                  {selectedPlace.banos ? 'Sí' : 'No'}<br/>
                  <FontAwesomeIcon icon={faParking} fixedWidth /> Estac.:{' '}
                  {selectedPlace.estacionamiento ? 'Sí' : 'No'}
                </p>
                <p style={{ fontSize: '0.85rem', marginBottom: 8 }}>
                  <FontAwesomeIcon icon={faStar} fixedWidth />{' '}
                  {selectedPlace.rating.toFixed(1)}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setOrigin({ lat: selectedPlace.lat, lng: selectedPlace.lng });
                      setSelectedPlace(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <FontAwesomeIcon icon={faRoute} /> Origen
                  </button>
                  <button
                    onClick={() => {
                      setDestination({ lat: selectedPlace.lat, lng: selectedPlace.lng });
                      setSelectedPlace(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <FontAwesomeIcon icon={faRoute} /> Destino
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Dibuja la ruta como polilínea */}
          {routePath.length > 0 && (
            <Polyline
              path={routePath}
              options={{
                strokeColor: '#007bff',
                strokeOpacity: 0.7,
                strokeWeight: 5
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
