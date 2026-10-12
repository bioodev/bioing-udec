# Guía de mantención y operación — BIOING+

> **Para quién es:** cualquier desarrollador o desarrolladora que tome el proyecto después de la entrega
> (la carrera o un proveedor distinto), con conocimientos de Astro. La operación diaria de contenido no
> requiere nada de esto: la hace el Encargado/a desde el panel.
> **Estado:** _esqueleto — pendiente de escribir el contenido_ (las URLs, cuentas y umbrales reales se
> completan cuando exista la infraestructura de la Fase C).
> **Relacionados:** [`architecture.md`](architecture.md) (estado del sistema) ·
> [`guia-usuario.md`](guia-usuario.md) ·
> [`pendientes-infra.md`](pendientes-infra.md) · [`../AGENTS.md`](../AGENTS.md) (comandos) ·
> [`adr/`](adr/) (decisiones) · [`guia-evolucion.md`](guia-evolucion.md) (cómo agregar o quitar funciones).

**Convención de esta guía:** cada procedimiento en formato *cuándo → cómo → cómo saber que salió bien →
cómo revertir*. Los incidentes van como tabla en §9.

---

## 1. Mapa de responsabilidades

- **Encargado/a de comunicaciones**: crear, revisar y publicar contenido; pedir cambios de modelo o diseño.
- **Operación automática**: cada publicación dispara build y despliegue; una reconstrucción diaria actualiza
  lo que depende de la fecha.
- **Mantención técnica**: actualizar dependencias, vigilar el build, respaldos, incidencias y seguridad.
- Qué **no** es responsabilidad de la mantención (contenido, diseño nuevo, fallas de terceros: Instagram,
  Google Drive).

## 2. Rutinas

### 2.1 Diaria / semanal
- Revisar que el build diario corrió y que no llegaron avisos por correo.
- Mirar el sitio en un par de páginas clave (Inicio, Agenda, Anuncios) y el buscador.
- Atender el aviso de referencias rotas (`Invalid content reference`) en la salida del build.
- _Pendiente:_ definir responsable y canal del aviso.

### 2.2 Mensual
- `npm audit` y actualizaciones menores; correr `npm test` y `npx astro check`.
- Revisar enlaces (documentos de Drive y enlaces externos de Anuncios/Actividades).
- Confirmar que la reconstrucción diaria sigue programada y que los avisos de correo funcionan.

### 2.3 Semestral
- Actualizar dependencias mayores (Astro, Sveltia, Tailwind/Starwind, Pagefind) siguiendo §3.3.
- **Sveltia CMS** (versión fija en `app/web/public/admin/index.html`): revisar si hay versión nueva y leer sus
  notas de versión desde la actual. Si no trae cambios que rompan la compatibilidad (opciones de `config.yml`
  renombradas o retiradas, cambios en `registerPreviewTemplate`/`registerPreviewStyle`, recursos de dominios
  nuevos que choquen con la CSP de `/admin/*`), actualizar siguiendo `despliegue-cloudflare.md` §12. Si los trae o
  hay dudas, quedarse en la versión actual y anotar el motivo en `docs/pendientes-infra.md`.
- Revalidar Lighthouse (≥ 90 en las cuatro categorías) y el recorrido por teclado.
- Revisar `docs/pendientes-infra.md` y este documento; actualizar lo que cambió.
- Revisar el tamaño del repositorio y el costo de los servicios (§11).

## 3. Entorno y comandos

### 3.1 Puesta en marcha
- Requisitos (Node ≥ 22.18, el valor de `engines` en `app/web/package.json`), `npm ci`, `npm run dev`, variables de entorno (`SITE_URL`).
- Comandos de verificación (`npm test`, `astro check`, `build` + `postbuild`, `verificar:jsonld`,
  `preview`) y el detalle de que npm 11 no dispara `postbuild` solo. Referencia: [`../AGENTS.md`](../AGENTS.md).

### 3.2 Contenido de prueba
- `npm run datos:generar` / `datos:limpiar`; que el contenido `sint-*` no va a git y que hay que reiniciar
  el servidor de dev después de generarlo.
- Qué borrar antes de la entrega (`Contenido de ejemplo`, "Noticia demo borrar luego").

### 3.3 Actualizar dependencias
- Procedimiento: rama nueva → `npm update`/`npm i <paquete>@latest` → `npm test` + `astro check` +
  build → revisar los cambios visibles (Starwind v3 puede cambiar componentes) → commit y deploy.
- Cuándo **no** actualizar: en medio de una campaña o cerca de una fecha de entrega de contenido; anotar la
  versión y esperar.
