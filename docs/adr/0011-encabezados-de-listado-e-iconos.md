# 0011 · Encabezados de los listados, íconos y bloque del Directorio desde el panel

- **Estado:** Accepted (diseño visual con imagen superado por 0016, 2026-10-12) · 2026-10-12 · decisión de la persona responsable del proyecto («imágenes e íconos editables»)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `../context.md` (Encabezado de listado, Ícono) · `../architecture.md` (§ Secciones y SEO) ·
  `../design.md` (Encabezado de los listados) · ADR 0010 (imagen para redes por listado)

## Contexto

Los listados (Noticias, Agenda, Anuncios, Repositorio, Directorio e Instagram) tenían solo un título de texto, y el bloque
«¿Eres egresado/a y no apareces?» del Directorio, también. El Encargado de comunicaciones quería poder dar identidad visual
a esas páginas con una imagen y un ícono, sin pedir un cambio de código. Además, la imagen que sale al compartir cada
listado (og:image) se tenía que poder elegir por listado (ADR 0010).

## Decisión

1. **Imagen para redes por listado** (ADR 0010, ampliado): en «SEO del sitio», cada listado es un objeto con
   `descripcion` y `imagen`. Precedencia de la imagen: imagen del listado → imagen del sitio → `og-default.png`
   (`imagenDeListado` en `src/lib/seo.ts`).
2. **Encabezado de listado**: archivo nuevo «Encabezados de los listados» (`src/content/encabezados/encabezados.yml`,
   colección `encabezados`) con un objeto por listado `{ imagen, imagen_alt, icono, intro }`. El componente
   `EncabezadoListado.astro` reemplaza el `<h1>` de las seis páginas. La `intro` (1–2 frases, texto plano) se muestra
   bajo el título. Sin valores, el marcado queda igual. El Inicio no tiene encabezado: ya tiene el carrusel.
3. **Bloque «¿Eres egresado/a?»** del Directorio: `sumarse_imagen`, `sumarse_imagen_alt` y `sumarse_icono` en «Secciones del
   sitio» (`menu.yml`), junto al formulario del Directorio.
4. **Ícono**: desplegable con una lista curada de 44 íconos de Phosphor. La lista se define una sola vez en `config.yml`
   (ancla `&iconos_phosphor`), se reconoce en `src/lib/iconos.ts` y se dibuja con `Icono.astro` (imports estáticos, sin
   glob del paquete). Una prueba (`iconos.test.ts`) impide que las tres listas se desalineen. Un valor desconocido no
   muestra ícono ni rompe el build.

## Consecuencias

- Agregar un ícono exige cambiar `config.yml` (ancla), `src/lib/iconos.ts` y `Icono.astro`; la prueba avisa si una falta.
- Los tres campos de la lista de íconos viven en el mismo archivo de `config.yml` porque las anclas YAML no cruzan archivos.
- Las imágenes van por `image()` de Astro (se optimizan y no se sirven sin revisar).
- La `intro` no alimenta la descripción de buscadores (`descripcionDeListado`): sigue la cadena de siempre (descripción
  del panel en «SEO del sitio» → texto por defecto del código). Se evaluó usarla como respaldo, pero cambiaría en silencio
  los textos por defecto de seis metadescripciones, pensados para buscadores, y depende de si la intro está llena.
  Pendiente de decisión: si la carrera la quiere como respaldo, se agrega un paso en `descripcionListado` con test.
- Con los archivos vacíos, el HTML de las seis páginas es igual al de antes. Única salvedad: en Agenda y Anuncios el
  `<h1>` deja de llevar el atributo de ámbito de Astro (`data-astro-cid-*`); esas páginas no tienen reglas CSS que lo usen.

## Alternativas

- **Un ícono libre por URL o archivo SVG**: más flexible, pero el panel no valida el archivo y el sitio quedaría sin
  control de accesibilidad ni de peso. Se descartó.
- **Importar todo el paquete `phosphor-astro` con un glob**: simple, pero infla el build. Se usan imports estáticos de los 44.
- **Encabezado con la imagen como fondo y título encima (con velo)**: más llamativo, pero el contraste depende de cada
  foto y del modo oscuro. Se eligió imagen ancha con el título debajo.
  **Nota del 2026-10-12:** esta alternativa se adoptó después, con velo degradado y texto blanco fijo; ver ADR 0016.
