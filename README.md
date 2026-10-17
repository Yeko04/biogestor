# Bioterra — Materia en movimiento

**Proyecto desarrollado para el Rally Latinoamericano de Innovación 2026.**

Bioterra es un prototipo web demostrativo para organizar el aprovechamiento comunitario de biomasa vegetal urbana en Masaya, Nicaragua. Propone una alternativa a la quema a cielo abierto mediante la recepción y clasificación de residuos, el seguimiento de lotes y procesos, y el registro de subproductos como biol, biogás y biochar.

> El sistema es un prototipo local: no cuenta con servidor, cuentas de usuario ni sincronización entre dispositivos. Los registros se guardan en el navegador donde se utiliza la aplicación.

## Qué permite hacer

- Explorar el proceso, los materiales que se reciben, los productos y la ubicación del proyecto.
- Registrar solicitudes o aportes de biomasa y gestionar su recepción.
- Clasificar recepciones y vincularlas con lotes para conservar su trazabilidad.
- Registrar procesos, seguimientos, pérdidas y subproductos.
- Consultar indicadores de operación e impacto.
- Configurar las categorías y los materiales habilitados para el centro.
- Importar y exportar respaldos JSON desde la vista de configuración.

La asignación de biomasa a un proceso es una decisión operativa manual; el sistema no decide el tratamiento automáticamente. Los registros de prueba o de procesos no ejecutados deben mantenerse identificados como simulados.

## Flujos propuestos

1. **Fracción húmeda o blanda** — restos de frutas, verduras y mercados pueden procesarse en biodigestor para obtener biogás y biol.
2. **Fracción seca o dura** — poda y ramas pueden triturarse y aprovecharse mediante pirólisis para producir biochar.
3. **Mezcla final** — biol y biochar pueden registrarse como una enmienda orgánica para su distribución documentada.

Estos son flujos propuestos para el prototipo; la operación real debe ajustarse a la capacidad, seguridad y condiciones del centro.

## Requisitos

- Node.js con soporte para módulos ES.
- Navegador moderno.
- Conexión a Internet para cargar los fondos cartográficos del mapa. La aplicación, Leaflet, las imágenes y las tipografías se sirven localmente.

No hace falta instalar paquetes: el proyecto no declara dependencias de npm.

## Ejecutar en local

Desde la carpeta del proyecto:

```bash
npm run dev
```

También se puede usar `npm start` o ejecutar directamente:

```bash
node scripts/serve.mjs
```

Abre [http://localhost:5500](http://localhost:5500). El servidor escucha en `127.0.0.1`; para elegir otro puerto, establece la variable de entorno `PORT` antes de iniciar el servidor. No abras `index.html` directamente como archivo: la aplicación necesita un servidor HTTP para cargar sus módulos ES.

## Pruebas

Ejecuta todas las pruebas disponibles con:

```bash
npm test
```

También puedes ejecutar la prueba del mapa directamente:

```bash
node --test tests/map-data.test.mjs
```

## Datos y limitaciones

- La persistencia principal usa `localStorage` del navegador; los datos no se comparten con otros usuarios ni dispositivos.
- Usa la opción de exportación de la vista **Configuración** para guardar un respaldo JSON, y la opción de importación para restaurarlo.
- Limpiar los datos del sitio o cambiar de navegador/perfil puede hacer que los registros no estén disponibles. Conserva respaldos fuera del navegador.
- El mapa requiere Internet para sus mosaicos cartográficos. La aplicación no incluye backend, autenticación, sensores ni conexión con instalaciones físicas.
- Las imágenes de referencia no documentan las instalaciones del piloto. Consulta sus fuentes y licencias en [Licencias de imágenes](assets/LICENCIAS-IMAGENES.md).

## Estructura del proyecto

```text
biogestor/
├── assets/          # Marca, imágenes, tipografías y licencias
├── css/             # Estilos, componentes, formularios y responsive
├── docs/            # Identidad visual, reglas de negocio y notas técnicas
├── examples/        # Datos de ejemplo
├── scripts/         # Servidor HTTP local
├── src/
│   ├── data/        # Esquema de datos
│   ├── logic/       # Validación, lotes, procesos e indicadores
│   ├── storage/     # Estado inicial y persistencia local
│   ├── store/       # Estado y acciones de la aplicación
│   └── ui/          # Navegación, componentes y vistas
├── tests/           # Pruebas automatizadas
├── vendor/leaflet/  # Leaflet incluido en el repositorio
├── index.html       # Shell de la aplicación
└── package.json     # Comandos dev, start y test
```

## Documentación relacionada

- [Reglas de negocio y trazabilidad](docs/logic-rules.md)
- [Identidad visual de Bioterra](docs/bioterra-identidad.md)
- [Dirección visual](docs/direccion-visual.md)
- [Notas de diseño responsive](docs/responsive-notes.md)
- [Licencias de imágenes](assets/LICENCIAS-IMAGENES.md)
