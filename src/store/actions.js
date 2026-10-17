/**
 * Domain Store Actions - Dispatches validated mutations to the central Store
 */

import { store } from './store.js';
import { generateId, generateCode } from '../logic/id.js';
import { validateSolicitud, validateReception, normalizeReception } from '../logic/validation.js';
import { computeLotComposition, updateLotLossesFromFollowUps, validateFollowUp, createFollowUpBase, canAdvanceState } from '../logic/lots.js';
import { validateSubproduct, validateSalida, applyOutput } from '../logic/subproducts.js';
import { setReceptionsPaused } from '../logic/config.js';
import { exportJson, importJson } from '../storage/localstore.js';
import { ESTADOS_SOLICITUD, ESTADOS_LOTE } from '../logic/constants.js';

function addAuditLog(state, accion, entidad, detalle, usuarioId = 'u_op_001') {
  const log = {
    id: generateId('bit'),
    fecha: new Date().toISOString(),
    usuario_id: usuarioId,
    entidad,
    accion,
    detalle
  };
  return [log, ...(state.config?.bitacora_cambios || [])];
}

// ----------------------------------------------------------------------
// SOLICITUDES
// ----------------------------------------------------------------------
export function crearSolicitud(payload) {
  const data = {
    ...payload,
    fecha_creacion: payload.fecha_creacion || new Date().toISOString(),
    cantidad: {
      estimada_kg: Number(payload.cantidad?.estimada_kg) || 0,
      unidad_estimada: payload.cantidad?.unidad_estimada || 'kg',
      fecha_generacion: payload.cantidad?.fecha_generacion || new Date().toISOString().slice(0, 10),
      fecha_disponibilidad: payload.cantidad?.fecha_disponibilidad || new Date().toISOString().slice(0, 10),
      hora_disponibilidad: payload.cantidad?.hora_disponibilidad || '08:00'
    }
  };

  const validation = validateSolicitud(data);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const state = store.getState();
  const solicitudes = state.collections.solicitudes || [];
  const count = solicitudes.length + 1;
  const id = generateId('sol');
  const codigo = generateCode('SOL', count);

  const nuevaSolicitud = {
    id,
    codigo,
    usuario_id: payload.usuario_id || 'u_gen_001',
    generador: {
      nombre_establecimiento: payload.generador?.nombre_establecimiento || 'Establecimiento no especificado',
      tipo_generador: payload.generador?.tipo_generador || 'otros',
      nombre_contacto: payload.generador?.nombre_contacto || '',
      telefono: payload.generador?.telefono || ''
    },
    material: {
      categoria_id: payload.material?.categoria_id || 'mat_001',
      categoria_nombre: payload.material?.categoria_nombre || 'Material general',
      descripcion: payload.material?.descripcion || ''
    },
    cantidad: data.cantidad,
    condiciones: {
      humedad: payload.condiciones?.humedad || 'media',
      tamano: payload.condiciones?.tamano || 'mediano',
      separacion: payload.condiciones?.separacion || 'si',
      almacenamiento: payload.condiciones?.almacenamiento || 'cubierto',
      presencia_impropios: !!payload.condiciones?.presencia_impropios,
      impropios_especificar: payload.condiciones?.impropios_especificar || null
    },
    entrega: {
      modalidad: payload.entrega?.modalidad || 'entrega_propia',
      recogida_habilitada: !!payload.entrega?.recogida_habilitada,
      direccion: payload.entrega?.direccion || '',
      coordenadas: payload.entrega?.coordenadas || { lat: 0, lng: 0 },
      observaciones_acceso: payload.entrega?.observaciones_acceso || null,
      foto_url: payload.entrega?.foto_url || null
    },
    estado: payload.estado || ESTADOS_SOLICITUD.ENVIADA,
    responsable_id: payload.responsable_id || null,
    horario_acordado: payload.horario_acordado || null,
    orden_visita: payload.orden_visita || 0,
    observaciones_centro: payload.observaciones_centro || null,
    rechazo: { motivo: null, detalle: null },
    historial_cambios: [
      { fecha: new Date().toISOString(), usuario_id: payload.usuario_id || 'u_gen_001', accion: 'crear_solicitud' }
    ],
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    recepcion_id: null,
    tiene_recepcion: false
  };

  store.setState((prev) => ({
    ...prev,
    collections: {
      ...prev.collections,
      solicitudes: [nuevaSolicitud, ...solicitudes]
    },
    config: {
      ...prev.config,
      bitacora_cambios: addAuditLog(prev, 'crear', 'solicitudes', `Solicitud ${codigo} creada.`, nuevaSolicitud.usuario_id)
    }
  }), 'CREAR_SOLICITUD');

  return { success: true, data: nuevaSolicitud };
}

