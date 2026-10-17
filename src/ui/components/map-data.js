export function getCoordinates(point) {
  if (!point || point.lat === null || point.lng === null || point.lat === '' || point.lng === '') return null;
  const lat = Number(point.lat), lng = Number(point.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null;
}

export function classifyMapRequests(requests, materials) {
  return requests.map((request) => ({ ...request, kind: materials.find((material) => material.id === request.material?.categoria_id)?.tipo_biomasa === 'dura' ? 'dry' : 'wet' }));
}

export function filterMapRequests(requests, kind) {
  return requests.filter((request) => kind === 'all' || request.kind === kind);
}

export function requestUnit(request) {
  return request.cantidad?.unidad_estimada === 'm3' ? 'm³' : 'kg';
}

// Previous versions stored 0,0 for an origin that had never been located.
export function requestCoordinates(request) {
  const point = getCoordinates(request.entrega?.coordenadas);
  return point && (point[0] !== 0 || point[1] !== 0) ? point : null;
}
