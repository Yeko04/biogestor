/**
 * Admin View - Configuración del Centro, Pausa de Recepciones, Respaldos JSON y Bitácora
 */

import { store } from '../../store/store.js';
import { selectConfig, selectBitacora, selectCentro, selectCapacidad } from '../../store/selectors.js';
import { alternarPausaRecepciones, exportarRespaldo, importarRespaldo, restablecerSistema } from '../../store/actions.js';

export function renderAdminView() {
  const state = store.getState();
  const centro = selectCentro(state);
  const capacidad = selectCapacidad(state);
  const bitacora = selectBitacora(state);

  return `
    <section class="section" id="admin-view">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h1 class="section-title" style="margin-bottom:0;">Panel de Administración y Control</h1>
            <p class="view-subtitle">Configuración operativa, gestión de copias de seguridad (JSON) y bitácora de auditoría.</p>
          </div>
        </div>

        <div id="adminAlertContainer"></div>

        <div class="grid grid-md-2" style="margin-bottom: var(--space-xl); gap: var(--space-lg);">
          <!-- Control de Recepciones y Capacidad -->
          <article class="card">
            <div class="card-header">
              <h3 class="card-title">Estado Operativo del Centro</h3>
              <span class="badge ${capacidad.recepciones_pausadas ? 'badge-warning' : 'badge-success'}">
                ${capacidad.recepciones_pausadas ? 'Pausado' : 'Operando Normal'}
              </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-sm); margin-top: var(--space-xs);">
              <p style="font-size: 0.95rem;">
                <strong>Centro:</strong> ${centro.nombre}<br>
                <strong>Capacidad diaria:</strong> ${capacidad.recepcion_kg_dia} kg/día<br>
                <strong>Almacenamiento máximo:</strong> ${capacidad.almacenamiento_kg} kg
              </p>

              <hr style="border: 0; border-top: 1px solid var(--color-border); margin: var(--space-2xs) 0;">

              <form id="formPausaRecepcion">
                <div class="form-group">
                  <label class="form-label" for="txtMotivoPausa">
                    ${capacidad.recepciones_pausadas ? 'Motivo actual de pausa:' : 'Motivo de pausa (requerido para pausar):'}
                  </label>
                  <input class="form-control" type="text" id="txtMotivoPausa" 
                    value="${capacidad.motivo_pausa || ''}" 
                    placeholder="Ej. Mantenimiento del biodigestor o saturación de patios"
                    ${capacidad.recepciones_pausadas ? 'readonly' : ''}>
                </div>

                <div style="margin-top: var(--space-sm);">
                  ${
                    capacidad.recepciones_pausadas
                      ? `<button type="button" class="btn btn-primary btn-block-sm" id="btnReanudarRec">Reanudar Recepciones</button>`
                      : `<button type="submit" class="btn btn-outline btn-block-sm" style="border-color: var(--color-warning); color: #b45309;">
                          Pausar Recepciones de Biomasa
                        </button>`
                  }
                </div>
              </form>
            </div>
          </article>

          <!-- Respaldos y Persistencia en localStorage -->
          <article class="card">
            <div class="card-header">
              <h3 class="card-title">Copias de Seguridad (JSON + localStorage)</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-xs);">
              <p style="font-size: 0.95rem; color: var(--color-text-secondary);">
                Toda la información reside de forma reactiva en su navegador. Exporte periódicamente una copia de seguridad en formato JSON estructurado.
              </p>

              <div style="display: flex; flex-wrap: wrap; gap: var(--space-sm);">
                <button class="btn btn-primary" id="btnExportarJson">
                  Exportar Respaldo JSON
                </button>
                <label class="btn btn-outline" style="cursor: pointer;">
                  Importar Respaldo JSON
                  <input type="file" id="fileImportJson" accept=".json" style="display: none;">
                </label>
              </div>

              <div style="margin-top: auto; padding-top: var(--space-xs); border-top: 1px solid var(--color-border);">
                <button class="btn btn-outline" id="btnResetSistema" style="border-color: var(--color-danger); color: var(--color-danger); font-size: 0.88rem;">
                  Restablecer a Datos Iniciales
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- Bitácora de Auditoría -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Bitácora de Cambios y Trazabilidad (${bitacora.length})</h3>
          </div>

          ${
            bitacora.length === 0
              ? `<div class="empty-state">
                  <p>No hay eventos registrados en la bitácora.</p>
                </div>`
              : `
              <div class="table-wrap" data-responsive="table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Fecha / Hora</th>
                      <th>Entidad</th>
                      <th>Acción</th>
                      <th>Detalle del Evento</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bitacora.slice(0, 20).map((b) => `
                      <tr>
                        <td><small style="color:var(--color-text-secondary);">${new Date(b.fecha).toLocaleString()}</small></td>
                        <td><span class="badge badge-info">${b.entidad}</span></td>
                        <td><strong>${b.accion}</strong></td>
                        <td>${b.detalle}</td>
                        <td><small>${b.usuario_id || 'Sistema'}</small></td>
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

export function attachAdminEvents() {
  const formPausa = document.getElementById('formPausaRecepcion');
  const btnReanudar = document.getElementById('btnReanudarRec');
  const btnExport = document.getElementById('btnExportarJson');
  const fileImport = document.getElementById('fileImportJson');
  const btnReset = document.getElementById('btnResetSistema');
  const alertContainer = document.getElementById('adminAlertContainer');

  if (formPausa) {
    formPausa.addEventListener('submit', (e) => {
      e.preventDefault();
      const motivo = document.getElementById('txtMotivoPausa').value.trim();
      if (!motivo) {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <strong>Error:</strong> Debe proporcionar un motivo justificado para pausar las recepciones.
          </div>
        `;
        return;
      }
      alternarPausaRecepciones(true, motivo);
    });
  }

  if (btnReanudar) {
    btnReanudar.addEventListener('click', () => {
      alternarPausaRecepciones(false);
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const ok = exportarRespaldo(`biogestor-backup-${new Date().toISOString().slice(0, 10)}.json`);
      if (ok) {
        alertContainer.innerHTML = `
          <div class="alert alert-success">
            <strong>Éxito:</strong> Copia de seguridad JSON exportada correctamente.
          </div>
        `;
      }
    });
  }

  if (fileImport) {
    fileImport.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const confirmImport = confirm(
        '¿Desea restaurar esta copia de seguridad? Se reemplazarán los datos actuales en el navegador.'
      );
      if (!confirmImport) {
        fileImport.value = '';
        return;
      }

      const result = await importarRespaldo(file);
      if (result.success) {
        alertContainer.innerHTML = `
          <div class="alert alert-success">
            <strong>Éxito:</strong> Datos importados y restaurados correctamente.
          </div>
        `;
      } else {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <strong>Error al importar:</strong> ${result.errors.join('<br>')}
          </div>
        `;
      }
      fileImport.value = '';
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      const confirmReset = confirm(
        '¿Está seguro de restablecer el sistema a los datos iniciales? Se borrarán los cambios locales no exportados.'
      );
      if (confirmReset) {
        restablecerSistema();
      }
    });
  }
}
