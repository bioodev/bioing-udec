# Plan: panel funcionando de punta a punta, datos sintéticos completos y guías

> Fecha: 2026-10-11 · Estado: en ejecución · Relacionados: [ADR 0004](../adr/0004-flujo-de-trabajo-una-persona.md),
> [plan de ambientes](2026-10-11-plan-ambientes-qa-produccion.md), [`pendientes-infra.md`](../pendientes-infra.md).

**Objetivo.** Que actualizar el sitio desde Sveltia CMS funcione de principio a fin (entrar → editar → commit
→ build → sitio publicado), que la vista previa muestre **todas** las funciones del sitio con datos de prueba
realistas, y dejar dos guías: una para quien carga contenido y otra para quien hace crecer la plataforma.

---

## 0. Diagnóstico (lo que se encontró al probar el panel el 2026-10-11)

| # | Síntoma | Causa | Estado |
|---|---|---|---|
| 0.1 | `/admin/` no cargaba: CSP bloqueaba `unpkg.com` | Cloudflare **suma** las cabeceras de todas las reglas de `_headers` que coinciden: llegaban dos CSP y la pública ganaba | ✅ `5680be9` (`! Content-Security-Policy` en `/admin/*`) |
| 0.2 | La primera Noticia creada desde el panel rompió el build (`ImageNotFound /media/…`) | Sveltia ignoraba el `public_folder` relativo de cada colección (misma carpeta que la global) y escribía el global `/media` | ✅ `98571d8` (`public_folder: '@/assets/media'`) |
| 0.3 | Publicar desde el panel no actualizó el sitio | La vista previa (`bioing-web-qa`, cuenta personal) se despliega **a mano**; ningún Worker está conectado al repositorio | ⏳ §1 |
| 0.4 | La vista previa no ejercita todo: Noticias sin video, galería, alt ni Instagram; textos en latín; sin fotos ni logos | El generador `scripts/datos-sinteticos.mjs` cubre solo los campos básicos | ⏳ §2 |
| 0.5 | No hay guía para cargar contenido ni para extender el sitio | `guia-usuario.md` es esqueleto; no existe una guía de evolución | ⏳ §3 y §4 |

Comprobado además: las **imágenes dentro del cuerpo** (`![alt](@/assets/media/x.jpg)`, lo que inserta el
editor del panel) se optimizan con `<Image>`, y los **emojis** se publican tal cual (Unicode, sin
configuración).

## 1. Despliegue automático al publicar desde el panel

**Por qué no se gatilló:** el panel solo hace un commit en `main` de GitHub. Quien construye y despliega es
Cloudflare **Workers Builds**, que todavía no está conectado (en la cuenta oficial, etapa 3 del plan de
ambientes; en la vista previa personal, nunca se conectó).

**Alcance:** esto aplica solo a la **vista previa personal** (Etapa P, fuera de la entrega), que construye
desde `main` del espejo `bioodev/bioing-udec` porque ahí escribe el panel. No cambia el ADR 0004 para la
cuenta oficial (allí QA sigue siendo manual y solo `bioing-web` se conecta a `main`). Se retira con la Etapa P.

Pasos (los hace la persona en el dashboard; el agente no puede autorizar la app de GitHub):

- [ ] Cloudflare (cuenta personal) → Workers → `bioing-web-qa` → Settings → **Build** → *Connect* →
      GitHub → autorizar la app solo en `bioodev/bioing-udec`.
- [ ] Rama de producción: `main`. **Sin** builds de otras ramas (ADR 0004: solo `main`).
- [ ] Directorio raíz: `app/web`.
- [ ] Comando de build: `npm run datos:generar && npm run build && npm run postbuild`.
      El contenido `sint-*` está fuera de git: la vista previa lo **genera en cada build** (semilla fija,
      fechas relativas a hoy). En el Worker de producción este paso **no** va.
- [ ] Comando de deploy: `npx wrangler deploy --env qa --domain bioing.bioodev.work` (con `--domain`, igual
      que el deploy manual, para no perder el dominio).
