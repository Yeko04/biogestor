/**
 * Interactive Leaflet Map Component - Biogestor
 * Coordinates: Masaya, Nicaragua [11.9744, -86.0942]
 * Features: Dark Matter tiles + Satellite layer, Custom Radar Pulse Marker, Glassmorphism Popup
 */

import { store } from '../../store/store.js';
import { selectCentro, selectCapacidad } from '../../store/selectors.js';

let mapInstance = null;

export function initInteractiveMap(containerId = 'map') {
  const mapElement = document.getElementById(containerId);
  if (!mapElement) {
    return;
  }

  // Ensure Leaflet global is loaded
  if (typeof L === 'undefined') {
    console.warn('Leaflet no está cargado aún en window.L');
    return;
  }

  // Destroy previous instance if re-entering view in SPA router
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (e) {
      console.warn('Fallo al limpiar instancia previa del mapa:', e);
    }
    mapInstance = null;
  }

  const state = store.getState();
  const centro = selectCentro(state);
  const capacidad = selectCapacidad(state);

  const lat = centro.coordenadas?.lat || 11.9744;
  const lng = centro.coordenadas?.lng || -86.0942;
  const zoom = 14;

  // Initialize Map with dark background default
  const map = L.map(containerId, {
    center: [lat, lng],
    zoom: zoom,
    zoomControl: true,
    scrollWheelZoom: false // prevents accidental scroll capture
  });

  mapInstance = map;

  // 1. High-res Satellite Tile Layer (Esri World Imagery) - Free, no API key required
  const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 18
  });

  // 2. OpenStreetMap Street Tiles - Free, no API key required
  const streetTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });

  // Add Satellite tiles as default (fits biomass & nature context perfectly)
  satelliteTiles.addTo(map);

  // Add Layer Switcher Control
  L.control.layers(
    {
      '🛰️ Satelital en Vivo (Esri)': satelliteTiles,
      '🗺️ Calles y Rutas (OSM)': streetTiles
    },
    null,
    { position: 'topright' }
  ).addTo(map);

  // 3. Custom Radar Pulse Marker with Plant Icon
  const radarIcon = L.divIcon({
    className: 'custom-radar-marker',
    html: `
      <div class="radar-marker-container">
        <div class="radar-wave"></div>
        <div class="radar-wave radar-wave-delay"></div>
        <div class="radar-pin" title="${centro.nombre}">🌱</div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -22]
  });

  const marker = L.marker([lat, lng], { icon: radarIcon }).addTo(map);

  // 4. Glassmorphism Popup content
  const popupContent = `
    <div class="map-popup-card">
      <div class="map-popup-title">🌱 ${centro.nombre}</div>
      <div class="map-popup-detail">📍 ${centro.direccion}</div>
      <div class="map-popup-detail">📞 Tel: <strong>${centro.telefono}</strong></div>
      <div class="map-popup-detail">⚖️ Capacidad diaria: <strong>${capacidad.recepcion_kg_dia} kg/día</strong></div>
      <div class="map-popup-detail">📦 Almacenamiento: <strong>${capacidad.almacenamiento_kg} kg</strong></div>
      <div class="map-popup-actions">
        <a class="map-popup-btn" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener">
          🧭 Cómo llegar
        </a>
        <a class="map-popup-btn map-popup-btn-outline" href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener">
          🗺️ Google Maps
        </a>
      </div>
    </div>
  `;

  marker.bindPopup(popupContent, {
    maxWidth: 320,
    closeButton: true,
    autoClose: false
  });

  // Open popup on hover or click
  marker.on('mouseover', () => {
    marker.openPopup();
  });

  // Auto-open on initial load after smooth pan
  setTimeout(() => {
    map.invalidateSize();
    marker.openPopup();
  }, 250);
}
