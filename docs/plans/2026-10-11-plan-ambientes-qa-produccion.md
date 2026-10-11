# Ambientes QA y producción en la cuenta central — Plan paso a paso

**Meta:** publicar el sitio **ya** en las cuentas definitivas del proyecto (cuenta central, organización de
GitHub y Cloudflare), con dos ambientes en `*.workers.dev` —QA y producción—, y dejar escrito el
**redespliegue** cuando la carrera defina el dominio oficial. Decisión: [ADR 0003](../adr/0003-cuenta-central-anticipada-y-ambientes.md).

**Por qué ahora:** adelanta C1, C3 y casi toda C4 del [plan del Hito 4](2026-10-11-plan-hito-4-produccion.md)
sin esperar la Fase B. De la carrera solo quedan pendientes el **dominio**, la **tarjeta** y la
**identidad visual**.

| Ambiente | Worker | Rama | URL (hasta tener dominio) | Indexable |
|---|---|---|---|---|
| dev | — | cualquiera | `localhost:4321` (y Gitea mientras dure) | no |
| QA | `bioing-web-qa` (`env.qa` en `wrangler.jsonc`) | `develop` | `https://bioing-web-qa.<sub>.workers.dev` | no (`noindex`) |
| producción | `bioing-web` | `main` | `https://bioing-web.<sub>.workers.dev` → dominio oficial | sí, solo con el dominio |

`<sub>` = subdominio `workers.dev` de la cuenta de Cloudflare central (se elige una vez, paso 3.2).

> **Quién hace qué.** Los pasos marcados **(persona)** requieren teléfono, navegador o verificaciones y los
> hace el proveedor; un agente puede preparar archivos y comprobar, pero no crear cuentas ni hacer login.

---

## Etapa P — Vista previa personal (provisional, fuera de la entrega)

Mientras no exista la cuenta central, el Worker de QA corre en la **cuenta personal de Cloudflare del
proveedor**, con un subdominio de su dominio de desarrollo. Sirve para mostrar el sitio a la carrera. **No es
parte de la entrega**: se desmonta al pasar a la cuenta central.

| | Valor |
|---|---|
| URL | `https://bioing.bioodev.work` (dominio propio del Worker; `workers.dev` desactivado) |
| Worker | `bioing-web-qa` (`env.qa`), cuenta personal del proveedor |
| Indexación | `noindex` (regla temporal en `public/_headers`) |
| Publicado | 2026-10-11, con el contenido sintético `sint-*` del equipo local |

**Publicar o actualizar** (desde `app/web`, con `wrangler login` en la cuenta personal):
```sh
echo 'SITE_URL=https://bioing.bioodev.work' > .env    # una vez; .env está en .gitignore
npm run build && npm run postbuild
npx wrangler deploy --env qa --domain bioing.bioodev.work
```
Usar **siempre** el `--domain`. El dominio no está en `wrangler.jsonc` a propósito (no se mete el dominio
del proveedor en la configuración de la entrega). `npm run deploy:dev` no lo lleva: sirve para la cuenta
central.

**Desmontar al migrar** (antes o justo después de la etapa 3):
1. `npx wrangler delete --env qa` **con la sesión de la cuenta personal** (`wrangler whoami` antes). Borra el
   Worker y su dominio propio. El comodín DNS de `bioodev.work` sigue igual.
2. Quitar de `public/_headers` el bloque `https://bioing.bioodev.work/*` (marcado TEMPORAL).
3. Cambiar `SITE_URL` en `app/web/.env` por la URL de QA de la cuenta central (o borrar el `.env`).
4. `npx wrangler logout` y `npx wrangler login` con la cuenta central (ventana privada).
5. Avisar a la carrera de la URL nueva de QA.

## Etapa 0 — Visto bueno de la carrera (antes de crear nada)

- [ ] **(persona)** Confirmar por escrito (correo o mensaje) el **nombre del correo** de la cuenta central.
      Es permanente. Si usa "UdeC", pedir la autorización correspondiente.
- [ ] Pedir el **correo institucional de la jefatura** para usarlo como recuperación y reenvío.

## Etapa 1 — Cuenta central (Gmail)

- [ ] **(persona)** Crear la cuenta con el nombre aprobado.
- [ ] Doble factor con **dos métodos** (app de autenticación + teléfono o llave), y **códigos de respaldo**
      guardados fuera de la cuenta.
- [ ] Correo de recuperación = el de la jefatura. Si el teléfono de verificación es del proveedor, anotarlo
      en el checklist de traspaso (se cambia en el Hito 5).
- [ ] Reenvío de avisos y facturas al correo de la jefatura (§6.5 de la propuesta).
- [ ] Contraseña en un **gestor compartido** (p. ej. Bitwarden); por ahora con el proveedor, en el traspaso con
      dos personas de la carrera.

