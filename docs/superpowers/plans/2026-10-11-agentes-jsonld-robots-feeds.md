# Preparación para agentes: datos estructurados, control de rastreo y feeds

> Para opencode (coordinado vía Herdr). Sale de la revisión del sitio contra el checklist de
> "sitio legible, verificable y operable" (Contentful / Chrome WebMCP). Base: `docs/superpowers/plans/2026-10-11-hito-4-produccion.md`
> (Fase B, código) y `docs/pendientes-infra.md`. Todo sobre la rama **`develop`**: los workstreams
> trabajan en worktrees con ramas `faseB-jsonld`, `faseB-metadatos` y `faseB-feeds` nacidas de `develop`;
> al cierre se integran a `develop` y se hace push al Gitea.

## Resultado (ejecutado 2026-10-11, subagentes opencode vía Herdr)

**COMPLETADO e integrado en `develop`.** Tres workstreams en paralelo (ramas `faseB-jsonld`,
`faseB-metadatos` y `faseB-feeds`, nacidas de `develop`), integrados con los merge commits `289cf02`,
`9b8771b` y `782c7ce`.

- **T1 (JSON-LD)**: `src/lib/schema.ts` + `schema.test.ts` (27 pruebas nuevas), prop `jsonLd` en
  `Base.astro` (siempre emite `WebSite` + `Organization`), JSON-LD en las cinco fichas y en el Directorio,
  y `scripts/verificar-jsonld.mjs` (`npm run verificar:jsonld`). **Decisión**: sin `SearchAction` — Pagefind
  UI no lee `?q=`, así que no se declara una acción que no existe (nota en `schema.ts`).
- **T2 (metadatos)**: `src/lib/robots.ts` (+ tests) → `src/pages/robots.txt.ts` (Sitemap absoluto; 9 bots de
  entrenamiento bloqueados y 5 de búsqueda/citación permitidos) y `src/lib/llms.ts` → `src/pages/llms.txt.ts`.
  Se borró `public/robots.txt` (el estático gana al generado y por eso el bug nunca se veía) y se eliminó el
  parche `reescribirRobotsSitemap()` del postbuild, que quedaba redundante.
- **T3 (feeds)**: `@astrojs/rss` 4.0.19, `src/lib/feeds.ts` (+ tests), `/noticias/rss.xml` y `/agenda/rss.xml`,
  con `<link rel="alternate">` en los listados de Noticias y Agenda.

Verificación en `develop`: `npm test` **123 ✓** (13 archivos), `npx astro check` **0 errores**, build
**198 páginas** (con el contenido sintético `sint-*`; 30 sin él) + postbuild, `npm run verificar:jsonld`
**386 bloques válidos en 198 páginas**, XML de ambos feeds válido con enlaces absolutos, `dist/robots.txt`
con `Sitemap` absoluto, `dist/llms.txt` con enlaces absolutos y `/admin` fuera del sitemap.
Lighthouse (mismo worktree sin contenido sintético, antes → después del merge): `/` 91 → 91 y
`/directorio` 90 → 89, con accesibilidad, buenas prácticas y SEO en 100. En el worktree principal (con el
contenido sintético: más banners en el hero y ~54 fichas) mide 88/84; es el contenido de prueba, no estos
cambios (queda anotado en `docs/pendientes-infra.md`).

Fuera de alcance por decisión: `security.txt` (falta el contacto real; pendiente anotado) y WebMCP /
Page Agent (descartados por ahora).

---

## Alcance y decisiones

Lo que ya está cubierto y **no** se toca: HTTPS y `_headers` (CSP, HSTS), HTML semántico server-rendered,
canonical + Open Graph/Twitter, `sitemap-index.xml` (`@astrojs/sitemap`), 404, Pagefind, `AGENTS.md`/`CONTEXT.md`
(la parte "operable por agentes" del lado edición ya existe).

Lo que entra en esta tanda:

