/**
 * Interactive Leaflet Map Component - Biogestor
 * Coordinates: Masaya, Nicaragua [11.9744, -86.0942]
 * 
 * Features:
 * 1. Public Center View: Esri Satellite + OSM, Radar Marker, Rich Popup (Horarios, Contacto, Materiales, "Cómo llegar")
 * 2. Form Pickup Map: Draggable marker, click-to-place, manual coordinates sync, on-demand geolocation
 */

import { store } from '../../store/store.js';
import { selectCentro, selectCapacidad } from '../../store/selectors.js';

let publicMapInstance = null;
let pickupMapInstance = null;
let pickupMarkerInstance = null;

/**
 * --------------------------------------------------------------------------
 * 1. PUBLIC CENTER MAP
 * --------------------------------------------------------------------------
 */
export function initInteractiveMap(containerId = 'map') {
  const mapElement = document.getElementById(containerId);
  if (!mapElement || typeof L === 'undefined') {
    return null;
  }

  // Clean up existing instance if route was reloaded
  if (publicMapInstance) {
    try {
      publicMapInstance.remove();
    } catch (e) {
      console.warn('Fallo al limpiar instancia previa del mapa público:', e);
    }
    publicMapInstance = null;
  }

  const state = store.getState();
  const centro = selectCentro(state);
  const capacidad = selectCapacidad(state);

  const lat = centro.coordenadas?.lat || 11.9744;
  const lng = centro.coordenadas?.lng || -86.0942;
  const zoom = 14;
  // Offset center southwards so the marker sits in lower third and popup sits completely in view
  const centerLat = lat - 0.0035;

  const map = L.map(containerId, {
    center: [centerLat, lng],
    zoom: zoom,
    zoomControl: true,
    scrollWheelZoom: false
  });

  publicMapInstance = map;

  // 1. High-res Satellite Tile Layer (Esri World Imagery) - Keyless
  const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 18
  });

  // 2. OpenStreetMap Street Tiles - Keyless
  const streetTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  });

  satelliteTiles.addTo(map);

  L.control.layers(
    {
      '🛰️ Satelital en Vivo (Esri)': satelliteTiles,
      '🗺️ Calles y Rutas (OSM)': streetTiles
    },
    null,
    { position: 'topright' }
  ).addTo(map);

  // Custom Radar Pulse Marker with Plant Icon
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

  // Complete popup with Horarios, Contacto, Materiales Aceptados y Cómo Llegar
  const popupContent = `
    <div class="map-popup-card">
      <div class="map-popup-badge">● Planta Piloto Operativa</div>
      <div class="map-popup-title">🌱 ${centro.nombre}</div>
      <div class="map-popup-address">📍 ${centro.direccion}</div>
      
      <div class="map-popup-section">
        <div class="map-popup-label">⏰ Horarios de Atención</div>
        <div class="map-popup-val">
          <div>Lun - Vie: <strong>07:00 am – 04:00 pm</strong></div>
          <div>Sábados: <strong>08:00 am – 12:00 md</strong></div>
        </div>
      </div>

      <div class="map-popup-section">
        <div class="map-popup-label">📞 Contacto Directo</div>
        <div class="map-popup-val">
          <div>Tel: <a href="tel:${centro.telefono}" style="color:#86efac; font-weight:700;">${centro.telefono}</a> · WhatsApp: <strong style="color:#86efac;">+505 8888-2233</strong></div>
          <div style="font-size:0.75rem; color:#cbd5e1;">Email: operaciones@biogestor.local</div>
        </div>
      </div>

      <div class="map-popup-section">
        <div class="map-popup-label">🌿 Materiales Aceptados</div>
        <div class="map-popup-materials">
          <span class="badge-mini badge-green">Restos cocina/mercado</span>
          <span class="badge-mini badge-green">Poda tierna/hojas</span>
          <span class="badge-mini badge-amber">Ramas y leña seca</span>
          <span class="badge-mini badge-amber">Aserrín limpio</span>
        </div>
        <a href="#materiales" class="map-popup-link">Ver catálogo completo y requisitos &rarr;</a>
      </div>

      <div class="map-popup-actions">
        <a class="map-popup-btn map-popup-btn-primary" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener">
          🧭 Cómo llegar
        </a>
        <a class="map-popup-btn map-popup-btn-outline" href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener">
          🗺️ Google Maps
        </a>
      </div>
    </div>
  `;

  marker.bindPopup(popupContent, {
    maxWidth: 340,
    minWidth: 280,
    autoPan: true,
    autoPanPaddingTopLeft: L.point(20, 30),
    autoPanPaddingBottomRight: L.point(20, 20),
    closeButton: true,
    autoClose: false
  });

  marker.on('click', () => {
    map.panTo([lat - 0.0035, lng], { animate: true, duration: 0.35 });
    marker.openPopup();
  });

  // Auto-open on initial view load with centered view
  setTimeout(() => {
    map.invalidateSize();
    map.setView([lat - 0.0035, lng], zoom);
    marker.openPopup();
  }, 250);

  return map;
}

