/**
 * State Validator - Ensures JSON structure conforms to Biogestor requirements
 */

export function validateStateSchema(state) {
  const errors = [];

  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return { valid: false, errors: ['El estado debe ser un objeto JSON válido.'] };
  }

  if (!state.version || typeof state.version !== 'string') {
    errors.push('Falta el campo de versión del esquema ("version").');
  }

  if (!state.collections || typeof state.collections !== 'object') {
    errors.push('Falta la sección "collections" en el estado.');
  } else {
    const requiredCollections = [
      'usuarios',
      'solicitudes',
      'recepciones',
      'lotes',
      'subproductos',
      'salidas_subproductos'
    ];

    for (const col of requiredCollections) {
      if (!Array.isArray(state.collections[col])) {
        errors.push(`La colección "${col}" debe ser un arreglo.`);
      }
    }
  }

  if (!state.config || typeof state.config !== 'object') {
    errors.push('Falta la sección "config" en el estado.');
  } else {
    if (!state.config.centro || typeof state.config.centro !== 'object') {
      errors.push('Falta la configuración de "config.centro".');
    }
    if (!state.config.capacidad || typeof state.config.capacidad !== 'object') {
      errors.push('Falta la configuración de "config.capacidad".');
    }
    if (!Array.isArray(state.config.catalogo_materiales)) {
      errors.push('La lista "config.catalogo_materiales" debe ser un arreglo.');
    }
    if (!Array.isArray(state.config.procesos)) {
      errors.push('La lista "config.procesos" debe ser un arreglo.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
