# 0006 · Página destacada en el Inicio

- **Estado:** Proposed · 2026-10-12 · prototipo en la rama `prototipo-destacado`, pendiente de aprobación
- **Decisores:** proveedor
- **Contexto relacionado:** `0005-paginas-libres-desde-el-panel.md` · `../guia-usuario.md` §4.12 · `../design.md` («Página destacada»)

## Contexto

La propuesta pide una portada dinámica: que el Inicio cambie con el contenido que publica la carrera, sin tocar
código. Hoy el Inicio ya tiene Banners (carrusel con fecha de inicio y fin) y Secciones destacadas (bloques con
imagen al final, en una lista fija del panel). Ninguno de los dos sirve para presentar una página de texto con
video, como «¿Qué es la Bioingeniería?». Esa página está en el menú «La carrera», y casi nadie que llega al sitio
por primera vez la encuentra.

## Decisión propuesta

1. **Una Página libre puede marcarse** con «Destacar en el Inicio» (`destacar_inicio`, por defecto apagado). Se
   muestra como un bloque entre el carrusel de Banners y «Noticias recientes», con título, resumen, video (si
   tiene), imagen (si tiene) y «Ver más» → `/p/<id>`.
2. **Solo una a la vez.** La regla pura `paginaDestacada` (`src/lib/pagina-destacada.ts`) toma las marcadas y
   publicadas, gana la primera por título y deja el resto como `fuera`. El build avisa con un `console.warn`; el
   sitio no falla.
3. **Resumen propio** (`resumen_inicio`, opcional). Si falta, se usa la bajada, así que el bloque nunca queda vacío.
4. **Sin colección nueva.** Usa el modelo de Páginas libres (ADR 0005) y el mismo `VideoModal`.

## Consecuencias

- Una persona de la carrera puede cambiar lo que destaca el Inicio desde el panel, en el próximo build.
- La regla «una sola» la hace el sitio, no el panel. Sveltia no puede limitar un interruptor a una sola entrada. Si se
  marcan varias, el Inicio muestra una y el build lo deja en el registro; el panel no lo advierte.
- El bloque se suma a los Banners y a las Secciones destacadas. Tres lugares para destacar algo en el Inicio: hay que
  explicarlo en la guía de usuario (§4.12) para no confundirlo con ellos.
- Si la página destacada se despublica o se borra, el bloque desaparece sin error; no queda ningún hueco.
- Un cambio en la regla de «una sola» o en los campos va en tres lugares: `public/admin/config.yml`,
  `src/content.config.ts` y `docs/context.md`.

## Alternativas

- **Una Sección destacada manual** (bloque con imagen, en la lista fija de `inicio`): descartada para este caso. Ya
  existe y se ve al final del Inicio, con poco peso visual para una página de texto. Además, obliga a copiar título,
  texto e imagen en dos lugares.
- **Un bloque fijo en el código** (siempre «¿Qué es la Bioingeniería?»): descartado. Requiere código cada vez que
  cambie lo que se quiere destacar.
- **Un ítem de primer nivel en el menú** (p. ej. «¿Qué es?» junto a Inicio): descartado. El menú ya tiene grupos y
  agregar un ítem no aumenta la visibilidad de la página en la portada.
- **Varias páginas destacadas en carrusel**: descartado en el prototipo para no duplicar los Banners.
