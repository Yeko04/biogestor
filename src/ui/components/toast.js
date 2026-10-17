/**
 * Floating Toast Notification System - Biogestor
 * Spring bounce animation, auto-dismiss, and persistent feedback
 */

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

export function showToast({ title, message, type = 'success', duration = 3200 }) {
  const container = getToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const icon = type === 'success' ? '✦' : type === 'warning' ? '⚠️' : type === 'error' ? '✖' : 'ℹ';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div style="display:flex; flex-direction:column; gap:0.15rem;">
      <span class="toast-title">${title}</span>
      ${message ? `<span class="toast-desc">${message}</span>` : ''}
    </div>
  `;

  // Click to dismiss early
  toast.addEventListener('click', () => {
    dismissToast(toast);
  });

  container.appendChild(toast);

  // Auto-dismiss after duration
  setTimeout(() => {
    dismissToast(toast);
  }, duration);
}

function dismissToast(toastElement) {
  if (!toastElement || !toastElement.parentElement) return;
  toastElement.classList.add('toast-leave');
  setTimeout(() => {
    if (toastElement.parentElement) {
      toastElement.parentElement.removeChild(toastElement);
    }
  }, 260);
}

/**
 * Maps store actions to human-friendly feedback toasts
 */
export function notifyStoreAction(actionName) {
  switch (actionName) {
    case 'CREAR_SOLICITUD':
      showToast({
        title: 'Solicitud Registrada',
        message: 'Guardado en localStorage y vinculado a bitácora.',
        type: 'success'
      });
      break;
    case 'REGISTRAR_RECEPCION':
      showToast({
        title: 'Recepción y Triaje Guardados',
        message: 'Kilogramos netos integrados al inventario.',
        type: 'success'
      });
      break;
    case 'CREAR_LOTE':
      showToast({
        title: 'Lote Creado',
        message: 'Trazabilidad y balance de masa computados.',
        type: 'success'
      });
      break;
    case 'REGISTRAR_SEGUIMIENTO_LOTE':
      showToast({
        title: 'Etapa Registrada',
        message: 'Mermas y variables operativas actualizadas.',
        type: 'success'
      });
      break;
    case 'REGISTRAR_SUBPRODUCTO':
      showToast({
        title: 'Subproducto Incorporado',
        message: 'Stock disponible listo para distribución.',
        type: 'success'
      });
      break;
    case 'REGISTRAR_SALIDA_SUBPRODUCTO':
      showToast({
        title: 'Salida de Subproducto Exitosa',
        message: 'Stock deducido en tiempo real en localStorage.',
        type: 'success'
      });
      break;
    case 'ALTERNAR_PAUSA_RECEPCIONES':
      showToast({
        title: 'Configuración de Recepción Actualizada',
        message: 'Estado operativo del centro modificado.',
        type: 'warning'
      });
      break;
    case 'IMPORTAR_RESPALDO':
      showToast({
        title: 'Respaldo Restaurado',
        message: 'Colecciones JSON cargadas exitosamente.',
        type: 'success'
      });
      break;
    case 'RESET_TO_DEFAULTS':
      showToast({
        title: 'Sistema Restablecido',
        message: 'Datos reinicializados a valores semilla.',
        type: 'info'
      });
      break;
    default:
      break;
  }
}
