> Propuesta anterior, sustituida por [la identidad de Bioterra](bioterra-identidad.md) el 17 de octubre de 2026.

# Biogestor: dirección visual y recorrido para el video

Revisión: 16 de octubre de 2026. Alcance: lectura de ambos repositorios y revisión visual de las vistas previas de cuatro recursos en Figma Community. Este documento propone el rediseño; no representa una interfaz ya implementada ni una validación de la aplicación en ejecución.

## Dirección elegida

Una biofábrica de barrio que devuelve vida al suelo. La interfaz debe transmitir territorio, materia y trabajo comunitario. Tomar de Agrifos la composición editorial, la fotografía humana, los tonos tierra y la relación entre paisaje y datos. Dar a Biogestor identidad propia mediante el ciclo de transformación de los residuos.

Titular propuesto: **Lo que sobra hoy, da vida mañana.**

Texto: Transformamos restos vegetales y poda en biol, biogás y biochar para nuestra comunidad.

Acciones de entrada: **Quiero aportar material** y **Explorar el territorio**.

## Diagnóstico del código

- `src/ui/views/home-view.js`: el título institucional ocupa el protagonismo; tres llamadas a la acción compiten antes de explicar el valor. La sucesión de simulador, tarjetas y KPI carece de fotografía y contraste editorial.
- `css/base.css`: Inter, superficies blancas, verde brillante y radios repetidos crean una apariencia habitual de panel administrativo.
- `index.html`: ocho destinos mezclan el recorrido ciudadano con recepción, lotes y administración. La etiqueta «En Vivo» tiene como explicación la persistencia local.
- `src/ui/components/biodigestor-sim.js`: presión, temperatura, metano y pH fluctúan mediante `Math.random()`. Presentarlos como simulación educativa explícita; no atribuirlos a sensores conectados.
- `src/ui/components/interactive-map.js`: ya existe Leaflet, dos fondos cartográficos y un marcador del centro. Actualmente funciona como ubicación, no como explorador de la red de biomasa. «Satelital en Vivo» debe pasar a «Imagen satelital»: el código carga teselas de Esri, no una transmisión en directo.
- `src/storage/default-state.js`: el centro se ubica en Masaya y las solicitudes de ejemplo tienen coordenadas en Managua. Confirmar el territorio del piloto antes de construir la narración geográfica.
- La persistencia de los registros es local. El README plantea funcionamiento offline, pero las fuentes, Leaflet y las teselas dependen de servicios externos y no se observa un service worker entre los archivos revisados.

## Plantillas revisadas en Figma