export function actualizarEstadoSolicitud(solicitudId, nuevoEstado, observaciones = null, usuarioId = 'u_op_001') {
  const state = store.getState();
  const solicitudes = state.collections.solicitudes || [];
  const index = solicitudes.findIndex((s) => s.id === solicitudId);

  if (index === -1) {
    return { success: false, errors: ['Solicitud no encontrada.'] };
  }

  const target = solicitudes[index];
  const updated = {
    ...target,
    estado: nuevoEstado,
    observaciones_centro: observaciones !== null ? observaciones : target.observaciones_centro,
    fecha_actualizacion: new Date().toISOString(),
    historial_cambios: [
      { fecha: new Date().toISOString(), usuario_id: usuarioId, accion: `cambio_estado_${nuevoEstado}` },
      ...(target.historial_cambios || [])
    ]
  };

  const nextSolicitudes = [...solicitudes];
  nextSolicitudes[index] = updated;

  store.setState((prev) => ({
    ...prev,
    collections: { ...prev.collections, solicitudes: nextSolicitudes },
    config: {
      ...prev.config,
      bitacora_cambios: addAuditLog(prev, 'cambiar_estado', 'solicitudes', `Solicitud ${target.codigo} cambió a ${nuevoEstado}.`, usuarioId)
    }
  }), 'ACTUALIZAR_ESTADO_SOLICITUD');

  return { success: true, data: updated };
}

// ----------------------------------------------------------------------
// RECEPCIONES & TRIAJE
// ----------------------------------------------------------------------
export function registrarRecepcion(payload) {
  const data = {
    ...payload,
    fecha_recepcion: payload.fecha_recepcion || new Date().toISOString(),
    responsable_id: payload.responsable_id || 'u_op_001'
  };

  const validation = validateReception(data);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const normalized = normalizeReception(data);
  const state = store.getState();
  const recepciones = state.collections.recepciones || [];
  const count = recepciones.length + 1;
  const id = generateId('rec');
  const codigo = generateCode('REC', count);

  const nuevaRecepcion = {
    ...normalized,
    id,
    codigo,
    lote_id: null
  };

  // Update corresponding request
  const solicitudes = (state.collections.solicitudes || []).map((sol) => {
    if (sol.id === nuevaRecepcion.solicitud_id) {
      return {
        ...sol,
        estado: ESTADOS_SOLICITUD.RECIBIDA,
        recepcion_id: id,
        tiene_recepcion: true,
        fecha_actualizacion: new Date().toISOString(),
        historial_cambios: [
          { fecha: new Date().toISOString(), usuario_id: nuevaRecepcion.responsable_id, accion: 'recepcion_registrada' },
          ...(sol.historial_cambios || [])
        ]
      };
    }
    return sol;
  });

  store.setState((prev) => ({
    ...prev,
    collections: {
      ...prev.collections,
      recepciones: [nuevaRecepcion, ...recepciones],
      solicitudes
    },
    config: {
      ...prev.config,
      bitacora_cambios: addAuditLog(prev, 'crear', 'recepciones', `Recepción ${codigo} vinculada a solicitud ${nuevaRecepcion.solicitud_id}.`, nuevaRecepcion.responsable_id)
    }
  }), 'REGISTRAR_RECEPCION');

  return { success: true, data: nuevaRecepcion };
}

