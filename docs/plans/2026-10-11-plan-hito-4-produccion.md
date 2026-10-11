# Hito 4 — Puesta en producción — Plan de implementación

> **Para agentes:** ejecutar tarea por tarea (superpowers:executing-plans). Los pasos usan casillas (`- [ ]`).

**Meta:** llevar el sitio de "demo funcional" a **producción** según `docs/propuesta-desarrollo.md` §6–§8 y §11 (Hito 4, fecha comprometida 31-ene-2027): repositorio en GitHub, build y hosting en Cloudflare, dominio propio, documentos en Drive/R2, con las metas de calidad (WCAG 2.1 AA, Lighthouse ≥ 90, SEO y analítica sin cookies) verificadas.

**Estado de partida (rama `demo-frontend`):** Hitos 1–3 completos. Todas las secciones funcionan; 58 tests verdes; `astro check` 0/0; build de 28 páginas. Falta todo lo de `docs/pendientes-infra.md`.

**Spec:** `docs/propuesta-desarrollo.md` (§3 alcance y metas de calidad; §6 arquitectura; §6.1 dominio; §6.3 documentos; §6.4 imágenes; §6.5 cuentas; §6.6 repositorio; §8 CI/CD; §11 hitos; §13 requisitos; §14 cierre) · `docs/pendientes-infra.md` (checklist fuente) · `docs/preguntas-reunion.md`.

## Restricciones globales

- Rama `demo-frontend`, carpeta `app/web`. Sin push salvo que se pida. No tocar `AGENTS.md` (raíz) ni `app/web/AGENTS.md`.
- Leer antes: `AGENTS.md` (raíz), `app/web/AGENTS.md`, `docs/context.md`.
- **TDD donde hay lógica pura** (convención del repo: cada helper con su `*.test.ts`). Infra y config se verifican con build + prueba manual.
- Sin dependencias nuevas salvo las que este plan nombra (todas oficiales/estables).
- Textos en español; íconos Phosphor; commits en español, imperativo.
- El **dominio final no se conoce aún** (depende de la carrera, §13): todo lo que lo necesite usa una variable de entorno `SITE_URL` con un valor provisional, no una URL incrustada.

## Mapa de dependencias

- **Fase A — Código, SIN cuentas de terceros.** Se puede hacer ya, íntegra. No bloquea a nadie.
- **Fase B — Requisitos de la carrera (§13).** No los ejecuta el proveedor; son entregas del cliente (cuenta central, GitHub, Cloudflare, dominio, tarjeta, identidad visual, listado de egresados/as). Plazo cliente: 15-dic-2026 / 15-ene-2027.
- **Fase C — Puesta en producción.** Requiere la Fase B hecha. Migración a GitHub, autenticación del panel, CI/CD, R2, cron diario, pruebas en el admin real.
- **Fase D — Hito 5 (cierre).** Capacitación, documentación y entrega. Requiere C.

El orden de trabajo del proveedor es: **toda la Fase A ahora** → esperar Fase B → Fase C → Fase D.

> **Cambio 2026-10-11** ([ADR 0003](../adr/0003-cuenta-central-anticipada-y-ambientes.md)): B1–B3 (cuenta central, GitHub,
> Cloudflare) las ejecuta el proveedor ya, con visto bueno de la carrera para el nombre. Así C1, C3 y casi
> toda C4 se adelantan en `*.workers.dev` (QA + producción); el dominio (B4) solo agrega el redespliegue final.
> Paso a paso: [`2026-10-11-plan-ambientes-qa-produccion.md`](2026-10-11-plan-ambientes-qa-produccion.md).

---

## FASE A — Producción en código (sin cuentas) — SE HACE YA

> **Estado (2026-10-11):** A1, A2, A3 y A5 **hechas** (ver `2026-10-11-plan-fase-a-infra-seo.md`) e integradas en `develop`. En paralelo se ejecutó el **rediseño v2** de los wireframes (ver `2026-10-11-plan-rediseno-v2.md`). **A4 y A6 también están hechas** (2026-10-11, ver `2026-10-11-plan-fase-a-pendientes.md`), con lo que la Fase A queda cerrada. A7 (limpiar ejemplo) queda para el final, cuando la carrera entregue contenidos reales.

### Tarea A1: Página 404, encabezados de seguridad y redirecciones

**Archivos:** crear `app/web/src/pages/404.astro`, `app/web/public/_headers`, `app/web/public/_redirects`.

