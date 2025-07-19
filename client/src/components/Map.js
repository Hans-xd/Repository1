// src/components/Map.js
import React, { useState, useRef } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Autocomplete
} from '@react-google-maps/api';
import { environment } from '../environments/environment'; // Asegúrate de que la ruta sea correcta

const googleMapsApiKey = environment.googleMapsApiKey;

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: -34.397,
  lng: 150.644
};

const staticLocations = [
  { lat: -34.397, lng: 150.644, title: 'Lugar A' },
  { lat: -34.407, lng: 150.654, title: 'Lugar B' }
];

function Map() {
  const [map, setMap] = useState(null);
  const [autoComp, setAutoComp] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [info, setInfo] = useState(null);
  const inputRef = useRef(null);

  // Guarda la instancia del mapa
  const handleMapLoad = mapInstance => {
    setMap(mapInstance);
  };

  // Guarda la instancia de Autocomplete
  const handleAutoLoad = autocomplete => {
    setAutoComp(autocomplete);
  };

  // Cuando el usuario selecciona un lugar
  const handlePlaceChanged = () => {
    if (!autoComp) return;

    const place = autoComp.getPlace();
    if (!place.geometry || !place.geometry.location) {
      alert(`No hay detalles para: "${place.name}"`);
      setMarkerPos(null);
      setInfo(null);
      return;
    }

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    // Centrar y hacer zoom
    map.panTo(location);
    map.setZoom(17);

    // Mover marcador y abrir InfoWindow
    setMarkerPos(location);
    setInfo({
      position: location,
      content: `<strong>${place.name}</strong><br>${place.formatted_address}`
    });
  };

  return (
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={['places']}  // importante para Autocomplete
    >
      <div style={{ marginBottom: '8px' }}>
        <Autocomplete
          onLoad={handleAutoLoad}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            type="text"
            placeholder="Ingresa una dirección"
            ref={inputRef}
            style={{
              width: '280px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
          />
        </Autocomplete>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={handleMapLoad}
      >
        {/* Marcadores estáticos */}
        {staticLocations.map((loc, idx) => (
          <Marker
            key={idx}
            position={{ lat: loc.lat, lng: loc.lng }}
            title={loc.title}
          />
        ))}

        {/* Marcador dinámico y su InfoWindow */}
        {markerPos && (
          <>
            <Marker position={markerPos} />
            {info && (
              <InfoWindow position={info.position}>
                <div
                  dangerouslySetInnerHTML={{ __html: info.content }}
                />
              </InfoWindow>
            )}
          </>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;
