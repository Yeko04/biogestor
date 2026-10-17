/**
 * Process rules - Procesos configurables
 * Húmedo/Blando -> Biodigestor | Seco/Duro -> Triturado/Machecado -> Pirólisis -> Biochar
 * Mezcla (Control) | Rechazo/Descartes
 * Manual assignment only. No automatic assignment by humidity/hardness.
 */

import { PROCESOS_CLAVE, TIPO_BIOMASA, CONTAMINACION } from './constants.js';

export const DEFAULT_PROCESSES = [
  {
    id: 'proc_001',
    nombre: 'Húmedo/Blando → Biodigestor',
    clave: PROCESOS_CLAVE.BLANDA_BIODIGESTOR,
    descripcion: 'Fracción húmeda/blanda ingreso directo al biodigestor.',
    activo: true,
    solo_pruebas: false,
    permite_asignacion_manual: true,
    reglas_entrada: { tipo_biomasa: [TIPO_BIOMASA.BLANDA], tamano: [], humedad: [], contaminacion: [] },
    etapas: ['recepcion', 'clasificacion', 'en_biodigestor', 'seguimiento'],
    salida_esperada: ['biol', 'biogas'],
    orden: 1
  },
  {
    id: 'proc_002',
    nombre: 'Seco/Duro → Triturado/Machecado → Pirólisis → Biochar',
    clave: PROCESOS_CLAVE.DURA_PIRÓLISIS_BIOCHAR,
    descripcion: 'Trituración/machecado → Pirólisis (Kon-Tiki elevado) → Biochar.',
    activo: true,
    solo_pruebas: false,
    permite_asignacion_manual: true,
    reglas_entrada: { tipo_biomasa: [TIPO_BIOMASA.DURA], tamano: [], humedad: [], contaminacion: [] },
    etapas: ['recepcion', 'clasificacion', 'triturado', 'preparacion_pirólisis', 'pirólisis', 'obtencion_biochar', 'seguimiento'],
    salida_esperada: ['biochar'],
    orden: 2
  },
  {
    id: 'proc_003',
    nombre: 'Mezcla (Control - Solo pruebas)',
    clave: PROCESOS_CLAVE.MEZCLA_CONTROL,
    descripcion: 'Mezcla sin triaje (Caso C - Control). Solo para pruebas.',
    activo: false,
    solo_pruebas: true,
    permite_asignacion_manual: true,
    reglas_entrada: { tipo_biomasa: [TIPO_BIOMASA.MEZCLA], tamano: [], humedad: [], contaminacion: [] },
    etapas: ['recepcion', 'clasificacion', 'en_tratamiento', 'seguimiento'],
    salida_esperada: ['comparativo'],
    orden: 3
  },
  {
    id: 'proc_004',
    nombre: 'Rechazo/Descartes',
    clave: PROCESOS_CLAVE.RECHAZO_DESCARTES,
    descripcion: 'Material no apto para aprovechamiento. Ruta de residuos sólidos autorizada.',
    activo: true,
    solo_pruebas: false,
    permite_asignacion_manual: true,
    reglas_entrada: { tipo_biomasa: [], tamano: [], humedad: [], contaminacion: [CONTAMINACION.MODERADA, CONTAMINACION.ALTA] },
    etapas: ['recepcion', 'clasificacion', 'rechazo'],
    salida_esperada: ['no_aprovechado'],
    orden: 4
  }
];

export function processMatchesClassification(clasificacion = {}, proceso = {}) {
  const reglas = proceso.reglas_entrada || {};
  const tipoOk = !reglas.tipo_biomasa?.length || reglas.tipo_biomasa.includes(clasificacion.tipo_biomasa);
  const tamOk = !reglas.tamano?.length || reglas.tamano.includes(clasificacion.tamano);
  const humOk = !reglas.humedad?.length || reglas.humedad.includes(clasificacion.humedad);
  const contOk = !reglas.contaminacion?.length || reglas.contaminacion.includes(clasificacion.contaminacion);
  return tipoOk && tamOk && humOk && contOk;
}

export function getProcessByKey(clave, processes = DEFAULT_PROCESSES) {
  return (processes || []).find(p => p.clave === clave) || null;
}

export function getActiveProcesses(processes = DEFAULT_PROCESSES) {
  return (processes || []).filter(p => p.activo);
}
