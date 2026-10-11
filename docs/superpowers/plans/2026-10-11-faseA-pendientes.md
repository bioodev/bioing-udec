# Fase A — Pendientes (A4 imágenes + A6 auditoría) y renombrado CLAUDE.md → AGENTS.md

> Para opencode (coordinado vía Herdr). Base: `docs/superpowers/plans/2026-10-11-hito-4-produccion.md` (Fase A) y `docs/pendientes-infra.md`. Todo sobre la rama **`develop`** (la más avanzada): los workstreams trabajan en worktrees con ramas `faseA-a4` y `faseA-a6` nacidas de `develop`, y al cierre se integran a `develop` y se hace push al Gitea.

## Estado previo (verificado 2026-10-11)
- A1 (404+seguridad), A2 (SEO), A3 (Pagefind) y A5 (wrangler) **hechas**; rediseño v2 integrado en `develop`.
- `npm test` 69 ✓ · `astro check` 0/0 · build 30 páginas.
- **Pendientes:** A4 (optimización de imágenes al subir en `config.yml`) y A6 (auditoría A11y/Lighthouse ≥ 90).
- `CLAUDE.md` (raíz, versionado en git) pasará a llamarse `AGENTS.md` (coexiste con `app/web/AGENTS.md`).
- Hallazgo: con npm 11, `npm run build` **no** dispara `postbuild` solo; ejecutar siempre `npm run build && npm run postbuild`.

## Restricciones globales
- Rama objetivo: `develop`. Sin push hasta el cierre. Commits en español, imperativo, uno por tarea/hallazgo.
- No tocar `AGENTS.md` (raíz) ni `app/web/AGENTS.md` salvo el T0 (renombrado). Leer antes: `AGENTS.md` raíz y `app/web/AGENTS.md`, `CONTEXT.md`, `docs/DESIGN.md`, `docs/pendientes-infra.md`.
- TDD donde haya lógica pura (convención del repo: helper + `*.test.ts`); la UI y la config se validan con build + prueba manual.
- Textos en español; íconos **Phosphor** (`phosphor-astro`); no linters nuevos salvo que ya existan.
- En worktrees nuevos: primer paso `cd app/web && npm ci` (no hay `node_modules`).

---

## T0 — Renombrado CLAUDE.md → AGENTS.md (lo hace el coordinador en `develop`)
- [x] `git mv CLAUDE.md AGENTS.md`; encabezado `# AGENTS.md` (+ nota de que reemplaza a CLAUDE.md).
- [ ]  Actualizar referencias activas: `docs/pendientes-infra.md` (línea "y CLAUDE.md" → "y AGENTS.md"), `docs/superpowers/plans/2026-10-11-hito-4-produccion.md` (paso de validación "las dos formas de CLAUDE.md" → "de AGENTS.md"; D1 "actualizar CLAUDE.md" → "AGENTS.md"; restricción "No commitear CLAUDE.md ni AGENTS.md" → "No tocar AGENTS.md (raíz)"). Los planes históricos (2026-09-30, 2026-10-10…) quedan como registro.
- [x] Commit: `Renombra CLAUDE.md a AGENTS.md`.
- [x] Commit del plan: `Agrega plan de pendientes de Fase A (A4, A6)`.

## T1 — A4: Optimización de imágenes al subir (`app/web/public/admin/config.yml`)
**Worktree:** `…/bioing-udec-wt-a4` · **Rama:** `faseA-a4` (nace de `develop`).