/**
 * --------------------------------------------------------------------------
 * 2. FORM PICKUP MAP (Draggable marker + click-to-place + on-demand GPS)
 * --------------------------------------------------------------------------
 */
export function initPickupMap(containerId = 'mapRecogida', options = {}) {
  const container = document.getElementById(containerId);
  if (!container || typeof L === 'undefined') {
    return null;
  }

  // Destroy previous pickup map if active
  if (pickupMapInstance) {
    try {
      pickupMapInstance.remove();
    } catch (e) {
      console.warn('Error al limpiar mapa previo de recogida:', e);
    }
    pickupMapInstance = null;
    pickupMarkerInstance = null;
  }

  const defaultLat = options.initialLat || 11.9744;
  const defaultLng = options.initialLng || -86.0942;
  const hasInitialCoords = !!options.hasCoords;

  const map = L.map(containerId, {
    center: [defaultLat, defaultLng],
    zoom: hasInitialCoords ? 15 : 13,
    zoomControl: true,
    scrollWheelZoom: false
  });

  pickupMapInstance = map;

  // OpenStreetMap layer for street readability
  const streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  });
  streetLayer.addTo(map);

  // Custom marker for pickup truck location
  const pickupIcon = L.divIcon({
    className: 'pickup-marker-icon',
    html: `
      <div class="pickup-pin-wrapper">
        <div class="pickup-pin">🚛</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18]
  });

  const updateCoordinates = (lat, lng) => {
    const latField = document.getElementById('solLat');
    const lngField = document.getElementById('solLng');
    const badge = document.getElementById('coordsBadge');
    const clearBtn = document.getElementById('btnLimpiarCoords');

    if (latField) latField.value = lat.toFixed(6);
    if (lngField) lngField.value = lng.toFixed(6);

    if (badge) {
      badge.textContent = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      badge.style.color = '#15803d';
      badge.style.background = 'rgba(34, 197, 94, 0.15)';
      badge.style.border = '1px solid rgba(34, 197, 94, 0.4)';
    }

    if (clearBtn) clearBtn.style.display = 'inline-flex';

    if (typeof options.onLocationChange === 'function') {
      options.onLocationChange({ lat, lng });
    }
  };

  const createOrMoveMarker = (lat, lng, shouldPan = true) => {
    if (!pickupMarkerInstance) {
      pickupMarkerInstance = L.marker([lat, lng], {
        icon: pickupIcon,
        draggable: true
      }).addTo(map);

      pickupMarkerInstance.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
      });
    } else {
      pickupMarkerInstance.setLatLng([lat, lng]);
    }

    if (shouldPan) {
      map.panTo([lat, lng]);
    }
    updateCoordinates(lat, lng);
  };

  if (hasInitialCoords) {
    createOrMoveMarker(defaultLat, defaultLng, false);
  }

  // Click on map to place or adjust marker
  map.on('click', (e) => {
    createOrMoveMarker(e.latlng.lat, e.latlng.lng);
  });

  const clearCoords = () => {
    if (pickupMarkerInstance) {
      map.removeLayer(pickupMarkerInstance);
      pickupMarkerInstance = null;
    }
    const latField = document.getElementById('solLat');
    const lngField = document.getElementById('solLng');
    const badge = document.getElementById('coordsBadge');
    const clearBtn = document.getElementById('btnLimpiarCoords');

    if (latField) latField.value = '';
    if (lngField) lngField.value = '';
    if (badge) {
      badge.textContent = 'Sin coordenadas fijadas (opcional)';
      badge.style.color = 'var(--color-text-secondary)';
      badge.style.background = 'var(--color-gray-bg)';
      badge.style.border = '1px solid var(--color-border)';
    }
    if (clearBtn) clearBtn.style.display = 'none';
  };

  const clearBtn = document.getElementById('btnLimpiarCoords');
  if (clearBtn) {
    clearBtn.onclick = (e) => {
      e.preventDefault();
      clearCoords();
    };
  }

  return {
    map,
    setCoordinates: (lat, lng) => createOrMoveMarker(lat, lng),
    clearCoordinates: clearCoords,
    invalidateSize: () => {
      setTimeout(() => map.invalidateSize(), 150);
    }
  };
}
