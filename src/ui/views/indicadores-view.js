/**
 * Indicadores View - Dashboard Integral de KPIs Ambientales y Operativos
 * Conforme con las reglas de negocio (Separación de unidades, Real vs Simulado, % Desviación)
 */

import { store } from '../../store/store.js';
import { selectKpiTotals, selectEstimatedTotals, selectRejectionReasons, selectLotProductionSummary, selectStockSummary, selectSolicitudes, selectRecepciones } from '../../store/selectors.js';
import { getTimeRequestToReception } from '../../logic/indicators.js';

export function renderIndicadoresView() {
  const state = store.getState();
  const kpis = selectKpiTotals(state);
  const estimated = selectEstimatedTotals(state);
  const rejections = selectRejectionReasons(state);
  const lotProd = selectLotProductionSummary(state);
  const stock = selectStockSummary(state);
  const solicitudes = selectSolicitudes(state);
  const recepciones = selectRecepciones(state);
  const tiempos = getTimeRequestToReception(solicitudes, recepciones);

  const totalKgRechazo = Object.values(rejections).reduce((a, b) => a + b, 0);

  return `
    <section class="section" id="indicadores-view">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h1 class="section-title" style="margin-bottom:0;">Lo que estamos transformando.</h1>
            <p class="view-subtitle">Un vistazo al material recibido, su aprovechamiento y los resultados de cada proceso.</p>
          </div>
        </div>

        <!-- KPI Grid Principal -->
        <div class="kpi-grid" style="margin-bottom: var(--space-xl);">
          <div class="kpi-card" style="border-left: 5px solid ${kpis.metaCumplida ? 'var(--color-success)' : 'var(--color-danger)'};">
            <div class="kpi-label">% Desviación del Descarte</div>
            <div class="kpi-value ${kpis.metaCumplida ? 'kpi-success' : ''}">${kpis.pctDesviacion}%</div>
            <div class="kpi-meta">
              Meta mínima: ≥ ${kpis.metaDesviacionMinPct}% · 
              <strong style="color: ${kpis.metaCumplida ? '#15803d' : '#b91c1c'};">
                ${kpis.metaCumplida ? '✓ META CUMPLIDA' : '⚠️ POR DEBAJO DE META'}
              </strong>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Biomasa Verificada (Balanza)</div>
            <div class="kpi-value">${kpis.kg.recibidos} <span style="font-size: 1.2rem; font-weight: 500;">kg</span></div>
            <div class="kpi-meta">
              Aceptados: <span style="color: #15803d; font-weight: 600;">${kpis.kg.aceptados} kg</span> | 
              Rechazados: <span style="color: #b91c1c; font-weight: 600;">${kpis.kg.rechazados} kg</span> (${kpis.pctRechazo}%)
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Biomasa Estimada (Planificada)</div>
            <div class="kpi-value">${estimated.estimada_kg} <span style="font-size: 1.2rem; font-weight: 500;">kg</span></div>
            <div class="kpi-meta">
              ${estimated.estimada_m3 > 0 ? `+ ${estimated.estimada_m3} m³ estimados · ` : ''}
              ${estimated.nota}
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Tiempo Solicitud → Recepción</div>
            <div class="kpi-value">${tiempos.promedioDias.toFixed(1)} <span style="font-size: 1.2rem; font-weight: 500;">días</span></div>
            <div class="kpi-meta">Mediana: ${tiempos.medianaDias} d · Rango: ${tiempos.minDias} - ${tiempos.maxDias} días</div>
          </div>
        </div>

        <div class="grid grid-md-2" style="margin-bottom: var(--space-xl); gap: var(--space-lg);">
          <!-- Resumen de Subproductos en Existencia -->
          <article class="card">
            <div class="card-header">
              <h3 class="card-title">Existencias por Unidad (Sin mezclar kg y L)</h3>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-xs);">
              <div style="background: var(--color-blue-bg); padding: var(--space-md); border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                  <strong style="color: var(--color-info); font-size: 1.1rem;">Biol Líquido (L)</strong>
                  <span class="badge badge-info" style="font-size: 1rem;">${stock.L.disponible} L disponibles</span>
                </div>
                <p style="font-size: 0.88rem; color: var(--color-text-secondary);">
                  Total Producido: ${stock.L.producida} L · Entregado a huertos: ${stock.L.destinada} L
                </p>
              </div>

              <div style="background: rgba(34,197,94,0.12); padding: var(--space-md); border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                  <strong style="color: #15803d; font-size: 1.1rem;">Biochar Sólido (kg)</strong>
                  <span class="badge badge-success" style="font-size: 1rem;">${stock.kg.disponible} kg disponibles</span>
                </div>
                <p style="font-size: 0.88rem; color: var(--color-text-secondary);">
                  Total Producido: ${stock.kg.producida} kg · Aplicado en suelos: ${stock.kg.destinada} kg
                </p>
              </div>
            </div>
          </article>

          <!-- Desglose de Motivos de Rechazo -->
          <article class="card">
            <div class="card-header">
              <h3 class="card-title">Desglose de Descarte por Motivo (${totalKgRechazo} kg)</h3>
            </div>
            ${
              Object.keys(rejections).length === 0
                ? `<div class="empty-state" style="padding: 1.5rem;">
                    <p>No se registran descartes ni impropios en las recepciones.</p>
                  </div>`
                : `
                <div style="display: flex; flex-direction: column; gap: var(--space-xs); margin-top: var(--space-xs);">
                  ${Object.entries(rejections).map(([motivo, kg]) => {
                    const pct = totalKgRechazo > 0 ? ((kg / totalKgRechazo) * 100).toFixed(1) : 0;
                    return `
                      <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.92rem;">
                          <span style="text-transform: capitalize; font-weight: 600;">${motivo.replace(/_/g, ' ')}</span>
                          <span><strong>${kg} kg</strong> (${pct}%)</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: var(--color-gray-bg); border-radius: 999px; overflow: hidden;">
                          <div style="width: ${pct}%; height: 100%; background: var(--color-danger); border-radius: 999px;"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `
            }
          </article>
        </div>

        <!-- Tabla de Producción por Lote: Real vs Simulado -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Producción Acumulada por Lote (Trazabilidad Real / Simulado)</h3>
          </div>
          ${
            lotProd.length === 0
              ? `<div class="empty-state">
                  <p>No hay lotes en seguimiento registrados.</p>
                </div>`
              : `
              <div class="table-wrap" data-responsive="table">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Código Lote</th>
                      <th>Biol Producido (L)</th>
                      <th>Biogás (m³)</th>
                      <th>Biochar (kg)</th>
                      <th>Tipo de Medición</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lotProd.map((lp) => `
                      <tr>
                        <td><strong>${lp.codigo}</strong></td>
                        <td>${lp.litros_biol_total} L</td>
                        <td>${lp.m3_biogas_total} m³</td>
                        <td>${lp.kg_biochar_total} kg</td>
                        <td>
                          <span class="badge ${lp.real ? 'badge-success' : lp.simulado ? 'badge-warning' : 'badge-info'}">
                            ${lp.real ? '✓ Medición Real' : lp.simulado ? '⚙️ Simulado' : 'Mixto'}
                          </span>
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
