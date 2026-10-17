/**
 * Main application entry point - Biogestor
 */

import { initNav } from './ui/nav.js';
import { initResponsiveTables } from './ui/tables-responsive.js';
import { loadData } from './storage/localstore.js';
import { router } from './ui/router.js';

function init() {
  // 1. Initialize Navigation Drawer & Shell Interactions
  initNav();
  initResponsiveTables();

  // 2. Initialize State Storage Engine
  loadData();

  // 3. Initialize Client-Side Router
  router.init('app-view');

  console.info('Bioterra: interfaz y navegación inicializadas.');
}

document.addEventListener('DOMContentLoaded', init);