- [ ] **404:** usa `Base`, mensaje claro y enlaces a Inicio y al buscador; 375 px sin scroll horizontal.
- [ ] **`_headers`:** encabezados de seguridad globales — `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (salvo `/admin/*`), `Strict-Transport-Security`, y una **CSP** que permita los embeds en lista cerrada de §6.3 (youtube-nocookie, player.vimeo, drive.google, instagram) y nada más. Para `/admin/*`: `Cross-Origin-Opener-Policy: same-origin-allow-popups` (necesario para el login emergente de Sveltia).
- [ ] **`_redirects`:** archivo creado y vacío por ahora (se llenará con las URLs del sitio antiguo cuando la carrera las entregue, §10 supuestos).
- [ ] **Verificación:** `npm run build`; confirmar que `dist/404.html`, `dist/_headers` y `dist/_redirects` existen. Revisar la CSP contra cada embed en una página servida (`npx serve dist` o `wrangler dev`): ningún recurso legítimo bloqueado en consola.

### Tarea A2: SEO — `site`, sitemap y metadatos Open Graph

**Dependencia nueva:** `@astrojs/sitemap` (oficial).
**Archivos:** `astro.config.mjs`, `app/web/src/layouts/Base.astro`, `app/web/.env.example`, crear `app/web/public/robots.txt`.

- [ ] **`site` por entorno:** en `astro.config.mjs`, `site: process.env.SITE_URL ?? 'https://bioing.example'`; documentar `SITE_URL` en `.env.example`. (La URL real se fija en Cloudflare en la Fase C.)
- [ ] **Sitemap:** añadir `@astrojs/sitemap` a `integrations`; excluir rutas no indexables (`/admin`, `/componentes`). `robots.txt` apunta a `/sitemap-index.xml` y desautoriza `/admin`.
- [ ] **Open Graph / Twitter / canonical en `Base.astro`:** props `titulo`, `descripcion`, `imagen?`; genera `<link rel=canonical>` y etiquetas `og:*`/`twitter:card` con URL absoluta (vía `Astro.site`). Imagen OG por defecto en `src/assets` (placeholder BIOING+, se reemplaza con la marca final).
- [ ] **Verificación:** `npx astro check` 0/0; `npm run build`; `dist/sitemap-index.xml` existe y no incluye `/admin` ni `/componentes`; una página de detalle (p. ej. una Noticia) tiene `og:title`, `og:image` absoluta y `canonical` correctos.

### Tarea A3: Buscador general del sitio (Pagefind)

**Spec:** §3 ("Buscador general del sitio, índice estático, sin servidor").
**Dependencia nueva:** `pagefind` (indexa `dist/` tras el build; sin servidor).
**Archivos:** `package.json` (script `postbuild`), crear `app/web/src/pages/buscar.astro`, enlace en `Base.astro` (ícono de lupa en el menú).

- [ ] **Indexado:** `"postbuild": "pagefind --site dist"` para generar `dist/pagefind/` tras `astro build`. Excluir `/admin` y `/componentes` con `data-pagefind-ignore` o filtro de ruta. Marcar el cuerpo indexable con `data-pagefind-body` en `Base.astro` (región principal), para no indexar menú/pie repetidos.
- [ ] **Página `/buscar`:** UI de Pagefind (`pagefind/pagefind-ui.js`) con estilos acordes a docs/design.md; accesible (label, `aria-live` para el conteo de resultados). Resultados llevan a la página real.
- [ ] **Verificación:** `npm run build && npm run postbuild`; servir `dist`; buscar un término de una Noticia y de un egresado/a → aparecen; `/admin` no aparece en resultados. Añadir, si aplica, un test puro si se extrae alguna función de normalización.

### Tarea A4: Optimización de imágenes al subir (config.yml de Sveltia)

**Spec:** §6.4.
**Archivos:** `app/web/public/admin/config.yml`.

- [x] Activar `media_libraries.all.transformations`: formato **WebP**, máximo **2048 px**, **calidad 85**; aceptar HEIC. (El schema de Sveltia no admite `all.config`; Sveltia elimina metadatos EXIF/GPS al transformar; confirmar en la prueba de la Fase C.)
- [x] Validar `config.yml` de las dos formas de `AGENTS.md`: contra el JSON Schema de Sveltia y cargando `/admin/` (servir `public`); la pantalla de login aparece sin errores de consola.
- [ ] **Nota:** la prueba real de subida (ruta `@/assets/media/…`, EXIF borrado) queda en la Fase C (necesita login real al repositorio). Aquí solo se deja la configuración.

### Tarea A5: Configuración de publicación en Cloudflare (sin desplegar)

**Spec:** §6, §8, `pendientes-infra.md` ("Build y despliegue").
**Dependencia nueva (dev):** `wrangler`.
**Archivos:** crear `app/web/wrangler.jsonc`, `.gitignore` (si hace falta, ignorar `.wrangler/`).

- [ ] `wrangler.jsonc` para servir `app/web/dist` como **assets estáticos** (Workers Assets): `name`, `compatibility_date`, `assets = { directory = "./dist" }`. Sin secretos en el archivo.
- [ ] Documentar en `pendientes-infra.md` el comando de despliegue manual provisional (`npm run build && npm run postbuild && npx wrangler deploy`) y que el deploy real se conecta a Workers Builds en la Fase C.
- [ ] **Verificación:** `npx wrangler deploy --dry-run` (sin cuenta) valida la config; o `npx wrangler dev` sirve `dist` localmente y las páginas cargan.

### Tarea A6: Calidad — accesibilidad y Lighthouse

**Spec:** §3 metas de calidad (WCAG 2.1 AA; Lighthouse ≥ 90 en rendimiento, accesibilidad, buenas prácticas y SEO).
**Herramienta:** Lighthouse CI o `lighthouse` CLI contra `dist` servido (headless). Revisión manual de teclado y lectores de pantalla en las páginas clave.

- [x] Auditar las páginas principales: Inicio, Noticias (listado y detalle), Agenda, Directorio, Ficha, Repositorio, Anuncios, ¿Qué es?, Instagram, Buscar, 404.
- [x] Corregir hallazgos: jerarquía de encabezados, textos alternativos, contraste (acento #0066cc sobre fondos), foco visible, `lang`, nombres accesibles de controles (los `Select` de Starwind ya usan `aria-labelledby`), dimensiones de imagen para no desplazar el layout.
- [x] **Verificación:** Lighthouse ≥ 90 en las cuatro categorías en las páginas principales; recorrido completo por teclado sin trampas de foco; `npx astro check` 0/0; `npm test` verde. _Evidencia en `app/web/auditoria/` (README + `resumen-lighthouse.csv`)._

### Tarea A7 (al final de la Fase A): limpiar contenido de ejemplo

> Hacer **solo** cuando la carrera entregue contenidos reales (Fase B); se deja listado aquí para no olvidarlo.

- [ ] Borrar el contenido marcado "Contenido de ejemplo" y la "Noticia demo borrar luego".
- [ ] `npm run datos:limpiar` para el sintético `sint-*` (no versionado).
- [ ] `npm run build` y revisar que ninguna página quede vacía sin su estado "aún no hay…".

**Cierre de Fase A:** `npm test` + `npx astro check` (0/0) + `npm run build` + `postbuild` en verde. Commits por tarea. La demo queda "lista para producción" salvo lo que depende de cuentas.

---

## FASE B — Requisitos de la carrera (§13) — ENTREGA DEL CLIENTE

No los ejecuta el proveedor: son entregas de la carrera que **desbloquean** la Fase C. El rol del proveedor es **guiar, recibir y verificar** cada una. Fuente: `pendientes-infra.md` → "Cuentas" y §13. Plazos del cliente: cuentas/dominio/tarjeta/identidad **15-dic-2026**; egresados/as y contenidos **15-ene-2027** (§13). Un atraso corre las fechas del Hito 4 en el mismo plazo (§10).

Para cada requisito: **qué entrega la carrera · cómo lo verifica el proveedor · qué desbloquea**. Se recomienda una reunión de arranque de producción para abrir estos puntos y registrar responsables.

### B1: Cuenta central del proyecto
- [ ] **Entrega:** correo Gmail dedicado, con 2FA en **dos** métodos, códigos de respaldo guardados fuera de la cuenta y contraseña en un gestor compartido (p. ej. Bitwarden) con **al menos dos** personas de la carrera; reenvío de avisos/facturas al correo de la jefatura.
- [ ] **Verifica el proveedor:** acceso de prueba al gestor; 2FA activo; reenvío funcionando.
- [ ] **Desbloquea:** B2, B3 (todos los servicios cuelgan de esta cuenta, §6.5).

### B2: Organización en GitHub
- [ ] **Entrega:** organización creada **a nombre de la cuenta central**; invitación a los miembros con **sus propias cuentas** (Encargado de comunicaciones, respaldo, jefatura, proveedor), no una contraseña compartida.
- [ ] **Verifica:** el proveedor acepta la invitación con permiso de escritura; cada acción quedará registrada por persona.
- [ ] **Desbloquea:** C1 (repositorio), C3 (OAuth del panel), C4 (Workers Builds).

### B3: Cuenta de Cloudflare
- [ ] **Entrega:** cuenta de la cuenta central; miembros invitados; **tarjeta** registrada (Cloudflare la exige para activar R2 aunque no haya cobro); **alertas de facturación** activas.
- [ ] **Verifica:** el proveedor accede; alertas configuradas (umbral bajo); se decide si se usará R2 (§6.3).
- [ ] **Desbloquea:** C4 (hosting/CI), C5 (R2), analítica.

### B4: Dominio
- [ ] **Entrega / decisión:** nombre de dominio definido. Opción recomendada: **Cloudflare Registrar** (`.org`/`.com`) a nombre de la cuenta central. Si `.cl`: titular con RUT definido por escrito. Si el nombre usa la marca "UdeC": autorización de la universidad.
- [ ] **Verifica:** dominio activo y gestionable desde la cuenta de Cloudflare (o DNS delegable).
- [ ] **Desbloquea:** C3 (`/auth`, `/admin`), C4 (`SITE_URL`, publicación), C5 (`/media`).

### B5: Identidad visual definitiva
- [ ] **Entrega:** logo BIOING+ y manual de marca UdeC/FCB, **o** aprobación del diseño propuesto (`docs/design.md`).
- [ ] **Verifica:** assets en formato utilizable (SVG/PNG de alta resolución); color de acento definido.
- [ ] **Desbloquea:** C2 (identidad en el sitio). Incluye **dos rondas** de ajuste (§10).

### B6: Listado de egresados/as y consentimiento
- [ ] **Entrega:** planilla de egresados/as con los campos del Perfil (docs/context.md) y, por cada persona, **autorización registrada** (el Google Form es el registro oficial, con fecha y alcance — §9 riesgo 2).
- [ ] **Verifica:** la planilla distingue qué datos están autorizados; define el procedimiento de **supresión** (riesgo 1: borrar también del historial de Git, Ley 21.719 vigente 1-dic-2026) con la asesoría jurídica UdeC.
- [ ] **Desbloquea:** importación al Directorio y anuario (parte de C6/A7).

### B7: Contenidos iniciales y decisiones de contenido
- [ ] **Entrega:** textos institucionales, video de "¿Qué es la Bioingeniería?", documentos del Repositorio; respuestas de `docs/preguntas-reunion.md`.
- [ ] **Verifica:** formatos y permisos (documentos de Drive compartidos correctamente, §6.3); URL real de la FCB e Instagram oficial (hoy placeholders en `navegacion.ts`).
- [ ] **Desbloquea:** A7 (limpieza de ejemplo) y la carga inicial de C6.

### B8: Designación del Encargado de comunicaciones
- [ ] **Entrega:** persona designada formalmente, con cuenta de GitHub, durante y después del proyecto; más una persona de respaldo.
- [ ] **Desbloquea:** C6 (prueba de publicación de extremo a extremo) y D (capacitación).

---

## FASE C — Puesta en producción (requiere Fase B)

**Spec:** `pendientes-infra.md` ("Migración" y "Build y despliegue"), §6–§8. **Entorno:** cuentas de la carrera (B). Verificación transversal: tras cada cambio de config, `npm run build` local sigue verde; tras el deploy, el dominio real responde.

### C1: Migración del repositorio Gitea → GitHub  _(requiere B2)_
**Objetivo:** historial único en GitHub privado; Gitea queda solo como entorno de desarrollo.
- [ ] **Paso 1:** en Gitea, consolidar: integrar `demo-frontend` en `main` (recordar que `main` tiene además commits hechos desde Sveltia; resolver divergencia con merge, no rebase destructivo).
- [ ] **Paso 2:** crear el repositorio **privado** en la organización de GitHub (sin inicializar con README).
- [ ] **Paso 3:** `git push --mirror <github>` para subir todas las ramas y tags con su historial completo.
- [ ] **Paso 4:** proteger `main` (revisión de cambios, checks obligatorios); configurar el remoto de desarrollo.
- [ ] **Verificación:** `git log` y el número de commits coinciden entre Gitea y GitHub; ramas y tags presentes; `main` protegida.

### C2: Identidad visual definitiva  _(requiere B5)_
- [ ] **Paso 1:** reemplazar los logos de relleno ("BIOING+", "FCB UdeC") por los assets finales en `src/assets`.
- [ ] **Paso 2:** ajustar el acento en la variable de docs/design.md (una sola variable) y la imagen OG por defecto (A2).
- [ ] **Paso 3:** ronda 1 de ajustes con la contraparte → correcciones → ronda 2 (dos rondas, §10).
- [ ] **Verificación:** `npm run build`; revisión visual en claro/oscuro y a 375 px; contraste del acento cumple AA (revalidar A6).

### C3: Autenticación del panel y `config.yml` de producción  _(requiere B2, B4)_
- [ ] **Paso 1:** crear una **OAuth App de GitHub** en la organización, con callback a `https://<dominio>/auth`.
- [ ] **Paso 2:** desplegar el **Sveltia CMS Authenticator** (Worker de Cloudflare) en la ruta `/auth` del dominio, con el client id/secret de la OAuth App y los dominios permitidos (solo el del sitio).
- [ ] **Paso 3:** `config.yml` → `backend: github` con `repo: <org>/<repo>` y `base_url` del Worker; quitar el backend `gitea` de desarrollo (o dejarlo documentado).
- [ ] **Paso 4:** confirmar el encabezado `Cross-Origin-Opener-Policy: same-origin-allow-popups` en `/admin/*` (puesto en A1), necesario para la ventana emergente de login.
- [ ] **Verificación:** abrir `https://<dominio>/admin/`, iniciar sesión con una cuenta miembro de la organización, cargar las colecciones; un no-miembro es rechazado.

### C4: Dominio, hosting y CI/CD en Cloudflare  _(requiere B2, B3, B4)_
- [ ] **Paso 1:** conectar el dominio a Cloudflare (DNS gestionado); apuntar el sitio al Worker de assets (`wrangler.jsonc` de A5) o a Pages si el DNS fuera externo.
- [ ] **Paso 2:** fijar `SITE_URL=https://<dominio>` en el entorno de build de Cloudflare (recompone sitemap/OG/canonical con el dominio real).
- [ ] **Paso 3:** **Workers Builds** conectado al repo de GitHub: en cada push a `main`, `npm ci && npm run build && npm run postbuild` y publicar `dist`.
- [ ] **Paso 4:** **reconstrucción diaria** poco después de medianoche de Chile (≈ `15 4 * * *` UTC en invierno / `15 3 * * *` en verano) — **no** a las 00:00 UTC, o un Anuncio vencido seguiría visible ~21 h. _Actualización 2026-10-11:_ se resolvió con GitHub Actions a `15 4 * * *` UTC todo el año (00:15/01:15 de Chile), sin ajustes por el cambio de horario; ver `2026-10-11-plan-ambientes-qa-produccion.md` §3.5.
- [ ] **Paso 5:** avisos por correo ante fallas de build/deploy; el log de `Invalid content reference` **avisa sin fallar** (el sitio ya descarta esas referencias; un build caído congela Agenda y Anuncios).
- [ ] **Paso 6:** caché de imágenes optimizadas entre builds si el tiempo crece; aviso cuando el repositorio supere 1 GB. **Opcional, condicionado:** si el build crece, activar el **build incremental de Astro** (`experimental.incrementalBuild`) — requiere persistir `node_modules/.astro` entre builds + `cacheKey` en los `getStaticPaths()` + `build.concurrency: 1`; es experimental. Ver `docs/pendientes-infra.md`.
- [ ] **Paso 7:** **Cloudflare Web Analytics** (sin cookies): inyectar el snippet con el token de la cuenta vía variable de entorno, no incrustado en el código.
- [ ] **Verificación:** un push a `main` publica en 1–2 min; una edición con fecha (Anuncio que vence hoy) desaparece tras el cron; un build roto **no** cambia el sitio publicado y llega el aviso; analítica registra visitas sin cookies.

### C5: Documentos — Google Drive y R2  _(requiere B3; R2 opcional)_
- [ ] **Paso 1:** campo "documento" que acepte **enlace de Google Drive** o **archivo subido a R2**, mostrando la vista previa que corresponda (ya hay `TarjetaDocumento`/vista de Drive en el repo; extender al caso R2).
- [ ] **Paso 2:** reglas de Drive (§6.3): propiedad de la cuenta central, **carpeta pública dedicada**, nunca compartir carpetas internas; la reconstrucción diaria revisa enlaces y avisa si alguno se rompe (§9 riesgo 11).
- [ ] **Paso 3 (si se usa R2):** bucket servido en `/media` del dominio; clave limitada a ese bucket con permisos mínimos; `public_url` en `config.yml`; rotación de clave documentada (§9 riesgo 6).
- [ ] **Paso 4:** respaldo programado del repositorio y del bucket en una **segunda ubicación** (§9 riesgo 7).
- [ ] **Verificación:** un documento de Drive y (si aplica) un PDF en R2 se ven en Repositorio y en una Noticia; en móvil el PDF ofrece "Abrir/Descargar"; la revisión de enlaces detecta uno roto a propósito.

### C6: Carga inicial y pruebas en el admin real  _(requiere B6, B7, B8 y C1–C4)_
- [ ] **Paso 1:** importar el listado de egresados/as (planilla → entradas de `personas`, solo datos autorizados).
- [ ] **Paso 2:** carga inicial del resto por el Encargado durante la capacitación, con apoyo del proveedor.
- [ ] **Paso 3 (prueba imagen):** subir una imagen desde Sveltia → la ruta queda `@/assets/media/…` y se eliminan EXIF/GPS (verifica A4).
- [ ] **Paso 4 (prueba relación):** "Agregar Persona" desde una Noticia queda en el **mismo commit** que la Noticia.
- [ ] **Paso 5 (aceptación Hito 4):** el Encargado publica un contenido **de principio a fin sin ayuda**.
- [ ] **Paso 6:** cargar `_redirects` con las URLs del sitio antiguo que entregue la carrera (A1).
- [ ] **Paso 7:** ejecutar A7 (borrar contenido de ejemplo, `npm run datos:limpiar`).
- [ ] **Verificación:** metas de calidad en el **dominio real** (Lighthouse ≥ 90 en las cuatro categorías; dos últimas versiones de Chrome, Firefox, Safari y Edge, escritorio y móvil, §3).

---

## FASE D — Hito 5 (cierre) — requiere C

**Spec:** §14. **Criterio de aceptación global:** entregables recibidos, capacitación realizada, **acta de entrega conforme** → pago final (§12).

### D1: Documentación técnica y de arquitectura
- [ ] Documentación técnica del proyecto (cómo se construye, se publica y se mantiene).
- [ ] Arquitectura: diagramas y **ADR actualizados** — `docs/adr/0001-sveltia-cms-astro.md` pasa a "repositorio en GitHub; Gitea solo desarrollo"; actualizar `AGENTS.md` y `pendientes-infra.md` (marcar lo hecho).

### D2: Guías de uso y mantención
- [ ] **Guía de usuario** del Encargado de comunicaciones: publicar cada tipo de contenido, borradores, relaciones, imágenes, documentos, revertir un cambio.
- [ ] **Guía de mantención:** actualización de dependencias (cada ~6 meses), lectura de avisos de build, renovación de dominio, qué hacer si el repositorio se acerca a 1 GB.

### D3: Traspaso y evidencia
- [ ] Traspaso de **todas** las cuentas y credenciales a la institución (vía el gestor de contraseñas compartido, §6.5).
- [ ] Pruebas automatizadas y **evidencia de verificación** entregadas (salida de `npm test`, `astro check`, Lighthouse).
- [ ] El proveedor **elimina sus copias locales** de datos de egresados/as al cierre (§15).

### D4: Capacitación y acta
- [ ] Capacitación: **dos sesiones de 2 h** (Encargado + respaldo), con grabación.
- [ ] Inicio de la **garantía de 6 meses** (§15): correo de soporte, tiempos de respuesta (2 días hábiles; 1 si el sitio está caído).
- [ ] **Acta de entrega conforme** firmada → emisión de boleta y pago final (§12).

---

## Resumen de verificación (cada fase)

- **A:** `npm test` (con los tests nuevos), `npx astro check` 0/0, `npm run build` + `postbuild`, Lighthouse ≥ 90 local. Commits por tarea.
- **B:** cada requisito recibido y verificado por el proveedor (acceso real, no promesa); registrados responsables y fechas.
- **C:** build y deploy automáticos verdes en Cloudflare; login del panel OK; publicación de extremo a extremo por el Encargado; cron diario comprobado; documentos Drive/R2 OK; Lighthouse ≥ 90 en el dominio real.
- **D:** entregables de §14 recibidos; capacitación hecha; acta conforme → pago.
