# BIOING+

Plataforma digital de la comunidad de Bioingeniería de la Universidad de Concepción (FCB): noticias, actividades, oportunidades, documentos, Instagram y el directorio de egresados/as.

**Stack**: sitio estático **Astro 7** en `app/web`, contenido en archivos editados con **Sveltia CMS** (sin backend ni base de datos). Repositorio en Gitea propio (`gitea.bioodev.work/bioing/bioing-udec`), despliegue previsto en Cloudflare. **Plazo: marzo 2027.**

> **Documentación**: índice en **[`docs/README.md`](docs/README.md)** · cómo trabajar en el repo, en [`AGENTS.md`](AGENTS.md) · dominio y glosario, en [`docs/context.md`](docs/context.md) · arquitectura, en [`docs/architecture.md`](docs/architecture.md) · sistema visual, en [`docs/design.md`](docs/design.md).

## Estado

Hitos 1–3 completos. **Fase A del Hito 4 (producción en código) cerrada**: 404 + seguridad, SEO (sitemap/OG/canonical), buscador Pagefind, config Cloudflare, optimización de imágenes al subir y auditoría de calidad (Lighthouse ≥ 90). **Fase B (código) en curso**: datos estructurados (JSON-LD Schema.org), `robots.txt` y `llms.txt` generados y feeds RSS. Ver `docs/plans/` y `docs/pendientes-infra.md`. Lo que resta (Fases C–D) depende de entregas de la carrera: cuentas, dominio, identidad visual, contenidos reales.

## Estructura

```
app/web       → el sitio (Astro + Sveltia CMS); acá vive todo el código
docs/         → contexto, arquitectura, diseño, propuestas, planes, ADR y análisis
AGENTS.md     → reglas operativas para agentes de IA (breve; el detalle vive en docs/)
README.md     → esta puerta de entrada
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
npx astro check          # tipos y esquemas de contenido (objetivo: 0 errores)
npm test                 # Vitest: reglas puras en src/lib/*.test.ts
npm run verificar:jsonld  # valida el JSON-LD generado en dist/
npm run deploy:dev       # build + postbuild + deploy a Cloudflare (ambiente de desarrollo, *.workers.dev)
npm run datos:generar    # contenido sintético de prueba (prefijo sint-), ignorado por git
npm run datos:limpiar    # borra solo el contenido sint-
npm run dev:tunel        # expone el dev en una URL pública de cloudflared (para celular/sharing)
```

### Buscador (Pagefind)

El índice solo existe en `dist/`, así que **en `npm run dev` el buscador no aparece** (esperado, igual que `/admin/`). Para probarlo: build + postbuild + `npm run preview` (`/buscar`). En producción se sirve `dist/` y funciona.

## Contenido y CMS

- **Admin**: `http://localhost:4321/admin/index.html` en dev (login real en la Fase C, con el repositorio).
- Las colecciones viven en `app/web/src/content/<colección>/`; los modelos están en `src/content.config.ts` (espejo Zod de `public/admin/config.yml`). Un cambio de dominio se hace en **tres** lugares: `config.yml`, `content.config.ts` y `docs/context.md`.
- Borrador/Publicado es el campo booleano `publicado`; lo que depende de fechas (Agenda, Anuncios vencidos, Banners) se resuelve en el build → el sitio necesita reconstruirse a diario.

## Marca (logo)

El logo tiene **una sola fuente**: `app/web/src/assets/logo.svg`, renderizada con `src/components/Logo.astro` en navbar y footer. Para cambiarlo, reemplaza ese archivo (mismo nombre): nada de código se toca. Es un placeholder hasta la identidad definitiva.

## Deploy / producción

Ver `docs/pendientes-infra.md` (checklist completo) y `docs/plans/2026-10-11-plan-hito-4-produccion.md` (plan por fases A–D). Producción: repositorio en GitHub, build + hosting en Cloudflare (Workers Assets, `wrangler.jsonc`), dominio propio, documentos en Drive/R2, reconstrucción diaria.

## Documentación

El índice completo está en **[`docs/README.md`](docs/README.md)**. Los principales:

- [`docs/context.md`](docs/context.md) — propósito, alcance y glosario canónico del dominio.
- [`docs/architecture.md`](docs/architecture.md) — stack, componentes, modelo de contenido, rutas, build y despliegue.
- [`docs/design.md`](docs/design.md) — sistema de diseño (referencia e implementación).
- [`docs/pendientes-infra.md`](docs/pendientes-infra.md) y [`docs/preguntas-reunion.md`](docs/preguntas-reunion.md) — lo que falta y lo que está sin resolver con el equipo.
- [`docs/adr/`](docs/adr/) — decisiones de arquitectura.
- [`app/web/auditoria/`](app/web/auditoria/) — evidencia de la auditoría Lighthouse (Fase A, A6).