// ----------------------------------------------------------------------
// LOTES & SEGUIMIENTO
// ----------------------------------------------------------------------
export function crearLote({ nombre, proceso_id, recepciones_ids = [], responsable_id = 'u_op_001' }) {
  if (!nombre || !nombre.trim()) {
    return { success: false, errors: ['El nombre del lote es obligatorio.'] };
  }
  if (!proceso_id) {
    return { success: false, errors: ['Debe seleccionar un proceso para el lote.'] };
  }
  if (!Array.isArray(recepciones_ids) || recepciones_ids.length === 0) {
    return { success: false, errors: ['Debe asociar al menos una recepción al lote para mantener la trazabilidad.'] };
  }

  const state = store.getState();
  const recepcionesDisponibles = (state.collections.recepciones || []).filter((r) => recepciones_ids.includes(r.id));

  if (recepcionesDisponibles.length !== recepciones_ids.length) {
    return { success: false, errors: ['Una o más recepciones seleccionadas no existen en el sistema.'] };
  }

  const composicion = computeLotComposition(recepcionesDisponibles);
  const lotes = state.collections.lotes || [];
  const count = lotes.length + 1;
  const id = generateId('lot');
  const codigo = generateCode('LOTE', count);

  const nuevoLote = {
    id,
    codigo,
    nombre: nombre.trim(),
    proceso_id,
    estado: ESTADOS_LOTE.ASIGNADO,
    recepciones_ids: [...recepciones_ids],
    fecha_creacion: new Date().toISOString(),
    responsable_id,
    composicion,
    seguimientos: []
  };

  // Mark selected recepciones with lote_id
  const updatedRecepciones = (state.collections.recepciones || []).map((rec) => {
    if (recepciones_ids.includes(rec.id)) {
      return { ...rec, lote_id: id };
    }
    return rec;
  });

  store.setState((prev) => ({
    ...prev,
    collections: {
      ...prev.collections,
      lotes: [nuevoLote, ...lotes],
      recepciones: updatedRecepciones
    },
    config: {
      ...prev.config,
      bitacora_cambios: addAuditLog(prev, 'crear', 'lotes', `Lote ${codigo} (${nuevoLote.nombre}) creado con ${recepciones_ids.length} recepciones.`, responsable_id)
    }
  }), 'CREAR_LOTE');

  return { success: true, data: nuevoLote };
}

export function registrarSeguimientoLote(loteId, seguimientoPayload) {
  const state = store.getState();
  const lotes = state.collections.lotes || [];
  const index = lotes.findIndex((l) => l.id === loteId);

  if (index === -1) {
    return { success: false, errors: ['Lote no encontrado.'] };
  }

  const base = createFollowUpBase();
  const followUp = {
    ...base,
    ...seguimientoPayload,
    id: generateId('seg'),
    fecha: seguimientoPayload.fecha || new Date().toISOString(),
    datos_etapa: {
      ...base.datos_etapa,
      ...(seguimientoPayload.datos_etapa || {})
    },
    medicion: {
      ...base.medicion,
      ...(seguimientoPayload.medicion || {})
    }
  };

  const validation = validateFollowUp(followUp);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const targetLote = lotes[index];
  const nextSeguimientos = [followUp, ...(targetLote.seguimientos || [])];

  let nextEstado = targetLote.estado;
  if (followUp.estado_resultante && canAdvanceState(targetLote.estado, followUp.estado_resultante)) {
    nextEstado = followUp.estado_resultante;
  }

  const updatedLoteRaw = {
    ...targetLote,
    estado: nextEstado,
    seguimientos: nextSeguimientos
  };

  const updatedLote = updateLotLossesFromFollowUps(updatedLoteRaw);
  const nextLotes = [...lotes];
  nextLotes[index] = updatedLote;

  store.setState((prev) => ({
    ...prev,
    collections: { ...prev.collections, lotes: nextLotes },
    config: {
      ...prev.config,
      bitacora_cambios: addAuditLog(prev, 'editar', 'lotes', `Seguimiento de etapa ${followUp.etapa} registrado en Lote ${targetLote.codigo}.`, followUp.responsable_id || 'u_op_001')
    }
  }), 'REGISTRAR_SEGUIMIENTO_LOTE');

  return { success: true, data: updatedLote };
}

