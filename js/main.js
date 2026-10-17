import { initNav } from './ui/nav.js';
import { initResponsiveTables } from './ui/tables-responsive.js';

function init() {
  initNav();
  initResponsiveTables();
}

document.addEventListener('DOMContentLoaded', init);
