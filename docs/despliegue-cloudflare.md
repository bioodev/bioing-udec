# Despliegue en Cloudflare (ambiente de desarrollo)

> **Actualización 2026-10-11:** el destino de este procedimiento es ahora el Worker de **QA**
> (`bioing-web-qa`) en la cuenta central del proyecto. Producción (`bioing-web`) se publica por Workers Builds.
> Plan completo de ambientes y redespliegue con dominio:
> [`plans/2026-10-11-plan-ambientes-qa-produccion.md`](plans/2026-10-11-plan-ambientes-qa-produccion.md).

> **Para qué sirve:** publicar el sitio en una URL estable (`*.workers.dev`) para revisarlo desde cualquier
> dispositivo, probar los encabezados de seguridad reales, el 404, el buscador y el rendimiento en el CDN,
> **sin depender de las cuentas ni del dominio de la carrera** (que llegan en la Fase C).
> **Estado:** procedimiento probado hasta el paso 2 (configuración y `--dry-run` OK); **falta la sesión de
> `wrangler`**, que tiene que hacerla una persona en su terminal. No es el ambiente de producción.
> **Relacionados:** [`architecture.md`](architecture.md) §10 · [`pendientes-infra.md`](pendientes-infra.md) ·
> [`guia-mantencion.md`](guia-mantencion.md) §4 · [`../AGENTS.md`](../AGENTS.md) (comandos).

---

## 0. Lo que ya está listo en el repositorio

- `app/web/wrangler.jsonc` sirve `app/web/dist` como **Workers Static Assets**, con:
  - `not_found_handling: "404-page"` → las rutas inexistentes muestran el **404 propio** del sitio.
  - `html_handling: "auto-trailing-slash"` → `/noticias/` (carpeta con `index.html`) y `/404.html` sin barra.
- `app/web/public/_headers` incluye una regla para `https://*.workers.dev/*` con `X-Robots-Tag: noindex`,
  para que el ambiente de prueba no se indexe. El patrón **no** alcanza al dominio definitivo: puede quedarse
  igual cuando el sitio pase a producción.
- `npm run deploy:dev` (en `app/web`) = `build` + `postbuild` + `wrangler deploy --env qa` (Worker **`bioing-web-qa`**: nunca toca producción).
- `app/web/wrangler` ya está como devDependency: no hay que instalar nada aparte.

**Confirmado en la documentación de Cloudflare:** los archivos `_headers` y `_redirects` **sí** se aplican en
Workers Static Assets (no se aplican a respuestas generadas por código de Worker, algo que este sitio no usa).

## 1. Requisitos previos (una sola vez)

1. **Cuenta de Cloudflare** (plan gratuito alcanza). Para este ambiente puede ser una cuenta personal; en la
   Fase C se reemplaza por la de la carrera.
2. **Subdominio `workers.dev`**: la primera vez hay que elegirlo en el panel (Workers & Pages → *Change*
   subdomain), p. ej. `mi-cuenta.workers.dev`. La URL del sitio será
   `https://bioing-web-qa.<subdominio>.workers.dev`.
3. **Node ≥ 22.12** y dependencias instaladas: `cd app/web && npm ci`.
4. **Comprobación sin credenciales** (debe pasar siempre):
   ```sh
   cd app/web
   npm run build && npm run postbuild
   npx wrangler deploy --dry-run     # lista los archivos de dist/ y sale sin publicar
   ```

## 2. Autenticarse (paso que necesita una persona, no un agente)

```sh
cd app/web
npx wrangler login          # abre el navegador para autorizar
npx wrangler whoami         # debe listar la cuenta y el subdominio workers.dev
```

Alternativa sin navegador (CI o terminal compartida): crear un token en el panel
(*My Profile → API Tokens*, plantilla **Edit Cloudflare Workers**) y exportarlo:

```sh
export CLOUDFLARE_API_TOKEN=...     # no commitear; vive fuera del repositorio
npx wrangler whoami
```

Si `whoami` responde `Not logged in` (token caducado), repetir `wrangler login`.

## 3. Fijar la URL del sitio antes de construir

`SITE_URL` determina la URL canónica, el `sitemap`, `robots.txt`, `llms.txt`, los feeds RSS, el Open Graph y
el JSON-LD. Si se olvida, el build queda apuntando a `https://bioing.example` y el ambiente sirve metadatos
incorrectos.

Opción A — archivo local (recomendada; `app/web/.env` está en `.gitignore`; `astro.config.mjs` lo lee con
`loadEnv` de Vite desde el 2026-10-11 — antes se ignoraba en silencio):

