/**
 * Simple Hash-based Router & View Renderer - Biogestor
 */

import { store } from '../store/store.js';
import { initResponsiveTables } from './tables-responsive.js';
import { notifyStoreAction } from './components/toast.js';

import { renderHomeView, attachHomeEvents } from './views/home-view.js?v=2.0';
import { renderSolicitudesView, attachSolicitudesEvents } from './views/solicitudes-view.js';
import { renderRecepcionView, attachRecepcionEvents } from './views/recepcion-view.js';
import { renderLotesView, attachLotesEvents } from './views/lotes-view.js';
import { renderSubproductosView, attachSubproductosEvents } from './views/subproductos-view.js';
import { renderIndicadoresView } from './views/indicadores-view.js';
import { renderAdminView, attachAdminEvents } from './views/admin-view.js';

const routes = {
  '#inicio': { render: renderHomeView, attach: attachHomeEvents },
  '#materiales': { render: renderHomeView, attach: attachHomeEvents, scrollTo: 'materiales' },
  '#ubicacion': { render: renderHomeView, attach: attachHomeEvents, scrollTo: 'ubicacion' },
  '#solicitudes': { render: renderSolicitudesView, attach: attachSolicitudesEvents },
  '#recepcion': { render: renderRecepcionView, attach: attachRecepcionEvents },
  '#lotes': { render: renderLotesView, attach: attachLotesEvents },
  '#subproductos': { render: renderSubproductosView, attach: attachSubproductosEvents },
  '#indicadores': { render: renderIndicadoresView },
  '#admin': { render: renderAdminView, attach: attachAdminEvents }
};

class AppRouter {
  constructor() {
    this.container = null;
    this.currentHash = '#inicio';
  }

  init(containerId = 'app-view') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Router: No se encontró el contenedor con ID "${containerId}".`);
      return;
    }

    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleRoute());

    // Listen to store updates for reactive re-render & toast notifications
    store.subscribe((state, actionName) => {
      notifyStoreAction(actionName);
      this.renderCurrent();
      this.triggerGlintEffect();
    });

    // Initial render
    this.handleRoute();
  }

  handleRoute() {
    const rawHash = window.location.hash || '#inicio';
    const hash = routes[rawHash] ? rawHash : '#inicio';
    this.currentHash = hash;
    this.updateActiveNavLinks(hash);
    this.renderCurrent();

    if (routes[hash]?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(routes[hash].scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  renderCurrent() {
    if (!this.container) return;

    const route = routes[this.currentHash] || routes['#inicio'];
    this.container.innerHTML = route.render();

    // Attach view-specific interactive events
    if (typeof route.attach === 'function') {
      route.attach();
    }

    // Apply responsive tables transformation
    initResponsiveTables();
  }

  updateActiveNavLinks(hash) {
    const allLinks = document.querySelectorAll('.nav-link, .nav-drawer-link');
    allLinks.forEach((link) => {
      const linkHash = link.getAttribute('href');
      if (linkHash === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  triggerGlintEffect() {
    const navBadge = document.querySelector('.led-badge');
    if (navBadge) {
      navBadge.classList.remove('glint-active');
      // trigger reflow
      void navBadge.offsetWidth;
      navBadge.classList.add('glint-active');
    }
  }
}

export const router = new AppRouter();