- [ ] Variables de build: `SITE_URL=https://bioing.bioodev.work`, `NODE_VERSION=22`.
- [ ] Probar (lo hace la persona: es un commit real en GitHub): editar algo en el panel → en 1–3 min aparece un build en *Deployments* → el cambio se ve.
- [ ] Documentar en [`despliegue-cloudflare.md`](../despliegue-cloudflare.md) (sección vista previa) y
      desmontarlo con la Etapa P del plan de ambientes.

Hasta entonces: tras cada publicación, `git pull github main`, y desde `app/web`
`npm run build && npm run postbuild && npx wrangler deploy --env qa --domain bioing.bioodev.work`.

## 2. Datos sintéticos completos (subagente A)

Archivo: `app/web/scripts/datos-sinteticos.mjs` (+ `.gitignore`). Reglas: prefijo `sint-`, semilla fija,
fechas relativas a hoy, `--limpiar` borra todo lo generado (también los medios), nada de esto va a git.

- [ ] **Textos en español** sobre bioingeniería (acuicultura, biomateriales, alimentos, salud, medio
      ambiente) con pools curados en el script; nada de lorem ipsum en títulos, bajadas ni cuerpos.
- [ ] **Cuerpo Markdown rico** (Noticias, Actividades, Anuncios): subtítulos `##`, párrafos, listas, un
      enlace externo, una cita, a veces una imagen en el cuerpo (`![alt](@/assets/media/…)`) y algún emoji
      (🧬 🔬 🌊). Una de cada tantas con tabla simple.
- [ ] **Noticias**: `imagen_alt` siempre que haya imagen; `video` en ~30 %, de una **lista fija** en el script
      (verificada con oEmbed el 2026-10-11: `yLxPo7uBv-Q`, `SyYaQjP3MoU`, `mO-W-WL7Alk`; un video borrado no
      rompe el build, solo no se muestra); `galeria` de 3–8 fotos con `alt` en ~30 %; `etiquetas`;
      `instagram` en ~20 % (referencia a una Publicación de Instagram sintética).
- [ ] **Publicaciones de Instagram** (`src/content/instagram/sint-*.yml`, agregar `instagram` a `COLECCIONES`): 6–8, con `enlace` de forma válida
      (`https://www.instagram.com/p/<código>/`), `fecha`, `titulo`, `publicado`.
- [ ] **Fotos de Personas y logos de Organizaciones**: SVG generados por el script (iniciales sobre color
      de la paleta) en `src/assets/media/sint-*.svg`, asignados a `personas.foto` (~70 %) y
      `organizaciones.logo` (~70 %). Agregar `app/web/src/assets/media/sint-*` a `.gitignore` y borrarlos en
      `limpiar()`. (Probado: `image()` acepta SVG.)
- [ ] **Documentos**: enlaces con forma de archivo de Drive (`https://drive.google.com/file/d/<id>/view`)
      y descripción en español.
- [ ] **Anuncios**: `enlace` y `contacto` coherentes; vigentes, vencidos y sin fecha límite.
- [ ] Generar desde el script la noticia de prueba `sint-prueba-galeria-video.md` (hoy es manual y
      `limpiar()` la borra): galería de 4, video y cuerpo con imagen, emoji y enlace.
- [ ] **Verificación:** `npm run datos:limpiar && npm run datos:generar && npm run verificar` en verde;
      `npm run build 2>&1 | grep -c '\[ERROR\]'` da 0 (las referencias rotas no rompen el build);
      `git status --short` sin archivos `sint-*` y `git check-ignore app/web/src/assets/media/sint-x.svg`
      responde; cada campo de las colecciones de `config.yml` aparece en al menos un archivo sintético.

## 3. Guía de usuario del panel (subagente B)

Archivo: [`docs/guia-usuario.md`](../guia-usuario.md). Completar el esqueleto existente (no cambiar su
estructura): cada tarea como *objetivo → pasos → cómo comprobar → errores típicos*, con los **nombres de
campo que muestra el panel** (`label` de `config.yml`) y los términos de [`context.md`](../context.md).