| # | Qué | Por qué |
|---|---|---|
| T1 | **JSON-LD Schema.org** en todo el sitio | Es el hueco real: hoy ninguna página declara entidades. Es estándar de facto y se genera del modelo de contenido que ya existe. |
| T2 | **`robots.txt` generado** (URL absoluta del sitemap + política explícita de bots de IA) y **`llms.txt`** | El `robots.txt` actual tiene el `Sitemap` en ruta relativa (inválido) y no declara política por user-agent. |
| T3 | **Feeds RSS** de Noticias y Agenda | Interfaz machine-readable que sí se consume (a diferencia de `llms.txt`). |

**Fuera de esta tanda (decidido):**

- **`security.txt`**: no se crea todavía. Exige un `Contact` real (correo o URL) y el canal de contacto del
  proyecto aún no está definido (`docs/preguntas-reunion.md` 6.2; el pie dice "se está definiendo"). No se
  inventa un contacto público. Queda anotado en `docs/pendientes-infra.md`.
- **WebMCP**: experimental (flag de prueba, spec cambiando) y el sitio no tiene acciones propias (inscripciones
  y formularios son externos por alcance). Si algún día se expone, los filtros ya son funciones puras en
  `src/lib/*.ts`. No ahora.
- **Page Agent**: es un producto embebible, no un estándar; agrega dependencia de proveedor, costo LLM y
  superficie de ataque. Descartado.
- **`ai.txt`**: menos consolidado que `robots.txt`; la declaración de intenciones va en `robots.txt`.

## Estado previo (verificado 2026-10-11)
- `develop` limpio en `dddce00`. `npm test` 69 ✓ · `npx astro check` 0 ✓ · build 30 páginas.
- `public/robots.txt` existe (estático) y dice `Sitemap: /sitemap-index.xml` (relativo).
- `astro.config.mjs`: `site: process.env.SITE_URL ?? 'https://bioing.example'` + `@astrojs/sitemap`
  (filtra `/admin/` y `/componentes/`).
- `src/layouts/Base.astro` expone `titulo`, `descripcion`, `imagen` y un slot `head`.
- Fechas: las de hora llevan offset America/Santiago; las de día se parsean como medianoche UTC
  (`formatoFecha`). En JSON-LD usar ISO 8601 (`toISOString()`).

## Restricciones globales
- Rama objetivo: `develop`. Sin push de los workstreams; solo el coordinador integra y hace push al cierre.
- Commits en español, imperativo, uno por tarea/hallazgo. No commitear contenido `sint-*`.
- Leer antes: `AGENTS.md` (raíz) y `app/web/AGENTS.md`, `CONTEXT.md`, `docs/DESIGN.md`.
- TDD donde haya lógica pura (convención del repo: módulo en `src/lib/` + `*.test.ts`). La UI y las rutas
  se validan con build + inspección del `dist/`.
- Textos en español; íconos **Phosphor**; no linters nuevos; no cambiar diseño ni dependencias salvo la de T3.
- En worktrees nuevos: primer paso `cd app/web && npm ci` (no hay `node_modules`).
- No tocar los otros workstreams: **T1** → `src/lib/schema.ts`, `src/lib/schema.test.ts`, `src/layouts/Base.astro`,
  páginas de detalle y `scripts/verificar-jsonld.mjs`. **T2** → `src/lib/robots.ts`, `src/lib/robots.test.ts`,
  `src/lib/llms.ts`, `src/lib/llms.test.ts`, `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`,
  borrar `public/robots.txt`. **T3** → `package.json`, `package-lock.json`, `src/lib/feeds.ts`,
  `src/lib/feeds.test.ts`, `src/pages/noticias/rss.xml.ts`, `src/pages/agenda/rss.xml.ts` y el `<Fragment slot="head">`
  de los listados de Noticias y Agenda.

---

## T1 — JSON-LD Schema.org
**Worktree:** `…/bioing-udec-wt-jsonld` · **Rama:** `faseB-jsonld` (nace de `develop`).

