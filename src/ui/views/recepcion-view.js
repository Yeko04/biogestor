/**
 * Recepcion View - Registro de Triaje y Recepción de Biomasa
 * Conforme con las reglas de negocio (Trazabilidad, No asignación automática, Justificación de rechazo)
 */

import { store } from '../../store/store.js';
import { selectRecepciones, selectSolicitudes, selectCapacidad, selectAvailableProcesses } from '../../store/selectors.js';
import { registrarRecepcion, actualizarRecepcion } from '../../store/actions.js';
import { MOTIVOS_RECHAZO, TIPO_BIOMASA, TAMANO, HUMEDAD, CONTAMINACION, MEDIDA_TIPO } from '../../logic/constants.js';

export function renderRecepcionView() {
  const state = store.getState();
  const recepciones = selectRecepciones(state);
  const solicitudes = selectSolicitudes(state);
  const capacidad = selectCapacidad(state);
  const procesos = selectAvailableProcesses(state);

  const solicitudesDisponibles = solicitudes.filter((s) => s.estado !== 'recibida' && s.estado !== 'cancelada');

  return `
    <section class="section" id="recepcion-view">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h1 class="section-title" style="margin-bottom:0;">Cada aporte, bien recibido.</h1>
            <p class="view-subtitle">Pesá, revisá y clasificá el material. Acá empieza su siguiente vida.</p>
          </div>
          ${
            !capacidad.recepciones_pausadas
              ? `<button class="btn btn-primary" id="btnToggleRecForm">+ Registrar Entrada</button>`
              : `<span class="badge badge-warning">Recepciones Pausadas</span>`
          }
        </div>

        ${
          capacidad.recepciones_pausadas
            ? `<div class="alert alert-warning">
                <strong>⚠️ Recepciones en pausa:</strong> El centro no está admitiendo nuevas entradas en este momento. Motivo: ${capacidad.motivo_pausa || 'No especificado'}.
              </div>`
            : ''
        }

        <div id="recFormCard" class="form-card" style="display: none;">
          <h2 id="recFormTitle" style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-md); color: var(--color-text);">
            Nuevo Registro de Triaje en Balanza
          </h2>
          <div id="recFormAlert"></div>

          <form id="formNuevaRecepcion">
            <div class="form-grid form-grid-2">
              <div class="form-group form-group-full">
                <label class="form-label form-label-required" for="recSolicitudId">Solicitud de Origen (Trazabilidad)</label>
                <select class="form-select" id="recSolicitudId" required>
                  <option value="">-- Seleccionar solicitud activa --</option>
                  ${solicitudesDisponibles.map((s) => `
                    <option value="${s.id}" data-estimada="${s.cantidad?.estimada_kg || 0}" data-mat="${s.material?.categoria_nombre || ''}">
                      ${s.codigo} - ${s.generador?.nombre_establecimiento} (${s.material?.categoria_nombre} ~ ${s.cantidad?.estimada_kg} ${s.cantidad?.unidad_estimada})
                    </option>
                  `).join('')}
                </select>
                <small class="form-help">Cada recepción debe estar vinculada obligatoriamente a una solicitud de origen.</small>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="recCantidadRecibida">Cantidad Recibida Bruta (kg)</label>
                <input class="form-control" type="number" id="recCantidadRecibida" min="0.1" step="0.1" required placeholder="0.0">
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="recMedidaTipo">Tipo de Medición</label>
                <select class="form-select" id="recMedidaTipo" required>
                  <option value="${MEDIDA_TIPO.PESADA}">Pesada en báscula / balanza</option>
                  <option value="${MEDIDA_TIPO.ESTIMADA}">Estimada volumétrica</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="recCantidadAceptada">Cantidad Neta Aceptada (kg)</label>
                <input class="form-control" type="number" id="recCantidadAceptada" min="0" step="0.1" required placeholder="0.0">
              </div>

              <div class="form-group">
                <label class="form-label" for="recCantidadRechazada">Cantidad Rechazada / Descarte (kg)</label>
                <input class="form-control" type="number" id="recCantidadRechazada" min="0" step="0.1" value="0" placeholder="0.0">
              </div>

              <!-- Sección de rechazo condicional -->
              <div class="form-group form-group-full" id="recRechazoSection" style="display: none; background: var(--color-warn-bg); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid rgba(245,158,11,0.3);">
                <label class="form-label form-label-required" style="color: #92400e;">Justificación obligatoria del rechazo</label>
                <p style="font-size: 0.88rem; color: #92400e; margin-bottom: var(--space-xs);">
                  Si hay descarte &gt; 0 kg, debe indicar al menos un motivo justificado para trazabilidad ambiental.
                </p>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" name="motivosRechazo" value="${MOTIVOS_RECHAZO.PLASTICO}"> Plástico
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="motivosRechazo" value="${MOTIVOS_RECHAZO.ALAMBRE}"> Alambre / Metal
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="motivosRechazo" value="${MOTIVOS_RECHAZO.PIEDRAS_TIERRA}"> Piedras / Tierra excesiva
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="motivosRechazo" value="${MOTIVOS_RECHAZO.BOLSA_ENVASE}"> Bolsas o envases
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="motivosRechazo" id="chkRechazoOtro" value="${MOTIVOS_RECHAZO.OTRO}"> Otro motivo
                  </label>
                </div>
                <div id="recMotivoOtroGroup" style="display: none; margin-top: var(--space-xs);">
                  <input class="form-control" type="text" id="recMotivoOtro" placeholder="Especifique el otro motivo de rechazo...">
                </div>
              </div>

              <!-- Clasificación física -->
              <div class="form-group">
                <label class="form-label form-label-required" for="recTipoBiomasa">Tipo de Biomasa (Triaje)</label>
                <select class="form-select" id="recTipoBiomasa" required>
                  <option value="${TIPO_BIOMASA.BLANDA}">Blanda / Húmeda (Hojas, mercado, pulpas)</option>
                  <option value="${TIPO_BIOMASA.DURA}">Dura / Seca (Poda leñosa, ramas)</option>
                  <option value="${TIPO_BIOMASA.MEZCLA}">Mezcla sin triaje (Solo para pruebas)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="recTamano">Tamaño predominante</label>
                <select class="form-select" id="recTamano" required>
                  <option value="${TAMANO.FINO}">Fino (&lt; 2 cm)</option>
                  <option value="${TAMANO.MEDIANO}">Mediano (2 a 10 cm)</option>
                  <option value="${TAMANO.GRUESO}">Grueso (&gt; 10 cm / leña)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="recHumedad">Nivel de Humedad</label>
                <select class="form-select" id="recHumedad" required>
                  <option value="${HUMEDAD.BAJA}">Baja (&lt; 20% - Seco al tacto)</option>
                  <option value="${HUMEDAD.MEDIA}">Media (20% - 60%)</option>
                  <option value="${HUMEDAD.ALTA}">Alta (&gt; 60% - Saturado / exudante)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="recContaminacion">Nivel de Contaminación</label>
                <select class="form-select" id="recContaminacion" required>
                  <option value="${CONTAMINACION.NINGUNA}">Ninguna (100% limpio)</option>
                  <option value="${CONTAMINACION.LEVE}">Leve (Retirable manualmente)</option>
                  <option value="${CONTAMINACION.MODERADA}">Moderada</option>
                  <option value="${CONTAMINACION.ALTA}">Alta (No apto para digestión)</option>
                </select>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label form-label-required" for="recProcesoManual">
                  Proceso Asignado Manualmente
                </label>
                <select class="form-select" id="recProcesoManual" required>
                  ${procesos.map((p) => `<option value="${p.id}">${p.nombre} (${p.clave})</option>`).join('')}
                </select>
                <small class="form-help">Regla de negocio: El proceso NUNCA se asigna automáticamente; la decisión es del operador.</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Guardar Recepción y Triaje</button>
              <button type="button" class="btn btn-outline" id="btnCancelRecForm">Cancelar</button>
            </div>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recepciones Registradas (${recepciones.length})</h3>
          </div>

          ${
            recepciones.length === 0
              ? `<div class="empty-state">
                  <div class="empty-state-icon">⚖️</div>
                  <p>No se han registrado recepciones de biomasa todavía.</p>
                </div>`
              : `
              <div class="table-wrap" data-responsive="table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Fecha</th>
                      <th>Recibido (kg)</th>
                      <th>Aceptado (kg)</th>
                      <th>Rechazo (kg)</th>
                      <th>Clasificación</th>
                      <th>Lote Asociado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recepciones.map((r) => `
                      <tr>
                        <td><strong>${r.codigo}</strong></td>
                        <td>${new Date(r.fecha_recepcion).toLocaleDateString()}</td>
                        <td>${r.cantidad?.recibida_kg || 0} kg</td>
                        <td><span style="color: #15803d; font-weight: 600;">${r.cantidad?.aceptada_kg || 0} kg</span></td>
                        <td>
                          ${
                            (r.cantidad?.rechazada_kg || 0) > 0
                              ? `<span class="badge badge-danger">${r.cantidad?.rechazada_kg} kg</span>`
                              : `<span style="color: var(--color-text-secondary);">0 kg</span>`
                          }
                        </td>
                        <td>
                          <span class="badge ${r.clasificacion?.tipo_biomasa === 'dura' ? 'badge-warning' : 'badge-info'}">
                            ${r.clasificacion?.tipo_biomasa}
                          </span>
                        </td>
                        <td>
                          ${
                            r.lote_id
                              ? `<span class="badge badge-success">Asignado a Lote</span>`
                              : `<a class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" href="#lotes">
                                  Crear Lote →
                                </a>`
                          }
                        </td>
                        <td>
                          <button type="button" class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" data-editar-recepcion="${r.id}">
                            Editar
                          </button>
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

export function attachRecepcionEvents() {
  const toggleBtn = document.getElementById('btnToggleRecForm');
  const cancelBtn = document.getElementById('btnCancelRecForm');
  const formCard = document.getElementById('recFormCard');
  const form = document.getElementById('formNuevaRecepcion');
  const alertContainer = document.getElementById('recFormAlert');
  const rechazadaInput = document.getElementById('recCantidadRechazada');
  const rechazoSection = document.getElementById('recRechazoSection');
  const chkOtro = document.getElementById('chkRechazoOtro');
  const otroGroup = document.getElementById('recMotivoOtroGroup');
  const recibidaInput = document.getElementById('recCantidadRecibida');
  const aceptadaInput = document.getElementById('recCantidadAceptada');
  const solicitudSelect = document.getElementById('recSolicitudId');
  const formTitle = document.getElementById('recFormTitle');
  const submitBtn = form?.querySelector('[type="submit"]');
  let recepcionEditandoId = null;

  const resetFormMode = () => {
    recepcionEditandoId = null;
    form?.reset();
    formCard.style.display = 'none';
    formTitle.textContent = 'Nuevo Registro de Triaje en Balanza';
    submitBtn.textContent = 'Guardar Recepción y Triaje';
    solicitudSelect.disabled = false;
    solicitudSelect.querySelector('[data-edit-option]')?.remove();
    aceptadaInput.dataset.manual = '';
    rechazoSection.style.display = 'none';
    otroGroup.style.display = 'none';
    alertContainer.innerHTML = '';
  };

  if (window.__prefillSolicitudId && solicitudSelect) {
    solicitudSelect.value = window.__prefillSolicitudId;
    window.__prefillSolicitudId = null;
    if (formCard) formCard.style.display = 'block';
  }

  if (toggleBtn && formCard) {
    toggleBtn.addEventListener('click', () => {
      formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
      if (formCard.style.display === 'block') {
        solicitudSelect?.focus();
      }
    });
  }

  if (cancelBtn && formCard) {
    cancelBtn.addEventListener('click', () => {
      resetFormMode();
    });
  }

  document.querySelectorAll('[data-editar-recepcion]').forEach((button) => {
    button.addEventListener('click', () => {
      const recepcion = selectRecepciones(store.getState()).find((item) => item.id === button.dataset.editarRecepcion);
      if (!recepcion) return;

      recepcionEditandoId = recepcion.id;
      const solicitud = selectSolicitudes(store.getState()).find((item) => item.id === recepcion.solicitud_id);
      if (solicitud && !Array.from(solicitudSelect.options).some((option) => option.value === solicitud.id)) {
        const option = document.createElement('option');
        option.value = solicitud.id;
        option.textContent = `${solicitud.codigo} - ${solicitud.generador?.nombre_establecimiento || 'Solicitud recibida'}`;
        option.dataset.editOption = 'true';
        solicitudSelect.append(option);
      }
      solicitudSelect.value = recepcion.solicitud_id;
      solicitudSelect.disabled = true;
      document.getElementById('recCantidadRecibida').value = recepcion.cantidad?.recibida_kg ?? 0;
      document.getElementById('recCantidadAceptada').value = recepcion.cantidad?.aceptada_kg ?? 0;
      document.getElementById('recCantidadRechazada').value = recepcion.cantidad?.rechazada_kg ?? 0;
      document.getElementById('recMedidaTipo').value = recepcion.cantidad?.medida_tipo || MEDIDA_TIPO.PESADA;
      document.getElementById('recTipoBiomasa').value = recepcion.clasificacion?.tipo_biomasa || TIPO_BIOMASA.BLANDA;
      document.getElementById('recTamano').value = recepcion.clasificacion?.tamano || TAMANO.MEDIANO;
      document.getElementById('recHumedad').value = recepcion.clasificacion?.humedad || HUMEDAD.MEDIA;
      document.getElementById('recContaminacion').value = recepcion.clasificacion?.contaminacion || CONTAMINACION.NINGUNA;
      document.getElementById('recProcesoManual').value = recepcion.clasificacion?.proceso_sugerido_id || '';
      document.getElementById('recMotivoOtro').value = recepcion.rechazo?.motivo_otro || '';
      document.querySelectorAll('input[name="motivosRechazo"]').forEach((checkbox) => {
        checkbox.checked = recepcion.rechazo?.motivos?.includes(checkbox.value) || false;
      });
      aceptadaInput.dataset.manual = 'true';
      rechazoSection.style.display = Number(recepcion.cantidad?.rechazada_kg) > 0 ? 'block' : 'none';
      otroGroup.style.display = recepcion.rechazo?.motivos?.includes(MOTIVOS_RECHAZO.OTRO) ? 'block' : 'none';
      formTitle.textContent = `Editar Recepción ${recepcion.codigo}`;
      submitBtn.textContent = 'Guardar Cambios';
      formCard.style.display = 'block';
      alertContainer.innerHTML = '';
      formTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Auto-calculate aceptada when recibida or rechazada change
  const syncQuantities = () => {
    const rec = Number(recibidaInput?.value) || 0;
    const rech = Number(rechazadaInput?.value) || 0;
    if (rech > 0) {
      rechazoSection.style.display = 'block';
    } else {
      rechazoSection.style.display = 'none';
    }
    if (rec > 0 && !aceptadaInput?.dataset?.manual) {
      aceptadaInput.value = Math.max(0, rec - rech);
    }
  };

  recibidaInput?.addEventListener('input', () => {
    aceptadaInput.dataset.manual = '';
    syncQuantities();
  });
  rechazadaInput?.addEventListener('input', () => {
    aceptadaInput.dataset.manual = '';
    syncQuantities();
  });
  aceptadaInput?.addEventListener('input', () => {
    aceptadaInput.dataset.manual = 'true';
  });

  chkOtro?.addEventListener('change', () => {
    otroGroup.style.display = chkOtro.checked ? 'block' : 'none';
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertContainer.innerHTML = '';

      const motivosSeleccionados = Array.from(document.querySelectorAll('input[name="motivosRechazo"]:checked')).map(
        (cb) => cb.value
      );

      const payload = {
        solicitud_id: solicitudSelect.value,
        responsable_id: 'u_op_001',
        cantidad: {
          recibida_kg: Number(recibidaInput.value),
          aceptada_kg: Number(aceptadaInput.value),
          rechazada_kg: Number(rechazadaInput.value) || 0,
          medida_tipo: document.getElementById('recMedidaTipo').value,
          unidad_recibida: 'kg'
        },
        rechazo: {
          tiene_rechazo: Number(rechazadaInput.value) > 0,
          motivos: motivosSeleccionados,
          motivo_otro: document.getElementById('recMotivoOtro')?.value.trim() || null
        },
        clasificacion: {
          tipo_biomasa: document.getElementById('recTipoBiomasa').value,
          tamano: document.getElementById('recTamano').value,
          humedad: document.getElementById('recHumedad').value,
          contaminacion: document.getElementById('recContaminacion').value,
          proceso_sugerido_id: document.getElementById('recProcesoManual').value,
          proceso_decidido_manualmente: true
        }
      };

      const result = recepcionEditandoId
        ? actualizarRecepcion(recepcionEditandoId, payload)
        : registrarRecepcion(payload);
      if (result.success) {
        resetFormMode();
      } else {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <strong>Errores al registrar la recepción:</strong>
            <ul style="margin-top: 0.4rem; padding-left: 1.2rem; list-style: disc;">
              ${result.errors.map((err) => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    });
  }
}
