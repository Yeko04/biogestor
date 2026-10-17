import { store } from '../../store/store.js';
import { selectActivePublicMaterials, selectKpiTotals, selectStockSummary, selectCapacidad, selectSolicitudes } from '../../store/selectors.js';
import { initInteractiveMap } from '../components/interactive-map.js';
import { icon, escapeHtml as esc } from '../components/icons.js';

const number = (value) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 1 }).format(Number(value) || 0);

export function renderHomeView() {
  const state = store.getState();
  const materials = selectActivePublicMaterials(state);
  const kpis = selectKpiTotals(state);
  const stock = selectStockSummary(state);
  const capacity = selectCapacidad(state);
  const requests = selectSolicitudes(state);
  return `
    <section class="bioterra-hero" id="inicio" aria-labelledby="hero-heading">
      <div class="container hero-meta"><p class="eyebrow"><span class="status-dot"></span> BIOECONOMÍA HECHA EN COMUNIDAD</p><span>MASAYA, NICARAGUA / 11.974° N</span></div>
      <div class="container hero-stage">
        <img class="hero-process-photo" src="assets/biogas-plant.jpg" alt="Instalación de producción de biogás con tanques y digestores" width="1920" height="1280" fetchpriority="high">
        <div class="hero-shade"></div>
        <div class="hero-manifesto"><p class="hero-overline">LA MATERIA CAMBIA. EL FUTURO TAMBIÉN.</p><h1 id="hero-heading">EL FINAL<br>ES OTRO<br><span>COMIENZO.</span></h1><p class="hero-intro">Activamos el valor de los restos vegetales. Los transformamos en biol, biogás y biochar para que la comunidad produzca, aproveche y regenere.</p><div class="hero-cta"><a class="btn btn-acid" href="#solicitudes">Transformar mi aporte ${icon('diagonal')}</a><a class="hero-map-link" href="#ubicacion">Explorar la red ${icon('pin')}</a></div></div>
        <div class="hero-photo-label"><span>01 / TECNOLOGÍA QUE TRANSFORMA</span><p>Producción de biogás<br><small>Fotografía de referencia · CC0</small></p></div>
        <a class="hero-down" href="#ciclo" aria-label="Explorar el proceso de transformación">↓</a>
      </div>
      <div class="container hero-strip"><span>RESTOS VEGETALES</span>${icon('arrow')}<span>TRANSFORMACIÓN</span>${icon('arrow')}<span>NUEVOS RECURSOS</span><span class="hero-strip-note">UN CICLO. MUCHAS POSIBILIDADES.</span></div>
    </section>
    <section class="bioterra-impact" aria-label="Resumen de registros"><div class="container impact-layout"><div><p class="eyebrow">DEL REGISTRO A LA ACCIÓN</p><h2>Materia que<br>ya cuenta.</h2><a class="text-link" href="#indicadores">Explorar el impacto ${icon('diagonal')}</a></div><div class="impact-number"><small>01 / BIOMASA ACEPTADA</small><strong>${number(kpis.kg.aceptados)}<span>kg</span></strong><p>Un nuevo destino para el material.</p></div><div class="impact-number"><small>02 / BIOL DISPONIBLE</small><strong>${number(stock.L.disponible)}<span>L</span></strong><p>Fertilidad en forma líquida.</p></div><div class="impact-number"><small>03 / BIOCHAR DISPONIBLE</small><strong>${number(stock.kg.disponible)}<span>kg</span></strong><p>Un recurso para mejorar el suelo.</p></div></div><div class="container impact-source">Cifras de los registros locales del prototipo demostrativo.</div></section>
    <section class="resources-section" id="productos" aria-labelledby="resources-heading"><div class="container"><div class="section-heading"><div><p class="eyebrow">MATERIA REACTIVADA / 01</p><h2 id="resources-heading">EL VALOR ESTABA AHÍ.<br>LE DAMOS OTRA FORMA.</h2></div><p>Tecnología sencilla, procesos distintos y recursos que pueden regresar a la comunidad.</p></div><div class="resource-grid">
      <article class="resource-card resource-energy"><img src="assets/biodigestor.jpg" alt="Biodigestor de membrana flexible instalado en una zanja" width="1920" height="1440" loading="lazy"><span class="resource-index">01 / BIODIGESTIÓN</span><div class="resource-caption"><h3>ENERGÍA<br>QUE SE ACTIVA.</h3><p>La transformación sin oxígeno abre el camino al biogás y al biol.</p><a href="#ciclo" aria-label="Conocer el proceso de biodigestión">${icon('diagonal')}</a></div></article>
      <article class="resource-card resource-biol"><img src="assets/biol.svg" alt="Ilustración de un bidón de biol, fertilizante orgánico líquido" width="600" height="700" loading="lazy"><span class="resource-index">02 / BIOL</span><div class="resource-caption"><h3>FERTILIDAD<br>EN CADA GOTA.</h3><p>Un subproducto líquido del proceso de biodigestión.</p><a href="#subproductos" aria-label="Consultar existencias de biol">${icon('diagonal')}</a></div><span class="illustration-label">ILUSTRACIÓN PROPIA</span></article>
      <article class="resource-card resource-compost"><img src="assets/compost.jpg" alt="Material orgánico en proceso de compostaje, mezclado con una herramienta manual" width="1920" height="1440" loading="lazy"><span class="resource-index">03 / MATERIA ORGÁNICA</span><div class="resource-caption"><h3>EL SUELO<br>TIENE FUTURO.</h3><p>Separar y aprovechar los restos es el primer paso. Compostaje: imagen de referencia.</p><a href="#materiales" aria-label="Consultar materiales aceptados">${icon('diagonal')}</a></div></article>
    </div></div></section>
    <section class="editorial-section cycle-section" id="ciclo" aria-labelledby="cycle-heading">
      <div class="container">
        <div class="section-heading"><div><p class="eyebrow">EL PROCESO / 02</p><h2 id="cycle-heading">CADA MATERIAL,<br>SU PROPIO CAMINO.</h2></div><p>Dos recorridos para aprovechar la biomasa vegetal. Elegí un material y descubrí cómo se transforma.</p></div>
        <div class="cycle-layout">
          <div class="cycle-visual"><img src="assets/biodigestor.jpg" alt="Biodigestor flexible de referencia, fotografía de Kyle Butler en dominio público" loading="lazy" width="1920" height="1440"><div class="cycle-caption">TECNOLOGÍA APROPIADA<br><strong>para un cambio real.</strong></div><span class="photo-credit">Kyle Butler · Dominio público · Imagen de referencia</span></div>
          <div class="cycle-story">
            <div class="cycle-tabs" role="tablist" aria-label="Recorridos de transformación"><button role="tab" id="tab-wet" aria-controls="cycle-panel" aria-selected="true" data-cycle="wet">${icon('drop')} Restos húmedos</button><button role="tab" id="tab-dry" aria-controls="cycle-panel" aria-selected="false" tabindex="-1" data-cycle="dry">${icon('leaf')} Poda y ramas</button></div>
            <div id="cycle-panel" role="tabpanel" tabindex="0" aria-labelledby="tab-wet">${cycleContent('wet')}</div>
            <p class="cycle-note">${icon('check')} Dos caminos distintos. Un mismo propósito: devolver valor a la tierra.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="territory-section" id="ubicacion" aria-labelledby="territory-heading">
      <div class="container">
        <div class="section-heading"><div><p class="eyebrow">RED TERRITORIAL / 03</p><h2 id="territory-heading">CONECTAR EL ORIGEN.<br>ACTIVAR EL CAMBIO.</h2></div><p>El territorio es parte del proceso. Explorá los aportes, conocé su origen y encontrá el centro de transformación.</p></div>
        <div class="territory-toolbar"><div class="map-filters" role="group" aria-label="Filtrar aportes por material"><button class="is-selected" data-map-filter="all" aria-pressed="true">Todos los aportes</button><button data-map-filter="wet" aria-pressed="false">${icon('drop')} Restos húmedos</button><button data-map-filter="dry" aria-pressed="false">${icon('leaf')} Poda y ramas</button></div><span class="map-demo-label">DATOS LOCALES · PILOTO DEMOSTRATIVO</span></div>
        <div class="territory-explorer">
          <aside class="territory-sidebar" aria-label="Aportes en el territorio"><div class="territory-sidebar-heading"><span class="eyebrow">RED DE APROVECHAMIENTO</span><p><strong id="map-count">${requests.length}</strong> aportes registrados</p></div><div id="map-list" class="map-request-list"></div><div class="center-note">${icon('sprout')}<div><strong>Centro comunitario</strong><span>${capacity.recepciones_pausadas ? 'Recepciones pausadas' : 'Punto de transformación'} · Masaya</span></div><button id="map-center" class="icon-button" aria-label="Ver centro comunitario">${icon('diagonal')}</button></div></aside>
          <div class="territory-map-wrap"><div id="map" aria-label="Mapa de aportes y centro comunitario"></div><div class="map-tools"><button id="map-fit" aria-label="Encuadrar todos los puntos" title="Encuadrar todos los puntos">${icon('focus')}</button><button id="map-layer" aria-label="Cambiar a imagen satelital" title="Cambiar fondo del mapa">${icon('layers')}</button></div><div id="map-notice" class="map-notice" role="status" hidden></div><div class="map-legend"><span class="legend-center"></span> Centro <span class="legend-wet"></span> Húmedos <span class="legend-dry"></span> Secos</div></div>
          <div id="map-detail" class="map-detail" aria-live="polite"></div>
        </div>
        <p class="territory-footnote">Ubicaciones de ejemplo. Las cantidades de los aportes son estimadas y se verifican al recibir el material.</p>
      </div>
    </section>
    <section class="editorial-section materials-section" id="materiales" aria-labelledby="materials-heading"><div class="container"><div class="section-heading"><div><p class="eyebrow">EL PUNTO DE PARTIDA / 04</p><h2 id="materials-heading">EMPEZÁ POR<br>LO QUE TENÉS.</h2></div><p>La transformación empieza con una buena separación. Estos son los materiales que podemos recibir.</p></div><div class="material-editorial-grid">${materials.map((material, index) => `<article class="material-editorial"><div class="material-top"><span>0${index + 1}</span>${icon(material.tipo_biomasa === 'dura' ? 'leaf' : 'sprout')}</div><h3>${esc(material.nombre)}</h3><p>${material.tipo_biomasa === 'dura' ? 'Ramas y restos de poda separados, sin plásticos ni residuos mezclados.' : 'Material vegetal separado desde el origen, libre de plásticos y otros impropios.'}</p><div class="material-route">${icon(material.tipo_biomasa === 'dura' ? 'flame' : 'drop')} ${material.tipo_biomasa === 'dura' ? 'Camino al biochar' : 'Camino al biol y biogás'}<span>↗</span></div></article>`).join('')}</div><div class="acceptance-note">${icon('check')} Recibimos biomasa vegetal. Revisamos su condición, separación y capacidad disponible antes de aceptarla.</div></div></section>
    <section class="community-invite"><div class="container invite-inner"><div><p class="eyebrow">EL PRÓXIMO CICLO EMPIEZA CON VOS.</p><h2>HAGAMOS QUE<br>ALGO <span>CAMBIE.</span></h2></div><div><p>${capacity.recepciones_pausadas ? `Recepciones temporalmente pausadas. ${esc(capacity.motivo_pausa || 'Consultá la disponibilidad del centro.')}` : 'Tu poda, tus restos vegetales, tu comunidad. Registrá un aporte y demos el siguiente paso.'}</p><a class="btn btn-primary" href="#solicitudes">Activar mi aporte ${icon('diagonal')}</a></div></div></section>
  `;
}

