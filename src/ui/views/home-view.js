/**
 * Home View - Hero, Catálogo de Materiales Aceptados, Simulador Interactivo y KPIs Resumen
 */

import { store } from '../../store/store.js';
import { selectActivePublicMaterials, selectKpiTotals, selectStockSummary, selectCapacidad } from '../../store/selectors.js';
import { renderBiodigestorSimulator, startTelemetryTicker } from '../components/biodigestor-sim.js';
import { initInteractiveMap } from '../components/interactive-map.js?v=3.1';

export function renderHomeView() {
  const state = store.getState();
  const materiales = selectActivePublicMaterials(state);
  const kpis = selectKpiTotals(state);
  const stock = selectStockSummary(state);
  const capacidad = selectCapacidad(state);

  return `
    <section class="hero" id="inicio">
      <div class="container">
        <div class="hero-content">
          ${
            capacidad.recepciones_pausadas
              ? `<div class="alert alert-warning">
                  <strong>⚠️ Recepciones temporalmente pausadas:</strong> ${capacidad.motivo_pausa || 'Mantenimiento del centro.'}
                </div>`
              : ''
          }
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
            <span class="led-badge">
              <span class="led-dot"></span> Planta Piloto Operativa
            </span>
            <span style="font-size: 0.85rem; color: var(--color-text-secondary);">Economía Circular Urbana</span>
          </div>
          <h1 class="hero-title">Centro Comunitario de Aprovechamiento de Biomasa Vegetal</h1>
          <p class="hero-subtitle">Transformación comunitaria de restos orgánicos urbanos y poda en Biogás, Biol fertilizante y Biochar mejorador de suelo.</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-block-sm btn-ripple" href="#solicitudes">Tengo material disponible</a>
            <a class="btn btn-outline btn-block-sm btn-ripple" href="#recepcion">Registrar Recepción y Triaje</a>
            <a class="btn btn-outline btn-block-sm btn-ripple" href="#materiales">Qué podemos recibir</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Simulated Biodigestor & Pyrolysis System -->
    <section class="section" id="simulador-proceso" style="padding-top: var(--space-lg); padding-bottom: var(--space-lg);">
      <div class="container">
        ${renderBiodigestorSimulator()}
      </div>
    </section>

    <section class="section" id="materiales">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h2 class="section-title" style="margin-bottom:0;">Materiales aceptados en el centro</h2>
            <p class="view-subtitle">Categorías autorizadas según balance de humedad y dureza.</p>
          </div>
        </div>
        
        <div class="grid grid-md-2 grid-lg-3">
          ${materiales.map((m) => `
            <article class="card ${m.protagonista ? 'card-featured' : ''}" style="${m.protagonista ? 'border-color: var(--color-primary); box-shadow: 0 4px 14px rgba(58,154,64,0.18);' : ''}">
              <div class="card-header">
                <h3 class="card-title">${m.nombre}</h3>
                <span class="badge ${m.protagonista ? 'badge-success' : 'badge-info'}">
                  ${m.protagonista ? '★ Prioritario' : 'Aceptado'}
                </span>
              </div>
              <p class="card-text">${m.descripcion}</p>
              <div style="margin-top: auto; padding-top: 0.5rem; font-size: 0.85rem; color: var(--color-text-secondary);">
                Ruta: <strong>${m.tipo_biomasa === 'dura' ? 'Seco / Duro → Triturado → Pirólisis Biochar' : 'Húmedo / Blando → Biodigestor (Biol + Biogás)'}</strong>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="section" id="indicadores-resumen">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h2 class="section-title" style="margin-bottom:0;">Métricas de Impacto Ambiental</h2>
            <p class="view-subtitle">Calculadas en tiempo real desde los registros de triaje y producción.</p>
          </div>
          <a class="btn btn-outline" href="#indicadores" style="padding: 0.5rem 1.2rem; font-size: 0.9rem;">Ver reporte completo &rarr;</a>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">% Desviación del descarte</div>
            <div class="kpi-value ${kpis.metaCumplida ? 'kpi-success' : ''}">${kpis.pctDesviacion}%</div>
            <div class="kpi-meta">Meta mínima: &ge; ${kpis.metaDesviacionMinPct}% (${kpis.metaCumplida ? 'Cumplida' : 'Requiere mejora'})</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Biomasa Verificada</div>
            <div class="kpi-value">${kpis.kg.recibidos} <span style="font-size: 1.2rem; font-weight: 500;">kg</span></div>
            <div class="kpi-meta">Aceptados: ${kpis.kg.aceptados} kg | Rechazados: ${kpis.kg.rechazados} kg</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Biol Disponible</div>
            <div class="kpi-value">${stock.L.disponible} <span style="font-size: 1.2rem; font-weight: 500;">L</span></div>
            <div class="kpi-meta">Fertilizante orgánico líquido (Biodigestor)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Biochar Disponible</div>
            <div class="kpi-value">${stock.kg.disponible} <span style="font-size: 1.2rem; font-weight: 500;">kg</span></div>
            <div class="kpi-meta">Enmienda de suelo (Pirólisis Kon-Tiki)</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="ubicacion">
      <div class="container">
        <div class="view-header">
          <div class="view-title-group">
            <h2 class="section-title" style="margin-bottom:0;">Ubicación y Operaciones en Campo</h2>
            <p class="view-subtitle">Centro Comunitario de Aprovechamiento de Biomasa Vegetal &middot; Masaya, Nicaragua</p>
          </div>
        </div>

        <div class="map-interactive-container">
          <div id="map"></div>
          <div class="map-status-overlay">
            <span class="led-dot"></span> Operación: Centro Activo
          </div>
        </div>
      </div>
    </section>
  `;
}

export function attachHomeEvents() {
  startTelemetryTicker();
  initInteractiveMap('map');
}
