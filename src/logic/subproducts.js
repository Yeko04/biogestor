/**
 * Subproducts logic - Stock control
 * Never allow output > available. disponible = producido - destinado
 */

import { UNIDADES, CONDICION_CALIDAD } from './constants.js';

export function createEmptySubproduct() {
  return {
    id: `sp_${Date.now().toString(36)}`,
    codigo: 'SP-000',
    lote_id: null,
    lote_codigo: null,
    tipo: null,
    tipo_otro: null,
    fecha_obtencion: new Date().toISOString(),
    cantidad_producida: 0,
    unidad: UNIDADES.KG,
    cantidad_disponible: 0,
    cantidad_destinada: 0,
    condicion_calidad: CONDICION_CALIDAD.PENDIENTE_DE_EVALUACION,
    responsable_id: null,
    observaciones: null,
    simulado: false,
    salidas_ids: []
  };
}

export function recalcSubproductStock(sp = {}) {
  const prod = Number(sp.cantidad_producida) || 0;
  const dest = Number(sp.cantidad_destinada) || 0;
  let disp = prod - dest;
  if (disp < 0) disp = 0;
  sp.cantidad_destinada = Math.max(0, dest);
  sp.cantidad_producida = Math.max(0, prod);
  sp.cantidad_disponible = disp;
  return sp;
}

export function canCreateOutput(sp = {}, cantidadEntregar = 0) {
  const disp = Number(sp.cantidad_disponible) || 0;
  const ce = Number(cantidadEntregar) || 0;
  if (ce <= 0) return { ok: false, reason: 'Quantity to deliver must be > 0.' };
  if (ce > disp + 1e-9) return { ok: false, reason: 'Cannot deliver more than available (cantidad_disponible).', disp };
  return { ok: true, disp };
}

export function applyOutput(sp = {}, cantidadEntregar = 0) {
  const check = canCreateOutput(sp, cantidadEntregar);
  if (!check.ok) return { ok: false, ...check, subproduct: sp };
  const ce = Number(cantidadEntregar) || 0;
  sp.cantidad_destinada = (Number(sp.cantidad_destinada) || 0) + ce;
  recalcSubproductStock(sp);
  return { ok: true, subproduct: sp };
}

export function validateSubproduct(sp = {}) {
  const errors = [];
  if (!sp.lote_id) errors.push('Subproduct must be linked to a lot (lote_id).');
  if (!sp.tipo) errors.push('Subproduct type (tipo) is required.');
  if (sp.cantidad_producida < 0) errors.push('cantidad_producida cannot be negative.');
  if (sp.cantidad_disponible < 0) errors.push('cantidad_disponible cannot be negative.');
  if (sp.cantidad_destinada < 0) errors.push('cantidad_destinada cannot be negative.');
  if (sp.unidad !== UNIDADES.KG && sp.unidad !== UNIDADES.LITROS) {
    errors.push('unidad must be kg or L.');
  }
  if (typeof sp.simulado !== 'boolean') errors.push('simulado must be boolean.');
  recalcSubproductStock(sp);
  return { valid: errors.length === 0, errors, subproduct: sp };
}

export function validateSalida(salida = {}) {
  const errors = [];
  if (!salida.subproducto_id) errors.push('Output must be linked to a subproduct (subproducto_id).');
  if (!salida.lote_id) errors.push('Output must be linked to a lot (lote_id).');
  if (!salida.destino) errors.push('Destination (destino) is required.');
  if (!salida.beneficiario_uso || salida.beneficiario_uso.trim() === '') {
    errors.push('Beneficiary/use (beneficiario_uso) is required.');
  }
  if (!salida.fecha_salida) errors.push('Output date (fecha_salida) is required.');
  if (!salida.responsable_id) errors.push('Responsible (responsable_id) is required.');
  if ((Number(salida.cantidad_entregada) || 0) <= 0) {
    errors.push('cantidad_entregada must be > 0.');
  }
  if (salida.unidad !== UNIDADES.KG && salida.unidad !== UNIDADES.LITROS) {
    errors.push('unidad must be kg or L.');
  }
  return { valid: errors.length === 0, errors };
}
