# BIOING+

Plataforma digital de la comunidad de Bioingeniería de la Universidad de Concepción (FCB): noticias, actividades, oportunidades, documentos, Instagram y el directorio de egresados/as.

**Stack**: sitio estático **Astro 7** en `app/web`, contenido en archivos editados con **Sveltia CMS** (sin backend ni base de datos). Repositorio en Gitea propio (`gitea.bioodev.work/bioing/bioing-udec`), despliegue previsto en Cloudflare. **Plazo: marzo 2027.**

> Guías: **`AGENTS.md`** (raíz) — cómo trabajar en el repo · **`CONTEXT.md`** — glosario canónico del dominio · **`docs/`** — propuesta, diseño y planes.

## Estado

Hitos 1–3 completos. **Fase A del Hito 4 (producción en código) cerrada**: 404 + seguridad, SEO (sitemap/OG/canonical), buscador Pagefind, config Cloudflare, optimización de imágenes al subir y auditoría de calidad (Lighthouse ≥ 90). Ver `docs/superpowers/plans/` y `docs/pendientes-infra.md`. Lo que resta (Fases B–D) depende de entregas de la carrera: cuentas, dominio, identidad visual, contenidos reales.

```
app/web       → el sitio (Astro + Sveltia CMS); acá vive todo el código
docs/         → propuesta funcional, diseño, ADR, plan de hitos, pendientes de infra
AGENTS.md     → guía para agentes de IA que trabajan en el repo
CONTEXT.md    → glosario de dominio (personas, contenidos, clasificación)
```

## Requisitos

- Node ≥ 22.12 (Astro 7).
- `cloudflared` solo para el túnel de vista previa (`npm run dev:tunel`).

## Puesta en marcha

```sh
cd app/web
npm ci
npm run dev          # servidor local con recarga en caliente → http://localhost:4321
```

Para ver el sitio **como en producción** (buscador Pagefind incluido) se necesita el build:

```sh
npm run build        # sitio estático en dist/
npm run postbuild    # índice de Pagefind en dist/pagefind/  ← imprescindible para /buscar
npm run preview      # sirve dist/ (con buscador) → http://localhost:4322
```

> **Ojo con npm 11**: `postbuild` **no** se dispara solo tras `build`; ejecutarlos siempre juntos.

### Comandos útiles

```sh
npx astro check        # tipos y esquemas de contenido (objetivo: 0 errores)
npm test               # Vitest: reglas puras en src/lib/*.test.ts
npm run datos:generar  # contenido sintético de prueba (prefijo sint-), ignorado por git
npm run datos:limpiar  # borra solo el contenido sint-
npm run dev:tunel      # expone el dev en una URL pública de cloudflared (para celular/sharing)
```

### Buscador (Pagefind)

El índice solo existe en `dist/`, así que **en `npm run dev` el buscador no aparece** (esperado, igual que `/admin/`). Para probarlo: build + postbuild + `npm run preview` (`/buscar`). En producción se sirve `dist/` y funciona.

## Contenido

- **Admin**: `http://localhost:4321/admin/index.html` en dev (login real en la Fase C, con el repositorio).
- Las colecciones viven en `app/web/src/content/<colección>/`; los modelos están en `src/content.config.ts` (espejo Zod de `public/admin/config.yml`). Cambios de dominio se hacen en ambos, reflejando `CONTEXT.md`.
- Borrador/Publicado es el campo booleano `publicado`; lo que depende de fechas (Agenda, Anuncios vencidos, Banners) se resuelve en el build → el sitio necesita reconstruirse a diario.

## Marca (logo)

El logo tiene **una sola fuente**: `app/web/src/assets/logo.svg`, renderizada con `src/components/Logo.astro` en navbar y footer. Para cambiarlo, reemplaza ese archivo (mismo nombre): nada de código se toca. Es un placeholder hasta la identidad definitiva.

## Arquitectura en 30 segundos

- Páginas consultan el contenido mediante `src/lib/contenido.ts` (`publicados()` filtra borradores; `vinculosDe()` da el índice inverso de las Fichas). No usar `getCollection` directo en colecciones con `publicado`.
- Reglas con fechas/filtros en módulos puros (`src/lib/reglas.ts`, `filtro-noticias.ts`, `filtro-agenda.ts`) con sus `*.test.ts`.
- UI: Starwind UI v3 (`src/components/starwind/`) + tema en `src/styles/starwind.css` (tokens de `docs/DESIGN.md`); íconos solo **Phosphor** (`phosphor-astro`).
- Listados con filtros renderizan las tarjetas con atributos `data-*` y filtran en el cliente con funciones puras.
- Referencias rotas entre colecciones no rompen el build (se registran como `Invalid content reference` y se descartan).

## Deploy / producción

Ver `docs/pendientes-infra.md` (checklist completo) y `docs/superpowers/plans/2026-10-11-hito-4-produccion.md` (plan por fases A–D). Producción: repositorio en GitHub, build + hosting en Cloudflare (Workers Assets, `wrangler.jsonc`), dominio propio, documentos en Drive/R2, reconstrucción diaria.

## Documentación relacionada

- `docs/Propuesta de arquitectura y contenidos para sitio web BIOING.md` — especificación funcional principal.
- `docs/DESIGN.md` — sistema de diseño de referencia.
- `docs/notas.md` y `docs/preguntas-reunion.md` — acuerdos y preguntas abiertas con el equipo.
- `docs/adr/` — decisiones de arquitectura.
- `docs/superpowers/plans/` — planes de ejecución (historial de trabajo por hito).
- `app/web/auditoria/` — evidencia de la auditoría Lighthouse (Fase A, A6).