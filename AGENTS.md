# AGENTS.md

Guía **operativa y breve** para agentes de IA (y personas) que trabajan en el repositorio de **BIOING+**: el
sitio web de la comunidad de Bioingeniería de la Facultad de Ciencias Biológicas, Universidad de Concepción.
Es un sitio **Astro** estático en `app/web`, con el contenido en archivos editados mediante **Sveltia CMS**;
sin backend ni base de datos. **Plazo de entrega: marzo de 2027.**

> El detalle **no** vive acá:
> **[`docs/README.md`](docs/README.md)** (índice) · [`docs/context.md`](docs/context.md) (dominio, alcance y
> glosario) · [`docs/architecture.md`](docs/architecture.md) (cómo está hecho) ·
> [`docs/design.md`](docs/design.md) (UI/UX) · [`docs/pendientes-infra.md`](docs/pendientes-infra.md)
> (qué falta) · [`docs/adr/`](docs/adr/) (decisiones) · [`docs/plans/`](docs/plans/) (planes fechados).

## Comandos

Desde `app/web`:

```sh
npm ci                    # instalar (en worktrees nuevos, primero esto)
npm run dev               # dev en localhost:4321; el servidor se maneja en segundo plano:
                          #   astro dev --background | astro dev stop | astro dev status | astro dev logs
npx astro check           # tipos y esquemas de contenido: debe quedar en 0 errores
npm test                  # Vitest: reglas puras en src/lib/*.test.ts
npm run build             # sitio estático en dist/
npm run postbuild         # índice de Pagefind (npm 11 NO lo dispara solo: correr ambos juntos)
npm run preview           # sirve dist/ en localhost:4322 (el buscador /buscar solo existe aquí)
npm run verificar:jsonld  # valida el JSON-LD del build
npm run deploy:dev        # build + postbuild + deploy a Cloudflare (*.workers.dev; requiere wrangler login)
npm run datos:generar     # contenido sintético de prueba (sint-*, ignorado por git)
npm run datos:limpiar     # borra solo el contenido sint-
npm run dev:tunel         # expone el dev por cloudflared (revisión desde el celular)
```

Con el servidor de dev corriendo, después de `datos:generar` hay que reiniciarlo (`astro dev stop` y volver a
levantar): no detecta cientos de archivos nuevos de una vez.

## Herramientas locales (fuera de git)

- **Skills de IA del stack**: se generan con `npx autoskills -y` **ejecutado desde `app/web`** (desde la raíz
  del monorepo no detecta Astro ni Cloudflare: solo ofrece Bash). Quedan en `app/web/.agents/skills`, con
  enlaces en `.opencode/skills`, y están **gitignored** a propósito (no son parte del entregable): hay que
  regenerarlos en cada clon nuevo. Traen `cloudflare`, `wrangler`, `workers-best-practices`, `astro`,
  `tailwind-css-patterns`, `gsap-*`, `vitest`, `seo`, `accessibility`…
- **Despliegue** (ambiente de desarrollo y camino a producción, con verificación y problemas comunes):
  [`docs/despliegue-cloudflare.md`](docs/despliegue-cloudflare.md).

## Reglas de trabajo

- Commits en **español e imperativo**, uno por tarea o hallazgo. No hay linter todavía.
- **TDD** donde haya lógica pura: módulo en `src/lib/` + `*.test.ts`. Las páginas no llevan lógica de negocio;
  consultan el contenido por `src/lib/contenido.ts`.
- Textos de interfaz en español y **términos del dominio según `docs/context.md`** (evitar los listados
  `_Avoid_`).
- No commitear el contenido sintético `sint-*`; no borrar contenido real sin consultar.
- Nunca commitear secretos ni credenciales (la cuenta y el dominio son de la carrera).

## Trampas conocidas (leer antes de tocar)

- **Fechas**: los campos con hora llevan offset de America/Santiago y se muestran con `formatoFechaHora`; las
  fechas solas (`AAAA-MM-DD`) se parsean como medianoche UTC y se muestran con `formatoFecha` (en UTC), para no
  correr el día.
- **Un cambio de modelo de dominio va en tres lugares**: `public/admin/config.yml`, `src/content.config.ts` y
  `docs/context.md`.
- **`config.yml` se valida de dos formas**: contra el JSON Schema de Sveltia
  (`https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json`) y cargando `/admin/` (p. ej.
  `python3 -m http.server` en `app/web/public`).
- **Una referencia rota no rompe el build**: se registra como `[ERROR] [content] Invalid content reference` y
  la página la descarta (`existentes()`); revisar la salida del build para limpiarla.
- **`/componentes` solo existe en `npm run dev`**; `/admin/` y el buscador de Pagefind, solo sobre el build.
- **Starwind UI v3 ≠ v2**: la documentación en línea de v2 no aplica (detalles en `docs/design.md`). Los
  íconos son **Phosphor** (`phosphor-astro`), no Tabler.
- **JSON-LD, `robots.txt` y `llms.txt` se generan en el build** (`src/lib/schema.ts`, `robots.ts`, `llms.ts`):
  no crear archivos con esos nombres en `public/` (el estático gana al generado).
- **Lo que depende de la fecha se resuelve en el build** (Agenda, Anuncios vencidos, Banners): el sitio
  necesita una reconstrucción diaria.
- **Sin comprobación de tipos en el CMS**: el esquema Zod del build es la red de seguridad; `astro check` en 0.
