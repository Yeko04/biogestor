/**
 * Indicators - KPIs and calculations
 * % Desviación descarte = (Kg recibidos_verificados - Kg rechazados_verificados)/Kg recibidos_verificados * 100
 * Separate estimated vs verified. Never sum kg + m³. Real/Simulated visible.
 * Flujos: Biodigestor (biol/biogas) | Pirólisis (biochar) | Mezcla final (biol+biochar)
 */

import { UMBRALES, UNIDADES } from './constants.js';

export function getVerifiedTotals(recepciones = []) {
  let recibidosKg = 0, aceptadosKg = 0, rechazadosKg = 0;
  for (const r of recepciones) {
    const c = r.cantidad || {};
    const u = c.unidad_recibida;
    if (u === UNIDADES.KG) {
      recibidosKg += Number(c.recibida_kg) || 0;
      aceptadosKg += Number(c.aceptada_kg) || 0;
      rechazadosKg += Number(c.rechazada_kg) || 0;
    }
  }
  const totalRecibidosVerifKg = recibidosKg;
  const pctDesviacion = totalRecibidosVerifKg <= 0 ? 0 : ((totalRecibidosVerifKg - rechazadosKg) / totalRecibidosVerifKg) * 100;
  const pctRechazo = totalRecibidosVerifKg <= 0 ? 0 : (rechazadosKg / totalRecibidosVerifKg) * 100;
  const metaCumplida = pctDesviacion >= UMBRALES.DESVIACION_DESCARTE_MIN_PCT;

  return {
    kg: { recibidos: totalRecibidosVerifKg, aceptados: aceptadosKg, rechazados: rechazadosKg },
    pctDesviacion: Number(pctDesviacion.toFixed(3)),
    pctRechazo: Number(pctRechazo.toFixed(3)),
    metaDesviacionMinPct: UMBRALES.DESVIACION_DESCARTE_MIN_PCT,
    metaCumplida,
    unidadesSeparadas: true
  };
}

export function getEstimatedTotals(solicitudes = []) {
  let estimadaKg = 0;
  let estimadaM3 = 0;
  for (const s of solicitudes) {
    const cant = s.cantidad || {};
    if (cant.unidad_estimada === UNIDADES.KG) estimadaKg += Number(cant.estimada_kg) || 0;
    if (cant.unidad_estimada === UNIDADES.M3) estimadaM3 += Number(cant.estimada_kg) || 0;
  }
  return {
    estimada_kg: estimadaKg,
    estimada_m3: estimadaM3,
    separadosPorUnidad: true,
    nota: 'Solo para fines de planificación'
  };
}

export function getRejectionByReason(recepciones = []) {
  const map = {};
  for (const r of recepciones) {
    const rech = r.rechazo || {};
    if (rech.tiene_rechazo && Array.isArray(rech.motivos)) {
      for (const m of rech.motivos) {
        map[m] = (map[m] || 0) + (Number(r.cantidad?.rechazada_kg) || 0);
      }
    }
  }
  return map;
}

export function getTimeRequestToReception(solicitudes = [], recepciones = []) {
  const mapRec = Object.fromEntries(recepciones.map(x => [x.solicitud_id, x]));
  const dias = [];
  for (const s of solicitudes) {
    const rec = mapRec[s.id];
    if (rec && s.fecha_creacion && rec.fecha_recepcion) {
      const t1 = new Date(s.fecha_creacion).getTime();
      const t2 = new Date(rec.fecha_recepcion).getTime();
      if (!isNaN(t1) && !isNaN(t2) && t2 >= t1) {
        const d = (t2 - t1) / (1000*60*60*24);
        dias.push(d);
      }
    }
  }
  if (dias.length === 0) return { count: 0, promedioDias: 0, medianaDias: 0, minDias: 0, maxDias: 0 };
  dias.sort((a,b)=>a-b);
  const sum = dias.reduce((a,v)=>a+v,0);
  const n = dias.length;
  const med = n%2===1 ? dias[Math.floor(n/2)] : (dias[n/2-1]+dias[n/2])/2;
  return {
    count: n,
    promedioDias: Number((sum/n).toFixed(3)),
    medianaDias: Number(med.toFixed(3)),
    minDias: Number(dias[0].toFixed(3)),
    maxDias: Number(dias[n-1].toFixed(3))
  };
}

export function getProductionByLot(lotes = []) {
  const res = [];
  for (const lot of lotes) {
    let litrosBiol = 0, m3Biogas = 0, kgBiochar = 0, kgMezcla = 0;
    let realCount = 0, simCount = 0;
    const segs = lot.seguimientos || [];
    for (const f of segs) {
      const d = f.datos_etapa || {};
      litrosBiol += Number(d.litros_biol) || 0;
      m3Biogas += Number(d.m3_biogas) || 0;
      kgBiochar += Number(d.kg_biochar) || 0;
      kgMezcla += Number(d.kg_mezcla_biol_biochar) || 0;
      if (f.medicion?.real) realCount++; else if (f.medicion?.simulado) simCount++;
    }
    const tieneReal = realCount > 0;
    const tieneSim = simCount > 0;
    res.push({
      lote_id: lot.id,
      codigo: lot.codigo,
      litros_biol_total: litrosBiol,
      m3_biogas_total: m3Biogas,
      kg_biochar_total: kgBiochar,
      kg_mezcla_biol_biochar_total: kgMezcla,
      real: tieneReal && !tieneSim,
      simulado: tieneSim && !tieneReal,
      mixto: tieneReal && tieneSim,
      etiqueta: (tieneSim && !tieneReal) ? 'Simulated' : (tieneReal && !tieneSim) ? 'Real' : 'Mixed'
    });
  }
  return res;
}

export function getSubproductsStock(subproductos = []) {
  let dispKg=0,destKg=0,prodKg=0,dispL=0,destL=0,prodL=0;
  for (const sp of subproductos) {
    const u = sp.unidad;
    const pd = Number(sp.cantidad_producida)||0, dd=Number(sp.cantidad_destinada)||0, di=Number(sp.cantidad_disponible)||0;
    if (u === UNIDADES.KG){ prodKg+=pd; destKg+=dd; dispKg+=di; }
    if (u === UNIDADES.LITROS){ prodL+=pd; destL+=dd; dispL+=di; }
  }
  return {
    kg: { producida: prodKg, destinada: destKg, disponible: dispKg },
    L:  { producida: prodL,  destinada: destL,  disponible: dispL },
    separadosPorUnidad: true
  };
}