| Recurso | Uso propuesto | Evaluación visual |
| --- | --- | --- |
| [Smart Agro — MD. Mahamudur Rahman](https://www.figma.com/community/file/1282754155929226368) | Portada y bloques fotográficos | Primera elección: verde profundo, acentos cálidos, fotografías amplias y secciones alternadas. Adaptar la composición al trabajo comunitario. |
| [AgriVista Farm Agriculture Landing Page — Garis Studio](https://www.figma.com/community/file/1262629286217779843) | Jerarquía y ritmo de la página pública | Segunda referencia: portada fotográfica y alternancia entre imagen y texto. Menos distintiva que Agrifos; usar selectivamente. |
| [Map Navigation Mobile App UI Kit Template — Jit Banik](https://www.figma.com/community/file/1021089370549931688) | Mapa y ficha inferior móvil | Referencia útil para mapa protagonista, selección de ubicación y detalle contextual. Aplicar la paleta de Biogestor. Es un diseño de interfaz; no entrega por sí mismo cartografía ni rutas funcionales. |
| [AgroFarm — Thamuditha Veenath](https://www.figma.com/community/file/1435714398681844113) | Arquitectura de navegación móvil | Referencia secundaria: navegación por tareas y pantallas compactas. Sus amarillos saturados y densidad visual no son la dirección recomendada. |

Las fichas consultadas muestran CC BY 4.0. Si se reutilizan componentes, registrar autor, enlace, licencia y modificaciones; revisar por separado los derechos de fotografías y fuentes incluidas. La revisión cubrió fichas y vistas previas, no la calidad interna de componentes ni su duplicación en Figma.

## Sistema visual propuesto

- Lino `#F9F0E9`, bosque `#31543B`, chocolate `#472319`, ocre `#C28F57`. Son los tokens de referencia de Agrifos; ajustar contraste según el uso.
- Josefin Sans para títulos y Nunito para texto, como punto de continuidad con Agrifos. Pesos contenidos y números grandes para resultados comprobables.
- Fotografías de manos, mercados, poda y suelo; priorizar imágenes del equipo y del territorio con autorización. Conservar créditos en cualquier fotografía de terceros.
- Textura de papel muy tenue, líneas finas, pequeños motivos botánicos y recortes asimétricos. Evitar aplicar la misma tarjeta redondeada a cada sección.
- Movimiento con propósito: revelar etapas del proceso, destacar un punto seleccionado y conectar material con resultado. Respetar la preferencia de movimiento reducido.

## Página pública

1. Portada editorial: titular breve, fotografía dominante y un detalle de materia vegetal o suelo. El nombre institucional completo puede ir en la presentación del proyecto.
2. «Cada resto tiene un siguiente paso»: dos recorridos legibles. Restos húmedos → biodigestión → biol y biogás. Poda seca → preparación → pirólisis → biochar. Explicar las condiciones de aceptación junto al material.
3. Mapa del territorio como sección protagonista, con acceso a pantalla amplia.
4. Historias del material: de dónde viene, cómo se procesa y para qué sirve. Identificar claramente los ejemplos demostrativos.
5. Impacto desde registros: biomasa recibida/aceptada, lotes y existencias. Mantener diferenciadas entradas, producción e inventario disponible.
6. Invitación a participar con solicitud sencilla.

Navegación pública propuesta: El proyecto / El ciclo / Territorio / Participar. Acceso «Operación» para los módulos de gestión; conservar las funcionalidades actuales y su acceso por teclado.

## Mapa que cuenta una historia

En escritorio: mapa amplio y panel lateral con lista de aportes. Al seleccionar una fila o un marcador, destacar ambos y mostrar material, cantidad estimada, estado y modalidad de entrega. El centro debe tener un símbolo diferente al de los aportes.

En móvil: mapa en la parte superior y ficha inferior expandible con botones visibles. Ofrecer vista de lista equivalente, controles táctiles de al menos 44 px y estados que se entiendan con texto y forma además de color.

Interacciones prioritarias:

- Filtrar por tipo de material y estado de solicitud usando los registros existentes.
- Cambiar entre calles y satélite, volver a encuadrar todos los puntos y consultar la ficha del centro.
- Mostrar un resumen que se actualice con los filtros y un estado vacío comprensible.
- Abrir indicaciones externas para un punto seleccionado.
- Para el video, permitir un recorrido guiado sobre puntos de demostración identificados. Si una línea conecta origen y centro sin un motor de rutas, llamarla «conexión ilustrativa»; no presentar distancia por carretera ni tiempo de llegada como calculados.
- Explicar fallos de carga de la cartografía y conservar la lista utilizable. Mantener visible la atribución del proveedor.

La primera versión puede ampliar el Leaflet existente. El impacto visual depende principalmente de la composición, las fichas y la interacción entre mapa y datos; no exige migrar el proyecto a React ni añadir una infraestructura cartográfica nueva.

## Interfaz de operación en móvil

Cuatro accesos principales: Resumen / Aportes / Procesos / Más. Acciones frecuentes a un toque: registrar recepción y revisar solicitudes. Formularios divididos en pasos cortos con etiquetas persistentes, unidades claras y confirmación vinculada al registro creado. Tarjetas de lotes con material, peso, proceso y siguiente acción; tablas completas en escritorio.

## Secuencia de captura propuesta, 40 segundos

| Tiempo | Escena | Qué demuestra |
| --- | --- | --- |
| 0–6 s | Portada, fotografía y titular | Identidad y propósito comprensibles |
| 6–13 s | Selección de un aporte en el mapa | Territorio, origen y detalle del material |
| 13–22 s | Solicitud y recepción desde móvil | Uso concreto y facilidad de participación |
| 22–31 s | Lote y recorrido de transformación | Trazabilidad y explicación del proceso |
| 31–40 s | Existencias e impacto del mismo recorrido | Resultado coherente y cierre comunitario |

Preparar datos de demo reproducibles, coordinar las cantidades entre escenas y rotular la simulación. Las capturas deben mostrar el producto funcionando; no simular éxito de acciones que no persisten.

## Orden de implementación

1. Aplicar tokens y jerarquía editorial; reorganizar portada y navegación.
2. Ampliar el mapa con solicitudes existentes, filtros y ficha adaptable.
3. Unificar formularios, lotes e indicadores con el mismo sistema visual.
4. Separar etiquetas de demo, simulación y registros; preparar la secuencia del video.
5. Verificar 390 px, 768 px y 1440 px: desbordamiento, navegación con teclado, foco visible, formularios, persistencia, filtros y selección del mapa. Probar también errores de cartografía y movimiento reducido.

Entregable de esta revisión: dirección de diseño y selección de referencias. No se modificó el código de la aplicación ni se publicó ningún cambio remoto.
