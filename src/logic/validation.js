/**
 * Validations - Reception + Classification (Triage)
 * Cases A-D. No automatic process assignment.
 * Pure validation without mutating arguments.
 */

import { MEDIDA_TIPO, MOTIVOS_RECHAZO, TIPO_BIOMASA, CONTAMINACION, HUMEDAD, TAMANO } from './constants.js';

export function validateReception(recepcion = {}) {
  const errors = [];
  const cantidad = recepcion.cantidad || {};
  const rechazo = recepcion.rechazo || {};
  const clasificacion = recepcion.clasificacion || {};

  if (!recepcion.solicitud_id) errors.push('Reception must be linked to a request (solicitud_id).');
  if (!recepcion.fecha_recepcion) errors.push('Reception date/time is required.');
  if (!recepcion.responsable_id) errors.push('Responsible (responsable_id) is required.');

  if (cantidad.recibida_kg === undefined || cantidad.recibida_kg === null || isNaN(cantidad.recibida_kg)) {
    errors.push('Received quantity (cantidad.recibida_kg) is required.');
  } else if (Number(cantidad.recibida_kg) < 0) {
    errors.push('Received quantity cannot be negative.');
  }

  if (cantidad.aceptada_kg === undefined || cantidad.aceptada_kg === null || isNaN(cantidad.aceptada_kg)) {
    errors.push('Accepted quantity (cantidad.aceptada_kg) is required.');
  } else if (Number(cantidad.aceptada_kg) < 0) {
    errors.push('Accepted quantity cannot be negative.');
  }

  if (cantidad.rechazada_kg === undefined || cantidad.rechazada_kg === null || isNaN(cantidad.rechazada_kg)) {
    errors.push('Rejected quantity (cantidad.rechazada_kg) is required.');
  } else if (Number(cantidad.rechazada_kg) < 0) {
    errors.push('Rejected quantity cannot be negative.');
  }

  if (!cantidad.medida_tipo || !Object.values(MEDIDA_TIPO).includes(cantidad.medida_tipo)) {
    errors.push('Measurement type (medida_tipo) must be "pesada" or "estimada".');
  }
  if (!cantidad.unidad_recibida) {
    errors.push('Received unit (unidad_recibida) is required (kg|m3).');
  }

  const sumAceptRech = (Number(cantidad.aceptada_kg) || 0) + (Number(cantidad.rechazada_kg) || 0);
  const recib = Number(cantidad.recibida_kg) || 0;
  if (sumAceptRech > recib + 0.0001) {
    errors.push('Accepted + Rejected cannot be greater than Received quantity.');
  }

  const rechKg = Number(cantidad.rechazada_kg) || 0;
  if (rechKg > 0) {
    if (!rechazo.motivos || !Array.isArray(rechazo.motivos) || rechazo.motivos.length === 0) {
      errors.push('If rejected quantity > 0, at least one rejection reason is required.');
    }
    if (rechazo.motivos?.includes(MOTIVOS_RECHAZO.OTRO) && (!rechazo.motivo_otro || rechazo.motivo_otro.trim() === '')) {
      errors.push('If "otro" reason is selected, motivo_otro is required.');
    }
  }

  if (!clasificacion.tipo_biomasa || !Object.values(TIPO_BIOMASA).includes(clasificacion.tipo_biomasa)) {
    errors.push('Biomass type (tipo_biomasa) is required: blanda | dura | mezcla.');
  }
  if (!clasificacion.tamano || !Object.values(TAMANO).includes(clasificacion.tamano)) {
    errors.push('Size (tamano) is required: fino | mediano | grueso.');
  }
  if (!clasificacion.humedad || !Object.values(HUMEDAD).includes(clasificacion.humedad)) {
    errors.push('Humidity (humedad) is required: baja | media | alta.');
  }
  if (!clasificacion.contaminacion || !Object.values(CONTAMINACION).includes(clasificacion.contaminacion)) {
    errors.push('Contamination (contaminacion) is required: ninguna | leve | moderada | alta.');
  }

  return { valid: errors.length === 0, errors };
}

export function normalizeReception(raw = {}) {
  const cantidad = raw.cantidad || {};
  const rechKg = Number(cantidad.rechazada_kg) || 0;
  const motivos = Array.isArray(raw.rechazo?.motivos) ? [...raw.rechazo.motivos] : [];

  return {
    ...raw,
    cantidad: {
      ...cantidad,
      recibida_kg: Number(cantidad.recibida_kg) || 0,
      aceptada_kg: Number(cantidad.aceptada_kg) || 0,
      rechazada_kg: rechKg,
      medida_tipo: cantidad.medida_tipo || MEDIDA_TIPO.PESADA,
      unidad_recibida: cantidad.unidad_recibida || 'kg'
    },
    rechazo: {
      ...raw.rechazo,
      tiene_rechazo: rechKg > 0,
      justificado: rechKg > 0 && motivos.length > 0,
      motivos,
      motivo_otro: raw.rechazo?.motivo_otro || null
    },
    clasificacion: {
      ...raw.clasificacion,
      asignacion_automatica_proceso: false,
      proceso_decidido_manualmente: true
    }
  };
}

export function validateSolicitud(solicitud = {}) {
  const errors = [];
  const entrega = solicitud.entrega || {};
  const cantidad = solicitud.cantidad || {};

  if (cantidad.estimada_kg === undefined || cantidad.estimada_kg === null || isNaN(cantidad.estimada_kg)) {
    errors.push('Estimated quantity (cantidad.estimada_kg) is required.');
  } else if (Number(cantidad.estimada_kg) < 0) {
    errors.push('Estimated quantity cannot be negative.');
  }
  if (!cantidad.unidad_estimada) errors.push('Estimated unit (unidad_estimada) is required (kg|m3).');

  if (entrega.modalidad === 'recogida' && !entrega.recogida_habilitada) {
    errors.push('Pick-up (recogida) can only be offered when recogida_habilitada is true.');
  }
  if (entrega.modalidad === 'recogida' && !entrega.direccion) {
    errors.push('Address is required for pick-up modality.');
  }
  return { valid: errors.length === 0, errors };
}

export function isValidMotivoRechazo(motivos = []) {
  if (!Array.isArray(motivos) || motivos.length === 0) return false;
  return motivos.every(m => Object.values(MOTIVOS_RECHAZO).includes(m));
}
