/**
 * Constants - Centro Comunitario de Aprovechamiento de Biomasa Vegetal
 * JSON + localStorage - No database
 * Flujo: Húmedo/Blando -> Biodigestor | Seco/Duro -> Triturado/Machecado -> Pirólisis -> Biochar
 */

export const ROLES = { VISITANTE: 'visitante', GENERADOR: 'generador', OPERADOR: 'operador', ADMINISTRADOR: 'administrador' };
export const TIPOS_GENERADOR = { PARQUES: 'parques', MERCADOS: 'mercados', RESTAURANTES: 'restaurantes', INSTITUCIONES: 'instituciones', OTROS: 'otros' };
export const UNIDADES = { KG: 'kg', M3: 'm3', LITROS: 'L' };
export const MODALIDAD_ENTREGA = { ENTREGA_PROPIA: 'entrega_propia', RECOGIDA: 'recogida' };
export const ESTADOS_SOLICITUD = { ENVIADA: 'enviada', EN_REVISION: 'en_revision', ACEPTADA_Y_PROGRAMADA: 'aceptada_y_programada', RECIBIDA: 'recibida', REQUIERE_INFORMACION: 'requiere_informacion', RECHAZADA: 'rechazada', CANCELADA: 'cancelada', RECEPCION_PARCIAL: 'recepcion_parcial', CERRADA: 'cerrada' };
export const FLUJO_SOLICITUD = ['enviada','en_revision','aceptada_y_programada','recibida','cerrada'];
export const ESTADOS_SOLICITUD_ALTERNATIVOS = ['requiere_informacion','rechazada','cancelada','recepcion_parcial'];
export const MEDIDA_TIPO = { PESADA: 'pesada', ESTIMADA: 'estimada' };
export const MOTIVOS_RECHAZO = { PLASTICO: 'plastico', ALAMBRE: 'alambre', PIEDRAS_TIERRA: 'piedras_tierra', BOLSA_ENVASE: 'bolsa_envase', OTRO: 'otro' };
export const TIPO_BIOMASA = { BLANDA: 'blanda', DURA: 'dura', MEZCLA: 'mezcla' };
export const TAMANO = { FINO: 'fino', MEDIANO: 'mediano', GRUESO: 'grueso' };
export const HUMEDAD = { BAJA: 'baja', MEDIA: 'media', ALTA: 'alta' };
export const CONTAMINACION = { NINGUNA: 'ninguna', LEVE: 'leve', MODERADA: 'moderada', ALTA: 'alta' };
export const ESTADOS_LOTE = { CREADO: 'creado', CLASIFICADO: 'clasificado', ASIGNADO: 'asignado', EN_TRATAMIENTO: 'en_tratamiento', PENDIENTE_DE_EVALUACION: 'pendiente_de_evaluacion', DISPONIBLE: 'disponible', DESTINADO: 'destinado' };
export const ETAPAS_SEGUIMIENTO = { RECEPCION: 'recepcion', CLASIFICACION: 'clasificacion', TRITURADO: 'triturado', PREPARACION_PIRÓLISIS: 'preparacion_pirólisis', PIRÓLISIS: 'pirólisis', OBTENCION_BIOCHAR: 'obtencion_biochar', EN_BIODIGESTOR: 'en_biodigestor', MEZCLA_FINAL: 'mezcla_final', EN_TRATAMIENTO: 'en_tratamiento', PENDIENTE_DE_EVALUACION: 'pendiente_de_evaluacion', DISPONIBLE: 'disponible', DESTINADO: 'destinado', RECHAZO: 'rechazo', OTRO: 'otro' };
export const CONDICION_CALIDAD = { PENDIENTE_DE_EVALUACION: 'pendiente_de_evaluacion', APROBADO_PARA_USO_DEFINIDO: 'aprobado_para_uso_definido', RECHAZADO: 'rechazado' };
export const TIPOS_SUBPRODUCTO = { BIOL: 'biol', BIOGAS: 'biogas', BIOCHAR: 'biochar', MEZCLA_BIOL_BIOCHAR: 'mezcla_biol_biochar', OTRO: 'otro' };
export const DESTINOS_SALIDA = { PRODUCCION_URBANA_CENTRO: 'produccion_urbana_centro', PRODUCTORES_LOCALES: 'productores_locales', PROYECTOS_COMUNITARIOS: 'proyectos_comunitarios', DONACION: 'donacion', VENTA_BAJO_COSTO: 'venta_bajo_costo', ENSAYOS: 'ensayos', OTRO_DESTINO_AUTORIZADO: 'otro_destino_autorizado' };
export const ESTADO_MATERIAL = { ACEPTADO: 'aceptado', TEMPORALMENTE_SUSPENDIDO: 'temporalmente_suspendido', PENDIENTE_DE_EVALUACION: 'pendiente_de_evaluacion' };
export const PROCESOS_CLAVE = { BLANDA_BIODIGESTOR: 'blanda_biodigestor', DURA_PIRÓLISIS_BIOCHAR: 'dura_pirólisis_biochar', MEZCLA_CONTROL: 'mezcla_control', RECHAZO_DESCARTES: 'rechazo_descartes' };
export const UMBRALES = { DESVIACION_DESCARTE_MIN_PCT: 70, PH_BIOL_MIN: 7.5, PH_BIOL_MAX: 8.5, REDUCCION_MASA_MIN_PCT: 25, REDUCCION_VOLUMEN_MIN_PCT: 40 };
export const ENTIDADES_BITACORA = { SOLICITUDES: 'solicitudes', RECEPCIONES: 'recepciones', LOTES: 'lotes', SUBPRODUCTOS: 'subproductos', SALIDAS_SUBPRODUCTOS: 'salidas_subproductos', CONFIG: 'config', USUARIOS: 'usuarios' };
export const ACCIONES_BITACORA = { CREAR: 'crear', EDITAR: 'editar', ELIMINAR: 'eliminar', CAMBIAR_ESTADO: 'cambiar_estado', ASIGNAR: 'asignar', PAUSAR: 'pausar', REANUDAR: 'reanudar', EXPORTAR: 'exportar', IMPORTAR: 'importar' };