Diseño: un módulo puro `src/lib/schema.ts` con **constructores** que devuelven objetos JSON-LD ya listos
(sin `undefined`, con URLs absolutas), y un helper `jsonLd(obj)` que devuelve `{ __html }` con el
`<script>` escapado (`</script>` → `<\/script>`) para usar con `set:html`. Nada de `schema-dts`
(evitamos dependencias nuevas); los tipos se declaran localmente.

- [ ] `src/lib/schema.ts`:
  - `sitioWeb(site)`: `WebSite` + `Organization` (tipo `NGO`), `name` "BIOING+", `url` el sitio,
    `parentOrganization` la Facultad de Ciencias Biológicas UdeC, `sameAs` (Instagram y FCB cuando existan;
    hoy son placeholders de `src/lib/navegacion.ts` → incluir solo los que sean reales).
  - `SearchAction` (`potentialAction` de `WebSite`) **solo si `/buscar?q=` funciona**. Verificarlo con
    `npm run build && npm run postbuild && npm run preview` antes de incluirlo; si Pagefind no lee `?q=`,
    omitir el `potentialAction` y anotarlo (no declarar una acción que no existe).
  - `migas(items)`: `BreadcrumbList` (`itemListElement` con `position`, `name`, `item` absolutos).
  - `noticia(entrada, { site, url })`: `NewsArticle` (`headline`, `datePublished`, `image` absoluta si hay,
    `description` = bajada, `articleSection` = temas, `about` = áreas, `keywords` = etiquetas,
    `author`/`mentions` = personas mencionadas cuando existan).
  - `actividad(entrada, { site, url })`: `Event` (`name`, `startDate`, `endDate` si hay, `eventStatus`,
    `eventAttendanceMode` = `Offline`/`Online`/`Mixed` según `modalidad`, `location` `Place` con `name`=lugar
    cuando es presencial/híbrida, `VirtualLocation` con la URL del sitio cuando es en línea, `organizer`
    (Persona u Organización), `performer` = expositores, `image`, `offers` = `Offer` con `url` y
    `availability: InStock` **solo** si hay `enlace_inscripcion`).
  - `ofertaLaboral(entrada, { site, url })`: `JobPosting` **solo** para `tipo` ∈ {trabajo, practica, pasantia}
    y **solo si está vigente** (`anuncioVigente` de `src/lib/reglas.ts`): `title`, `datePosted` (ISO),
    `validThrough` (`fecha_limite` o `fecha + 60 días`, la misma regla de vencimiento del sitio),
    `hiringOrganization` (Organización; si el oferente es Persona, `Organization` con su nombre),
    `jobLocation` si hay lugar no aplica (Anuncios no tiene lugar): omitir, `description` = título + áreas
    (en texto plano; **limitación anotada**: el modelo de Anuncios no tiene bajada; mejora futura).
  - `persona(entrada, { site, url })`: `Person` (`name`, `description`, `image`, `jobTitle` = cargo,
    `affiliation` = organización, `sameAs` = enlaces, `alumniOf` = UdeC para egresados/as). **Solo con datos
    que ya se publican**: nada de `perfil_egresado` sin `autorizado`.
  - `documento(entrada, { site, url })`: `DigitalDocument` (`name`, `datePublished` = `${anio}-01-01`,
    `url` = enlace de Drive, `inLanguage: 'es'`, `about` = temas, `keywords` = palabras clave).
  - `listaElementos(titulo, elementos)`: `CollectionPage` + `ItemList` (`itemListElement` con `position`,
    `url`, `name`).
- [ ] `src/lib/schema.test.ts`: para cada constructor, que devuelva `@context`/`@type` correctos, que **no**
      haya valores `undefined`, que las URLs sean absolutas y que los casos borde se respeten (Event en línea
      sin lugar, Anuncio vencido sin `JobPosting`, `SearchAction` según configuración, `Person` sin perfil
      autorizado).
