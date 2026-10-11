# Fase A — Infra + SEO — Plan de ejecución (workstream 1)

> Para opencode. Ejecutar con disciplina TDD donde haya lógica; infra/config se valida con build. Casillas `- [ ]`.

**Meta:** dejar el sitio "listo para publicar" en lo que no depende de cuentas: 404, encabezados de seguridad, SEO (sitemap + Open Graph), buscador general (Pagefind) y config de servir en Cloudflare. Base: `docs/superpowers/plans/2026-10-11-hito-4-produccion.md` (Fase A, tareas A1–A3, A5) y `docs/propuesta-desarrollo.md` §3.

## Restricciones (IMPORTANTES)
- Rama de trabajo: **`faseA-infra-seo`**. Carpeta: `app/web`.
- **Toca SOLO estos archivos** (para no chocar con el otro workstream):
  `app/web/astro.config.mjs`, `app/web/package.json` (+ lock), `app/web/src/layouts/Base.astro`,
  `app/web/src/pages/404.astro`, `app/web/src/pages/buscar.astro`,
  `app/web/public/_headers`, `app/web/public/_redirects`, `app/web/public/robots.txt`,
  `app/web/wrangler.jsonc`, `app/web/.env.example`.
  **No edites** `index.astro`, `content.config.ts`, `config.yml`, componentes de tarjetas ni páginas de secciones.
- No commitees `CLAUDE.md` ni `AGENTS.md`. Leer antes: `AGENTS.md` raíz y `app/web/AGENTS.md`, `CONTEXT.md`, `docs/DESIGN.md`.
- Commits en español, imperativo, uno por tarea. Al final: `npm test`, `npx astro check` (0/0), `npm run build`, `npm run postbuild`.

## Tareas
- [ ] **T1 — 404 + seguridad.** `src/pages/404.astro` (usa `Base`, mensaje + enlaces a Inicio y `/buscar`, 375 px sin scroll). `public/_headers`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (menos `/admin/*`), `Strict-Transport-Security`, CSP que permita solo los embeds de §6.3 (youtube-nocookie, player.vimeo, drive.google, instagram); en `/admin/*`: `Cross-Origin-Opener-Policy: same-origin-allow-popups`. `public/_redirects` vacío con comentario. Verifica: build genera `dist/404.html`, `dist/_headers`, `dist/_redirects`.
- [ ] **T2 — SEO.** `astro.config.mjs`: `site: process.env.SITE_URL ?? 'https://bioing.example'`; añade integración `@astrojs/sitemap` (instálala) excluyendo `/admin` y `/componentes`. `.env.example` documenta `SITE_URL`. `public/robots.txt` apunta a `/sitemap-index.xml` y desautoriza `/admin`. En `Base.astro`: props `titulo`/`descripcion`/`imagen?`, genera `<link rel=canonical>` y `og:*`/`twitter:card` con URL absoluta (`Astro.site`); imagen OG por defecto. Verifica: `astro check` 0/0; `dist/sitemap-index.xml` existe sin `/admin`; una Noticia tiene `og:title`, `og:image` absoluta y canonical.
- [ ] **T3 — Buscador Pagefind.** Instala `pagefind`; `"postbuild": "pagefind --site dist"`. En `Base.astro`, marca la región principal con `data-pagefind-body` y excluye menú/pie; añade ícono de lupa en el menú que lleva a `/buscar`. `src/pages/buscar.astro`: UI de Pagefind (`pagefind/pagefind-ui.js`), estilos acordes a DESIGN.md, accesible (`aria-live` en el conteo). Excluir `/admin` y `/componentes` del índice. Verifica: `npm run build && npm run postbuild`; servir `dist`; buscar término de una Noticia aparece; `/admin` no aparece.
- [ ] **T4 — Cloudflare (sin desplegar).** Instala `wrangler` (dev). `wrangler.jsonc` sirve `./dist` como assets estáticos (`name`, `compatibility_date`, `assets.directory`). Sin secretos. Verifica: `npx wrangler deploy --dry-run` valida la config (o `npx wrangler dev` sirve dist).

## Cierre
- [ ] `npm test` verde, `npx astro check` 0/0, `npm run build` + `npm run postbuild` sin errores. Commits por tarea en `faseA-infra-seo`. Reporta en una línea qué quedó y cualquier hallazgo.
