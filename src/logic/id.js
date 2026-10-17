/**
 * Safe ID generation utilities
 */

export function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  return `${prefix}_${timePart}${randomPart}`;
}

export function generateCode(prefix = 'COD', count = 1) {
  const pad = String(count).padStart(3, '0');
  return `${prefix}-${pad}`;
}
