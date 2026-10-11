landing con menu => sticky
que es bioingenieria => video en modal
importante => base de datos => anuario de todos los bioingenieros. egresados en pdf. 
debe estar lista en marzo 2027
buscadores => noticia, agenda, anuncios, base de datos, repositorios (biblioteca en drive)
enlace a google form para agregar o quitar informacion

base de datos bioingerieros:
- nombre apellido, generacion, año egreso, area desempeño, organizacion o institucion donde trabaja, cargo/profesion, enlaces (linkeding u otro)

---

## Ajustes y mejoras (sesión 2026-10-11, cierre de la Fase A + exploración)

Decisiones de producto/UX acordadas en esta tanda de trabajo:

- **Marca/logo**: una sola fuente (`src/assets/logo.svg`, placeholder) renderizada por `Logo.astro` en navbar y footer; reemplazar el archivo para cambiarlo. La identidad definitiva llega con la carrera (Fase B/C2).
- **Imágenes**: agregadas 7 fotos demo (biotech, `app/web/src/assets/media/demo-01..07.jpg`, optimizadas 1920px). Toda noticia y actividad lleva imagen; los banners sintéticos usan solo fotos demo.
- **Hero (Inicio)**: foto cálida del slide (opacity ~70%) + velo oscuro sutil para el texto. Se **descartaron** los shaders WebGL (Paper Shaders: rompían el rendimiento ≥90) y la textura halftone CMYK (no gustó visualmente).
- **Animaciones**: GSAP con **fade solo** (sin deslizamientos): entrada del hero (primer slide), reveals de títulos/secciones y grillas con stagger vía IntersectionObserver; transiciones entre páginas en fade (View Transitions/ClientRouter). Todo respeta `prefers-reduced-motion` y es visible sin JS.
- **Buscador (Pagefind)**: solo funciona en build/preview (no en dev); con npm 11 hay que correr `npm run build && npm run postbuild`.
- **Tema claro/oscuro**: toggle en navbar y menú móvil; preferencia guardada (`localStorage`) con fallback al sistema, sin parpadeo (script en `<head>`), y se mantiene al navegar con View Transitions.
- **Inicio**: enlaces "Ver todas las noticias" y "Ver todas las actividades" en sus secciones.
- **Footer**: columnas (marca, navegación desde `MENU`, comunidad, contacto) + barra de copyright.
- **Tarjetas 100% clicables**: imagen y card llevan al detalle (Noticia/Actividad con overlay; Anuncio/Documento/Egresado con un solo enlace), conservando los enlaces secundarios (badges, botón, organizadores).

Técnicamente, todo esto quedó anotado en `AGENTS.md` (convenciones del repo) y en la memoria del agente.

---

## Preparación para agentes: datos estructurados, control de rastreo y feeds (sesión 2026-10-11, Fase B de código)

Revisión del sitio contra el checklist de "sitio legible, verificable y operable" (Contentful / Chrome WebMCP).
Ya estaba cubierto HTTPS + `_headers`, HTML semántico, canonical/Open Graph, sitemap, Pagefind, 404 y el lado
"edición operable por agentes" (`AGENTS.md`/`docs/context.md`). Lo que se agregó:

- **JSON-LD (Schema.org)** en todo el sitio: `Organization`/`NGO` + `WebSite` en el layout (prop `jsonLd` de
  `Base.astro`) y `NewsArticle`, `Event`, `JobPosting` (solo trabajo/práctica/pasantía vigente), `Person` (solo
  datos ya publicados), `DigitalDocument`, `BreadcrumbList` y `ItemList` en el Directorio. Constructores puros en
  `src/lib/schema.ts`; se validan con `npm run verificar:jsonld`. Sin `SearchAction`: Pagefind UI no lee `?q=`.
- **`robots.txt` generado en el build** (`src/lib/robots.ts` → `src/pages/robots.txt.ts`): `Sitemap` absoluto y
  política por user-agent (se permite indexar y citar; se bloquea el rastreo de entrenamiento; la lista de bots se
  edita en un solo lugar). Se borró el `public/robots.txt` estático (en Astro, `public/` **gana** a la ruta del
  mismo nombre y por eso el bug nunca se veía) y el parche del postbuild.
- **`llms.txt`** como índice curado (`src/pages/llms.txt.ts`); es opcional por diseño y no sustituye al sitemap.
- **Feeds RSS** de Noticias y Agenda (`src/lib/feeds.ts` + `src/pages/{noticias,agenda}/rss.xml.ts`), con
  `<link rel="alternate">` en sus listados.

**Descartado por ahora (y por qué):** `security.txt` (necesita un contacto real, aún indefinido — no se inventa);
**WebMCP** (experimental y el sitio no tiene acciones propias) y **Page Agent** (producto embebible: proveedor,
costo LLM, superficie de ataque). Si algún día se expone WebMCP, los filtros ya son funciones puras en `src/lib/`.

Ejecución: tres workstreams en paralelo con subagentes opencode en worktrees coordinados por Herdr
(`faseB-jsonld`, `faseB-metadatos`, `faseB-feeds`), integrados en `develop` (`289cf02`, `9b8771b`, `782c7ce`,
docs en `5bf8dea`). Plan y resultado: `docs/planes/2026-10-11-plan-agentes-jsonld-robots-feeds.md`.
Verificación: `npm test` 123 ✓, `astro check` 0, 386 bloques JSON-LD válidos, feeds XML válidos y Lighthouse sin
regresión (91/89 medido sin el contenido sintético; con `sint-*` baja a 88/84 por cantidad de imágenes).



