export function initResponsiveTables() {
  const wrappers = document.querySelectorAll('[data-responsive="table"]');
  wrappers.forEach((wrap) => {
    const table = wrap.querySelector('table');
    if (!table) return;
    const headers = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim());
    table.querySelectorAll('tbody tr').forEach((tr) => {
      Array.from(tr.querySelectorAll('td')).forEach((td, index) => {
        if (headers[index]) {
          td.setAttribute('data-label', headers[index]);
        }
      });
    });
  });
}
