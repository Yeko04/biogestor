# Responsive Web Notes - Biogestor

## Breakpoints (mobile-first)
- xs: < 640px
- sm: >= 640px
- md: >= 768px
- lg: >= 1024px
- xl: >= 1280px

## Layout
- Container: width: min(100% - 2rem, 1280px)
- Grid: 1 col (xs) -> 2 (md) -> 3 (lg) -> 4 (xl) for KPIs
- Navbar: hamburger on < md, horizontal >= md
- Tables: card-view < 768px via data-responsive="table"

## Testing
- Chrome DevTools (device emulation: iPhone SE, Pixel 7, iPad, 1024+, 1280+)
- Test orientation (portrait/landscape)
- Check tables, forms, map, buttons

## Files
- css/base.css, layout.css, components.css, responsive.css
- js/ui/nav.js, tables-responsive.js, breakpoints.js
- js/storage/localstore.js
- src/ui/breakpoints.js
- index.html

## How to run
Use a local server (Live Server in VS Code, or py -m http.server 5500). Do NOT open index.html directly with double click.
