# Despliegue en Cloudflare (ambiente de desarrollo)

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
- `npm run deploy:dev` (en `app/web`) = `build` + `postbuild` + `wrangler deploy`.
- `app/web/wrangler` ya está como devDependency: no hay que instalar nada aparte.

**Confirmado en la documentación de Cloudflare:** los archivos `_headers` y `_redirects` **sí** se aplican en
Workers Static Assets (no se aplican a respuestas generadas por código de Worker, algo que este sitio no usa).

## 1. Requisitos previos (una sola vez)

1. **Cuenta de Cloudflare** (plan gratuito alcanza). Para este ambiente puede ser una cuenta personal; en la
   Fase C se reemplaza por la de la carrera.
2. **Subdominio `workers.dev`**: la primera vez hay que elegirlo en el panel (Workers & Pages → *Change*
   subdomain), p. ej. `mi-cuenta.workers.dev`. La URL del sitio será
   `https://bioing-web.<subdominio>.workers.dev`.
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

Opción A — archivo local (recomendada; `app/web/.env` está en `.gitignore`):

```sh
cd app/web
echo 'SITE_URL=https://bioing-web.<subdominio>.workers.dev' > .env
```

Opción B — solo para un comando:

```sh
SITE_URL=https://bioing-web.<subdominio>.workers.dev npm run deploy:dev
```

## 4. Desplegar

```sh
cd app/web
npm run deploy:dev        # build → postbuild (Pagefind) → wrangler deploy
```

La primera vez, `wrangler` crea el Worker llamado `bioing-web` (nombre definido en `wrangler.jsonc`).
Al terminar imprime la URL publicada.

Para actualizar el ambiente después de cualquier cambio: volver a correr `npm run deploy:dev` (sin volver a
hacer login).

## 5. Verificación (5 minutos, con la URL publicada)

- [ ] `/` carga con imágenes y estilos (CSS/JS y fuentes no bloqueados por el CSP).
- [ ] `/buscar` **funciona**: aparece Pagefind y devuelve resultados (si no, faltó el `postbuild`).
- [ ] Una ruta inventada (p. ej. `/no-existe`) muestra el **404 propio**, con estado 404.
- [ ] `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`, `/noticias/rss.xml` y `/agenda/rss.xml` responden y
      contienen la **URL del Worker**, no `bioing.example`.
- [ ] El `<head>` de una ficha lleva canonical y Open Graph con la URL del Worker; el JSON-LD valida
      (`npm run verificar:jsonld` en local).
- [ ] Encabezados reales (`curl -I https://bioing-web.<subdominio>.workers.dev/`):
      `content-security-policy`, `strict-transport-security`, `x-content-type-options`,
      `x-frame-options: DENY`.
- [ ] Caché larga en los assets con hash: `curl -I .../_astro/<archivo>` debe traer
      `cache-control: public, max-age=31536000, immutable`. Los del buscador (`/pagefind/*`) siguen sin caché
      larga a propósito (cambian en cada reconstrucción).
- [ ] Un `curl -I` a la raíz trae `x-robots-tag: noindex` (el ambiente no se indexa).
- [ ] Recorrido rápido con teclado y en el celular.
- [ ] Lighthouse de una pasada en `/` (aquí sí se ven los números con CDN y compresión reales).

## 6. Qué **no** funciona en este ambiente

- **El panel (`/admin/`) no inicia sesión**: el CMS necesita el repositorio definitivo y el CORS/PKCE del
  Worker de autenticación (Fase C). Se edita contenido en local (`npm run dev`).
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
