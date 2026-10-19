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
docs en `5bf8dea`). Plan y resultado: `docs/plans/2026-10-11-plan-agentes-jsonld-robots-feeds.md`.
Verificación: `npm test` 123 ✓, `astro check` 0, 386 bloques JSON-LD válidos, feeds XML válidos y Lighthouse sin
regresión (91/89 medido sin el contenido sintético; con `sint-*` baja a 88/84 por cantidad de imágenes).




---

## Páginas libres, contenido incrustado y enlaces (sesión 2026-10-11/12)

Publicado en `main` = `develop` = `9d0a802`, que Workers Builds despliega en https://bioing.bioodev.work.

- **`SITE_URL` en Workers Builds:** la persona la cargó en *Build variables and secrets*, y ahora el canonical, el
  sitemap y `robots.txt` usan `bioing.bioodev.work`. Justo después de corregirla, `robots.txt` y el sitemap pueden
  seguir mostrando el valor anterior por la caché de Cloudflare; está anotado en `despliegue-cloudflare.md` §8.
- **Filtros:** en escritorio, el botón «Filtros» va a la derecha del buscador, sin ocupar una columna.
- **Tipografía:** `prose` no hacía nada porque faltaba `@tailwindcss/typography`. Se instaló, y sus colores toman
  los tokens del tema.
- **Páginas libres** (ADR 0005): se crean desde el panel y se publican en `/p/<nombre>`. «Mostrar en» decide si van
  en ninguno, el pie, «La carrera» o «Comunidad». Tienen video, bloques destacados, Enlaces y Contenido incrustado
  opcionales. «¿Qué es la Bioingeniería?» pasó a ser una Página libre (`/p/bioingenieria`, primera en «La
  carrera»); `/bioingenieria` se eliminó sin redirección. Se descartó acortar las URL de Noticias y Agenda (`/n/`,
  `/a/`) por legibilidad.
- **Página destacada en el Inicio** (ADR 0006): un switch en la Página libre muestra un bloque entre el carrusel y
  las Noticias. Se destaca una sola a la vez; si hay varias marcadas, el build avisa. Los detalles se validan con
  la contraparte (`preguntas-reunion.md` 7.1).
- **Contenido incrustado:** hasta 10 enlaces por Noticia, Actividad o Página libre, que se muestran bajo
  «Multimedia». Hay un parser puro con una lista cerrada de unos 30 proveedores con iframe (`src/lib/incrustados.ts`).
  Los que necesitan scripts propios (X, Bluesky, Threads, Medium, Gist, WhatsApp…) se muestran como tarjeta. Un
  test guardián en `csp.test.ts` exige que cada origen de iframe esté en `frame-src`. Dailymotion usa
  `geo.dailymotion.com`, porque su embed clásico redirige ahí.
- **Enlaces:** hasta 6 botones (etiqueta y URL `https://` o ruta `/…`) en Noticias, Actividades y Páginas libres.
  En las Actividades, la inscripción sigue siendo el botón principal.

**Próximos pasos:** las pruebas en el panel (ver `pendientes-infra.md`, «Contenido y medios»), la reunión con la
contraparte (`preguntas-reunion.md`, sobre todo la 7.1), el ajuste del bloque destacado sin imagen y borrar el
contenido de prueba antes de la entrega.

Ejecución: subagentes Haiku en worktrees coordinados con Herdr (`filtros-compacto`, `paginas-libres`,
`bioing-libre`, `incrustados`, `prototipo-destacado`, `proveedores`, `enlaces`), integrados en `develop` por el
orquestador después de revisar el diff, probar en el navegador y verificar sobre el build servido con la CSP.

---

## Diseño, seguridad, panel y tanda de mejoras visuales (sesión 2026-10-12)

Publicado en `main` = `develop` = `c740d6a` (GitHub y Gitea), que Workers Builds despliega en
https://bioing.bioodev.work. Una publicación intermedia (`5c267b4`) desplegó bien, pero dejó el check en rojo sin
causa conocida (ver `pendientes-infra.md`).

**Diseño**
- **Sombras tenues** en todas las tarjetas (`tarjeta-elevada`): suben 2 px al pasar el mouse, solo en dispositivos con
  puntero. Trampa: `@layer components` pierde frente a las utilidades de Tailwind v4, así que la regla del borde va
  fuera de `@layer`.
