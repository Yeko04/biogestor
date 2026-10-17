# Bioterra — Materia en movimiento

## Identidad visual local de Bioterra

Ejecutar `node scripts/serve.mjs` y abrir http://localhost:5500. No requiere instalar dependencias. La identidad visual, el mapa interactivo y las comprobaciones están documentados en [Identidad de Bioterra](docs/bioterra-identidad.md).

Pruebas: `node --test tests/map-data.test.mjs`.

Sistema web integral para la gestión, recepción, clasificación (triaje), procesamiento y control de inventario de biomasa vegetal urbana, orientado a evitar quemas a cielo abierto y generar subproductos de alto valor (Biol, Biogás y Biochar).

## Arquitectura del Proyecto

El sistema utiliza JavaScript Vanilla (ES Modules) y guarda los registros en `localStorage`. Las fotografías, tipografías y Leaflet están incluidos en el repositorio; los fondos cartográficos requieren conexión a Internet.

```text
biogestor/
├── css/                         # Hojas de estilo responsive (Mobile-First)
│   ├── base.css                 # Tokens de diseño, reset y tipografía
│   ├── layout.css               # Contenedores, grids y estructura base
│   ├── components.css           # Botones, tarjetas, badges y KPIs
│   └── responsive.css           # Media queries y adaptabilidad
├── docs/                        # Documentación técnica
│   ├── logic-rules.md           # Reglas de negocio, trazabilidad y procesos
│   └── responsive-notes.md      # Breakpoints y notas de maquetación
├── examples/                    # Datos de prueba
│   └── sample-data.json         # Ejemplos de colecciones
├── src/                         # Código fuente unificado
│   ├── logic/                   # Lógica de dominio pura
│   │   ├── constants.js         # Estados, roles, umbrales y tipos
│   │   ├── validation.js        # Validaciones de recepción y solicitudes
│   │   ├── lots.js              # Trazabilidad de lotes y balances de masa
│   │   ├── processes.js         # Procesos de biomasa (Biodigestor / Pirólisis)
│   │   ├── subproducts.js       # Control de existencias y salidas
│   │   ├── indicators.js        # Cálculo de KPIs (desviación, producción, tiempos)
│   │   └── id.js                # Generador seguro de identificadores UUID
│   ├── storage/                 # Motor de almacenamiento y persistencia
│   │   ├── default-state.js     # Estado semilla inicial y catálogo
│   │   ├── validator.js         # Validador de esquema JSON
│   │   └── localstore.js        # Persistencia en localStorage con auto-guardado debounced
│   ├── ui/                      # Componentes de presentación
│   │   ├── breakpoints.js       # Detección de dispositivos y tamaños
│   │   ├── nav.js               # Control accesible del drawer móvil
│   │   └── tables-responsive.js # Adaptabilidad de tablas a formato tarjeta
│   └── main.js                  # Punto de entrada de la aplicación
└── index.html                   # Shell principal de la aplicación web
```

## Flujos Operativos Clave

1. **Fracción Húmeda / Blanda**: Restos de mercados, frutas y verduras $\rightarrow$ Biodigestor $\rightarrow$ Biogás + Biol.
2. **Fracción Seca / Dura**: Poda y ramas $\rightarrow$ Triturado / Machecado $\rightarrow$ Pirólisis (Kon-Tiki elevado) $\rightarrow$ Biochar.
3. **Mezcla Final**: Enmienda orgánica compuesta (Biol + Biochar) para distribución comunitaria.

## Cómo Ejecutar Localmente

Dado que el proyecto utiliza **ES Modules** nativos de JavaScript, se debe ejecutar a través de un servidor HTTP local (no abrir directamente con doble click):

- Con **Python**:
  ```bash
  python -m http.server 5500
  ```
- Con **Node.js** (`npx serve` o `live-server`):
  ```bash
  npx serve .
  ```
- O utilizando la extensión **Live Server** en Visual Studio Code.
