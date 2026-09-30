# Pendientes de infraestructura

Se hacen antes de entregar el admin al Encargado de comunicaciones. Mientras tanto se desarrolla en local y se publica a mano (`npm run build` + `wrangler deploy`).

- [ ] **Prueba de imagen en el admin**: subir una imagen desde Sveltia y confirmar que la ruta queda como `../../assets/media/…`. Si no, ajustar `media_folder`/`public_folder` en `config.yml`.
- [ ] **Prueba de "Agregar Persona"** desde una Noticia: debe quedar en el mismo commit que la Noticia.
- [ ] **Dominio del sitio** (depende de la pregunta 6.4 de `docs/preguntas-reunion.md`).
- [ ] **Cloudflare**: cuenta, token de API con permiso de Workers, `wrangler.jsonc` para servir `app/web/dist` como assets estáticos.
- [ ] **Runner de Gitea Actions** (`act_runner` en el docker-compose de Gitea, registrado en la organización `bioing`, `capacity: 1`, builds con `--memory=1g`).
- [ ] **Workflow** `.gitea/workflows/deploy.yml`: build + deploy en cada push a `main` y una vez al día (Agenda, Anuncios y Banners dependen de la fecha). Debe fallar si el build registra `Invalid content reference`.
- [ ] **OAuth app en Gitea** (PKCE, cliente no confidencial) con redirect a la URL del admin de producción; poner su `app_id` en `config.yml`.
- [ ] **CORS de producción**: agregar el dominio del sitio a `GITEA__cors__ALLOW_DOMAIN`.
- [ ] **Cuenta del Encargado de comunicaciones** en Gitea, con escritura en `bioing/bioing-udec`.
- [ ] Borrar el contenido de ejemplo y la "Noticia demo borrar luego".