- [ ] Añadir en la raíz de `config.yml` (junto a `media_folder`/`public_folder`), según el schema de Sveltia (`media_libraries.all.config.transformations` con entradas por formato original; `format` solo admite `webp`):
```yaml
media_libraries:
  all:
    config:
      transformations:
        raster_image:   # cualquier formato raster (png, jpeg, …)
          format: webp
          width: 2048
          quality: 85
        heic:           # aceptar HEIC y convertirlo a WebP
          format: webp
          width: 2048
          quality: 85
```
- [ ] No tocar nada más de `config.yml` (las colecciones y sus campos quedan intactos).
- [ ] **Validar de las dos formas de AGENTS.md:**
  1. Contra el JSON Schema: `https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json` — convertir `config.yml` a JSON (`python3 -c "import yaml,json;print(json.dumps(yaml.safe_load(open('public/admin/config.yml'))))" > /tmp/cfg-a4.json`) y validar con `npx --yes ajv-cli validate -s /tmp/sveltia-schema.json -d /tmp/cfg-a4.json` (si el schema es viejo y falla por claves no estándar, validar al menos el subárbol `media_libraries`; documentar).
  2. Cargar `/admin/`: `python3 -m http.server 4810 -d public` y verificar que `GET /admin/index.html` y `GET /admin/config.yml` responden 200 (la pantalla de login y la subida real se prueban en la Fase C, que necesita login al repositorio).
- [ ] Commit: `Activa optimización de imágenes al subir (WebP, 2048 px, calidad 85)`.
- [ ] Cierre de workstream: `npx astro check` 0/0 y `npm run build` sin errores (no toca el build: solo confirmar que la config no rompe nada).

## T2 — A6: Auditoría de calidad (accesibilidad + Lighthouse ≥ 90)
**Worktree:** `…/bioing-udec-wt-a6` · **Rama:** `faseA-a6` (nace de `develop`).

- [ ] Instalar `lighthouse` como devDependency (oficial, sin API key). `npm i -D lighthouse`.
- [ ] `npm run build && npm run postbuild`; servir `dist/` (`python3 -m http.server 4820 -d dist`).
- [ ] Auditar con Lighthouse (headless) las páginas clave: Inicio, Noticias (listado y detalle), Agenda, Directorio, Ficha de persona, Repositorio, Anuncios, ¿Qué es la Bioingeniería?, Instagram, Buscar, 404. Registrar el reporte por página (CSV/JSON o resumen con puntajes).
- [ ] Corregir hallazgos de: jerarquía de encabezados, textos alternativos (`alt`), contraste (acento `#0066cc` sobre fondos — AA), foco visible, `lang`, nombres accesibles de controles (los `Select`/`Combobox` de Starwind ya usan `aria-labelledby`: verificar), dimensiones de imagen para evitar CLS (layout shift), orden del DOM, `aria-live` del buscador Pagefind, estado "aún no hay…" en páginas vacías.
- [ ] No cambiar diseño ni DESIGN.md; solo accesibilidad/rendimiento. Si algo del acento no cumple AA, ajustar la variable del tema con el menor cambio posible.
- [ ] Recorrido por teclado en las páginas clave (sin trampas de foco; la lupa de `/buscar` y los menús desplegables operables con teclado).
- [ ] Commits por grupo de hallazgos (español, imperativo).
- [ ] Cierre: `npm test` verde (69 + nuevos si se extrae lógica pura), `npx astro check` 0/0, `npm run build && npm run postbuild` OK, Lighthouse ≥ 90 en las cuatro categorías en las páginas principales, sin regresiones visuales a 375 px.

---

## Cierre de Fase A (coordinador)
- [ ] Integrar `faseA-a4` y `faseA-a6` en `develop` (merge). Resolver conflictos si los hubiera (no debería: archivos disjuntos salvo `package.json`, que solo toca a6 con `lighthouse` en devDependencies).
- [ ] Verificación combinada en `develop`: `npm test`, `npx astro check` 0/0, `npm run build && npm run postbuild`, resumen Lighthouse.
- [ ] Actualizar `docs/superpowers/plans/2026-10-11-hito-4-produccion.md` (marcar A4 y A6) y `docs/pendientes-infra.md` (marcar "Activar en config.yml la optimización al subir" y el checklist de auditoría si existe).
- [ ] Push de `develop` al Gitea.
- [ ] Borrar worktrees y ramas `faseA-a4`/`faseA-a6`.

## Resumen de verificación
- **A4:** schema Sveltia OK + `/admin/` servido responde; `astro check` 0/0; build OK.
- **A6:** Lighthouse ≥ 90 (rendimiento, accesibilidad, buenas prácticas, SEO) en páginas principales; teclado sin trampas; `npm test` verde; `astro check` 0/0.