## Etapa 2 — GitHub

- [ ] **(persona)** Crear la **organización** con la cuenta central como dueña; invitar al proveedor (con su
      cuenta propia) como owner temporal.
- [ ] Crear el repositorio **privado** y subir el historial completo desde el Gitea:
      ```sh
      git clone --mirror https://gitea.bioodev.work/bioing/bioing-udec.git
      cd bioing-udec.git
      git push --mirror git@github.com:<org>/<repo>.git
      ```
      (Al 2026-10-11, `origin/main` no tiene commits fuera de `develop`: no hay nada que reconciliar.)
- [ ] Integrar `develop` en `main` (`develop` va 74 commits adelante), para que producción parta del sitio
      actual. Proteger `main` (sin push forzado).
- [ ] En el clon de trabajo, apuntar `origin` a GitHub y dejar el Gitea como remoto secundario (`gitea`), o
      retirarlo.

## Etapa 3 — Cloudflare (cuenta y Workers)

### 3.1 Cuenta
- [ ] **(persona)** Crear la cuenta de Cloudflare con la cuenta central. Invitar al proveedor como miembro.
      **No** hace falta tarjeta todavía (Workers y Builds funcionan en el plan gratuito).

### 3.2 Subdominio `workers.dev`
- [ ] Workers & Pages → *Change subdomain*. Elegir uno neutro y sin datos personales (p. ej. `bioing-udec`).
      Define las URLs de QA y de producción hasta tener dominio.

### 3.3 Primer despliegue manual (crea los dos Workers)
Workers Builds necesita que los Workers existan para conectarlos al repositorio. Desde `app/web`:
```sh
npx wrangler login                                   # (persona) con la cuenta central
npx wrangler whoami
SITE_URL=https://bioing-web-qa.<sub>.workers.dev npm run build && npm run postbuild
npx wrangler deploy --env qa                          # crea bioing-web-qa
SITE_URL=https://bioing-web.<sub>.workers.dev npm run build && npm run postbuild
npx wrangler deploy                                   # crea bioing-web
```

### 3.4 Workers Builds (CI/CD)
Conectar el repositorio de GitHub **a cada Worker** (Settings → Build). Configuración:

| Campo | `bioing-web` (producción) | `bioing-web-qa` (QA) |
|---|---|---|
| Rama de producción | `main` | `develop` |
| Root directory | `app/web` | `app/web` |
| Build command | `npm run build && npm run postbuild` | `npm run build && npm run postbuild` |
| Deploy command | `npx wrangler deploy` | `npx wrangler deploy --env qa` |
| Preview builds | desactivadas (por ahora) | desactivadas |
| Variable de build `SITE_URL` | `https://bioing-web.<sub>.workers.dev` | `https://bioing-web-qa.<sub>.workers.dev` |
| Variable de build `NODE_VERSION` | `22` | `22` |

- El `postbuild` (Pagefind) va explícito: npm 11 no lo dispara solo.
- `NODE_VERSION=22` porque Workers Builds usa Node 24 por defecto y el proyecto se probó en 22 (`engines`:
  `>=22.12`). Cambiar a 24 solo después de probar.
- Las variables de build no llegan al runtime (no hacen falta: el sitio es estático).
- Un push a `develop` publica QA; un push o merge a `main` publica producción.

### 3.5 Reconstrucción diaria (Agenda, Anuncios, Banners)
- [ ] En `bioing-web` → Settings → Builds → **Deploy Hooks**: crear uno para la rama `main`. La URL es un
      **secreto** (cualquiera que la tenga puede disparar builds): va al gestor, nunca al repositorio.
- [ ] Dispararlo a diario poco después de las 00:00 de Chile (`15 4 * * *` UTC en invierno; ver
      `pendientes-infra.md`). Opción recomendada: un Worker mínimo con Cron Trigger que haga `POST` al hook,
      con la URL como secret (`wrangler secret put DEPLOY_HOOK_URL`). Es una invocación al día: dentro del plan
      gratuito.

### 3.6 Avisos de build fallido
- [ ] Workers Builds publica eventos (`build.failed`, etc.) mediante **Event Subscriptions** a una Queue;
      Cloudflare tiene una plantilla (`workers-builds-notifications-template`) que los reenvía. Definir el
      destino (correo de la cuenta central o un webhook). Revisar al configurarlo si Queues exige plan pago.

## Etapa 4 — Panel (Sveltia CMS) contra GitHub

- [ ] **(persona)** Desplegar **Sveltia CMS Authenticator** en la cuenta central (Worker propio, p. ej.
      `sveltia-cms-auth.<sub>.workers.dev`), siguiendo su README vigente.
