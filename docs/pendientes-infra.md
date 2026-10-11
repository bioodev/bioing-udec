# Pendientes de infraestructura

Producción según `docs/propuesta-desarrollo.md` (secciones 6 y 8): repositorio en **GitHub**, build y hosting en **Cloudflare**, imágenes en el repositorio, documentos en Google Drive o R2, todo a nombre de la **cuenta central** del proyecto.

Mientras tanto, el desarrollo sigue en el Gitea propio (`gitea.bioodev.work/bioing/bioing-udec`, backend `gitea` en `config.yml`) y se publica a mano si hace falta (`npm run build` + `wrangler deploy`). El Gitea **no** es parte de la entrega.

## Cuentas (requieren a la carrera)

- [ ] Cuenta central del proyecto (Gmail) con doble factor (dos métodos), códigos de respaldo y contraseña en gestor compartido; reenvío al correo de la jefatura.
- [ ] Organización en GitHub a nombre de la cuenta central; miembros con sus propias cuentas (Encargado de comunicaciones, respaldo, jefatura, proveedor).
- [ ] Cuenta de Cloudflare de la cuenta central, con miembros invitados, tarjeta y alertas de facturación.
- [ ] Dominio (Cloudflare Registrar recomendado; si es `.cl`, definir titular) y autorización si el nombre usa la marca "UdeC".

## Migración del repositorio de Gitea a GitHub

- [ ] Integrar `demo-frontend` a `main` (en Gitea, `main` además tiene commits hechos desde Sveltia).
- [ ] Crear el repositorio privado en la organización de GitHub y subir el historial completo (`git push --mirror`).
- [ ] `config.yml`: backend `github` con `repo: <org>/<repo>` y `base_url` del Worker de autenticación.
- [ ] Desplegar Sveltia CMS Authenticator (Worker de Cloudflare) en la ruta `/auth` del dominio, con la OAuth App de GitHub (callback a esa ruta) y los dominios permitidos.
- [ ] Actualizar `docs/adr/0001-sveltia-cms-astro.md` (repositorio en GitHub; el Gitea queda solo como entorno de desarrollo) y `AGENTS.md`.
- [ ] Revisar `Cross-Origin-Opener-Policy` en `/admin` (`same-origin-allow-popups`) para que funcione la ventana de inicio de sesión.

## Build y despliegue (Cloudflare)

- [ ] `wrangler.jsonc` para servir `app/web/dist` como assets estáticos (o Cloudflare Pages si el dominio tuviera DNS externo).
- [ ] Workers Builds conectado al repositorio de GitHub: build y deploy en cada push a `main`.
- [ ] Reconstrucción diaria poco después de las 00:00 **de Chile** (≈ 04:00 UTC en invierno, 03:00 UTC en verano; p. ej. `15 4 * * *`), no a las 00:00 UTC, o un Anuncio vencido seguiría visible hasta ~21 horas.
- [ ] Avisos por correo ante fallas de build. Si el build registra `Invalid content reference`, avisar sin fallar (el sitio ya descarta esas referencias y un build caído congela Agenda y Anuncios).
- [ ] Revisión periódica de enlaces rotos (documentos de Drive).
- [ ] Aviso cuando el repositorio supere 1 GB.
- [ ] Caché de imágenes optimizadas entre builds, si el tiempo de build crece.
- [ ] **Build incremental de Astro** (`experimental.incrementalBuild`, disponible desde Astro 7.2.0; el proyecto usa 7.3.5) — **solo cuando el build crezca**. No activar suelto: requiere las tres cosas juntas o no rinde (hoy el build es ~1 s / 28 páginas):
  - persistir el `cacheDir` (`node_modules/.astro/`) entre builds de Cloudflare (cada build arranca limpio; sin esto se re-renderiza todo);
  - `cacheKey` en los `getStaticPaths()` de las rutas dinámicas (noticias, agenda, personas, anuncios, repositorio), que cambie cuando cambie el contenido;
  - `build.concurrency: 1` (el incremental se desactiva con concurrencia > 1).
  - Es experimental: su API puede cambiar; revisar antes de la entrega.
