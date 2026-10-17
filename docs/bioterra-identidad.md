# Bioterra — Materia en movimiento

Dirección vigente desde el 17 de octubre de 2026. Sustituye la propuesta inspirada en Agrifos.

## Composición e identidad

Portada fotográfica oscura, titulares condensados en Barlow Condensed y texto en DM Sans. Paleta de verde profundo `#163f35`, lima `#d8e88c`, blanco mineral `#f5f5ed` y verdes secundarios. Marca geométrica propia. Sin las fotografías superpuestas, el sello circular, los recortes arqueados, las cursivas ni las fuentes de la propuesta anterior.

La portada presenta una fotografía real de producción de biogás. Los bloques de resultados combinan un biodigestor flexible, una ilustración propia de biol y una fotografía de compostaje. El mapa, los formularios y las vistas de operación usan la misma identidad.

## Nuevas referencias revisadas en Figma

- [GreenBin — Om Auti](https://www.figma.com/community/file/1358457074437662725): tareas móviles y participación en gestión de residuos.
- [EcoInsight — wealthwells](https://www.figma.com/community/file/1372064821677117630): contraste entre datos, mapa y paneles. Se revisó su vista previa; no se compró ni copió el archivo comercial.
- [Ecoriz — Peterdraw](https://www.figma.com/community/file/1621505965282292293): protagonismo fotográfico y composición de un producto de energía renovable. Se revisó su vista previa; no se compró ni copió el archivo comercial.

Se combinaron criterios de composición y navegación en una implementación propia. No se usó la plantilla de Agrifos ni se incorporaron componentes licenciados de esos diseños.

## Imágenes

Fotografías CC0 o liberadas al dominio público, verificadas individualmente en Wikimedia Commons. Fuentes y autores en [Licencias de imágenes](../assets/LICENCIAS-IMAGENES.md) y en el pie de la página. La imagen del biol es una ilustración vectorial propia, identificada como tal. No se etiqueta una fotografía genérica de fertilización como si documentara biol.

## Ejecutar

```powershell
node scripts/serve.mjs
```

Abrir http://localhost:5500. La carpeta local sigue llamándose `biogestor` porque es el clon del repositorio original. Se conservan las claves de almacenamiento para mantener los registros existentes.

```powershell
node --test tests/map-data.test.mjs
```

Las fotografías, fuentes y Leaflet se sirven localmente. Los fondos del mapa requieren conexión. El prototipo conserva persistencia local, sin agregar backend, autenticación ni sensores.
