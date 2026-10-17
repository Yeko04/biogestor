import test from 'node:test';
import assert from 'node:assert/strict';
import { getCoordinates, classifyMapRequests, filterMapRequests, requestUnit, requestCoordinates } from '../src/ui/components/map-data.js';
import { getDefaultState } from '../src/storage/default-state.js';
import { getVerifiedTotals } from '../src/logic/indicators.js';
import { crearSolicitud } from '../src/store/actions.js';
import { store } from '../src/store/store.js';

test('reject missing, blank and out-of-range locations without inventing a pin at 0,0', () => {
  for (const point of [undefined, {}, {lat:null,lng:null}, {lat:'',lng:''}, {lat:91,lng:0}, {lat:0,lng:-181}, {lat:'no',lng:2}]) assert.equal(getCoordinates(point), null);
  assert.deepEqual(getCoordinates({lat:0,lng:0}), [0,0]);
  assert.deepEqual(getCoordinates({lat:'11.974',lng:'-86.094'}), [11.974,-86.094]);
});

test('filters use the material catalog and preserve the original request records', () => {
  const state = getDefaultState();
  const requests = state.collections.solicitudes;
  const classified = classifyMapRequests(requests, state.config.catalogo_materiales);
  assert.equal(filterMapRequests(classified,'wet').length, 1);
  assert.equal(filterMapRequests(classified,'dry').length, 1);
  assert.equal(filterMapRequests(classified,'all').length, requests.length);
  assert.ok(requests.every((request) => !('kind' in request)));
  assert.deepEqual(filterMapRequests([], 'wet'), []);
});

test('volume estimates retain their units and never become verified kilograms', () => {
  assert.equal(requestUnit({cantidad:{unidad_estimada:'m3'}}), 'm³');
  assert.equal(requestUnit({cantidad:{unidad_estimada:'kg'}}), 'kg');
  assert.equal(getVerifiedTotals([{cantidad:{unidad_recibida:'m3',recibida_kg:5,aceptada_kg:5}}]).kg.recibidos, 0);
});

test('demonstration origins remain in the same territory as the pilot center', () => {
  const state = getDefaultState();
  const center = getCoordinates(state.config.centro.coordenadas);
  for (const request of state.collections.solicitudes) {
    const point = getCoordinates(request.entrega.coordenadas);
    assert.ok(point);
    assert.ok(Math.abs(point[0]-center[0]) < .05 && Math.abs(point[1]-center[1]) < .05);
  }
});

test('legacy unlocated requests do not send the map to the Gulf of Guinea', () => {
  assert.equal(requestCoordinates({entrega:{coordenadas:{lat:0,lng:0}}}), null);
  assert.equal(requestCoordinates({entrega:{coordenadas:null}}), null);
  assert.deepEqual(requestCoordinates({entrega:{coordenadas:{lat:11.974,lng:-86.094}}}), [11.974,-86.094]);
});

test('creating an unlocated volume request stores no fictional coordinates', () => {
  const previous = store.getState();
  try {
    const result = crearSolicitud({ generador: { nombre_establecimiento: 'Huerto de prueba', tipo_generador: 'otros' }, material: { categoria_id: 'mat_001', categoria_nombre: 'Poda y ramas' }, cantidad: { estimada_kg: 2, unidad_estimada: 'm3' }, entrega: { modalidad: 'entrega_propia' } });
    assert.equal(result.success, true);
    assert.equal(result.data.entrega.coordenadas, null);
    assert.equal(result.data.cantidad.unidad_estimada, 'm3');
    assert.equal(requestCoordinates(result.data), null);
  } finally { store.setState(previous); }
});
