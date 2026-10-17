/**
 * Lots logic - Agrupación, estados, seguimientos (Real/Simulado)
 * Húmedo/Blando -> Biodigestor | Seco/Duro -> Triturado/Machecado -> Pirólisis -> Biochar
 */

import { ESTADOS_LOTE, ETAPAS_SEGUIMIENTO, UMBRALES } from './constants.js';
import { generateId } from './id.js';

export function createEmptyLotComposition() {
  return {
    blanda_kg: 0,
    dura_kg: 0,
    mezcla_kg: 0,
    aceptada_total_kg: 0,
    rechazada_total_kg: 0,
    perdidas_estimadas_kg: 0,
    disponible_aprovechamiento_kg: 0
  };
}

export function computeLotComposition(recepciones = []) {
  const comp = createEmptyLotComposition();
  for (const r of recepciones) {
    const c = r.clasificacion || {};
    const cant = r.cantidad || {};
    const t = c.tipo_biomasa;
    const akg = Number(cant.aceptada_kg) || 0;
    const rkg = Number(cant.rechazada_kg) || 0;
    if (t === 'blanda') comp.blanda_kg += akg;
    if (t === 'dura') comp.dura_kg += akg;
    if (t === 'mezcla') comp.mezcla_kg += akg;
    comp.aceptada_total_kg += akg;
    comp.rechazada_total_kg += rkg;
  }
  comp.disponible_aprovechamiento_kg = Math.max(0, comp.aceptada_total_kg - comp.perdidas_estimadas_kg);
  return comp;
}

export function updateLotLossesFromFollowUps(lote = {}) {
  const s = lote.seguimientos || [];
  let totalLoss = 0;
  for (const f of s) {
    totalLoss += Number(f.perdidas_estimadas_kg) || 0;
  }
  const composicion = lote.composicion ? { ...lote.composicion } : createEmptyLotComposition();
  composicion.perdidas_estimadas_kg = totalLoss;
  const acc = composicion.aceptada_total_kg || 0;
  composicion.disponible_aprovechamiento_kg = Math.max(0, acc - totalLoss);
  return {
    ...lote,
    composicion
  };
}

export function canAdvanceState(currentState, nextState) {
  const order = [
    ESTADOS_LOTE.CREADO,
    ESTADOS_LOTE.CLASIFICADO,
    ESTADOS_LOTE.ASIGNADO,
    ESTADOS_LOTE.EN_TRATAMIENTO,
    ESTADOS_LOTE.PENDIENTE_DE_EVALUACION,
    ESTADOS_LOTE.DISPONIBLE,
    ESTADOS_LOTE.DESTINADO
  ];
  const i = order.indexOf(currentState);
  const j = order.indexOf(nextState);
  if (i < 0 || j < 0) return false;
  return j >= i;
}

export function createFollowUpBase() {
  return {
    id: generateId('seg'),
    fecha: new Date().toISOString(),
    responsable_id: null,
    etapa: ETAPAS_SEGUIMIENTO.EN_TRATAMIENTO,
    etapa_otro: null,
    estado_resultante: ESTADOS_LOTE.EN_TRATAMIENTO,
    descripcion: null,
    datos_etapa: {
      ph_biol: null,
      litros_biol: 0,
      m3_biogas: 0,
      kg_biochar: 0,
      kg_mezcla_biol_biochar: 0,
      masa_triturada_kg: 0
    },
    medicion: {
      real: true,
      simulado: false
    },
    perdidas_estimadas_kg: 0,
    observaciones: null,
    foto_url: null
  };
}

export function validateFollowUp(followUp = {}) {
  const errors = [];
  const d = followUp.datos_etapa || {};
  const m = followUp.medicion || {};

  if (typeof m.real !== 'boolean') errors.push('medicion.real is required (boolean).');
  if (typeof m.simulado !== 'boolean') errors.push('medicion.simulado is required (boolean).');
  if (m.real === m.simulado) errors.push('medicion.real and medicion.simulado must be opposite (one true, other false).');

  if (followUp.etapa === ETAPAS_SEGUIMIENTO.EN_BIODIGESTOR) {
    if (d.ph_biol !== null && d.ph_biol !== undefined) {
      if (d.ph_biol < 0 || d.ph_biol > 14) errors.push('ph_biol must be between 0 and 14.');
    }
    if (d.litros_biol < 0) errors.push('litros_biol cannot be negative.');
    if (d.m3_biogas < 0) errors.push('m3_biogas cannot be negative.');
  }

  if (d.masa_triturada_kg < 0) errors.push('masa_triturada_kg cannot be negative.');
  if (d.kg_biochar < 0) errors.push('kg_biochar cannot be negative.');
  if (d.kg_mezcla_biol_biochar < 0) errors.push('kg_mezcla_biol_biochar cannot be negative.');
  if ((followUp.perdidas_estimadas_kg || 0) < 0) errors.push('perdidas_estimadas_kg cannot be negative.');

  return { valid: errors.length === 0, errors };
}

export function isPhBiolInReference(ph = null) {
  if (ph === null || ph === undefined) return null;
  return ph >= UMBRALES.PH_BIOL_MIN && ph <= UMBRALES.PH_BIOL_MAX;
}
