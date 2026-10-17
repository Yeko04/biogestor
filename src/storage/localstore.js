/**
 * Robust LocalStorage Engine for Biogestor
 * Features:
 * - Debounced auto-save to prevent Event Loop freezing
 * - Schema validation upon loading and importing
 * - Safe error handling (QuotaExceeded, JSON corruption, SSR/Node fallback)
 * - Safe export and import with validation
 */

import { validateStateSchema } from './validator.js';
import { getDefaultState } from './default-state.js';

export const STORAGE_KEY = 'biogestor:v1:data';
export const LEGACY_STORAGE_KEY = 'biogestor:data';

let autoSaveTimeout = null;
const memoryFallback = new Map();

function isStorageAvailable() {
  return typeof localStorage !== 'undefined';
}

export function loadData(fallback = null) {
  const defaultState = fallback || getDefaultState();

  if (!isStorageAvailable()) {
    const mem = memoryFallback.get(STORAGE_KEY);
    return mem || defaultState;
  }

  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    
    // Check legacy key if primary is empty
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
      }
    }

    if (!raw) {
      saveData(defaultState);
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    const validation = validateStateSchema(parsed);

    if (!validation.valid) {
      console.warn('Almacenamiento local contenía datos con esquema inválido. Cargando datos base.', validation.errors);
      saveData(defaultState);
      return defaultState;
    }

    return parsed;
  } catch (error) {
    console.error('Error crítico al leer localStorage. Restableciendo al estado predeterminado.', error);
    return defaultState;
  }
}

export function saveData(data) {
  if (!data || typeof data !== 'object') {
    console.error('saveData: Se intentó guardar un valor no válido.', data);
    return false;
  }

  const payload = {
    ...data,
    lastUpdated: new Date().toISOString()
  };

  if (!isStorageAvailable()) {
    memoryFallback.set(STORAGE_KEY, payload);
    return true;
  }

  try {
    const serialized = JSON.stringify(payload);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.error('Error de cuota excedida en localStorage. Por favor exporte un respaldo y libere espacio.', error);
      if (typeof alert === 'function') {
        alert('Alerta de almacenamiento: El espacio en navegador está lleno. Exporte un respaldo JSON.');
      }
    } else {
      console.error('Error al guardar datos en localStorage:', error);
    }
    return false;
  }
}

export function scheduleAutoSave(data, delayMs = 300) {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  return new Promise((resolve) => {
    autoSaveTimeout = setTimeout(() => {
      const success = saveData(data);
      resolve(success);
    }, delayMs);
  });
}

export function exportJson(data, filename = 'biogestor-backup.json') {
  try {
    const payload = {
      ...data,
      exportedAt: new Date().toISOString()
    };
    if (typeof Blob === 'undefined' || typeof document === 'undefined') {
      return JSON.stringify(payload, null, 2);
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exportando archivo JSON:', error);
    return false;
  }
}

export function importJson(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No se seleccionó ningún archivo.'));
    }

    if (typeof FileReader === 'undefined') {
      return reject(new Error('FileReader no está disponible en este entorno.'));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const validation = validateStateSchema(parsed);

        if (!validation.valid) {
          return reject(new Error(`Estructura de JSON inválida:\n- ${validation.errors.join('\n- ')}`));
        }

        resolve({
          success: true,
          data: parsed
        });
      } catch (err) {
        reject(new Error(`El archivo no contiene un JSON válido: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Error de lectura del archivo en disco.'));
    reader.readAsText(file);
  });
}

export function resetToDefaults() {
  const initial = getDefaultState();
  saveData(initial);
  return initial;
}