```sh
cd app/web
echo 'SITE_URL=https://bioing-web-qa.<subdominio>.workers.dev' > .env
```

Opción B — solo para un comando (la variable del entorno gana sobre `.env`):

```sh
SITE_URL=https://bioing-web-qa.<subdominio>.workers.dev npm run deploy:dev
```

## 4. Desplegar

```sh
cd app/web
npm run deploy:dev        # build → postbuild (Pagefind) → wrangler deploy
```

La primera vez, `wrangler` crea el Worker `bioing-web-qa` (`name` de `wrangler.jsonc` + el entorno `qa`).
Al terminar imprime la URL publicada.

Para actualizar el ambiente después de cualquier cambio: volver a correr `npm run deploy:dev` (sin volver a
hacer login).

### 4.1 Vista previa personal con despliegue automático (Etapa P, conectada el 2026-10-11)

La vista previa `https://bioing.bioodev.work` (Worker `bioing-web-qa`, cuenta personal del proveedor) se
publica **a mano**. Por eso una publicación desde el panel —que solo hace un commit en `main` del espejo
`bioodev/bioing-udec`— **no** actualiza el sitio. Para que se actualice sola, la persona conecta Workers Builds
en el dashboard (el agente no puede autorizar la app de GitHub):

| Campo (Worker `bioing-web-qa` → Settings → Build) | Valor |
|---|---|
| Repositorio | `bioodev/bioing-udec` (autorizar la app de GitHub solo en ese repo) |
| Rama | `main` (sin builds de otras ramas) |
| Directorio raíz | `app/web` |
| Comando de build | `npm run datos:generar && npm run build && npm run postbuild` |
| Comando de deploy | `npx wrangler deploy --env qa --domain bioing.bioodev.work` |
| Variables de build | `SITE_URL=https://bioing.bioodev.work`, `NODE_VERSION=22` |

- `datos:generar` va **solo** aquí: el contenido `sint-*` está fuera de git y la vista previa lo genera en cada
  build (semilla fija, fechas relativas a hoy). En el Worker de producción ese paso **no** va.
- Prueba: publicar algo desde el panel → en 1–3 min aparece un build en *Deployments* → el cambio se ve.
- No cambia el [ADR 0004](adr/0004-flujo-de-trabajo-una-persona.md) para la cuenta oficial; se desmonta con la
  Etapa P del [plan de ambientes](plans/2026-10-11-plan-ambientes-qa-produccion.md).

## 5. Verificación (5 minutos, con la URL publicada)

- [ ] `/` carga con imágenes y estilos (CSS/JS y fuentes no bloqueados por el CSP).
- [ ] `/buscar` **funciona**: aparece Pagefind y devuelve resultados (si no, faltó el `postbuild`).
- [ ] Una ruta inventada (p. ej. `/no-existe`) muestra el **404 propio**, con estado 404.
- [ ] `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`, `/noticias/rss.xml` y `/agenda/rss.xml` responden y
      contienen la **URL del Worker**, no `bioing.example`.
- [ ] El `<head>` de una ficha lleva canonical y Open Graph con la URL del Worker; el JSON-LD valida
      (`npm run verificar:jsonld` en local).
- [ ] Encabezados reales (`curl -I https://bioing-web-qa.<subdominio>.workers.dev/`):
      `content-security-policy`, `strict-transport-security`, `x-content-type-options`,
      `x-frame-options: DENY`.
- [ ] Caché larga en los assets con hash: `curl -I .../_astro/<archivo>` debe traer
      `cache-control: public, max-age=31536000, immutable`. Los del buscador (`/pagefind/*`) siguen sin caché
      larga a propósito (cambian en cada reconstrucción).
- [ ] Un `curl -I` a la raíz trae `x-robots-tag: noindex` (el ambiente no se indexa).
- [ ] Recorrido rápido con teclado y en el celular.
- [ ] Lighthouse de una pasada en `/` (aquí sí se ven los números con CDN y compresión reales).

## 6. Qué **no** funciona en este ambiente

- **El panel (`/admin/`) entra solo con token**: apunta al espejo de prueba `bioodev/bioing-udec` y se usa
  «Iniciar sesión con un token de acceso» (fine-grained, *Contents: Read and write*). El botón «Iniciar sesión
  con GitHub» necesita el Worker de autenticación OAuth (Fase C, etapa 4 del plan de ambientes).
