/**
 * Solicitudes View - Registro y Listado de Solicitudes de Generadores
 */

import { store } from '../../store/store.js';
import { selectSolicitudes, selectCatalogoMateriales } from '../../store/selectors.js';
import { crearSolicitud } from '../../store/actions.js';

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
          <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-md); color: var(--color-text);">
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

              <div class="form-group">
                <label class="form-label form-label-required" for="solModalidad">Modalidad de Entrega</label>
                <select class="form-select" id="solModalidad" required>
                  <option value="entrega_propia">Entrega propia en el centro</option>
                  <option value="recogida">Solicitar recogida en sitio</option>
                </select>
              </div>

              <div class="form-group" id="solDireccionGroup" style="display: none;">
                <label class="form-label form-label-required" for="solDireccion">Dirección de recogida</label>
                <input class="form-control" type="text" id="solDireccion" placeholder="Dirección exacta para camión">
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
                        <td><strong>${s.codigo}</strong></td>
                        <td>
                          ${s.generador?.nombre_establecimiento || 'N/A'}<br>
                          <small style="color:var(--color-text-secondary);">${s.generador?.nombre_contacto || ''}</small>
                        </td>
                        <td>${s.material?.categoria_nombre || 'Material'}</td>
                        <td>${s.cantidad?.estimada_kg || 0} ${s.cantidad?.unidad_estimada || 'kg'}</td>
                        <td>${s.entrega?.modalidad === 'recogida' ? '🚛 Recogida' : '🚚 Entrega Propia'}</td>
                        <td>
                          <span class="badge ${getStatusBadge(s.estado)}">
                            ${s.estado.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
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

  if (toggleBtn && formCard) {
    toggleBtn.addEventListener('click', () => {
      formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
      if (formCard.style.display === 'block') {
        document.getElementById('solEstablecimiento')?.focus();
      }
    });
  }

  if (cancelBtn && formCard) {
    cancelBtn.addEventListener('click', () => {
      formCard.style.display = 'none';
    });
  }

  if (modalidadSelect && direccionGroup) {
    modalidadSelect.addEventListener('change', () => {
      const isRecogida = modalidadSelect.value === 'recogida';
      direccionGroup.style.display = isRecogida ? 'flex' : 'none';
      const dirInput = document.getElementById('solDireccion');
      if (dirInput) dirInput.required = isRecogida;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertContainer.innerHTML = '';

      const matSelect = document.getElementById('solMaterial');
      const selectedOption = matSelect.options[matSelect.selectedIndex];

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
          direccion: document.getElementById('solDireccion')?.value.trim() || ''
        }
      };

      const result = crearSolicitud(payload);
      if (result.success) {
        form.reset();
        formCard.style.display = 'none';
      } else {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <strong>Errores al registrar la solicitud:</strong>
            <ul style="margin-top: 0.4rem; padding-left: 1.2rem; list-style: disc;">
              ${result.errors.map((err) => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    });
  }
}