// ----------------------------------------------------------------------
// SUBPRODUCTOS & SALIDAS
// ----------------------------------------------------------------------
export function registrarSubproducto(payload) {
  const data = {
    ...payload,
    fecha_obtencion: payload.fecha_obtencion || new Date().toISOString(),
    responsable_id: payload.responsable_id || 'u_op_001',
    simulado: typeof payload.simulado === 'boolean' ? payload.simulado : false
  };

  const validation = validateSubproduct(data);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const state = store.getState();
  const subproductos = state.collections.subproductos || [];
  const count = subproductos.length + 1;
  const id = generateId('sp');
  const codigo = generateCode('SP', count);

  const nuevoSubproducto = {
    ...validation.subproduct,
    id,
    codigo,
    salidas_ids: []
  };

  store.setState((prev) => ({
    ...prev,
    collections: {
      ...prev.collections,
      subproductos: [nuevoSubproducto, ...subproductos]
    },
    config: {
      ...prev.config,
      bitacora_cambios: addAuditLog(prev, 'crear', 'subproductos', `Subproducto ${codigo} (${nuevoSubproducto.tipo}) registrado.`, nuevoSubproducto.responsable_id || 'u_op_001')
    }
  }), 'REGISTRAR_SUBPRODUCTO');

  return { success: true, data: nuevoSubproducto };
}

export function registrarSalidaSubproducto(payload) {
  const data = {
    ...payload,
    fecha_salida: payload.fecha_salida || new Date().toISOString(),
    responsable_id: payload.responsable_id || 'u_op_001'
  };

  const validation = validateSalida(data);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const state = store.getState();
  const subproductos = state.collections.subproductos || [];
  const spIndex = subproductos.findIndex((sp) => sp.id === data.subproducto_id);

  if (spIndex === -1) {
    return { success: false, errors: ['Subproducto no encontrado.'] };
  }

  const currentSp = subproductos[spIndex];
  const applyResult = applyOutput(currentSp, data.cantidad_entregada);

  if (!applyResult.ok) {
    return { success: false, errors: [applyResult.reason || 'Existencias insuficientes para realizar la salida.'] };
  }

  const salidas = state.collections.salidas_subproductos || [];
  const count = salidas.length + 1;
  const salidaId = generateId('sal');
  const codigo = generateCode('SAL', count);

  const nuevaSalida = {
    ...data,
    id: salidaId,
    codigo
  };

  const updatedSp = {
    ...applyResult.subproduct,
    salidas_ids: [salidaId, ...(currentSp.salidas_ids || [])]
  };

  const nextSubproductos = [...subproductos];
  nextSubproductos[spIndex] = updatedSp;

  store.setState((prev) => ({
    ...prev,
    collections: {
      ...prev.collections,
      subproductos: nextSubproductos,
      salidas_subproductos: [nuevaSalida, ...salidas]
    },
    config: {
      ...prev.config,
      bitacora_cambios: addAuditLog(prev, 'crear', 'salidas_subproductos', `Salida ${codigo} de ${data.cantidad_entregada} ${data.unidad} entregada a "${data.beneficiario_uso}".`, data.responsable_id)
    }
  }), 'REGISTRAR_SALIDA_SUBPRODUCTO');

  return { success: true, data: nuevaSalida };
}

// ----------------------------------------------------------------------
// CONFIGURACIÓN & ADMINISTRACIÓN
// ----------------------------------------------------------------------
export function alternarPausaRecepciones(pausar, motivo = '') {
  const state = store.getState();
  const centroConfig = state.config?.capacidad || {};
  const result = setReceptionsPaused(centroConfig, pausar, motivo);

  if (!result.ok) {
    return { success: false, errors: [result.error] };
  }

  store.setState((prev) => ({
    ...prev,
    config: {
      ...prev.config,
      capacidad: result.configCentro,
      bitacora_cambios: addAuditLog(prev, pausar ? 'pausar' : 'reanudar', 'config', pausar ? `Recepciones pausadas: ${motivo}` : 'Recepciones reanudadas.')
    }
  }), 'ALTERNAR_PAUSA_RECEPCIONES');

  return { success: true, data: result.configCentro };
}

// ----------------------------------------------------------------------
// IMPORT / EXPORT / RESET
// ----------------------------------------------------------------------
export function exportarRespaldo(filename) {
  const state = store.getState();
  return exportJson(state, filename);
}

export async function importarRespaldo(file) {
  try {
    const { data } = await importJson(file);
    store.setState(data, 'IMPORTAR_RESPALDO');
    return { success: true, data };
  } catch (error) {
    return { success: false, errors: [error.message] };
  }
}

export function restablecerSistema() {
  store.reset();
  return { success: true };
}
