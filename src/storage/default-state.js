/**
 * Default State / Seed Data - Centro Comunitario de Aprovechamiento de Biomasa Vegetal
 * Conforme con las reglas de negocio y schema
 */

import { DEFAULT_PROCESSES } from '../logic/processes.js';
import { ROLES, TIPOS_GENERADOR, ESTADOS_SOLICITUD, MODALIDAD_ENTREGA, ESTADO_MATERIAL, TIPO_BIOMASA, UNIDADES, CONDICION_CALIDAD, TIPOS_SUBPRODUCTO } from '../logic/constants.js';

export function getDefaultState() {
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    collections: {
      usuarios: [
        {
          id: 'u_admin_001',
          nombre: 'Yessenia Admin',
          correo: 'admin@biogestor.local',
          rol: ROLES.ADMINISTRADOR,
          organizacion: 'Centro Comunitario',
          tipo_generador: null,
          activo: true,
          ultimo_acceso: new Date().toISOString()
        },
        {
          id: 'u_op_001',
          nombre: 'José Castillo',
          correo: 'operador@biogestor.local',
          rol: ROLES.OPERADOR,
          organizacion: 'Centro Comunitario',
          tipo_generador: null,
          activo: true,
          ultimo_acceso: new Date().toISOString()
        },
        {
          id: 'u_gen_001',
          nombre: 'María López',
          correo: 'mlopez@mercadocentral.org',
          rol: ROLES.GENERADOR,
          tipo_generador: TIPOS_GENERADOR.MERCADOS,
          organizacion: 'Mercado Central',
          activo: true,
          ultimo_acceso: new Date().toISOString()
        }
      ],
      solicitudes: [
        {
          id: 'sol_001',
          codigo: 'SOL-001',
          usuario_id: 'u_gen_001',
          generador: {
            nombre_establecimiento: 'Mercado Central - Sección Verduras',
            tipo_generador: TIPOS_GENERADOR.MERCADOS,
            nombre_contacto: 'María López',
            telefono: '+505-8888-1111'
          },
          material: {
            categoria_id: 'mat_003',
            categoria_nombre: 'Restos vegetales de mercados',
            descripcion: 'Restos de hojas de lechuga, repollo y cáscaras'
          },
          cantidad: {
            estimada_kg: 120,
            unidad_estimada: UNIDADES.KG,
            fecha_generacion: new Date().toISOString().slice(0, 10),
            fecha_disponibilidad: new Date().toISOString().slice(0, 10),
            hora_disponibilidad: '08:00'
          },
          condiciones: {
            humedad: 'alta',
            tamano: 'fino',
            separacion: 'si',
            almacenamiento: 'cubierto',
            presencia_impropios: false,
            impropios_especificar: null
          },
          entrega: {
            modalidad: MODALIDAD_ENTREGA.ENTREGA_PROPIA,
            recogida_habilitada: true,
            direccion: 'Módulo 14, Mercado Central',
            coordenadas: { lat: 11.9768, lng: -86.0865 },
            observaciones_acceso: 'Entrada por portón norte',
            foto_url: null
          },
          estado: ESTADOS_SOLICITUD.RECIBIDA,
          responsable_id: 'u_op_001',
          horario_acordado: new Date().toISOString(),
          orden_visita: 1,
          observaciones_centro: 'Material limpio y adecuado para biodigestor',
          rechazo: { motivo: null, detalle: null },
          historial_cambios: [
            { fecha: new Date().toISOString(), usuario_id: 'u_gen_001', accion: 'crear_solicitud' }
          ],
          fecha_creacion: new Date(Date.now() - 86400000 * 2).toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          recepcion_id: 'rec_001',
          tiene_recepcion: true
        },
        {
          id: 'sol_002',
          codigo: 'SOL-002',
          usuario_id: 'u_gen_001',
          generador: {
            nombre_establecimiento: 'Parque Central Municipal',
            tipo_generador: TIPOS_GENERADOR.PARQUES,
            nombre_contacto: 'Carlos Gómez',
            telefono: '+505-8888-2222'
          },
          material: {
            categoria_id: 'mat_001',
            categoria_nombre: 'Poda y ramas',
            descripcion: 'Ramas leñosas de poda de árboles ornamentales'
          },
          cantidad: {
            estimada_kg: 250,
            unidad_estimada: UNIDADES.KG,
            fecha_generacion: new Date().toISOString().slice(0, 10),
            fecha_disponibilidad: new Date().toISOString().slice(0, 10),
            hora_disponibilidad: '10:30'
          },
          condiciones: {
            humedad: 'baja',
            tamano: 'grueso',
            separacion: 'si',
            almacenamiento: 'descubierto',
            presencia_impropios: false,
            impropios_especificar: null
          },
          entrega: {
            modalidad: MODALIDAD_ENTREGA.RECOGIDA,
            recogida_habilitada: true,
            direccion: 'Costado sur del Parque Central',
            coordenadas: { lat: 11.9666, lng: -86.1025 },
            observaciones_acceso: 'Camión puede estacionar junto a la glorieta',
            foto_url: null
          },
          estado: ESTADOS_SOLICITUD.RECIBIDA,
          responsable_id: 'u_op_001',
          horario_acordado: new Date().toISOString(),
          orden_visita: 2,
          observaciones_centro: 'Poda leñosa ideal para triturado y pirólisis',
          rechazo: { motivo: null, detalle: null },
          historial_cambios: [
            { fecha: new Date().toISOString(), usuario_id: 'u_op_001', accion: 'programar_recepcion' }
          ],
          fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          recepcion_id: 'rec_002',
          tiene_recepcion: true
        }
      ],
      recepciones: [
        {
          id: 'rec_001',
          codigo: 'REC-001',
          solicitud_id: 'sol_001',
          fecha_recepcion: new Date(Date.now() - 86400000).toISOString(),
          responsable_id: 'u_op_001',
          cantidad: {
            recibida_kg: 115,
            aceptada_kg: 110,
            rechazada_kg: 5,
            medida_tipo: 'pesada',
            unidad_recibida: UNIDADES.KG
          },
          rechazo: {
            tiene_rechazo: true,
            justificado: true,
            motivos: ['bolsa_envase'],
            motivo_otro: null,
            detalle: 'Pequeñas bolsas plásticas mezcladas con cáscaras'
          },
          clasificacion: {
            tipo_biomasa: TIPO_BIOMASA.BLANDA,
            tamano: 'fino',
            humedad: 'alta',
            contaminacion: 'leve',
            proceso_sugerido_id: 'proc_001',
            proceso_decidido_manualmente: true,
            asignacion_automatica_proceso: false
          },
          lote_id: 'lot_001',
          observaciones: 'Ingresado al biodigestor comunitario'
        },
        {
          id: 'rec_002',
          codigo: 'REC-002',
          solicitud_id: 'sol_002',
          fecha_recepcion: new Date().toISOString(),
          responsable_id: 'u_op_001',
          cantidad: {
            recibida_kg: 240,
            aceptada_kg: 235,
            rechazada_kg: 5,
            medida_tipo: 'pesada',
            unidad_recibida: UNIDADES.KG
          },
          rechazo: {
            tiene_rechazo: true,
            justificado: true,
            motivos: ['alambre'],
            motivo_otro: null,
            detalle: 'Alambres de amarre encontrados en ramas'
          },
          clasificacion: {
            tipo_biomasa: TIPO_BIOMASA.DURA,
            tamano: 'grueso',
            humedad: 'baja',
            contaminacion: 'leve',
            proceso_sugerido_id: 'proc_002',
            proceso_decidido_manualmente: true,
            asignacion_automatica_proceso: false
          },
          lote_id: 'lot_002',
          observaciones: 'Listo para trituradora y pirólisis Kon-Tiki'
        }
      ],
      lotes: [
        {
          id: 'lot_001',
          codigo: 'LOTE-2026-001',
          nombre: 'Lote Biodigestor Fracción Blanda',
          proceso_id: 'proc_001',
          estado: 'en_tratamiento',
          recepciones_ids: ['rec_001'],
          fecha_creacion: new Date(Date.now() - 86400000).toISOString(),
          responsable_id: 'u_op_001',
          composicion: {
            blanda_kg: 110,
            dura_kg: 0,
            mezcla_kg: 0,
            aceptada_total_kg: 110,
            rechazada_total_kg: 5,
            perdidas_estimadas_kg: 0,
            disponible_aprovechamiento_kg: 110
          },
          seguimientos: [
            {
              id: 'seg_001',
              fecha: new Date(Date.now() - 43200000).toISOString(),
              responsable_id: 'u_op_001',
              etapa: 'en_biodigestor',
              etapa_otro: null,
              estado_resultante: 'en_tratamiento',
              descripcion: 'Alimentación inicial del digestor y estabilización de pH',
              datos_etapa: {
                ph_biol: 7.8,
                litros_biol: 45,
                m3_biogas: 8.5,
                kg_biochar: 0,
                kg_mezcla_biol_biochar: 0,
                masa_triturada_kg: 0
              },
              medicion: { real: true, simulado: false },
              perdidas_estimadas_kg: 0,
              observaciones: 'Medición real con pH-metro portátil en rango óptimo'
            }
          ]
        },
        {
          id: 'lot_002',
          codigo: 'LOTE-2026-002',
          nombre: 'Lote Poda Pirólisis Kon-Tiki',
          proceso_id: 'proc_002',
          estado: 'en_tratamiento',
          recepciones_ids: ['rec_002'],
          fecha_creacion: new Date().toISOString(),
          responsable_id: 'u_op_001',
          composicion: {
            blanda_kg: 0,
            dura_kg: 235,
            mezcla_kg: 0,
            aceptada_total_kg: 235,
            rechazada_total_kg: 5,
            perdidas_estimadas_kg: 35,
            disponible_aprovechamiento_kg: 200
          },
          seguimientos: [
            {
              id: 'seg_002',
              fecha: new Date().toISOString(),
              responsable_id: 'u_op_001',
              etapa: 'triturado',
              etapa_otro: null,
              estado_resultante: 'en_tratamiento',
              descripcion: 'Machecado y trituración mecánica de ramas secas',
              datos_etapa: {
                ph_biol: null,
                litros_biol: 0,
                m3_biogas: 0,
                kg_biochar: 55,
                kg_mezcla_biol_biochar: 0,
                masa_triturada_kg: 200
              },
              medicion: { real: true, simulado: false },
              perdidas_estimadas_kg: 35,
              observaciones: 'Humedad controlada para asegurar ignición óptima en cono'
            }
          ]
        }
      ],
      subproductos: [
        {
          id: 'sp_001',
          codigo: 'SP-BIOL-01',
          lote_id: 'lot_001',
          lote_codigo: 'LOTE-2026-001',
          tipo: TIPOS_SUBPRODUCTO.BIOL,
          tipo_otro: null,
          fecha_obtencion: new Date().toISOString(),
          cantidad_producida: 45,
          unidad: UNIDADES.LITROS,
          cantidad_destinada: 15,
          cantidad_disponible: 30,
          condicion_calidad: CONDICION_CALIDAD.APROBADO_PARA_USO_DEFINIDO,
          responsable_id: 'u_op_001',
          observaciones: 'Biol líquido fertilizante con pH 7.8',
          simulado: false,
          salidas_ids: ['sal_001']
        },
        {
          id: 'sp_002',
          codigo: 'SP-BIOCHAR-01',
          lote_id: 'lot_002',
          lote_codigo: 'LOTE-2026-002',
          tipo: TIPOS_SUBPRODUCTO.BIOCHAR,
          tipo_otro: null,
          fecha_obtencion: new Date().toISOString(),
          cantidad_producida: 55,
          unidad: UNIDADES.KG,
          cantidad_destinada: 20,
          cantidad_disponible: 35,
          condicion_calidad: CONDICION_CALIDAD.APROBADO_PARA_USO_DEFINIDO,
          responsable_id: 'u_op_001',
          observaciones: 'Biochar de alta porosidad apagado con agua',
          simulado: false,
          salidas_ids: ['sal_002']
        }
      ],
      salidas_subproductos: [
        {
          id: 'sal_001',
          codigo: 'SAL-001',
          subproducto_id: 'sp_001',
          lote_id: 'lot_001',
          destino: 'productores_locales',
          beneficiario_uso: 'Huertos Urbanos San Jerónimo - Fertirriego',
          fecha_salida: new Date().toISOString(),
          responsable_id: 'u_op_001',
          cantidad_entregada: 15,
          unidad: UNIDADES.LITROS,
          observaciones: 'Entregado en bidones sellados'
        },
        {
          id: 'sal_002',
          codigo: 'SAL-002',
          subproducto_id: 'sp_002',
          lote_id: 'lot_002',
          destino: 'proyectos_comunitarios',
          beneficiario_uso: 'Parque Comunitario El Roble - Enmienda de suelo',
          fecha_salida: new Date().toISOString(),
          responsable_id: 'u_op_001',
          cantidad_entregada: 20,
          unidad: UNIDADES.KG,
          observaciones: 'Aplicado en jardineras demostrativas'
        }
      ]
    },
    config: {
      centro: {
        nombre: 'Centro Comunitario de Aprovechamiento de Biomasa Vegetal',
        direccion: 'Municipio de Masaya, Nicaragua',
        telefono: '+505-2522-0000',
        coordenadas: { lat: 11.974, lng: -86.094 },
        activo: true
      },
      capacidad: {
        recepcion_kg_dia: 500,
        almacenamiento_kg: 2000,
        recepciones_pausadas: false,
        motivo_pausa: null,
        recogida_habilitada: true
      },
      catalogo_materiales: [
        {
          id: 'mat_001',
          nombre: 'Poda y ramas',
          tipo_biomasa: TIPO_BIOMASA.DURA,
          estado: ESTADO_MATERIAL.ACEPTADO,
          protagonista: true,
          mostrar_inicio_publico: true,
          activo: true,
          orden: 1,
          descripcion: 'Seco/Duro → Triturado/Machecado → Pirólisis (Kon-Tiki elevado) → Biochar'
        },
        {
          id: 'mat_002',
          nombre: 'Hojas, césped y restos finos',
          tipo_biomasa: TIPO_BIOMASA.BLANDA,
          estado: ESTADO_MATERIAL.ACEPTADO,
          protagonista: false,
          mostrar_inicio_publico: true,
          activo: true,
          orden: 2,
          descripcion: 'Húmedo/Blando → Ingreso directo al biodigestor → Biogás + Biol'
        },
        {
          id: 'mat_003',
          nombre: 'Restos vegetales de mercados',
          tipo_biomasa: TIPO_BIOMASA.BLANDA,
          estado: ESTADO_MATERIAL.ACEPTADO,
          protagonista: false,
          mostrar_inicio_publico: true,
          activo: true,
          orden: 3,
          descripcion: 'Húmedo/Blando → Ingreso directo al biodigestor'
        },
        {
          id: 'mat_004',
          nombre: 'Frutas y verduras (preparación)',
          tipo_biomasa: TIPO_BIOMASA.BLANDA,
          estado: ESTADO_MATERIAL.ACEPTADO,
          protagonista: false,
          mostrar_inicio_publico: true,
          activo: true,
          orden: 4,
          descripcion: 'Solo restos vegetales crudos. Sin alimentos cocinados.'
        }
      ],
      procesos: DEFAULT_PROCESSES,
      bitacora_cambios: [
        {
          id: 'bit_001',
          fecha: new Date().toISOString(),
          usuario_id: 'u_admin_001',
          entidad: 'config',
          accion: 'inicializar_sistema',
          detalle: 'Configuración inicial y catálogo de procesos cargados.'
        }
      ]
    }
  };
}
