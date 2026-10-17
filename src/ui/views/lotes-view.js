/**
 * Lotes View - Gestión de Lotes, Trazabilidad y Seguimiento de Procesos
 * (Biodigestor Biol/Biogás vs Pirólisis Kon-Tiki Biochar)
 */

import { store } from '../../store/store.js';
import { selectLotes, selectRecepciones, selectAvailableProcesses } from '../../store/selectors.js';
import {
  crearLote,
  actualizarLote,
  eliminarLote,
  registrarSeguimientoLote,
  actualizarSeguimientoLote,
  eliminarSeguimientoLote
} from '../../store/actions.js';
import { ETAPAS_SEGUIMIENTO } from '../../logic/constants.js';

function formatDateTimeLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

export function renderLotesView() {
  const state = store.getState();
  const lotes = selectLotes(state);
  const recepciones = selectRecepciones(state);
  const procesos = selectAvailableProcesses(state);
  const procesosEdicion = (state.config?.procesos || []).filter(
    (proceso) => proceso.activo || lotes.some((lote) => lote.proceso_id === proceso.id)
  );

  const recepcionesSinLote = recepciones.filter((r) => !r.lote_id);

  return `
    <section class="section" id="lotes-view">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h1 class="section-title" style="margin-bottom:0;">Gestión de Lotes y Trazabilidad</h1>
            <p class="view-subtitle">Agrupación de recepciones para Biodigestión anaerobia o Pirólisis (Kon-Tiki elevado).</p>
          </div>
          <button class="btn btn-primary" id="btnToggleLoteForm">+ Crear Nuevo Lote</button>
        </div>

        <div id="loteFormCard" class="form-card" style="display: none;">
          <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-md); color: var(--color-text);">
            Crear Lote de Biomasa
          </h2>
          <div id="loteFormAlert"></div>

          <form id="formNuevoLote">
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label form-label-required" for="loteNombre">Nombre identificativo del lote</label>
                <input class="form-control" type="text" id="loteNombre" required placeholder="Ej. Lote Poda Parque Central - Pirólisis">
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="loteProcesoId">Proceso de Destino</label>
                <select class="form-select" id="loteProcesoId" required>
                  ${procesos.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                </select>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label form-label-required">Seleccionar Recepciones a Integrar (Trazabilidad)</label>
                ${
                  recepcionesSinLote.length === 0
                    ? `<p style="font-size: 0.9rem; color: var(--color-warning);">No hay recepciones libres sin lote. Debe registrar o tener recepciones disponibles.</p>`
                    : `
                    <div class="checkbox-group" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                      ${recepcionesSinLote.map((r) => `
                        <label class="checkbox-label" style="background: var(--color-gray-bg); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                          <input type="checkbox" name="loteRecepciones" value="${r.id}">
                          <div>
                            <strong>${r.codigo}</strong> (${r.clasificacion?.tipo_biomasa})<br>
                            <span style="font-size: 0.82rem; color: var(--color-text-secondary);">${r.cantidad?.aceptada_kg} kg netos</span>
                          </div>
                        </label>
                      `).join('')}
                    </div>
                  `
                }
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" ${recepcionesSinLote.length === 0 ? 'disabled' : ''}>Crear Lote</button>
              <button type="button" class="btn btn-outline" id="btnCancelLoteForm">Cancelar</button>
            </div>
          </form>
        </div>

        <!-- Listado de Lotes -->
        <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
          ${
            lotes.length === 0
              ? `<div class="empty-state">
                  <div class="empty-state-icon">📦</div>
                  <p>No se han configurado lotes todavía.</p>
                </div>`
              : lotes.map((l) => {
                  const proc = procesos.find((p) => p.id === l.proceso_id);
                  const comp = l.composicion || {};
                  return `
                    <article class="card">
                      <div class="card-header">
                        <div>
                          <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em;">${l.codigo}</span>
                          <h3 class="card-title">${l.nombre}</h3>
                          <span style="font-size: 0.9rem; color: var(--color-text-secondary);">Proceso: <strong>${proc?.nombre || l.proceso_id}</strong></span>
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-xs);">
                          <span class="badge badge-info">${l.estado.replace(/_/g, ' ')}</span>
                          <button class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.88rem;" onclick="window.__openFollowUpModal('${l.id}')">
                            + Registrar Etapa
                          </button>
                        </div>
                      </div>

                      <!-- Balance de Masa del Lote -->
                      <div style="background: var(--color-gray-bg); padding: var(--space-md); border-radius: var(--radius-md); display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: var(--space-sm);">
                        <div>
                          <span style="font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase;">Fracción Blanda</span>
                          <p style="font-weight: 700; font-size: 1.1rem;">${comp.blanda_kg || 0} kg</p>
                        </div>
                        <div>
                          <span style="font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase;">Fracción Dura</span>
                          <p style="font-weight: 700; font-size: 1.1rem;">${comp.dura_kg || 0} kg</p>
                        </div>
                        <div>
                          <span style="font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase;">Aceptada Total</span>
                          <p style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary);">${comp.aceptada_total_kg || 0} kg</p>
                        </div>
                        <div>
                          <span style="font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase;">Mermas / Pérdidas</span>
                          <p style="font-weight: 700; font-size: 1.1rem; color: var(--color-danger);">${comp.perdidas_estimadas_kg || 0} kg</p>
                        </div>
                        <div>
                          <span style="font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase;">Aprovechable Neto</span>
                          <p style="font-weight: 700; font-size: 1.1rem; color: #15803d;">${comp.disponible_aprovechamiento_kg || 0} kg</p>
                        </div>
                      </div>

                      <!-- Trazabilidad de Recepciones -->
                      <div style="font-size: 0.88rem; color: var(--color-text-secondary);">
                        Trazabilidad de origen: <strong>${(l.recepciones_ids || []).join(', ') || 'Sin recepciones vinculadas'}</strong>
                      </div>

                      <!-- Historial de Seguimientos -->
                      ${
                        (l.seguimientos || []).length > 0
                          ? `
                          <div style="margin-top: var(--space-xs); border-top: 1px solid var(--color-border); padding-top: var(--space-sm);">
                            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: var(--space-xs);">Historial de Etapas Registradas:</h4>
                            <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
                              ${l.seguimientos.map((seg) => `
                                <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; font-size: 0.88rem; background: var(--color-surface); border: 1px solid var(--color-border); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);">
                                  <div style="display: flex; flex-direction: column; gap: var(--space-2xs);">
                                    <div>
                                      <strong style="text-transform: capitalize;">${seg.etapa.replace(/_/g, ' ')}</strong>
                                      · ${new Date(seg.fecha).toLocaleString()}
                                      <span class="badge ${seg.medicion?.real ? 'badge-success' : 'badge-warning'}" style="font-size: 0.75rem; margin-left: 0.4rem;">
                                        ${seg.medicion?.real ? 'Medición Real' : 'Simulado'}
                                      </span>
                                    </div>
                                    <div style="color: var(--color-text-secondary);">
                                      ${seg.datos_etapa?.ph_biol ? `pH: <strong>${seg.datos_etapa.ph_biol}</strong> | ` : ''}
                                      ${seg.datos_etapa?.litros_biol ? `Biol: <strong>${seg.datos_etapa.litros_biol} L</strong> | ` : ''}
                                      ${seg.datos_etapa?.kg_biochar ? `Biochar: <strong>${seg.datos_etapa.kg_biochar} kg</strong> | ` : ''}
                                      ${seg.datos_etapa?.m3_biogas ? `Biogás: <strong>${seg.datos_etapa.m3_biogas} m³</strong> | ` : ''}
                                      Mermas: <strong>${seg.perdidas_estimadas_kg || 0} kg</strong>
                                    </div>
                                    ${seg.descripcion ? `<div>${escapeHtml(seg.descripcion)}</div>` : ''}
                                    ${seg.observaciones ? `<div>${escapeHtml(seg.observaciones)}</div>` : ''}
                                  </div>
                                  <div style="display: flex; gap: var(--space-xs);">
                                    <button type="button" class="btn btn-outline" style="padding: 0.3rem 0.7rem; font-size: 0.82rem;" data-editar-seguimiento="${l.id}" data-seguimiento-id="${seg.id}">
                                      Editar
                                    </button>
                                    <button type="button" class="btn btn-outline" style="padding: 0.3rem 0.7rem; font-size: 0.82rem; border-color: var(--color-danger); color: var(--color-danger);" data-eliminar-seguimiento="${l.id}" data-seguimiento-id="${seg.id}">
                                      Eliminar
                                    </button>
                                  </div>
                                </div>
                              `).join('')}
                            </div>
                          </div>
                        `
                          : ''
                      }
                    </article>
                  `;
                }).join('')
          }
        </div>

        <div class="modal-overlay" id="editLoteModal" aria-hidden="true">
          <div class="modal-box">
            <div class="modal-header">
              <h3 class="modal-title">Editar lote</h3>
              <button type="button" class="modal-close" id="editLoteCloseBtn" aria-label="Cerrar">&times;</button>
            </div>
            <div id="editLoteAlert"></div>
            <form id="formEditarLote">
              <input type="hidden" id="editLoteId">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label form-label-required" for="editLoteNombre">Nombre identificativo del lote</label>
                  <input class="form-control" type="text" id="editLoteNombre" required maxlength="120">
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required" for="editLoteProceso">Proceso de destino</label>
                  <select class="form-select" id="editLoteProceso" required>
                    ${procesosEdicion.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <span class="form-label">Recepciones vinculadas</span>
                  <div id="editLoteRecepciones" class="checkbox-group"></div>
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                <button type="button" class="btn btn-outline" id="editLoteCancelBtn">Cancelar</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal para Registro de Etapa de Seguimiento -->
        <div class="modal-overlay" id="followUpModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3 class="modal-title" id="followUpModalTitle">Registrar Etapa de Seguimiento</h3>
              <button type="button" class="modal-close" id="modalCloseBtn" aria-label="Cerrar">&times;</button>
            </div>
            <div id="modalAlert"></div>

            <form id="formSeguimiento">
              <input type="hidden" id="modalLoteId">
              <input type="hidden" id="modalSeguimientoId">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label form-label-required" for="segFecha">Fecha y hora</label>
                  <input class="form-control" type="datetime-local" id="segFecha" required>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required" for="segEtapa">Etapa del Proceso</label>
                  <select class="form-select" id="segEtapa" required>
                    <option value="${ETAPAS_SEGUIMIENTO.EN_BIODIGESTOR}">Biodigestor - Digestión anaerobia (Biol/Biogás)</option>
                    <option value="${ETAPAS_SEGUIMIENTO.TRITURADO}">Triturado / Machecado previo</option>
                    <option value="${ETAPAS_SEGUIMIENTO.PIRÓLISIS}">Pirólisis (Horno Kon-Tiki elevado)</option>
                    <option value="${ETAPAS_SEGUIMIENTO.OBTENCION_BIOCHAR}">Obtención y apagado de Biochar</option>
                    <option value="${ETAPAS_SEGUIMIENTO.MEZCLA_FINAL}">Mezcla Final (Biol + Biochar)</option>
                    <option value="${ETAPAS_SEGUIMIENTO.DISPONIBLE}">Finalizar lote (Disponible para distribución)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label form-label-required">Tipo de Medición (Regla Real vs Simulado)</label>
                  <div style="display: flex; gap: var(--space-md);">
                    <label class="checkbox-label">
                      <input type="radio" name="segMedicion" value="real" checked> Medición Real en sitio
                    </label>
                    <label class="checkbox-label">
                      <input type="radio" name="segMedicion" value="simulado"> Estimado / Simulado
                    </label>
                  </div>
                  <small class="form-help">Obligatorio según reglas: Toda medición no ejecutada físicamente debe marcarse como simulada.</small>
                </div>

                <div class="form-grid form-grid-2">
                  <div class="form-group" id="groupPhBiol">
                    <label class="form-label" for="segPhBiol">pH del Biol (Rango óptimo: 7.5 - 8.5)</label>
                    <input class="form-control" type="number" id="segPhBiol" min="0" max="14" step="0.1" placeholder="Ej. 7.8">
                  </div>
                  <div class="form-group" id="groupLitrosBiol">
                    <label class="form-label" for="segLitrosBiol">Litros de Biol producidos (L)</label>
                    <input class="form-control" type="number" id="segLitrosBiol" min="0" step="0.5" value="0">
                  </div>
                  <div class="form-group" id="groupBiochar">
                    <label class="form-label" for="segKgBiochar">Kilogramos de Biochar (kg)</label>
                    <input class="form-control" type="number" id="segKgBiochar" min="0" step="0.5" value="0">
                  </div>
                  <div class="form-group" id="groupBiogas">
                    <label class="form-label" for="segM3Biogas">Metros cúbicos de Biogás (m³)</label>
                    <input class="form-control" type="number" id="segM3Biogas" min="0" step="0.1" value="0">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="segMasaTriturada">Masa procesada / triturada (kg)</label>
                    <input class="form-control" type="number" id="segMasaTriturada" min="0" step="0.5" value="0">
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="segPerdidas">Pérdidas o Mermas de etapa (kg)</label>
                    <input class="form-control" type="number" id="segPerdidas" min="0" step="0.5" value="0">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="segDescripcion">Descripción de la etapa</label>
                  <input class="form-control" type="text" id="segDescripcion" maxlength="300" placeholder="Resumen breve de la actividad">
                </div>

                <div class="form-group">
                  <label class="form-label" for="segObservaciones">Observaciones técnicas de la etapa</label>
                  <textarea class="form-textarea" id="segObservaciones" rows="2" placeholder="Estabilidad de llama, control de humo en cono, temperatura..."></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" id="followUpSubmitBtn">Registrar Seguimiento</button>
                <button type="button" class="btn btn-outline" id="modalCancelBtn">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function attachLotesEvents() {
  const toggleBtn = document.getElementById('btnToggleLoteForm');
  const cancelBtn = document.getElementById('btnCancelLoteForm');
  const formCard = document.getElementById('loteFormCard');
  const form = document.getElementById('formNuevoLote');
  const alertContainer = document.getElementById('loteFormAlert');
  const editModal = document.getElementById('editLoteModal');
  const editForm = document.getElementById('formEditarLote');
  const editAlert = document.getElementById('editLoteAlert');

  const modal = document.getElementById('followUpModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const modalCancel = document.getElementById('modalCancelBtn');
  const modalForm = document.getElementById('formSeguimiento');
  const modalAlert = document.getElementById('modalAlert');
  const modalTitle = document.getElementById('followUpModalTitle');
  const modalSubmit = document.getElementById('followUpSubmitBtn');

  document.querySelectorAll('[data-editar-seguimiento]').forEach((button) => {
    button.addEventListener('click', () => {
      const lote = selectLotes(store.getState()).find((item) => item.id === button.dataset.editarSeguimiento);
      const seguimiento = lote?.seguimientos?.find((item) => item.id === button.dataset.seguimientoId);
      if (!lote || !seguimiento || !modal || !modalForm) return;

      modalForm.reset();
      document.getElementById('modalLoteId').value = lote.id;
      document.getElementById('modalSeguimientoId').value = seguimiento.id;
      document.getElementById('segFecha').value = formatDateTimeLocal(seguimiento.fecha);
      document.getElementById('segEtapa').value = seguimiento.etapa;
      document.querySelector(`input[name="segMedicion"][value="${seguimiento.medicion?.real ? 'real' : 'simulado'}"]`).checked = true;
      document.getElementById('segPhBiol').value = seguimiento.datos_etapa?.ph_biol ?? '';
      document.getElementById('segLitrosBiol').value = seguimiento.datos_etapa?.litros_biol ?? 0;
      document.getElementById('segKgBiochar').value = seguimiento.datos_etapa?.kg_biochar ?? 0;
      document.getElementById('segM3Biogas').value = seguimiento.datos_etapa?.m3_biogas ?? 0;
      document.getElementById('segMasaTriturada').value = seguimiento.datos_etapa?.masa_triturada_kg ?? 0;
      document.getElementById('segPerdidas').value = seguimiento.perdidas_estimadas_kg ?? 0;
      document.getElementById('segDescripcion').value = seguimiento.descripcion || '';
      document.getElementById('segObservaciones').value = seguimiento.observaciones || '';
      modalTitle.textContent = 'Editar registro del historial';
      modalSubmit.textContent = 'Guardar cambios';
      modalAlert.innerHTML = '';
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  document.querySelectorAll('[data-eliminar-seguimiento]').forEach((button) => {
    button.addEventListener('click', () => {
      const lote = selectLotes(store.getState()).find((item) => item.id === button.dataset.eliminarSeguimiento);
      const seguimiento = lote?.seguimientos?.find((item) => item.id === button.dataset.seguimientoId);
      if (!lote || !seguimiento || !window.confirm(`¿Eliminar del historial la etapa "${seguimiento.etapa.replace(/_/g, ' ')}" del lote ${lote.codigo}?`)) {
        return;
      }

      const result = eliminarSeguimientoLote(lote.id, seguimiento.id);
      if (!result.success) {
        window.alert(result.errors.join('\n'));
      }
    });
  });

  const closeEditModal = () => {
    editModal?.classList.remove('is-active');
    editModal?.setAttribute('aria-hidden', 'true');
    editForm?.reset();
    if (editAlert) editAlert.innerHTML = '';
  };

  document.querySelectorAll('[data-editar-lote]').forEach((button) => {
    button.addEventListener('click', () => {
      const lote = selectLotes(store.getState()).find((item) => item.id === button.dataset.editarLote);
      if (!lote) return;

      document.getElementById('editLoteId').value = lote.id;
      document.getElementById('editLoteNombre').value = lote.nombre;
      document.getElementById('editLoteProceso').value = lote.proceso_id;
      const recepcionesActuales = selectRecepciones(store.getState());
      const recepcionesEditables = recepcionesActuales.filter(
        (recepcion) => !recepcion.lote_id || recepcion.lote_id === lote.id
      );
      const recepcionesContainer = document.getElementById('editLoteRecepciones');
      recepcionesContainer.innerHTML = recepcionesEditables.length
        ? recepcionesEditables.map((recepcion) => `
            <label class="checkbox-label">
              <input type="checkbox" name="editLoteRecepciones" value="${recepcion.id}" ${(lote.recepciones_ids || []).includes(recepcion.id) ? 'checked' : ''}>
              <span>${recepcion.codigo}</span>
            </label>
          `).join('')
        : '<p>No hay recepciones disponibles para vincular.</p>';
      editAlert.innerHTML = '';
      editModal.classList.add('is-active');
      editModal.setAttribute('aria-hidden', 'false');
    });
  });

  document.querySelectorAll('[data-eliminar-lote]').forEach((button) => {
    button.addEventListener('click', () => {
      const lote = selectLotes(store.getState()).find((item) => item.id === button.dataset.eliminarLote);
      if (!lote || !window.confirm(`¿Eliminar el lote ${lote.codigo} (${lote.nombre})? Las recepciones vinculadas quedarán disponibles nuevamente.`)) {
        return;
      }

      const result = eliminarLote(lote.id);
      if (!result.success) {
        window.alert(result.errors.join('\n'));
      }
    });
  });

  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      editAlert.innerHTML = '';
      const recepcionesIds = Array.from(
        editForm.querySelectorAll('input[name="editLoteRecepciones"]:checked')
      ).map((checkbox) => checkbox.value);
      const result = actualizarLote(document.getElementById('editLoteId').value, {
        nombre: document.getElementById('editLoteNombre').value,
        proceso_id: document.getElementById('editLoteProceso').value,
        recepciones_ids: recepcionesIds
      });

      if (result.success) {
        closeEditModal();
      } else {
        editAlert.innerHTML = `
          <div class="alert alert-danger">
            <strong>Error al actualizar el lote:</strong>
            <ul style="margin-top: 0.4rem; padding-left: 1.2rem; list-style: disc;">
              ${result.errors.map((error) => `<li>${error}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    });
  }

  document.getElementById('editLoteCloseBtn')?.addEventListener('click', closeEditModal);
  document.getElementById('editLoteCancelBtn')?.addEventListener('click', closeEditModal);

  if (toggleBtn && formCard) {
    toggleBtn.addEventListener('click', () => {
      formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
      if (formCard.style.display === 'block') {
        document.getElementById('loteNombre')?.focus();
      }
    });
  }

  if (cancelBtn && formCard) {
    cancelBtn.addEventListener('click', () => {
      formCard.style.display = 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertContainer.innerHTML = '';

      const recepcionesIds = Array.from(document.querySelectorAll('input[name="loteRecepciones"]:checked')).map(
        (cb) => cb.value
      );

      const payload = {
        nombre: document.getElementById('loteNombre').value.trim(),
        proceso_id: document.getElementById('loteProcesoId').value,
        recepciones_ids: recepcionesIds,
        responsable_id: 'u_op_001'
      };

      const result = crearLote(payload);
      if (result.success) {
        form.reset();
        formCard.style.display = 'none';
      } else {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <strong>Errores al crear el lote:</strong>
            <ul style="margin-top: 0.4rem; padding-left: 1.2rem; list-style: disc;">
              ${result.errors.map((err) => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    });
  }

  // Follow-up modal handling
  window.__openFollowUpModal = (loteId) => {
    if (modal && modalForm) {
      modalForm.reset();
      document.getElementById('modalLoteId').value = loteId;
      document.getElementById('modalSeguimientoId').value = '';
      document.getElementById('segFecha').value = formatDateTimeLocal(new Date());
      modalTitle.textContent = 'Registrar Etapa de Seguimiento';
      modalSubmit.textContent = 'Registrar Seguimiento';
      modalAlert.innerHTML = '';
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      modalForm?.reset();
      modalTitle.textContent = 'Registrar Etapa de Seguimiento';
      modalSubmit.textContent = 'Registrar Seguimiento';
    }
  };

  modalClose?.addEventListener('click', closeModal);
  modalCancel?.addEventListener('click', closeModal);

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      modalAlert.innerHTML = '';

      const loteId = document.getElementById('modalLoteId').value;
      const seguimientoId = document.getElementById('modalSeguimientoId').value;
      const isReal = document.querySelector('input[name="segMedicion"]:checked')?.value === 'real';
      const phVal = document.getElementById('segPhBiol').value;

      const payload = {
        fecha: new Date(document.getElementById('segFecha').value).toISOString(),
        etapa: document.getElementById('segEtapa').value,
        medicion: {
          real: isReal,
          simulado: !isReal
        },
        datos_etapa: {
          ph_biol: phVal ? Number(phVal) : null,
          litros_biol: Number(document.getElementById('segLitrosBiol').value) || 0,
          kg_biochar: Number(document.getElementById('segKgBiochar').value) || 0,
          m3_biogas: Number(document.getElementById('segM3Biogas').value) || 0,
          masa_triturada_kg: Number(document.getElementById('segMasaTriturada').value) || 0
        },
        perdidas_estimadas_kg: Number(document.getElementById('segPerdidas').value) || 0,
        descripcion: document.getElementById('segDescripcion').value.trim() || null,
        observaciones: document.getElementById('segObservaciones').value.trim() || null
      };

      const result = seguimientoId
        ? actualizarSeguimientoLote(loteId, seguimientoId, payload)
        : registrarSeguimientoLote(loteId, payload);
      if (result.success) {
        closeModal();
      } else {
        const actionLabel = seguimientoId ? 'actualizar' : 'registrar';
        modalAlert.innerHTML = `
          <div class="alert alert-danger">
            <strong>Error al ${actionLabel} el seguimiento:</strong>
            <ul style="margin-top: 0.4rem; padding-left: 1.2rem; list-style: disc;">
              ${result.errors.map((err) => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    });
  }
}