- Sección "cómo revertir si algo se rompe" (deploy anterior / revert del commit).

## 4. Despliegue y dominio

- **Procedimiento completo:** [`despliegue-cloudflare.md`](despliegue-cloudflare.md) (requisitos, autenticación
  de `wrangler`, `SITE_URL`, `npm run deploy:dev`, verificación, incidentes y camino a producción).
- Cloudflare Workers (Static Assets) con `app/web/wrangler.jsonc`; Workers Builds conectado al repositorio.
- Variables y secretos (dónde vive `SITE_URL` y cualquier token; nunca en el repositorio).
- Reconstrucción **diaria** programada poco después de medianoche de Chile (y por qué no a las 00:00 UTC):
  workflow `.github/workflows/reconstruccion-diaria.yml` + secret `CF_DEPLOY_HOOK_URL`; cómo probarlo a mano
  (*Run workflow*) y cómo rotar el hook si se filtra.
- Avisos por correo ante fallas de build; qué hacer si el build falla (el sitio publicado no cambia).
- Dominio, DNS y certificados (renovación automática); qué revisar cada año antes del vencimiento.
- _Pendiente:_ completar con las cuentas y URLs reales (Fase C).

## 5. Contenido y CMS

- Modelo en dos espejos: `app/web/public/admin/config.yml` ↔ `src/content.config.ts` (+ `docs/context.md`);
  todo cambio va en los tres.
- Cómo validar `config.yml` (JSON Schema de Sveltia + cargar `/admin/`).
- Migración a GitHub con el Worker de autenticación de Sveltia (`/auth`, CORS, COOP); qué revisar en
  `_headers` para que funcione el login.
- Qué hacer si el panel no puede guardar (permisos, tokens, permisos de CORS).

## 6. Reversión de cambios

- **Contenido publicado por error**: identificar el commit en el historial del repositorio y revertirlo
  (o deshacer desde el panel si el cambio es reciente); tiempos.
- **Cambio de contenido con datos personales**: procedimiento con prioridad (incluye revisar el historial
  de Git, ver riesgo 1 de la propuesta).
- **Cambio de código que rompió el sitio**: revertir el commit y esperar el redeploy, o volver al deploy
  anterior.
- Qué se puede hacer sin soporte del proveedor y qué conviene pedir dentro de la garantía.

## 7. Respaldos

- Repositorio: mirror/segunda copia (dónde y cada cuánto); por qué Git solo no es un respaldo.
- Documentos en R2 (si se usa) y en Drive (propiedad de la cuenta central).
- Evidencia de autorizaciones de datos personales (fuera del sitio: planilla del Google Form).
- Prueba de restauración: cómo verificar que el respaldo sirve (al menos una vez al año).

## 8. Salud del sitio

- Lighthouse y accesibilidad (evidencia en `app/web/auditoria/`), cuándo re-ejecutar.
- Tiempo de build y `experimental.incrementalBuild` (solo si el build crece; requisitos en
  `pendientes-infra.md`).
- Tamaño del repositorio (aviso al pasar 1 GB) y caché de imágenes optimizadas.
- Buscador Pagefind (se regenera en `postbuild`), sitemap, `robots.txt`, `llms.txt`, feeds RSS y JSON-LD
  (`npm run verificar:jsonld`).
- **Analítica sin cookies (Cloudflare Web Analytics)** — _implementada; falta el token de la cuenta de la carrera_
  (ADR 0012). Pasos para activarla:
  1. Cuenta de Cloudflare de la carrera. En *Web Analytics → Add site* se indica el dominio y se copia el token del
     *manual snippet*. Se pega **solo el token** en «SEO del sitio → Analítica (opcional)». No es secreto: va atado al dominio.
     Si el sitio está en un dominio *proxied* por Cloudflare, la analítica puede activarse desde el panel de Cloudflare sin
     token; en ese caso el campo se deja vacío para no contar dos veces.
  2. La CSP ya admite `https://static.cloudflareinsights.com` (`script-src`) y `https://cloudflareinsights.com`
     (`connect-src`) en la regla `/*` de `public/_headers`. `src/lib/csp.test.ts` lo vigila.
  3. El beacon se carga con `spa: true` (`analiticaCloudflare` en `src/lib/seo.ts`) porque el sitio navega con
     ClientRouter. Cloudflare lo tiene activado por defecto; se deja explícito.
  4. Dos detalles documentados por Cloudflare: la inyección automática **solo** aplica en dominios *proxied* (no en
     `*.workers.dev`) y falla si la respuesta lleva `Cache-Control: public, no-transform`.
  5. Retención: 6 meses en el panel, sin exportación de datos crudos (si se necesitara más, habría que evaluar otra
     herramienta).
  6. Verificar: sin errores de CSP en la consola del build servido (`npx wrangler dev --env qa`), llamadas a
     `cloudflareinsights` en DevTools y visitas en el panel 5–10 minutos después.
  7. El patrón del token (20–64 letras y números, en `seo.ts` y en `config.yml`) no está confirmado en la documentación de
     Cloudflare. Si el panel rechaza un token real, revisar ese patrón.

