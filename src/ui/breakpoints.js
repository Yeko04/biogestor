export function getBreakpoint() {
  const width = window.innerWidth;
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'xs';
}

export function isMobile() {
  return window.innerWidth < 768;
}

export function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function isDesktop() {
  return window.innerWidth >= 1024;
}
