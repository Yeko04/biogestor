/**
 * Subproductos View - Control de Existencias y Registro de Salidas/Distribución
 * Regla de negocio: Nunca permitir salida > disponible. disponible = producido - destinado.
 */

import { store } from '../../store/store.js';
import { selectSubproductos, selectSalidas, selectStockSummary, selectLotes } from '../../store/selectors.js';
import { registrarSalidaSubproducto, actualizarSalidaSubproducto } from '../../store/actions.js';
import { DESTINOS_SALIDA } from '../../logic/constants.js';

export function renderSubproductosView() {
  const state = store.getState();
  const subproductos = selectSubproductos(state);
  const salidas = selectSalidas(state);
  const stock = selectStockSummary(state);
  const lotes = selectLotes(state);

  return `
    <section class="section" id="subproductos-view">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h1 class="section-title" style="margin-bottom:0;">Lo que vuelve a la tierra.</h1>
            <p class="view-subtitle">Biol, biochar y nuevas posibilidades. Revisá las existencias y registrá cada entrega.</p>
          </div>
          <button class="btn btn-primary" id="btnToggleSalidaForm">+ Registrar Salida / Entrega</button>
        </div>

        <!-- KPI Cards de Stock Actual -->
        <div class="kpi-grid" style="margin-bottom: var(--space-xl);">
          <div class="kpi-card">
            <div class="kpi-label">Biol Disponible</div>
            <div class="kpi-value kpi-success">${stock.L.disponible} <span style="font-size: 1.2rem; font-weight: 500;">L</span></div>
            <div class="kpi-meta">Producido: ${stock.L.producida} L | Entregado: ${stock.L.destinada} L</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Biochar Disponible</div>
            <div class="kpi-value kpi-success">${stock.kg.disponible} <span style="font-size: 1.2rem; font-weight: 500;">kg</span></div>
            <div class="kpi-meta">Producido: ${stock.kg.producida} kg | Entregado: ${stock.kg.destinada} kg</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Lotes con Producción</div>
            <div class="kpi-value">${lotes.length}</div>
            <div class="kpi-meta">Trazabilidad desde origen</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Salidas Documentadas</div>
            <div class="kpi-value">${salidas.length}</div>
            <div class="kpi-meta">Huertos, proyectos y productores</div>
          </div>
        </div>

        <!-- Formulario de Nueva Salida -->
        <div id="salidaFormCard" class="form-card" style="display: none;">
          <h2 id="salidaFormTitle" style="font-size: 1.25rem; font-weight: 700; margin-bottom: var(--space-md); color: var(--color-text);">
            Registrar Entrega de Subproducto
          </h2>
          <div id="salidaFormAlert"></div>

          <form id="formNuevaSalida">
            <div class="form-grid form-grid-2">
              <div class="form-group form-group-full">
                <label class="form-label form-label-required" for="salSubproductoId">Subproducto en Existencia</label>
                <select class="form-select" id="salSubproductoId" required>
                  <option value="">-- Seleccionar subproducto con stock --</option>
                  ${subproductos.map((sp) => `
                    <option value="${sp.id}" data-disponible="${sp.cantidad_disponible}" data-unidad="${sp.unidad}" data-lote="${sp.lote_id}" ${sp.cantidad_disponible <= 0 ? 'disabled' : ''}>
                      ${sp.codigo} (${sp.tipo.toUpperCase()}) · Lote: ${sp.lote_codigo || sp.lote_id} · Disp: ${sp.cantidad_disponible} ${sp.unidad}
                    </option>
                  `).join('')}
                </select>
                <small class="form-help" id="stockHelperText">Seleccione un lote para ver existencias máximas disponibles.</small>
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="salCantidad">Cantidad a Entregar</label>
                <input class="form-control" type="number" id="salCantidad" min="0.1" step="0.1" required placeholder="0.0">
              </div>

              <div class="form-group">
                <label class="form-label form-label-required" for="salDestino">Destino Autorizado</label>
                <select class="form-select" id="salDestino" required>
                  <option value="${DESTINOS_SALIDA.PRODUCTORES_LOCALES}">Productores Locales</option>
                  <option value="${DESTINOS_SALIDA.PROYECTOS_COMUNITARIOS}">Proyectos Comunitarios / Parques</option>
                  <option value="${DESTINOS_SALIDA.PRODUCCION_URBANA_CENTRO}">Producción Urbana del Centro</option>
                  <option value="${DESTINOS_SALIDA.DONACION}">Donación Comunitaria</option>
                  <option value="${DESTINOS_SALIDA.VENTA_BAJO_COSTO}">Venta a Bajo Costo</option>
                  <option value="${DESTINOS_SALIDA.ENSAYOS}">Ensayos y Validación</option>
                  <option value="${DESTINOS_SALIDA.OTRO_DESTINO_AUTORIZADO}">Otro destino autorizado</option>
                </select>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label form-label-required" for="salBeneficiario">Beneficiario / Proyecto de Aplicación</label>
                <input class="form-control" type="text" id="salBeneficiario" required placeholder="Nombre del huerto, productor o institución beneficiaria">
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="salObservaciones">Observaciones</label>
                <textarea class="form-textarea" id="salObservaciones" rows="2" placeholder="Bidones entregados, aplicación foliar, enmienda en suelo..."></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Registrar Salida</button>
              <button type="button" class="btn btn-outline" id="btnCancelSalidaForm">Cancelar</button>
            </div>
          </form>
        </div>

        <!-- Tabla de Salidas Registradas -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Historial de Salidas y Distribución (${salidas.length})</h3>
          </div>

          ${
            salidas.length === 0
              ? `<div class="empty-state">
                  <div class="empty-state-icon">🚚</div>
                  <p>No se han registrado salidas de subproductos todavía.</p>
                </div>`
              : `
              <div class="table-wrap" data-responsive="table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Fecha</th>
                      <th>Cantidad</th>
                      <th>Destino</th>
                      <th>Beneficiario</th>
                      <th>Observaciones</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${salidas.map((s) => `
                      <tr>
                        <td><strong>${s.codigo}</strong></td>
                        <td>${new Date(s.fecha_salida).toLocaleDateString()}</td>
                        <td><span style="font-weight: 700; color: #15803d;">${s.cantidad_entregada} ${s.unidad}</span></td>
                        <td><span class="badge badge-info">${s.destino.replace(/_/g, ' ')}</span></td>
                        <td><strong>${s.beneficiario_uso}</strong></td>
                        <td>${s.observaciones || '<span style="color:var(--color-text-secondary);">-</span>'}</td>
                        <td>
                          <button type="button" class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" data-editar-salida="${s.id}">
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

export function attachSubproductosEvents() {
  const toggleBtn = document.getElementById('btnToggleSalidaForm');
  const cancelBtn = document.getElementById('btnCancelSalidaForm');
  const formCard = document.getElementById('salidaFormCard');
  const form = document.getElementById('formNuevaSalida');
  const alertContainer = document.getElementById('salidaFormAlert');
  const spSelect = document.getElementById('salSubproductoId');
  const cantidadInput = document.getElementById('salCantidad');
  const stockHelper = document.getElementById('stockHelperText');
  const formTitle = document.getElementById('salidaFormTitle');
  const submitBtn = form?.querySelector('[type="submit"]');
  let salidaEditandoId = null;

  const effectiveAvailable = (option) => {
    const base = Number(option?.dataset.disponible) || 0;
    if (!salidaEditandoId) return base;
    const salida = selectSalidas(store.getState()).find((item) => item.id === salidaEditandoId);
    return salida?.subproducto_id === option?.value ? base + Number(salida.cantidad_entregada || 0) : base;
  };

  const updateStockDisplay = () => {
    const selected = spSelect.options[spSelect.selectedIndex];
    if (selected && selected.dataset.disponible !== undefined) {
      const disponible = effectiveAvailable(selected);
      stockHelper.innerHTML = `Stock máximo disponible: <strong style="color: #15803d;">${disponible} ${selected.dataset.unidad}</strong>`;
      cantidadInput.max = disponible;
    } else {
      stockHelper.textContent = 'Seleccione un lote para ver existencias máximas disponibles.';
      cantidadInput.removeAttribute('max');
    }
  };

  const resetFormMode = () => {
    salidaEditandoId = null;
    form?.reset();
    formCard.style.display = 'none';
    formTitle.textContent = 'Registrar Entrega de Subproducto';
    submitBtn.textContent = 'Registrar Salida';
    Array.from(spSelect.options).forEach((option) => {
      if (option.dataset.disponible !== undefined) {
        option.disabled = Number(option.dataset.disponible) <= 0;
      }
    });
    updateStockDisplay();
    alertContainer.innerHTML = '';
  };

  if (toggleBtn && formCard) {
    toggleBtn.addEventListener('click', () => {
      formCard.style.display = formCard.style.display === 'none' ? 'block' : 'none';
      if (formCard.style.display === 'block') {
        spSelect?.focus();
      }
    });
  }

  if (cancelBtn && formCard) {
    cancelBtn.addEventListener('click', () => {
      resetFormMode();
    });
  }

  document.querySelectorAll('[data-editar-salida]').forEach((button) => {
    button.addEventListener('click', () => {
      const salida = selectSalidas(store.getState()).find((item) => item.id === button.dataset.editarSalida);
      if (!salida) return;

      const option = Array.from(spSelect.options).find((item) => item.value === salida.subproducto_id);
      if (!option) {
        alertContainer.innerHTML = '<div class="alert alert-danger">No se encontró el subproducto vinculado a esta salida.</div>';
        return;
      }
      salidaEditandoId = salida.id;
      option.disabled = false;
      spSelect.value = salida.subproducto_id;
      document.getElementById('salCantidad').value = salida.cantidad_entregada;
      document.getElementById('salDestino').value = salida.destino;
      document.getElementById('salBeneficiario').value = salida.beneficiario_uso || '';
      document.getElementById('salObservaciones').value = salida.observaciones || '';
      formTitle.textContent = `Editar Salida ${salida.codigo}`;
      submitBtn.textContent = 'Guardar Cambios';
      formCard.style.display = 'block';
      alertContainer.innerHTML = '';
      updateStockDisplay();
      formTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  spSelect?.addEventListener('change', updateStockDisplay);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alertContainer.innerHTML = '';

      const selected = spSelect.options[spSelect.selectedIndex];
      const disp = effectiveAvailable(selected);
      const cant = Number(cantidadInput.value) || 0;
      const unidad = selected?.dataset?.unidad || 'kg';
      const loteId = selected?.dataset?.lote || null;

      if (cant > disp) {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <strong>Error de existencias:</strong> No puede entregar ${cant} ${unidad}. El stock máximo disponible es de ${disp} ${unidad}.
          </div>
        `;
        return;
      }

      const payload = {
        subproducto_id: spSelect.value,
        lote_id: loteId,
        destino: document.getElementById('salDestino').value,
        beneficiario_uso: document.getElementById('salBeneficiario').value.trim(),
        cantidad_entregada: cant,
        unidad,
        responsable_id: 'u_op_001',
        observaciones: document.getElementById('salObservaciones').value.trim() || null
      };

      const result = salidaEditandoId
        ? actualizarSalidaSubproducto(salidaEditandoId, payload)
        : registrarSalidaSubproducto(payload);
      if (result.success) {
        resetFormMode();
      } else {
        alertContainer.innerHTML = `
          <div class="alert alert-danger">
            <strong>Error al registrar salida:</strong>
            <ul style="margin-top: 0.4rem; padding-left: 1.2rem; list-style: disc;">
              ${result.errors.map((err) => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    });
  }
}
