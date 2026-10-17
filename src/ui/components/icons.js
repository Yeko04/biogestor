// Botanical and interface marks drawn for Biogestor.
export function icon(name, className = '') {
  const paths = {
    leaf: '<path d="M19 4C10 3 4 7 5 13c1 6 10 8 13 1 1-3 1-6 1-10Z"/><path d="M4 21 15 9M9 15v-5m0 5h5"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    diagonal: '<path d="M6 18 18 6M6 6h12v12"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    drop: '<path d="M12 3C9 7 5 12 5 16a7 7 0 0 0 14 0c0-4-4-9-7-13Z"/><path d="M8 16c0 2 1 3 3 3"/>',
    flame: '<path d="M13 2c2 7-4 7-2 12 2 0 4-2 4-5 4 4 6 7 3 11-3 4-10 3-12-1C3 13 10 10 13 2Z"/>',
    sprout: '<path d="M12 22V11M12 15C4 15 2 11 2 6c6 0 10 3 10 9Zm0-4C12 5 16 2 22 2c0 6-4 9-10 9ZM5 22h14"/>',
    cycle: '<path d="M20 9a8 8 0 0 0-14-3L3 9m0-6v6h6M4 15a8 8 0 0 0 14 3l3-3m0 6v-6h-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    focus: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><circle cx="12" cy="12" r="3"/>',
    layers: '<path d="m12 3 10 6-10 6L2 9l10-6ZM2 14l10 6 10-6"/>',
  };
  return `<svg class="icon ${className}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.leaf}</svg>`;
}
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
