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

  let previousBodyOverflow = '';

  const open = () => {
    if (drawer.classList.contains('is-open')) return;
    previousBodyOverflow = document.body.style.overflow;
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.inert = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    close.focus();
  };

  const closeDrawer = (restoreFocus = true) => {
    const wasOpen = drawer.classList.contains('is-open');
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = previousBodyOverflow;
    if (wasOpen) {
      if (restoreFocus && toggle.getClientRects().length > 0) toggle.focus();
      else document.getElementById('app-view')?.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) closeDrawer();
    else open();
  });
  close.addEventListener('click', () => closeDrawer());
  overlay.addEventListener('click', () => closeDrawer());
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches) closeDrawer(false);
  });
  window.addEventListener('hashchange', () => closeDrawer(false));

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const hash = link.getAttribute('href');
      closeDrawer(false);
      if (window.location.hash !== hash) window.location.hash = hash;
      else {
        const target = document.getElementById(hash.slice(1)) || document.getElementById('app-view');
        target?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'start'
        });
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeDrawer();
    } else if (e.key === 'Tab') {
      const focusable = [...drawer.querySelectorAll('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (e.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  const scrollTop = document.getElementById('scrollTop');
  const updateScrollControls = () => {
    const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableDistance > 0 ? window.scrollY / scrollableDistance : 0;
    document.documentElement.style.setProperty('--scroll-progress', String(Math.min(1, Math.max(0, progress))));
    scrollTop?.classList.toggle('is-visible', window.scrollY > 480);
  };
  window.addEventListener('scroll', updateScrollControls, { passive: true });
  window.addEventListener('resize', updateScrollControls, { passive: true });
  scrollTop?.addEventListener('click', () => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    document.getElementById('app-view')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior });
  });
  updateScrollControls();
}