- **No es producción**: el contenido será el de prueba y la URL es provisional.
- **Sin analítica**: Cloudflare Web Analytics se activa con la cuenta definitiva (ver
  [`guia-mantencion.md`](guia-mantencion.md) §8, que incluye el ajuste de CSP que hace falta).
- No hay dominio propio ni cachés optimizadas a largo plazo (eso se configura en la Fase C).

## 7. Alternativa sin cuenta: túnel temporal

```sh
npm run dev:tunel        # expone el servidor de desarrollo con cloudflared
```

Sirve para una revisión rápida desde el celular, pero muestra el **dev**, no el build: sin Pagefind, sin
`_headers` y con URL efímera (muere al cerrar). No lo uses para validar SEO, cabeceras ni rendimiento.

## 8. Problemas comunes

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `Not logged in` o token caducado | Sesión de wrangler vencida | `npx wrangler login` (o exportar el token) |
| El despliegue no encuentra `dist/` | Se saltó el build | Usar `npm run deploy:dev` (build + postbuild incluidos) |
| El sitio publicado muestra `bioing.example` en canonical/sitemap | Falta `SITE_URL` al construir | Definir `.env` y volver a desplegar |
| `/buscar` aparece vacío | Falta el índice de Pagefind | Correr `npm run postbuild` (lo hace `deploy:dev`) |
| Las rutas inexistentes muestran un 404 pelado | Falta `not_found_handling` | Ya está en `wrangler.jsonc`; verificar que no se editó |
| El Worker no se crea: nombre tomado | Ya existe un Worker con ese nombre en la cuenta | Cambiar `name` en `wrangler.jsonc` (y la URL) |
| El subdominio `workers.dev` no existe | Nunca se eligió en el panel | Workers & Pages → *Change* subdomain |
| `/admin/` en blanco: la CSP bloquea `unpkg.com` | Cloudflare **suma** las cabeceras de las reglas de `_headers` que coinciden (llegan dos CSP) | La regla `/admin/*` debe quitar la heredada con `! Content-Security-Policy` (ya está) |
| El build falla con `ImageNotFound /media/…` tras publicar desde el panel | Ruta de imagen escrita con el `public_folder` antiguo | `public_folder: '@/assets/media'` en `config.yml` (ya está); corregir la ruta del archivo a `'@/assets/media/…'` |
| Workers Builds falla con `Could not read package.json` en `/opt/buildhome/repo` | El *Root directory* quedó vacío: el build corre en la raíz del monorepo | Settings → Builds → Root directory = `app/web` y *Retry build* |
| Tras un build automático, canonical/sitemap dicen `bioing.example` | `SITE_URL` cargada como variable de ejecución (*Variables & Secrets*) y no de build | Settings → Builds → **Build variables and secrets** → `SITE_URL`, y *Retry build* |
| Tras corregir `SITE_URL`, el canonical ya está bien pero `robots.txt` o `sitemap-index.xml` siguen con `bioing.example` | Caché del borde de Cloudflare (`cf-cache-status: HIT`) | Esperar unos minutos; para comprobar el build nuevo, pedir la URL con `?x=123` |
| Hice push a `main` y no aparece un deploy nuevo | Workers Builds no recibió el aviso del push: el commit no tiene el check «Workers Builds» en GitHub (`https://api.github.com/repos/<owner>/<repo>/commits/<sha>/check-runs`) | *Deployments* → volver a lanzar el build, o hacer otro push a `main`. Un clon limpio con el comando de build sirve para descartar un error del código |
| Publiqué desde el panel y el sitio no cambió | La vista previa no está conectada a Workers Builds | Desplegar a mano (§4) o conectar el build (§4.1) |
| Aparece una advertencia de cobro | Plan gratuito superado | Revisar el panel; el volumen esperado entra de sobra |

## 9. Costos y límites

- **Este Worker no ejecuta código**: `wrangler.jsonc` solo sirve archivos, sin `main`, así que servir los
  assets **no genera invocaciones facturables**. El límite de **100 000 invocaciones/día** del plan gratuito
  solo aplicaría si algún día se agrega un script de Worker.
- Cuotas del plan gratuito que sí conviene vigilar: **20 000 archivos** en `dist/` (100 000 en plan pago) y
  **25 MiB por archivo**. Hoy el build produce ~724 archivos: holgado.
- Al superar una cuota del plan gratuito, Cloudflare **limita** (p. ej. responde `429`); no cobra
  automáticamente.
