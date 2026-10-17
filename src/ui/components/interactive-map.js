import { store } from '../../store/store.js';
import { selectCentro, selectCapacidad, selectSolicitudes, selectCatalogoMateriales } from '../../store/selectors.js';
import { icon, escapeHtml as esc } from './icons.js';
import { getCoordinates, classifyMapRequests, filterMapRequests, requestUnit, requestCoordinates } from './map-data.js';

let mapInstance = null;
let resizeObserver = null;
let pickupMapInstance = null;
let pickupMarkerInstance = null;
export function destroyInteractiveMap() {
  pickupMapInstance?.remove();
  pickupMapInstance = null;
  pickupMarkerInstance = null;
  resizeObserver?.disconnect();
  resizeObserver = null;
  mapInstance?.remove();
  mapInstance = null;
}

export function initInteractiveMap(containerId = 'map') {
  destroyInteractiveMap();
  const container = document.getElementById(containerId);
  if (!container) return;
  const state = store.getState();
  const centro = selectCentro(state);
  const capacity = selectCapacidad(state);
  const materials = selectCatalogoMateriales(state);
  const requests = classifyMapRequests(selectSolicitudes(state), materials);
  const list = document.getElementById('map-list');
  const detail = document.getElementById('map-detail');
  const notice = document.getElementById('map-notice');
  const filters = [...document.querySelectorAll('[data-map-filter]')];
  const coordinates = getCoordinates;
  const center = coordinates(centro.coordenadas) || [11.974, -86.094];
  const number = (n) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 1 }).format(Number(n) || 0);
  const status = (value) => esc(String(value || 'Pendiente').replaceAll('_', ' '));
  let activeFilter = 'all';
  let selectedId = null;
  let markers = new Map();
  let markerLayer;
  let centerMarker;
  let connection = null;
  let streets;
  let satellite;
  let isSatellite = false;
  const filtered = () => filterMapRequests(requests, activeFilter);
  const showNotice = (message) => { notice.textContent = message; notice.hidden = false; };

  function showCenter(move = true) {
    selectedId = null;
    if (connection && mapInstance) mapInstance.removeLayer(connection);
    connection = null;
    renderList();
    detail.innerHTML = `<div class="detail-symbol">${icon('sprout')}</div><div class="detail-main"><span class="eyebrow">EL CORAZÓN DEL CICLO</span><h3>Centro comunitario de biomasa</h3><p>${esc(centro.direccion || 'Masaya, Nicaragua')}</p></div><div class="detail-stat"><strong>${number(capacity.recepcion_kg_dia)} <small>kg/día</small></strong><span>capacidad de recepción</span></div><a class="text-link" href="https://www.google.com/maps/dir/?api=1&destination=${center.join(',')}" target="_blank" rel="noopener noreferrer">Cómo llegar ${icon('diagonal')}</a>`;
    if (move && mapInstance) { mapInstance.flyTo(center, 14, { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches }); centerMarker?.openTooltip(); }
  }

  function selectRequest(id, move = true) {
    const request = filtered().find((item) => item.id === id);
    if (!request) return;
    selectedId = request.id;
    renderList();
    const point = requestCoordinates(request);
    detail.innerHTML = `<div class="detail-symbol ${request.kind}">${icon(request.kind === 'dry' ? 'leaf' : 'drop')}</div><div class="detail-main"><span class="eyebrow">${esc(request.codigo)} · ${status(request.estado)}</span><h3>${esc(request.generador?.nombre_establecimiento || 'Aporte de biomasa')}</h3><p>${esc(request.material?.categoria_nombre || 'Material vegetal')} · ${esc(request.entrega?.direccion || 'Dirección por coordinar')}</p></div><div class="detail-stat"><strong>${number(request.cantidad?.estimada_kg)} <small>${requestUnit(request)}</small></strong><span>cantidad estimada</span></div>${point ? `<a class="text-link" href="https://www.google.com/maps/dir/?api=1&destination=${point.join(',')}" target="_blank" rel="noopener noreferrer">Ver ubicación ${icon('diagonal')}</a>` : '<span class="missing-location">Ubicación por coordinar</span>'}`;
    if (connection && mapInstance) mapInstance.removeLayer(connection);
    connection = null;
    if (point && mapInstance) {
      connection = L.polyline([point, center], { color: request.kind === 'dry' ? '#a8743f' : '#31543b', weight: 2, dashArray: '6 8', className: 'biomass-connection', interactive: false }).addTo(mapInstance);
      detail.insertAdjacentHTML('beforeend', '<p class="connection-caption">Conexión ilustrativa · no representa una ruta vial.</p>');
    }
    if (move && point && mapInstance) { mapInstance.flyTo(point, 14, { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches }); markers.get(id)?.openTooltip(); }
  }

  function renderList() {
    const focusedId = document.activeElement?.dataset.requestId;
    const items = filtered();
    document.getElementById('map-count').textContent = items.length;
    list.innerHTML = items.length ? items.map((request) => `<button class="map-request ${selectedId === request.id ? 'is-active' : ''}" data-request-id="${esc(request.id)}" aria-pressed="${selectedId === request.id}"><span class="request-icon ${request.kind}">${icon(request.kind === 'dry' ? 'leaf' : 'drop')}</span><span class="request-copy"><strong>${esc(request.generador?.nombre_establecimiento || 'Aporte de biomasa')}</strong><small>${esc(request.material?.categoria_nombre || 'Material vegetal')}</small><span class="request-status">${status(request.estado)}${!requestCoordinates(request) ? ' · Sin ubicación' : ''}</span></span><span class="request-weight">${number(request.cantidad?.estimada_kg)}<small>${requestUnit(request)} est.</small></span></button>`).join('') : '<div class="map-empty">Todavía no hay aportes de este tipo.<a href="#solicitudes">Registrá el primero ↗</a></div>';
    list.querySelectorAll('[data-request-id]').forEach((button) => button.addEventListener('click', () => selectRequest(button.dataset.requestId)));
    if (focusedId) [...list.querySelectorAll('[data-request-id]')].find((button) => button.dataset.requestId === focusedId)?.focus({ preventScroll: true });
    markers.forEach((marker, id) => marker.getElement()?.classList.toggle('is-selected', id === selectedId));
  }

  function fitPoints() {
    if (!mapInstance) return;
    const points = [center, ...filtered().map((request) => requestCoordinates(request)).filter(Boolean)];
    mapInstance.fitBounds(L.latLngBounds(points), { padding: [55, 55], maxZoom: 14, animate: !matchMedia('(prefers-reduced-motion: reduce)').matches });
  }

  function renderMarkers() {
    if (!mapInstance) return;
    markerLayer.clearLayers();
    markers = new Map();
    filtered().forEach((request) => {
      const point = requestCoordinates(request);
      if (!point) return;
      const marker = L.marker(point, { title: request.generador?.nombre_establecimiento || 'Aporte', icon: L.divIcon({ className: 'earth-map-marker', html: `<span class="map-pin ${request.kind}">${icon(request.kind === 'dry' ? 'leaf' : 'drop')}</span>`, iconSize: [40, 40], iconAnchor: [20, 20] }) }).addTo(markerLayer);
      marker.bindTooltip(esc(request.generador?.nombre_establecimiento || 'Aporte'), { direction: 'top', offset: [0, -20] });
      marker.on('click', () => selectRequest(request.id));
      markers.set(request.id, marker);
    });
    fitPoints();
  }

  filters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.mapFilter;
    selectedId = null;
    filters.forEach((item) => { item.classList.toggle('is-selected', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    renderMarkers();
    showCenter(false);
  }));
  document.getElementById('map-center').addEventListener('click', () => showCenter());
  document.getElementById('map-fit').addEventListener('click', fitPoints);
  renderList();
  showCenter(false);

  if (typeof L === 'undefined') {
    showNotice('El mapa no está disponible. Podés explorar los aportes en la lista y abrir sus ubicaciones.');
    document.getElementById('map-fit').disabled = true;
    document.getElementById('map-layer').disabled = true;
    return;
  }
  mapInstance = L.map(containerId, { center, zoom: 13, scrollWheelZoom: false, zoomControl: false });
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
  streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 });
  satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri, Earthstar Geographics', maxZoom: 18 });
  [streets, satellite].forEach((layer) => {
    layer.on('tileerror', () => showNotice('Algunas imágenes del mapa no cargaron. La lista y las fichas siguen disponibles.'));
    layer.on('loading', () => { notice.hidden = true; });
  });
  streets.addTo(mapInstance);
  markerLayer = L.layerGroup().addTo(mapInstance);
  centerMarker = L.marker(center, { title: 'Centro comunitario de biomasa', icon: L.divIcon({ className: 'earth-map-marker', html: `<span class="map-pin center">${icon('sprout')}</span>`, iconSize: [52, 52], iconAnchor: [26, 26] }) }).addTo(mapInstance);
  centerMarker.bindTooltip('Centro comunitario · Masaya', { direction: 'top', offset: [0, -26] });
  centerMarker.on('click', () => showCenter());
  document.getElementById('map-layer').addEventListener('click', (event) => {
    mapInstance.removeLayer(isSatellite ? satellite : streets);
    isSatellite = !isSatellite;
    (isSatellite ? satellite : streets).addTo(mapInstance);
    event.currentTarget.setAttribute('aria-label', isSatellite ? 'Cambiar a mapa de calles' : 'Cambiar a imagen satelital');
    event.currentTarget.classList.toggle('is-selected', isSatellite);
  });
  renderMarkers();
  resizeObserver = new ResizeObserver(() => mapInstance?.invalidateSize());
  resizeObserver.observe(container);
}

// Pickup location editor integrated from the latest main branch.
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