## 9. Incidentes (runbook)

Tabla *síntoma → causa probable → acción inmediata → a quién avisar → cómo evitar que se repita*:

- El sitio no carga / muestra error.
- El build falla o el sitio quedó congelado (sin la actualización diaria).
- El panel no deja guardar o no inicia sesión.
- Un embed (Instagram, Drive, YouTube, Spotify, SoundCloud, Apple Podcasts, Facebook, Google Maps) dejó de
  funcionar: revisar `frame-src` en `public/_headers` y la regla en `src/lib/incrustados.ts`; el servicio pudo
  cambiar el formato de su enlace.
- Un enlace de Documento responde "sin permiso" (archivo movido o permiso cambiado).
- El buscador no encuentra contenido o `/buscar` aparece vacío.
- El dominio venció o el DNS apunta mal.
- Se perdió el acceso a la cuenta central o al correo del proyecto.
- El repositorio superó 1 GB o el build demora demasiado.
- Llegó un pedido de baja/eliminación de datos personales.

## 10. Seguridad

- Doble factor, quién tiene acceso a qué, y cómo se da y se quita acceso (personas, no contraseñas
  compartidas).
- `_headers` (CSP y encabezados): qué revisar antes de agregar un embed nuevo a la lista cerrada.
- Claves de R2 (permisos mínimos, rotación) — solo si se usa R2.
- **Reporte de vulnerabilidades**: `/.well-known/security.txt` (archivo en `app/web/public/.well-known/`, RFC 9116).
  Hoy es **provisional**: `Contact` apunta al repositorio de prueba del proveedor. Al migrar a la cuenta y el dominio de
  la carrera hay que cambiar `Contact`, descomentar `Canonical` y renovar `Expires`. **Renovar antes de la fecha de
  `Expires`, como mínimo una vez al año.** La prueba `src/lib/security-txt.test.ts` avisa en consola si faltan menos de
  60 días. Pendiente en `pendientes-infra.md`.
- **Revisión de seguridad** (última: `analisis/2026-10-12-revision-seguridad.md`). En la mantención semestral:
  `npm audit`, `gitleaks git --log-opts="--all" --redact` y las pruebas de cabeceras (`src/lib/csp.test.ts`).
  El cuerpo Markdown del panel no admite HTML crudo (`src/lib/sanear-html.ts`) y los enlaces solo aceptan http(s)
  o rutas internas (`src/lib/urls.ts`): no relajar esas reglas sin revisar la CSP.

## 11. Costos y cuotas

- Qué es gratuito y qué podría cobrar (repositorio, builds, R2, dominio, tarjeta de la cuenta).
- Dónde están las alertas de facturación y qué vigilar.
- Qué hacer si se acerca al límite de una cuota.

## 12. Deuda técnica conocida

- Resumen de [`architecture.md`](architecture.md) §11 y [`pendientes-infra.md`](pendientes-infra.md):
  Sveltia pre-1.0, sin tipos en el CMS, referencias rotas que no rompen el build, buscadores en el cliente,
  dependencias de terceros, contenido de ejemplo por limpiar.

## 13. Traspaso y continuidad

- Qué se entrega (código, cuentas, credenciales, documentación, evidencia de verificación y capacitación).
- Inventario de cuentas y credenciales a nombre de la institución. _Pendiente: plantilla._
- Qué cubre la garantía y qué no; cómo se pide un cambio de alcance.

---

## Apéndice A · Archivos clave para mantención

- Tabla: `app/web/public/admin/config.yml`, `src/content.config.ts`, `src/lib/*` (reglas y schema),
  `src/layouts/Base.astro`, `scripts/` (`postbuild`, `verificar-jsonld`, datos sintéticos),
  `public/_headers`, `public/_redirects`, `wrangler.jsonc`, `docs/`.

## Apéndice B · Registro de cambios del proyecto

- _Pendiente:_ decidir si se crea `CHANGELOG.md` (hay releases reales recién en la entrega) o si la bitácora
  (`bitacora.md`) y el historial de Git bastan.
