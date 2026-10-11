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