- **Badges** unificados en `Distintivo.astro`: con borde para clasificar y gris para estados; el negro no se usa.
- **Banda «Comunidad y documentos»** en una columna, con imagen a sangre y contenido en zigzag.
- **Favicon** generado desde `src/assets/logo.svg` (`npm run favicon`).
- **Tipografía**: `text-wrap: balance` en títulos y `pretty` en párrafos e ítems (regla base en `starwind.css`).
- **Hero** con velo y desenfoque radiales, configurables con las variables `--hero-*` de `starwind.css` (en 0 se
  apagan). El fondo del hero quedó fijo en oscuro: `bg-foreground` se invertía en el tema oscuro.
- **Parallax** de ±10 % a ±20 %, con la imagen al 175 % para que no aparezcan bordes vacíos.
- **Llamados a la acción** (`cta`, `cta-flecha`, `cta-relleno` en `animaciones.css`): la flecha avanza al pasar el
  mouse y los botones rellenos suben 1 px.
- **Incrustados con esqueleto**; Instagram se carga solo al acercarse a la pantalla (ADR 0014).
- **Recuadros destacados** (`> [!NOTA]`) y **columna lateral** con «Compartir» en las fichas (ADR 0015).
- **Encabezados de listados** con ícono, texto de introducción (campo nuevo `intro`) e imagen de ejemplo.

**Seguridad** (`analisis/2026-10-12-revision-seguridad.md`)
- Saneador del cuerpo Markdown, URL validadas (`urlWeb`, `enlaceDelSitio`), `form-action`, COOP y
  `Permissions-Policy`, Sveltia fijado con SRI, `security.txt` provisional, `wrangler` y dependencias al día.

**Panel**
- **Analítica sin cookies** (ADR 0012): token opcional de Cloudflare Web Analytics.
- **Orden** (ADR 0013): colecciones agrupadas; la configuración pasó a «Archivos»; «Páginas libres» → «Páginas».
- **Textos claros** en todos los campos, y la guía de usuario y el glosario alineados con ellos.
- **Vista previa** solo donde sirve: se quitó en Áreas, Temas, Organizaciones, Instagram y «Archivos».
- **Texto alternativo** en la imagen de las Actividades (cambio de modelo en los tres lugares).

**Contenido**
- Revisión de datos faltantes (`analisis/2026-10-12-datos-faltantes.md`). Se completó solo lo que se deduce del
  contenido; las preguntas para la contraparte están en `preguntas-reunion.md` §8 y §9.
- **Zona horaria**: sin cambios. El sitio y el panel usan `America/Santiago`, que pasa sola de UTC−4 a UTC−3 con el
  horario de verano. No conviene fijar «UTC−4».

**Próximos pasos:** la persona revisa el panel y el sitio. Después, reunión con la contraparte (§7.1, §8 y §9),
reemplazar las imágenes de ejemplo y borrar el contenido de prueba (`pendientes-infra.md`, «Contenido y medios»).

Ejecución: subagentes Haiku en worktrees coordinados con Herdr, integrados en `develop` por el orquestador después de
revisar el diff y las capturas. Trampa del orquestador: un agente renombró su rama (`datos` → `datos-faltantes`) y el
`git merge` falló en silencio porque la salida pasaba por `tail`. Al integrar, comprobar `git log develop..<rama>`.

### Segunda tanda visual (2026-10-12, publicada en `33a54ca`)

Decisiones de la persona: barra de redes en el Inicio; la referencia de udec.cl aplicada a Secciones y a la Página
destacada; etiqueta del hero como campo del Banner con color; tiempo relativo en fichas y tarjetas.

- **Fecha relativa** («· hace 4 meses», «· en 2 semanas») en tarjetas y fichas de Noticias, Agenda y Anuncios,
  calculada en el navegador. Ícono de calendario en la fecha de las tarjetas (también en «Te puede interesar»).
- **Compartir**: «Copiar enlace» cambia a ✓ «Enlace copiado» por 2 s; **código QR** plegado, generado en el build con
  `uqr` 0.1.3 (negro sobre blanco en ambos temas) y descargable.
- **Columna lateral**: ícono en cada dato, el mismo para el mismo concepto en las tres fichas.
- **Hero**: texto a la izquierda (el velo y el desenfoque se centran en `--hero-foco`) y **etiqueta** opcional sobre el
  título, con color de una lista (campos `etiqueta` y `etiqueta_color` del Banner).
