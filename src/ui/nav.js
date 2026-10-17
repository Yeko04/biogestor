export function initNav() {
  document.querySelector('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    const main = document.getElementById('app-view');
    main?.focus();
    main?.scrollIntoView({ block: 'start' });
  });
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');
  const close = document.getElementById('navDrawerClose');
  const overlay = document.getElementById('navOverlay');
  const links = document.querySelectorAll('.nav-drawer-link');

  if (!toggle || !drawer || !close || !overlay) {
    return;
  }

  const open = () => {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.inert = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    close.focus();
  };

  const closeDrawer = () => {
    const wasOpen = drawer.classList.contains('is-open');
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (wasOpen) toggle.focus();
  };

  toggle.addEventListener('click', open);
  close.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches) closeDrawer();
  });

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const hash = link.getAttribute('href');
      closeDrawer();
      if (window.location.hash !== hash) window.location.hash = hash;
      else document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'Tab' && drawer.classList.contains('is-open')) {
      const focusable = [...drawer.querySelectorAll('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
