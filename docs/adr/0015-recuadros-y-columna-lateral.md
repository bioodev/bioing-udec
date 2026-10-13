# 0015 · Recuadros destacados en el texto y columna lateral en las fichas

- **Estado:** Accepted · 2026-10-12 · decisión de la persona responsable del proyecto (preguntó por «asides» y eligió ambas formas)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `../design.md` (Recuadros, Columna lateral de las fichas) · `../guia-usuario.md` (Recuadros destacados) · `../analisis/2026-10-12-revision-seguridad.md` (saneador del cuerpo)

## Contexto

El cuerpo de Noticias, Actividades, Anuncios y Páginas es Markdown escrito en el panel. No había forma de destacar
un aviso dentro del texto: el HTML crudo se borra al publicar (saneador de la revisión de seguridad). Las fichas
mostraban los datos clave (fecha, lugar, contacto, organizadores) en una lista sobre el texto, y no había forma de
compartirlas.

## Decisión

1. **Recuadros** con la sintaxis de las alertas de GitHub: una cita cuya primera línea es `[!NOTA]`, `[!IMPORTANTE]`,
   `[!CONSEJO]` o `[!ATENCIÓN]` (también en inglés: `NOTE`, `IMPORTANT`, `TIP`, `WARNING`). El texto puede ir en la
   misma línea o en las siguientes. Un plugin hast de Sätteri (`src/lib/recuadros.ts`, con test) la convierte en
   `<aside class="recuadro recuadro-<tipo>" role="note">` con título e ícono Phosphor en SVG. Va **antes** de
   `sanearHtml` en `astro.config.mjs`. Una cita sin marca, o con una marca desconocida, queda como cita.
2. **Columna lateral** (`<aside>`, 18 rem, `sticky`) en las fichas de Noticia, Actividad y Anuncio, en escritorio. Lleva
   los datos clave que ya tiene la ficha y el bloque **Compartir** (`Compartir.astro`): copiar enlace y enlaces simples
   a WhatsApp, LinkedIn, X y correo, armados en el build (`src/lib/compartir.ts`). No usa scripts de terceros. En el
   celular, la columna va entre el título y el texto.
3. **Sin columna** en Documentos: tienen muy pocos datos. Los relacionados de Noticias siguen debajo del texto, a
   ancho completo.

## Consecuencias

- Quien edita aprende una marca de texto. El editor del panel no muestra el recuadro: la vista previa enseña la cita
  tal cual, y el resultado se ve recién en el sitio. La guía de usuario trae el ejemplo para copiar.
- Si Sätteri llega a soportar las alertas de GitHub de serie, se puede reemplazar el plugin.
- Los enlaces de compartir dependen de las URL públicas de cada red; si una cambia, se corrige en `compartir.ts`.

## Alternativas

- **Widget propio en el panel** (bloque «Recuadro» del editor). Sveltia lo permite con componentes del editor, pero
  agrega código al panel y otra vista previa que mantener. Descartado por ahora.
- **Botones de compartir de cada red** (scripts de Meta, X, LinkedIn). Rompen la CSP y rastrean a quien visita.
  Descartado.