- [ ] `Base.astro`: prop opcional `jsonLd` (objeto o arreglo) que se renderiza como
      `<script type="application/ld+json" set:html={...}>` dentro del `<head>`; **siempre** emite el bloque
      `WebSite` + `Organization` (constante del sitio), y suma el/los de la página.
- [ ] Páginas de detalle: pasar `jsonLd` con `migas` + el constructor correspondiente:
      `noticias/[id].astro`, `agenda/[id].astro`, `anuncios/[id].astro`, `personas/[id].astro`,
      `repositorio/[id].astro`. En `directorio.astro` agregar `listaElementos` con los egresados/as visibles
      (solo los que ya se muestran). No tocar listados restantes (Noticias/Agenda/Anuncios/Repositorio): quedan
      como mejora opcional.
- [ ] `scripts/verificar-jsonld.mjs` + script `verificar:jsonld` en `package.json` (`app/web`): recorre
      `dist/**/*.html`, extrae los bloques `application/ld+json`, los parsea y falla si alguno no es JSON válido
      o si falta `@context`/`@type`; imprime un resumen por tipo de página.
- [ ] Verificación del workstream: `npm test` verde, `npx astro check` 0, `npm run build && npm run postbuild`,
      `npm run verificar:jsonld` OK y revisión manual del `<head>` de una ficha de cada tipo.
- [ ] Commits: `Agrega constructores de JSON-LD (Schema.org) con pruebas` · `Emite WebSite/Organization en el layout y JSON-LD por página`
      · `Agrega verificación de JSON-LD del build`.

## T2 — `robots.txt` generado y `llms.txt`
**Worktree:** `…/bioing-udec-wt-metadatos` · **Rama:** `faseB-metadatos` (nace de `develop`).

- [ ] `src/lib/robots.ts`: función pura `generarRobots(site: URL | string): string` con:
  - `User-agent: *` → `Allow: /`, `Disallow: /admin`, `Crawl-delay: 1`.
  - `Sitemap: <absoluto>/sitemap-index.xml` (el bug actual: iba relativo).
  - **Bloqueo de rastreo de entrenamiento** (una entrada por user-agent, con `Disallow: /`, y un comentario
    que explique la decisión y cómo revertirla): `Google-Extended`, `CCBot`, `Bytespider`, `Amazonbot`,
    `Applebot-Extended`, `Meta-ExternalAgent`, `Diffbot`, `ImagesiftBot`, `anthropic-ai`.
  - **Permitidos explícitos** (búsqueda/citación/acciones pedidas por la persona; quedan fuera del bloqueo):
    `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot` → `Allow: /`.
  - Exportar las listas como constantes para que la decisión sea editable en un solo lugar y testeable.
- [ ] `src/lib/robots.test.ts`: sitemap absoluto, cada bloque con su `Allow`/`Disallow`, que no haya un
      user-agent bloqueado y a la vez permitido, y que no queden bloques vacíos.
- [ ] `src/pages/robots.txt.ts`: endpoint que devuelve `generarRobots(Astro.site)` con `Content-Type: text/plain`.
      **Borrar `public/robots.txt`** (si no, el archivo estático gana y no se vería el generado) y comprobar en
      `dist/robots.txt` que quedó el generado.
- [ ] `src/lib/llms.ts` + `src/lib/llms.test.ts`: `generarLlms(site, secciones)` (puro) que arme
      `# BIOING+` + una línea `>` y una sección `## Secciones` con enlaces **absolutos** y una descripción
      breve por sección; las secciones salen de `MENU` (`src/lib/navegacion.ts`) con sus descripciones
      (agregar un mapa de descripciones en `llms.ts`, no en `navegacion.ts`). Dejar claro en un comentario que
      **no sustituye** al sitemap.
- [ ] `src/pages/llms.txt.ts`: usa `generarLlms(Astro.site, …)`.
- [ ] Verificación: `npm test` verde, `npx astro check` 0, build+postbuild, e inspección de `dist/robots.txt`
      y `dist/llms.txt` (URLs absolutas, sin bloques repetidos). Comprobar que `/admin` sigue fuera del sitemap.
