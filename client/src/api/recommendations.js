// src/api/recommendations.js

/**
 * Obtiene recomendaciones de lugares accesibles según el tipo de discapacidad.
 * @param {string} disabilityType - Tipo de discapacidad del usuario.
 * @returns {Promise<Array>} - Promesa que resuelve con un arreglo de lugares recomendados.
 */
export async function fetchRecommendations(disabilityType) {
  const url = `/api/recommendations?disability=${encodeURIComponent(disabilityType)}`;
  const response = await fetch(url, {
    credentials: 'include', // incluye cookies para sesiones autenticadas
  });

  if (!response.ok) {
    throw new Error(`Error al cargar recomendaciones: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