- **Listados**: título, ícono e introducción sobre la imagen de cabecera (ADR 0016).
- **Tarjeta de contenido** (`TarjetaContenido.astro`, referencia «media-content» de udec.cl) en Secciones destacadas y
  Página destacada: etiqueta, título, línea corta, texto y botón. Campos nuevos `etiqueta` y `etiqueta_inicio`.
- **«Síguenos»** al final del Inicio: hasta 5 redes por fila con borde izquierdo, ícono y nombre, en un solo color de
  marca. No aparece mientras «Redes sociales» esté vacío.

Integración: los agentes de fecha y de íconos tocaron las mismas líneas de las fichas; se dejó el formato con íconos y
se sumó la fecha relativa. Se quitó el hueco que dejaba el aviso vacío de «Copiar enlace». Los prompts ahora prohíben
renombrar la rama de trabajo.

## Plan de avance y mejoras: bloques ejecutables (sesión 2026-10-18)

Ejecución del [plan de avance y mejoras](plans/2026-10-18-plan-avance-y-mejoras.md) por un agente, en `develop` y
sin push (ADR 0004). Se hizo solo lo que no depende de la carrera ni de cuentas; lo demás quedó como estaba.

**Mantención técnica (Bloque 4).** Un commit por paquete, con `npm run verificar` en verde entre cada uno:
`astro` 7.3.8, `vitest` 5.0.5, `wrangler` 4.151.0, `@astrojs/markdown-satteri` 0.4.4 y `@starwind-ui/astro` 1.3.0.
Los dos últimos con revisión visual: una Noticia con recuadros y el saneado del cuerpo en claro y oscuro (Sätteri) y
la sección Starwind, el Combobox de los filtros y el Sheet del menú móvil en 390 px (el diff de Starwind resultó ser
un refactor de `getInitCandidates` a un módulo compartido más el salto del runtime). El `save-prefix` de npm de este
equipo está vacío, así que `npm install` deja la versión exacta: astro y vitest quedan fijados, como ya pedía el plan
para estos parches. 580 pruebas y `astro check` en 0.

**Control rápido de Lighthouse (Bloque 3.1).** Se repitieron las 13 páginas del CSV de la Fase A —la de bioingeniería
hoy es `/p/bioingenieria`— más un Anuncio individual, sobre `dist/` servido con `python3 -m http.server`. Resultados
en `app/web/auditoria/lighthouse-2026-10-18-control.csv` (el CSV oficial no se toca); método y hallazgos en
`auditoria/README.md`. Para separar la regresión real del ruido del entorno, la Fase A se volvió a medir en el mismo
equipo y seguida de la corrida actual (worktree en `df53096` con su propio `npm ci`): reprodujo el CSV tal cual
(Inicio 98, Noticias 95…). Conclusión: las tandas visuales posteriores cuestan de 4 a 19 puntos de rendimiento —el
peso del Inicio sube de ~150 KiB a ~750 KiB— por Pagefind UI cargado con `requestIdleCallback` (213 KiB), GSAP y el
script del carrusel, más CSS e imágenes; en Noticias aparece CLS 0,121 por la animación de entrada de la lista, y
Instagram baja a 77 en buenas prácticas por la cookie del embed (consecuencia asumida del ADR 0014). Accesibilidad y
SEO siguen en 100. No se tocó código: ajustar `widths`/`sizes` y diferir Pagefind es del Bloque 5.

**Documentación.** Estado del Hito 3 al día en `propuesta-desarrollo.md` §11 (criterio técnico cumplido; falta la
aceptación de la contraparte). Versión de Sveltia del panel (0.235.1) anotada en `guia-mantencion.md` §2.3 y §5.

**Borradores que esperan a la persona** (no se enviaron): `analisis/2026-10-18-agenda-reunion-hito-3.md` (agenda del
Hito 3 con §6, §7.1, §8 y §9 de `preguntas-reunion.md`, la Ley 21.719, las URLs del WordPress, el plan B y la
aceptación del hito), `adr/0017-datos-personales-del-directorio.md` (**Proposed**: supresión que incluya el historial
de Git, o datos del Directorio fuera del repositorio) y `guia-mantencion.md` §7 (Respaldos, completo como propuesta,
sin tocar cuentas).