- [ ] §2.1 Entrar: hoy con token (fine-grained, *Contents: Read and write*); en producción, botón de GitHub
      (OAuth). Pasos para crear el token.
- [ ] §4 Todas las tareas, con los campos reales de cada colección.
- [ ] §5 Imágenes: subir, optimización automática, texto alternativo; **imágenes dentro del texto**,
      **emojis**, enlaces, listas, tablas; galería y video en Noticias.
- [ ] Corregir afirmaciones no comprobadas del esqueleto: video **solo YouTube** (no Vimeo, ver
      `src/lib/enlaces.ts`); borrado de EXIF/GPS y "crear Persona sin salir de la Noticia" quedan como
      *por verificar en el panel*.
- [ ] §8 Problemas comunes: añadir "el sitio no cambió" (build automático pendiente o fallido) y
      "error de imagen".
- [ ] Apéndice A: tabla de campos por colección generada desde `config.yml` (obligatorio/opcional).
- [ ] Sin pantallazos (llegan con la cuenta oficial); marcar dónde irían.

## 4. Guía de evolución de la plataforma (subagente C)

Archivo nuevo: `docs/guia-evolucion.md` (enlazado desde `docs/README.md` y `guia-mantencion.md`). Para quien
agrega o quita funciones: recetas *cuándo → cómo → cómo verificar → cómo revertir*, ancladas en el código real.

- [ ] Principios para crecer orgánicamente: el contenido manda (todo lo editable va al panel), cambios
      pequeños y verificados, los **tres espejos** del modelo, CSP con lista cerrada, accesibilidad y
      rendimiento como requisitos, TDD en `src/lib/`.
- [ ] Recetas: agregar/quitar un campo; agregar una colección; agregar un componente a una página;
      agregar una página; agregar un proveedor de embed (CSP `frame-src`).
- [ ] Contenido enriquecido dentro del cuerpo: imágenes (ya funciona), emojis (ya funciona), video, **PDF**
      (Drive `/preview` o archivo propio), **mapa** (OpenStreetMap/Google Maps embed). Forma correcta:
      **componentes del editor de Sveltia** (`editor_components` → bloque en el Markdown) + transformación en
      el build (plugin remark/rehype) o un campo dedicado; nunca HTML pegado. Ventajas y riesgos de cada uno.
- [ ] Cuándo una función es un campo, una colección, un componente o una página (tabla de decisión).
- [ ] Hoja de ruta sugerida (backlog priorizado): Workers Builds + OAuth, componentes de editor (video, PDF,
      mapa), guías con pantallazos, analítica, R2 para documentos, búsqueda, etc.
- [ ] Enlazar la guía en `docs/README.md` y en `guia-mantencion.md`; corregir Node `>=22.18` en
      `guia-mantencion.md` §3.1 (`package.json` → `engines`).
- [ ] Checklist de cada cambio: tests, `astro check`, `verificar`, CSP probada sobre el build servido
      (`wrangler dev`), docs y ADR si es decisión.

## 5. Validación y ejecución

- [x] Plan escrito por el orquestador.
- [x] Validación del plan por un subagente Haiku: 3 bloqueantes y 9 importantes, incorporados (alcance de §1,
      `.gitignore` de los SVG, noticia de prueba, Instagram, lista fija de videos, Vimeo, EXIF, `--domain`).
- [ ] Ejecución en paralelo con subagentes Haiku vía Herdr, cada uno en su worktree y rama:
      A `sint-completos`, B `guia-usuario`, C `guia-evolucion`. Archivos disjuntos (solo C toca
      `docs/README.md`).
- [ ] El orquestador revisa cada diff, integra en `develop`, corre `npm run verificar`, despliega la vista
      previa, revisa en el navegador (Noticias, galería, video, Instagram, Personas, Organizaciones) y
      sube a Gitea y GitHub (`develop` → `main`). El push lo autorizó la persona en esta sesión; por regla
      general (AGENTS.md) lo hace la persona.
