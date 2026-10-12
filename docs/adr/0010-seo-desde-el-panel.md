# 0010 · SEO configurable desde el panel

- **Estado:** Accepted · 2026-10-12 · decisión de la persona responsable del proyecto («SEO del sitio» + «SEO por contenido»)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `../context.md` (SEO del sitio, SEO opcional) · `../architecture.md` (§ 4 Modelo, § 8 SEO) · `../guia-usuario.md` (4.15)

## Contexto

El sitio ya generaba `<title>`, descripción, Open Graph, Twitter, canonical, sitemap, `robots.txt`, `llms.txt` y JSON-LD
en el build, pero los textos estaban fijos en el código: la descripción general, las descripciones de los listados
(Noticias, Agenda, Anuncios, Repositorio, Directorio, Instagram e Inicio) y el título de cada página venían de los
datos o del propio código. El Encargado de comunicaciones no podía ajustar cómo aparece la carrera en Google ni al
compartir un enlace, ni verificar el sitio ante Google o Bing, ni pedir que una página no se indexe, sin pedir un
cambio de código.

## Decisión

1. **SEO del sitio** (archivo único `src/content/seo/seo.yml`, colección `seo`, editado como archivo «SEO del sitio»
   de la colección `paginas`): descripción general, imagen por defecto para redes (1200 × 630), descripción e imagen
   para redes de cada listado (`listados.<clave>.descripcion` y `.imagen`; claves: inicio, noticias, agenda, anuncios,
   repositorio, directorio, instagram) y códigos de verificación de Google (`google-site-verification`) y Bing
   (`msvalidate.01`). Solo se emiten los códigos con valor. La imagen de un listado sigue la precedencia de
   `imagenDeListado`: imagen del listado → imagen del sitio → `og-default.png` (ver también ADR 0011).
2. **SEO por contenido** (bloque opcional «SEO (opcional)», colapsado, en Noticias, Actividades, Anuncios, Documentos y
   Páginas libres): `titulo` (máx. 60), `descripcion` (máx. 160), `imagen` para redes y `noindex` («No mostrar en
   buscadores»). Si el bloque está vacío, el sitio usa lo de siempre (título, bajada e imagen destacada).
3. **Precedencia** (función pura `resolverSeo` en `src/lib/seo.ts`, con prueba): campo SEO de la entrada → valor que
   arma la página → valor del sitio (`seo.yml`) → valor por defecto del código (`VALORES_POR_DEFECTO`, la única tabla
   de textos por defecto). Un campo vacío o con solo espacios cuenta como ausente.
4. **Título**: el sufijo « · BIOING+» lo agrega `tituloDocumento` una sola vez. Si el panel lo escribe, se quita y se
   vuelve a poner: el editor no tiene que pensarlo. El título se usa en `<title>`, `og:title` y `twitter:title`.
5. **No mostrar en buscadores** (`noindex`): la página sigue publicada y enlazada, con `<meta name="robots"
   content="noindex">`. El build la saca del sitemap (la integración de `astro.config.mjs` detecta la meta en el HTML
   generado) y el postbuild de Pagefind no la indexa. `llms.txt` lista solo secciones, no páginas, así que no requiere
   cambio.
6. **Validación en dos capas** (ADR 0001 y `AGENTS.md`): el panel valida con `maxlength` y `pattern` (los códigos de
   verificación, solo el valor sin etiqueta HTML); `content.config.ts` repite los límites con Zod como red de seguridad.
   Los dos espejos se mantienen juntos: `config.yml`, `content.config.ts` y `context.md`.

## Consecuencias

- Con el `seo.yml` inicial (los valores que ya tenía el sitio), el `<head>` de las 32 páginas queda idéntico al de
  antes del cambio. Verificado comparando los builds.
- Las descripciones de listados y del sitio viven en el panel, pero el texto por defecto sigue en el código: si el
  panel se vacía, vuelve a ese texto, no a una cadena vacía.
- El Inicio sin descripción propia en el panel hereda la descripción general del sitio, no el texto de su tabla.
- Un `noindex` no protege de enlaces externos: un buscador puede mostrar la URL sin contenido si ya la conoce.
  Para ocultar contenido de verdad hay que quitar la página (desactivarla o borrarla).
- Agregar otro campo SEO exige cambiar `config.yml`, `content.config.ts`, `seo.ts` y esta decisión.
- Pasar `listados.<clave>` de texto a objeto (`descripcion` e `imagen`) fue una migración: `seo.yml`, el esquema y
  `config.yml` cambian juntos, y el `<head>` de las páginas quedó igual (comprobado comparando los builds).

## Alternativas

- **Plugin de SEO de Astro o un componente externo**: suma dependencias y no resuelve la precedencia con el panel.
- **Un bloque SEO por cada página del sitio (incluidas las fijas)**: más control, pero el equipo no necesita editar
  los listados de cada sección, y es más confuso para quien edita; las descripciones de listado en `seo.yml` cubren el
  caso.
- **Un campo `noindex` que también quite la página**: mezcla dos decisiones. Desactivar una sección ya existe (ADR 0008)
  y «No mostrar en buscadores» debe dejar la página enlazada.