function cycleContent(kind) {
  const dry = kind === 'dry';
  const steps = dry ? [
    ['01', 'Un nuevo destino para la poda', 'Ramas y material vegetal seco, separados y revisados en el centro.'],
    ['02', 'Preparar. Transformar. Aprovechar.', 'El material se tritura y pasa por pirólisis controlada en un horno Kon-Tiki.'],
    ['03', 'Biochar que vuelve al suelo', 'Un material poroso que puede incorporarse como enmienda del suelo.'],
  ] : [
    ['01', 'Todo empieza con tu aporte', 'Restos de frutas, verduras y material vegetal húmedo, separados desde el origen.'],
    ['02', 'La vida transforma la materia', 'En el biodigestor, microorganismos descomponen el material sin oxígeno.'],
    ['03', 'Energía y fertilidad para volver', 'El proceso genera biogás y biol, un fertilizante orgánico líquido.'],
  ];
  return `<div class="cycle-steps">${steps.map(([n, title, text]) => `<article class="cycle-step"><span>${n}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div><div class="cycle-output">${icon(dry ? 'leaf' : 'drop')}<div><small>LO QUE REGRESA</small><strong>${dry ? 'Biochar · vida para el suelo' : 'Biol + biogás · un nuevo comienzo'}</strong></div>${icon('cycle')}</div>`;
}

export function attachHomeEvents() {
  const tabs = [...document.querySelectorAll('[data-cycle]')];
  const activate = (tab) => {
    tabs.forEach((item) => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
    const panel = document.getElementById('cycle-panel');
    panel.innerHTML = cycleContent(tab.dataset.cycle);
    panel.setAttribute('aria-labelledby', tab.id);
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = tabs[event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      activate(next); next.focus();
    });
  });
  initInteractiveMap('map');
}
