> Propuesta anterior, sustituida por [la identidad de Bioterra](bioterra-identidad.md) el 17 de octubre de 2026.

# Rediseño local de Biogestor

La versión local aplica una identidad editorial inspirada en Agrifos: lino, bosque y ocre, Josefin Sans y Nunito, fotografías del campo, un sello botánico propio y secciones con distintas composiciones.

## Ejecutar

Desde la carpeta `biogestor`, con Node.js instalado:

```powershell
node scripts/serve.mjs
```

Abrir http://localhost:5500. El servidor escucha únicamente en el equipo local y no requiere instalar dependencias. Para otro puerto: `$env:PORT = '5502'` antes de ejecutarlo.

## Qué cambió

- Portada fotográfica y narrativa, recorrido por pestañas para biomasa húmeda y seca, materiales aceptados e invitación a participar.
- Mapa Leaflet con lista y marcadores sincronizados, filtro por material, selector calles/satélite, encuadre general, ficha del centro y fichas de aportes. Una línea animada ilustra la conexión entre un origen seleccionado y el centro; se identifica como ilustrativa y no calcula rutas viales.
- Ficha antes de la lista en móvil, controles táctiles, foco visible y recorrido de pestañas por teclado.
- Mismo sistema de color, tipografía, formularios y tablas para aportes, recepción, lotes, subproductos, indicadores y administración.
- Menú móvil con cierre por Escape, devolución del foco, bloqueo de elementos ocultos y contención del foco.
- Fotografías, tipografías oficiales de Google Fonts y Leaflet guardados en el repositorio, junto con sus licencias. Las imágenes de los proveedores cartográficos siguen requiriendo conexión. No se presenta como una aplicación completamente offline.
- Se retiró de la portada el simulador con fluctuaciones aleatorias. El archivo anterior permanece en el repositorio sin montarse en la página pública.
- Se corrigió la creación de solicitudes sin ubicación: se guarda `null`. Los antiguos valores `0,0` tampoco crean marcadores ficticios.
- Se conservaron los módulos y la persistencia local originales. Los registros de ejemplo se identifican como demostrativos y las cantidades estimadas mantienen kg o m³.

## Datos y límites

Las dos ubicaciones semilla se ajustaron al territorio de Masaya como ejemplos demostrativos, sin presentarlas como ubicaciones verificadas. Los datos que ya existan en el almacenamiento de un navegador no se sobrescriben por este cambio. El registro nuevo no inventa una ubicación si no fue suministrada.

El producto sigue siendo un prototipo local: no se agregó un backend, autenticación ni sensores físicos. La consulta de indicaciones abre Google Maps. No se publicó ni se envió código al remoto.

## Comprobaciones

```powershell
node --test tests/map-data.test.mjs
```

Pruebas automatizadas para coordenadas inválidas, clasificación y filtros, preservación de unidades, coherencia territorial de la semilla y compatibilidad con solicitudes antiguas sin ubicación.

Verificación en navegador a 390, 768 y 1440 px: portada, imágenes, ausencia de desbordamiento de la página, cambio de proceso, filtros del mapa, selección de aportes y acceso a pantallas de operación. Se probó crear una solicitud de 2 m³ y recargarla en un origen de prueba separado (`localhost:5501`) para no añadir registros de prueba a la vista de entrega en `localhost:5500`.

Capturas de revisión en `docs/preview/`. Fotografías ilustrativas acreditadas en el pie de página. El símbolo de marca y los iconos son SVG propios; no se copiaron componentes de los archivos de Figma.