- El subdominio `workers.dev` es gratis; el dominio propio se paga aparte (Fase C).
- No se necesita R2 ni base de datos para este ambiente.
- Deploys muy grandes: Wrangler ≥ 4.34 renueva el token solo (el proyecto usa 4.148, así que no aplica el
  clásico "JWT expired during deployment"). Si alguna vez hay demasiados archivos, se pueden excluir del
  subida con `.assetsignore` (misma sintaxis que `.gitignore`).
- Si algún día se agrega un script de Worker (p. ej. el de autenticación del CMS), configurar
  `assets.run_worker_first` para que **solo** las rutas dinámicas invoquen el script y el resto se siga
  sirviendo como asset.

## 10. Cómo deshacerlo

```sh
npx wrangler deployments list        # historial
npx wrangler rollback                # volver a la versión anterior
npx wrangler delete                  # borrar el Worker (libera el nombre y la URL)
```

El ambiente es prescindible: si se borra, no afecta al repositorio ni al sitio de producción.

## 11. Camino a producción (Fase C, con la carrera)

> Superado por [`plans/2026-10-11-plan-ambientes-qa-produccion.md`](plans/2026-10-11-plan-ambientes-qa-produccion.md)
> (cuenta central adelantada, ambientes QA/producción y redespliegue con dominio). Se conserva como referencia.

1. Cuenta de Cloudflare de la **cuenta central** del proyecto y dominio propio.
2. Repositorio en GitHub + **Worker de autenticación** de Sveltia en `/auth` (CORS/PKCE) para que el panel
   funcione desde el dominio real.
3. **Workers Builds** conectado al repositorio: build y deploy automáticos en cada push, más la
   reconstrucción **diaria** poco después de medianoche de Chile.
4. `SITE_URL` con el dominio definitivo (y quitar el `noindex` si se usara un subdominio público).
5. Avisos por correo ante fallas de build y alertas de facturación.
6. Opcional: separar **staging y producción** con entornos de Wrangler (`env.staging` con su propio `name`,
   como recomienda la documentación de Cloudflare) si se quiere un preview estable además del dominio; con
   Workers Builds también hay URLs de preview por despliegue.

Detalle y checklist completo: [`pendientes-infra.md`](pendientes-infra.md).

## 12. Actualizar Sveltia CMS

El panel carga Sveltia desde unpkg con **versión fija y hash de integridad** (`app/web/public/admin/index.html`).
Sveltia todavía está en 0.x y publica a menudo, con cambios que pueden romper la compatibilidad. Por eso una versión
nueva **nunca llega sola** al panel: se actualiza a propósito, en un momento tranquilo (por ejemplo, una vez por
semestre o cuando una versión nueva traiga algo útil). La prueba `src/lib/panel-sveltia.test.ts` falla si alguien
quita la versión o el hash.

Qué depende de Sveltia y qué revisar:

- `config.yml`: las opciones que acepta.
- Las vistas previas (`public/admin/vista-previa-*.js`): usan `CMS.registerPreviewTemplate`,
  `CMS.registerPreviewStyle` y los globales `h` y `createClass`. El tema copia el `data-theme` del `<html>` del
  panel al iframe `blob:` de la vista previa.
- La CSP de `/admin/*` en `public/_headers`: si Sveltia empieza a cargar algo de otro dominio, el navegador lo
  bloquea.

Si algo de las vistas previas falla, el panel sigue editando y guardando; lo grave es la CSP o el `config.yml`.

Pasos (desde `app/web`, en una rama):

1. Ver la última versión: `npm view @sveltia/cms version`, y leer las notas de versión en
   <https://github.com/sveltia/sveltia-cms/releases> desde la versión actual.
2. Calcular el hash de la nueva:
   `curl -sL https://unpkg.com/@sveltia/cms@X.Y.Z/dist/sveltia-cms.js | openssl dgst -sha384 -binary | base64 -w0`
3. En `public/admin/index.html`, cambiar la versión en `src` y el hash en `integrity` (`sha384-<hash>`).
4. Validar `config.yml` contra el esquema **de esa versión**:
   `https://unpkg.com/@sveltia/cms@X.Y.Z/schema/sveltia-cms.json`.
5. `npm run verificar` en verde.
6. Probar `/admin/` sobre el build servido **con la CSP real** (`npx wrangler dev --env qa`): sin errores en la
   consola, abrir una Noticia y un Banner, ver las vistas previas en claro y en oscuro, y guardar una entrada de
   prueba en un repositorio local (sin commitearla).
7. Si todo está bien, se publica como cualquier cambio. Si algo falla, se queda en la versión anterior.