- [ ] Encabezados de seguridad (`_headers`), redirecciones (`_redirects`) y página 404.

## SEO, datos estructurados y descubrimiento

- [x] JSON-LD (Schema.org): `Organization`/`NGO` + `WebSite` en el layout y `NewsArticle`, `Event`, `JobPosting`, `Person`, `DigitalDocument`, `BreadcrumbList` y `ItemList` (Directorio) por página. Constructores puros en `src/lib/schema.ts`; se verifican con `npm run verificar:jsonld` sobre `dist/`. _Hecho 2026-10-11._
- [x] `robots.txt` generado en el build (`src/pages/robots.txt.ts` ← `src/lib/robots.ts`): `Sitemap` absoluto y política por user-agent (se permite indexar y citar; se bloquea el rastreo de entrenamiento). _Hecho 2026-10-11; la lista de bots es una decisión del equipo y se cambia en un solo lugar (`src/lib/robots.ts`)._
- [x] `llms.txt` como índice curado de secciones (`src/pages/llms.txt.ts` ← `src/lib/llms.ts`). _Hecho 2026-10-11. No sustituye al sitemap ni al SEO: es opcional por diseño._
- [x] Feeds RSS de Noticias (`/noticias/rss.xml`) y Agenda (`/agenda/rss.xml`), con `<link rel="alternate">` en sus listados. _Hecho 2026-10-11._
- [ ] **`security.txt`** en `/.well-known/security.txt`: depende del correo o URL de contacto real (preguntas-reunion 6.2). No publicar un contacto inventado; se activa cuando la carrera lo defina.
- [ ] **Validación externa de los datos estructurados**: pasar una muestra de páginas (noticia, actividad, anuncio, ficha) por el Rich Results Test de Google y el validador de Schema.org con el `SITE_URL` definitivo puesto en el build.
- [ ] **Rendimiento con contenido real**: con el contenido sintético de prueba (`sint-*`: más banners en el hero y ~54 fichas en el Directorio) el Inicio mide ~88 y el Directorio ~84; sin él quedan 90–91, sin regresión respecto de la Fase A. Al limpiar los datos sintéticos, revalidar; si el contenido real trae muchos banners, ajustar `widths`/`sizes` del hero y de las tarjetas.
- [ ] **WebMCP / Page Agent**: descartados por ahora — WebMCP es experimental y el sitio no tiene acciones propias (inscripciones y formularios son externos por alcance), y Page Agent agrega dependencia de proveedor, costo LLM y superficie de ataque. Si algún día se expone WebMCP, los filtros ya son funciones puras en `src/lib/*.ts`.

## Contenido y medios

- [x] Activar en `config.yml` la optimización al subir (`media_libraries.all.transformations`: WebP, 2048 px, calidad 85). _Hecho 2026-10-11 (commit `33e652a`); la subida real se prueba en la Fase C._
- [ ] Campo "documento" que acepte enlace de Google Drive o archivo en R2; reglas de Drive (propiedad de la cuenta central, carpeta pública dedicada).
- [ ] R2 solo si se usa para documentos: bucket, servido en `/media` del dominio, clave limitada a ese bucket, `public_url` en `config.yml`.
- [ ] **Prueba de imagen en el admin**: subir una imagen desde Sveltia y confirmar que la ruta queda como `../../assets/media/…`. Si no, ajustar `media_folder`/`public_folder` en `config.yml`.
- [ ] **Prueba de "Agregar Persona"** desde una Noticia: debe quedar en el mismo commit que la Noticia.
- [ ] Borrar el contenido de ejemplo y la "Noticia demo borrar luego" (el sintético `sint-*` no está en git: `npm run datos:limpiar`).
