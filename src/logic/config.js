/**
 * Config/Admin rules
 * Process conditions, enable/disable with confirmation, pause requires reason
 * Updated for pyrolysis+biochar flow
 */

import { ESTADO_MATERIAL } from './constants.js';

export function canToggleMaterialState(material = {}, nuevoEstado) {
  const cambios = [];
  if (material.estado !== nuevoEstado) cambios.push({ campo: 'estado', anterior: material.estado, nuevo: nuevoEstado });
  return { permitido: true, cambios, requiereConfirmacion: true };
}

export function validateMaterialActivation(material = {}) {
  const errors = [];
  if (!material.nombre) errors.push('Material name is required.');
  if (!material.estado) errors.push('Material state is required.');
  return { valid: errors.length === 0, errors };
}

export function canPauseReceptions(configCentro = {}) {
  const pausadas = !!configCentro.recepciones_pausadas;
  if (pausadas) {
    const motivo = (configCentro.motivo_pausa || '').trim();
    return { permitido: motivo.length > 0, requiereMotivo: true, motivoVacio: motivo.length === 0 };
  }
  return { permitido: true, requiereMotivo: false };
}

export function setReceptionsPaused(configCentro = {}, paused, motivo = '') {
  const isPaused = !!paused;
  if (isPaused) {
    const m = (motivo || '').trim();
    if (m.length === 0) {
      return { ok: false, error: 'Motivo de pausa is required when pausing receptions.', configCentro };
    }
    return {
      ok: true,
      configCentro: {
        ...configCentro,
        recepciones_pausadas: true,
        motivo_pausa: m
      }
    };
  }
  return {
    ok: true,
    configCentro: {
      ...configCentro,
      recepciones_pausadas: false,
      motivo_pausa: null
    }
  };
}

export function isCategoryPublicActive(mat = {}) {
  return mat.estado === ESTADO_MATERIAL.ACEPTADO && !!mat.mostrar_inicio_publico && !!mat.activo;
}

export function getPublicMaterials(catalogo = []) {
  return (catalogo || []).filter(isCategoryPublicActive).sort((a, b) => (a.orden || 0) - (b.orden || 0));
}

export function validateProcessConfig(proc = {}) {
  const errors = [];
  if (!proc.nombre) errors.push('Process name is required.');
  if (!proc.clave) errors.push('Process key (clave) is required.');
  if (!Array.isArray(proc.etapas) || proc.etapas.length === 0) errors.push('Process must have at least one stage.');
  return { valid: errors.length === 0, errors };
}
