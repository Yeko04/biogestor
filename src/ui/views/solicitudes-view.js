/**
 * Solicitudes View - Registro y Listado de Solicitudes de Generadores
 * Con mapa interactivo de punto de recogida, geolocalización bajo demanda y dirección escrita libre.
 */

import { store } from '../../store/store.js';
import { selectSolicitudes, selectCatalogoMateriales } from '../../store/selectors.js';
import { crearSolicitud, actualizarSolicitud } from '../../store/actions.js';
import { initPickupMap } from '../components/interactive-map.js';
import { showToast } from '../components/toast.js';

export function renderSolicitudesView() {
  const state = store.getState();
  const solicitudes = selectSolicitudes(state);
  const materiales = selectCatalogoMateriales(state);

  return `
    <section class="section" id="solicitudes-view">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h1 class="section-title" style="margin-bottom:0;">Aportes de la comunidad.</h1>
            <p class="view-subtitle">Cada resto tiene una nueva posibilidad. Registrá tu material y coordiná su aprovechamiento.</p>
          </div>
          <button class="btn btn-primary" id="btnToggleSolForm">
            + Registrar un aporte
          </button>
        </div>

        <div id="solicitudFormCard" class="form-card" style="display: none;">
          <h2 id="solFormTitle" style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-md); color: var(--color-text);">
            Registrar Biomasa Disponible
          </h2>
          <div id="solFormAlert"></div>

          <form id="formNuevaSolicitud">
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label form-label-required" for="solEstablecimiento">Establecimiento / Procedencia</label>
                <input class="form-control" type="text" id="solEstablecimiento" required placeholder="Ej. Mercado Central, Parque Las Flores">
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="solTipoGenerador">Tipo de Generador</label>
                <select class="form-select" id="solTipoGenerador" required>
                  <option value="mercados">Mercados</option>
                  <option value="parques">Parques y Áreas Verdes</option>
                  <option value="restaurantes">Restaurantes</option>
                  <option value="instituciones">Instituciones</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="solContacto">Persona de Contacto</label>
                <input class="form-control" type="text" id="solContacto" placeholder="Nombre completo">
              </div>

              <div class="form-group">
                <label class="form-label" for="solTelefono">Teléfono</label>
                <input class="form-control" type="tel" id="solTelefono" placeholder="+505-0000-0000">
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="solMaterial">Categoría de Material</label>
                <select class="form-select" id="solMaterial" required>
                  ${materiales.map((m) => `<option value="${m.id}" data-nombre="${m.nombre}">${m.nombre}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="solCantidadEstimada">Cantidad Estimada</label>
                <div style="display: flex; gap: var(--space-xs);">
                  <input class="form-control" type="number" id="solCantidadEstimada" min="1" step="0.5" required placeholder="0.0">
                  <select class="form-select" id="solUnidad" style="width: 100px;">
                    <option value="kg">kg</option>
                    <option value="m3">m³</option>
                  </select>
                </div>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label form-label-required" for="solModalidad">Modalidad de Entrega</label>
                <select class="form-select" id="solModalidad" required>
                  <option value="entrega_propia">Entrega propia en el centro</option>
                  <option value="recogida">Solicitar recogida en sitio</option>
                </select>
              </div>

              <div class="form-group form-group-full" id="solDireccionGroup" style="display: none;">
                <label class="form-label form-label-required" for="solDireccion">Dirección escrita / Referencia de recogida</label>
                <textarea class="form-textarea" id="solDireccion" rows="2" placeholder="Ej: Del Mercado Central 2 cuadras al norte, frente al portón azul. Apto para camión."></textarea>
                <small class="form-help">Puedes ingresar tu dirección escrita libremente sin interactuar con el mapa.</small>

                <!-- Mapa interactivo opcional para fijar y ajustar punto de recogida -->
                <div style="margin-top: var(--space-sm); background: var(--color-gray-bg); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <div>
                      <span style="font-weight: 700; font-size: 0.95rem; color: var(--color-text);">Punto Georreferenciado en el Mapa</span>
                      <span style="font-size: 0.8rem; color: var(--color-text-secondary); margin-left: 0.3rem;">(Opcional)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <span id="coordsBadge" style="font-size: 0.8rem; color: var(--color-text-secondary); background: var(--color-surface); padding: 0.2rem 0.6rem; border-radius: 999px; border: 1px solid var(--color-border);">
                        Sin coordenadas fijadas (opcional)
                      </span>
                      <button type="button" class="btn btn-outline" id="btnLimpiarCoords" style="display: none; padding: 0.2rem 0.5rem; font-size: 0.75rem; color: var(--color-danger); border-color: rgba(220, 38, 38, 0.3);">
                        ✕ Quitar punto
                      </button>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                    <button type="button" class="btn btn-outline" id="btnGeolocalizarPunto" style="padding: 0.35rem 0.8rem; font-size: 0.84rem; background: var(--color-surface);">
                      📍 Usar mi ubicación actual (GPS)
                    </button>
                    <small class="form-help" style="margin: 0;">Opcional: solo se solicita al presionar este botón.</small>
                  </div>

                  <div id="mapRecogida"></div>
                  <small class="form-help" style="margin-top: 0.4rem; display: block;">
                    Haz clic en el mapa para colocar el marcador o arrástralo para ajustar la posición exacta de recogida.
                  </small>

                  <input type="hidden" id="solLat" value="">
                  <input type="hidden" id="solLng" value="">
                </div>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="solDescripcion">Descripción adicional del material</label>
                <textarea class="form-textarea" id="solDescripcion" rows="2" placeholder="Detalles de humedad, ramas, hojas, empaque..."></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Registrar Solicitud</button>
              <button type="button" class="btn btn-outline" id="btnCancelSolForm">Cancelar</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Listado de Solicitudes (${solicitudes.length})</h3>
          </div>
          
          ${
            solicitudes.length === 0
              ? `<div class="empty-state">
                  <div class="empty-state-icon">📋</div>
                  <p>No hay solicitudes registradas aún.</p>
                </div>`
              : `
              <div class="table-wrap" data-responsive="table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Generador</th>
                      <th>Material</th>
                      <th>Cant. Estimada</th>
                      <th>Modalidad</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${solicitudes.map((s) => `
                      <tr>
                        <td data-label="Código"><strong>${s.codigo}</strong></td>
                        <td data-label="Generador">
                          ${s.generador?.nombre_establecimiento || 'N/A'}<br>
                          <small style="color:var(--color-text-secondary);">${s.generador?.nombre_contacto || ''}</small>
                        </td>
                        <td data-label="Material">${s.material?.categoria_nombre || 'Material'}</td>
                        <td data-label="Cant. Estimada">${s.cantidad?.estimada_kg || 0} ${s.cantidad?.unidad_estimada || 'kg'}</td>
                        <td data-label="Modalidad">
                          <div>${s.entrega?.modalidad === 'recogida' ? 'Recogida en sitio' : 'Entrega Propia'}</div>
                          ${s.entrega?.direccion ? `<div style="font-size:0.8rem; color:var(--color-text-secondary); max-width:200px; margin-top:0.2rem; line-height:1.3;">${s.entrega.direccion}</div>` : ''}
                          ${(s.entrega?.coordenadas?.lat && s.entrega?.coordenadas?.lng && s.entrega.coordenadas.lat !== 0)
                            ? `<a href="https://www.google.com/maps/search/?api=1&query=${s.entrega.coordenadas.lat},${s.entrega.coordenadas.lng}" target="_blank" rel="noopener" class="badge badge-info" style="margin-top:0.35rem; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;" title="Ver coordenadas exactas en Google Maps">
                                📍 Mapa (${s.entrega.coordenadas.lat.toFixed(3)}, ${s.entrega.coordenadas.lng.toFixed(3)})
                              </a>`
                            : ''}
                        </td>
                        <td data-label="Estado">
                          <span class="badge ${getStatusBadge(s.estado)}">
                            ${s.estado.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td data-label="Acción">
                          <button type="button" class="btn btn-outline" style="padding: 0.35rem 0.8rem; font-size: 0.82rem; margin-right: 0.35rem;" data-editar-solicitud="${s.id}">
                            Editar
                          </button>
                          ${
                            s.estado !== 'recibida'
                              ? `<a class="btn btn-outline" style="padding: 0.35rem 0.8rem; font-size: 0.82rem;" href="#recepcion" onclick="window.__prefillSolicitudId='${s.id}'">
                                  Triaje / Recibir →
                                </a>`
                              : `<span style="font-size: 0.85rem; color: var(--color-primary); font-weight: 600;">✓ Recibida (${s.recepcion_id || ''})</span>`
                          }
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `
          }
        </div>
      </div>
    </section>
  `;
}

function getStatusBadge(estado) {
  switch (estado) {
    case 'recibida':
    case 'aceptada_y_programada':
      return 'badge-success';
    case 'en_revision':
    case 'enviada':
      return 'badge-info';
    case 'requiere_informacion':
      return 'badge-warning';
    case 'rechazada':
    case 'cancelada':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
}

export function attachSolicitudesEvents() {
  const toggleBtn = document.getElementById('btnToggleSolForm');
  const cancelBtn = document.getElementById('btnCancelSolForm');
  const formCard = document.getElementById('solicitudFormCard');
  const form = document.getElementById('formNuevaSolicitud');
  const modalidadSelect = document.getElementById('solModalidad');
  const direccionGroup = document.getElementById('solDireccionGroup');
  const alertContainer = document.getElementById('solFormAlert');
  const formTitle = document.getElementById('solFormTitle');
  const submitBtn = form?.querySelector('[type="submit"]');
  const geoBtn = document.getElementById('btnGeolocalizarPunto');
  let solicitudEditandoId = null;
  let pickupMapController = null;

  const ensurePickupMap = (lat = null, lng = null) => {
    const isRecogida = modalidadSelect?.value === 'recogida';
    if (!isRecogida) return;

    const hasCoords = lat !== null && lng !== null && lat !== 0 && !isNaN(lat);
    setTimeout(() => {
      if (!pickupMapController) {
        pickupMapController = initPickupMap('mapRecogida', {
          initialLat: hasCoords ? Number(lat) : 11.9744,
          initialLng: hasCoords ? Number(lng) : -86.0942,
          hasCoords
        });
      } else {
        pickupMapController.invalidateSize();
        if (hasCoords) {
          pickupMapController.setCoordinates(Number(lat), Number(lng));
        }
      }
    }, 60);
  };

  const resetFormMode = () => {
    solicitudEditandoId = null;
    form?.reset();
    formCard.style.display = 'none';
    formTitle.textContent = 'Registrar Biomasa Disponible';
    submitBtn.textContent = 'Registrar Solicitud';
    direccionGroup.style.display = 'none';
    if (pickupMapController) {
      pickupMapController.clearCoordinates();
    }
  };

  if (toggleBtn && formCard) {
    toggleBtn.addEventListener('click', () => {
      formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
      if (formCard.style.display === 'block') {
        document.getElementById('solEstablecimiento')?.focus();
        if (modalidadSelect?.value === 'recogida') {
          ensurePickupMap();
        }
      }
    });
  }

  if (cancelBtn && formCard) {
    cancelBtn.addEventListener('click', () => {
      resetFormMode();
    });
  }

  // Edit existing solicitud
  document.querySelectorAll('[data-editar-solicitud]').forEach((button) => {
    button.addEventListener('click', () => {
      const solicitud = selectSolicitudes(store.getState()).find((item) => item.id === button.dataset.editarSolicitud);
      if (!solicitud) return;

      solicitudEditandoId = solicitud.id;
      formTitle.textContent = `Editar Solicitud ${solicitud.codigo}`;
      submitBtn.textContent = 'Guardar Cambios';
      formCard.style.display = 'block';

      document.getElementById('solEstablecimiento').value = solicitud.generador?.nombre_establecimiento || '';
      document.getElementById('solTipoGenerador').value = solicitud.generador?.tipo_generador || 'otros';
      document.getElementById('solContacto').value = solicitud.generador?.nombre_contacto || '';
      document.getElementById('solTelefono').value = solicitud.generador?.telefono || '';
      document.getElementById('solMaterial').value = solicitud.material?.categoria_id || '';
      document.getElementById('solCantidadEstimada').value = solicitud.cantidad?.estimada_kg ?? '';
      document.getElementById('solUnidad').value = solicitud.cantidad?.unidad_estimada || 'kg';
      modalidadSelect.value = solicitud.entrega?.modalidad || 'entrega_propia';
      document.getElementById('solDireccion').value = solicitud.entrega?.direccion || '';
      document.getElementById('solDescripcion').value = solicitud.material?.descripcion || '';

      const isRecogida = modalidadSelect.value === 'recogida';
      direccionGroup.style.display = isRecogida ? 'block' : 'none';
      document.getElementById('solDireccion').required = isRecogida;

      const coords = solicitud.entrega?.coordenadas;
      if (coords?.lat && coords?.lng && coords.lat !== 0) {
        document.getElementById('solLat').value = coords.lat;
        document.getElementById('solLng').value = coords.lng;
        if (isRecogida) {
          ensurePickupMap(coords.lat, coords.lng);
        }
      } else {
        document.getElementById('solLat').value = '';
        document.getElementById('solLng').value = '';
        if (isRecogida) {
          ensurePickupMap();
        }
      }

      alertContainer.innerHTML = '';
      formTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  if (modalidadSelect && direccionGroup) {
    modalidadSelect.addEventListener('change', () => {
      const isRecogida = modalidadSelect.value === 'recogida';
      direccionGroup.style.display = isRecogida ? 'block' : 'none';
      const dirInput = document.getElementById('solDireccion');
      if (dirInput) dirInput.required = isRecogida;

      if (isRecogida) {
        const curLat = document.getElementById('solLat')?.value;
        const curLng = document.getElementById('solLng')?.value;
        ensurePickupMap(curLat ? Number(curLat) : null, curLng ? Number(curLng) : null);
      }
    });
  }

  // On-demand Geolocation Button (Never automatic)
  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast({
          title: 'Geolocalización',
          message: 'Tu navegador no cuenta con soporte de geolocalización satelital.',
          type: 'warning'
        });
        return;
      }

      const originalHtml = geoBtn.innerHTML;
      geoBtn.innerHTML = '⌛ Obteniendo señal GPS...';
      geoBtn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          geoBtn.innerHTML = originalHtml;
          geoBtn.disabled = false;
          const { latitude, longitude } = position.coords;

          if (pickupMapController) {
            pickupMapController.setCoordinates(latitude, longitude);
            pickupMapController.map.setView([latitude, longitude], 16);
          } else {
            ensurePickupMap(latitude, longitude);
          }

          showToast({
            title: 'Ubicación GPS Detectada',
            message: `Punto fijado: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            type: 'success'
          });
        },
        (error) => {
          geoBtn.innerHTML = originalHtml;
          geoBtn.disabled = false;
          console.warn('Geolocation error:', error);
          let msg = 'No se pudo obtener la señal GPS.';
          if (error.code === 1) {
            msg = 'Permiso denegado. Puedes colocar el marcador en el mapa o solo escribir tu dirección.';
          } else if (error.code === 2) {
            msg = 'Señal GPS no disponible. Puedes colocar el marcador manualmente.';
          }
          showToast({
            title: 'Ubicación Manual',
            message: msg,
            type: 'info'
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  // Submit Handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertContainer.innerHTML = '';

      const matSelect = document.getElementById('solMaterial');
      const selectedOption = matSelect.options[matSelect.selectedIndex];
      const latVal = document.getElementById('solLat')?.value;
      const lngVal = document.getElementById('solLng')?.value;

      const payload = {
        generador: {
          nombre_establecimiento: document.getElementById('solEstablecimiento').value.trim(),
          tipo_generador: document.getElementById('solTipoGenerador').value,
          nombre_contacto: document.getElementById('solContacto').value.trim(),
          telefono: document.getElementById('solTelefono').value.trim()
        },
        material: {
          categoria_id: matSelect.value,
          categoria_nombre: selectedOption?.dataset?.nombre || selectedOption?.text || 'Material',
          descripcion: document.getElementById('solDescripcion').value.trim()
        },
        cantidad: {
          estimada_kg: Number(document.getElementById('solCantidadEstimada').value),
          unidad_estimada: document.getElementById('solUnidad').value
        },
        entrega: {
          modalidad: modalidadSelect.value,
          recogida_habilitada: modalidadSelect.value === 'recogida',
          direccion: document.getElementById('solDireccion')?.value.trim() || '',
          coordenadas: (latVal && lngVal && !isNaN(latVal) && !isNaN(lngVal))
            ? { lat: Number(latVal), lng: Number(lngVal) }
            : { lat: 0, lng: 0 }
        }
      };

      const result = solicitudEditandoId
        ? actualizarSolicitud(solicitudEditandoId, payload)
        : crearSolicitud(payload);

      if (result.success) {
        resetFormMode();
      } else {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <strong>Errores al procesar la solicitud:</strong>
            <ul style="margin-top: 0.4rem; padding-left: 1.2rem; list-style: disc;">
              ${result.errors.map((err) => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    });
  }
}