- [ ] Commits: `Genera robots.txt con sitemap absoluto y política de bots de IA` · `Agrega llms.txt como índice curado del sitio`.

## T3 — Feeds RSS de Noticias y Agenda
**Worktree:** `…/bioing-udec-wt-feeds` · **Rama:** `faseB-feeds` (nace de `develop`).

- [ ] `npm i @astrojs/rss` (dependencia de producción).
- [ ] `src/lib/feeds.ts` + `src/lib/feeds.test.ts`: mapeo puro entrada → ítem RSS
  (`title`, `link` absoluto, `pubDate`, `description` = bajada/descripción, `categories` = temas o áreas,
  `author` si aplica), reutilizando los helpers de `src/lib/contenido.ts` para filtrar publicados. Sin duplicar
  reglas de visibilidad.
- [ ] `src/pages/noticias/rss.xml.ts` y `src/pages/agenda/rss.xml.ts` con `rss({ title, description, site: Astro.site, items, customData: '<language>es-cl</language>' })`.
      Noticias: las visibles (mismas que el listado, con `noticiasVisibles()`). Agenda: las actividades publicadas
      (próximas y realizadas). Los ítems usan el mismo `pubDate`/fechas que muestra el sitio.
- [ ] Añadir `<link rel="alternate" type="application/rss+xml" title="…" href="/noticias/rss.xml">` (y el de Agenda)
      en el `<Fragment slot="head">` de `src/pages/noticias/index.astro` y `src/pages/agenda/index.astro`.
- [ ] Verificación: `npm test` verde, `npx astro check` 0, build+postbuild; validar `dist/noticias/rss.xml` y
      `dist/agenda/rss.xml` (XML bien formado, enlaces absolutos, `pubDate` RFC 822).
- [ ] Commits: `Agrega helpers de feeds RSS con pruebas` · `Publica feeds RSS de Noticias y Agenda`.

---

## Cierre (coordinador)
- [ ] Integrar `faseB-jsonld`, `faseB-metadatos` y `faseB-feeds` en `develop` (merge; conflicto esperado
      solo si dos tocan `Base.astro` — T1 sí lo toca, T3 no debería).
- [ ] Verificación combinada en `develop`: `npm test`, `npx astro check` 0, `npm run build && npm run postbuild`,
      `npm run verificar:jsonld`, inspección de `dist/robots.txt`, `dist/llms.txt`, `dist/noticias/rss.xml` y
      `dist/agenda/rss.xml`.
- [ ] Lighthouse (SEO y buenas prácticas) en `/`, `/noticias`, una ficha de noticia, una de agenda y una de
      anuncio: seguir ≥ 90 en las cuatro categorías.
- [ ] Actualizar `docs/pendientes-infra.md` (hecho: JSON-LD, robots/llms, feeds; **nuevo pendiente**:
      `security.txt` cuando exista correo de contacto) y `AGENTS.md` (convención: JSON-LD se arma en
      `src/lib/schema.ts`; `robots.txt`/`llms.txt` son rutas generadas, no archivos estáticos).
- [ ] Completar la sección "Resultado" de este plan y pushear `develop` al Gitea.
- [ ] Borrar worktrees y ramas `faseB-*`.

## Resumen de verificación
- **T1:** `npm test` + `astro check` + `verificar:jsonld` OK; `<head>` con `WebSite`/`Organization` en todas las
  páginas y el tipo correcto en cada ficha.
- **T2:** `dist/robots.txt` con `Sitemap` absoluto y bloques por user-agent; `dist/llms.txt` con enlaces absolutos.
- **T3:** feeds XML válidos con enlaces absolutos y `<link rel="alternate">` en los listados.
- **Global:** Lighthouse ≥ 90 en las cuatro categorías; sin cambios visuales.