- [ ] **(persona)** Crear la **OAuth App** de GitHub en la organización, con callback a ese Worker
      (`…/callback`). Cargar el client ID y el secret como **secrets** del Worker (nunca en el repositorio).
- [ ] Dominios permitidos del Worker de auth: los dos `*.workers.dev` del sitio (y luego el dominio oficial).
- [ ] `public/admin/config.yml`: backend `github`, `repo: <org>/<repo>`, `branch: main`,
      `base_url: https://sveltia-cms-auth.<sub>.workers.dev`. Validar con el JSON Schema de Sveltia y cargando
      `/admin/` (ver `AGENTS.md`).
- [ ] Probar desde **producción** (`bioing-web.<sub>.workers.dev/admin/`): iniciar sesión, subir una imagen
      (ruta `../../assets/media/…`), "Agregar Persona" desde una Noticia (mismo commit). Son las pruebas de C6
      que hoy están pendientes.

**Ojo con el panel en QA.** El `config.yml` es el mismo en los dos ambientes y escribe en `main`: lo que se
edite desde el `/admin/` de QA se publica en producción. Regla: **el contenido se edita solo desde
producción**; QA sirve para revisar código. Para que QA muestre el contenido nuevo, integrar `main` en
`develop` de vez en cuando.

## Etapa 5 — Verificación

- [ ] Checklist del §5 de [`despliegue-cloudflare.md`](../despliegue-cloudflare.md) en **ambas** URLs
      (canonical, sitemap, RSS y JSON-LD con la URL correcta de cada ambiente; `/buscar`; 404; encabezados).
- [ ] `curl -I` a ambas: `x-robots-tag: noindex` (correcto mientras no haya dominio).
- [ ] Un push de prueba a `develop` publica solo QA; un merge a `main` publica solo producción.
- [ ] El Deploy Hook reconstruye producción.
- [ ] Actualizar `pendientes-infra.md`, `architecture.md` §10 y el ADR 0001 (repositorio en GitHub).

---

## Redespliegue con el dominio oficial (cuando la carrera lo defina)

Requisitos: dominio decidido (y autorización de marca si usa "UdeC") y **tarjeta** de la carrera cargada en
la cuenta de Cloudflare.

1. **Registrar o incorporar el dominio en la cuenta central**: Cloudflare Registrar (recomendado) o, si es
   `.cl` u otro registrador, agregarlo como zona y cambiar los nameservers. La zona tiene que quedar **activa**
   en esta misma cuenta (un dominio propio en un Worker exige la zona en la misma cuenta).
2. **Producción** — en `wrangler.jsonc`, nivel superior:
   ```jsonc
   "routes": [
     { "pattern": "<dominio>", "custom_domain": true },
     { "pattern": "www.<dominio>", "custom_domain": true }
   ],
   "workers_dev": true   // mantener la URL vieja (con noindex) para no romper enlaces; false para retirarla
   ```
   Con `routes`, `workers_dev` pasa a `false` si no se declara. No crear antes un CNAME a mano en esos nombres
   (el dominio propio no se crea sobre un CNAME existente).
3. **`www` → dominio raíz** (o al revés): una regla de redirección 301 en la zona, para tener una sola URL
   canónica.
4. **`SITE_URL`** de `bioing-web` en Workers Builds = `https://<dominio>`. QA no cambia (sigue en
   `workers.dev`, con `noindex`).
5. **Panel**: agregar el dominio a los permitidos del Worker de auth. El callback de la OAuth App **no cambia**
   si el Worker de auth sigue en `workers.dev`. (Moverlo a `/auth` del dominio es opcional y obliga a cambiar
   el callback y `base_url`.)
6. Push (o *Retry build*) en `main` → el sitio se publica con el dominio.
7. **Verificar**: §5 de `despliegue-cloudflare.md` sobre el dominio; **sin** `x-robots-tag: noindex` en el
   dominio (la regla de `_headers` solo alcanza a `*.workers.dev`); HTTPS y HSTS; redirección de `www`.
8. **Después**: Cloudflare Web Analytics (ajuste de CSP en `guia-mantencion.md` §8), `security.txt` con el
   contacto real, validación externa del JSON-LD (Rich Results Test) y alta en Google Search Console.

## Traspaso (Hito 5)

- Teléfono y correo de recuperación de la cuenta central → los de la jefatura; nuevos códigos de respaldo.
- Gestor de contraseñas compartido con dos personas de la carrera.
- El proveedor pasa de owner a miembro (o sale) en GitHub y en Cloudflare.
- Rotar el Deploy Hook y el secret de la OAuth App.
