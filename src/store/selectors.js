/**
 * Store Selectors - Pure computed queries for UI and Domain logic
 */

import { getVerifiedTotals, getEstimatedTotals, getRejectionByReason, getProductionByLot, getSubproductsStock } from '../logic/indicators.js';
import { getPublicMaterials } from '../logic/config.js';
import { getActiveProcesses } from '../logic/processes.js';

// Base collection selectors
export function selectCollections(state) {
  return state?.collections || {};
}

export function selectUsuarios(state) {
  return selectCollections(state).usuarios || [];
}

export function selectSolicitudes(state) {
  return selectCollections(state).solicitudes || [];
}

export function selectRecepciones(state) {
  return selectCollections(state).recepciones || [];
}

export function selectLotes(state) {
  return selectCollections(state).lotes || [];
}

export function selectSubproductos(state) {
  return selectCollections(state).subproductos || [];
}

export function selectSalidas(state) {
  return selectCollections(state).salidas_subproductos || [];
}

// Config selectors
export function selectConfig(state) {
  return state?.config || {};
}

export function selectCentro(state) {
  return selectConfig(state).centro || {};
}

export function selectCapacidad(state) {
  return selectConfig(state).capacidad || {};
}

export function selectCatalogoMateriales(state) {
  return selectConfig(state).catalogo_materiales || [];
}

export function selectProcesos(state) {
  return selectConfig(state).procesos || [];
}

export function selectBitacora(state) {
  return selectConfig(state).bitacora_cambios || [];
}

// Filtered & Computed Domain Selectors
export function selectActivePublicMaterials(state) {
  return getPublicMaterials(selectCatalogoMateriales(state));
}

export function selectAvailableProcesses(state) {
  return getActiveProcesses(selectProcesos(state));
}

export function selectKpiTotals(state) {
  return getVerifiedTotals(selectRecepciones(state));
}

export function selectEstimatedTotals(state) {
  return getEstimatedTotals(selectSolicitudes(state));
}

export function selectRejectionReasons(state) {
  return getRejectionByReason(selectRecepciones(state));
}

export function selectLotProductionSummary(state) {
  return getProductionByLot(selectLotes(state));
}

export function selectStockSummary(state) {
  return getSubproductsStock(selectSubproductos(state));
}

// Single Item Selectors by ID
export function selectSolicitudById(state, id) {
  return selectSolicitudes(state).find((s) => s.id === id) || null;
}

export function selectRecepcionById(state, id) {
  return selectRecepciones(state).find((r) => r.id === id) || null;
}

export function selectLoteById(state, id) {
  return selectLotes(state).find((l) => l.id === id) || null;
}

export function selectSubproductoById(state, id) {
  return selectSubproductos(state).find((sp) => sp.id === id) || null;
}
