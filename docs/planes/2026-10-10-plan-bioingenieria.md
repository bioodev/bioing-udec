# ¿Qué es la Bioingeniería? — Plan de implementación

> **Para agentes:** ejecutar tarea por tarea (superpowers:executing-plans). Los pasos usan casillas (`- [ ]`).

**Meta:** página `/bioingenieria` con presentación, bajada, características de la carrera y video institucional que se abre en un modal; el texto es editable desde el CMS.

**Arquitectura:** una colección de archivo único en Sveltia (`files`) que guarda `src/content/paginas/bioingenieria.md`; en Astro, colección `paginas`. Una función pura extrae el ID de YouTube (con test). El modal usa `<dialog>` nativo: muestra la miniatura del video y solo al abrirlo inserta el `<iframe>` de `youtube-nocookie.com`; al cerrarlo lo quita (el video se detiene).

**Stack:** Astro 7, Sveltia CMS, Tailwind v4, Starwind UI v3, Vitest, `phosphor-astro`.

**Spec:** `docs/propuesta-arquitectura-y-contenidos.md` §5 · `docs/bitacora.md` ("video en modal") · `docs/propuesta-desarrollo.md` §6.3 (YouTube sin cookies, carga al hacer clic).

## Restricciones globales

- Rama `demo-frontend`, carpeta `app/web`. Sin push. No commitear `CLAUDE.md` ni `AGENTS.md`.
- Leer antes: `AGENTS.md` (raíz), `app/web/AGENTS.md`, `docs/context.md`, `docs/design.md` (tiles a sangre alternando claro/oscuro, un acento azul).
- Cambios de modelo en `config.yml` **y** `content.config.ts`; validar `config.yml` contra el JSON Schema y cargando `/admin/`.
- Nada de YouTube se carga antes de abrir el modal. Solo `youtube-nocookie.com`.
- Íconos Phosphor (`Play`, `X`). Textos en español.
- Commits en español, imperativo.

## Foco de revisión

1. Formatos de enlace: `youtube.com/watch?v=ID&t=30s`, `youtu.be/ID?si=…`, `youtube.com/shorts/ID`, `youtube.com/embed/ID` → mismo ID; cualquier otro → la página se construye sin la sección de video (no rompe el build).
2. Cerrar el modal con Esc, con el botón ✕ y haciendo clic fuera: el video se detiene y el foco vuelve al botón que lo abrió.
3. Sin campo de video en el CMS: no aparece ni el botón ni el modal.
4. Lectores de pantalla: el `<dialog>` tiene `aria-labelledby`, el iframe un `title` descriptivo y el botón de cierre `aria-label="Cerrar video"`.
5. Móvil (375 px): el video ocupa el ancho disponible en 16:9 sin scroll horizontal.

---

### Tarea 1: ID de YouTube (función pura)

**Archivos:**
- Modificar (o crear si aún no existe): `app/web/src/lib/enlaces.ts`, `app/web/src/lib/enlaces.test.ts`

**Interfaces:**
- Produce: `idYouTube(url: string): string | null`.

- [ ] **Paso 1: Test** (agregar al archivo de test):

```ts
import { idYouTube } from './enlaces';

describe('idYouTube', () => {
  test('formatos habituales', () => {
    expect(idYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ');
    expect(idYouTube('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe('dQw4w9WgXcQ');
    expect(idYouTube('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(idYouTube('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  test('no reconocidos', () => {
    expect(idYouTube('https://vimeo.com/123')).toBeNull();
    expect(idYouTube('https://www.youtube.com/@canal')).toBeNull();
    expect(idYouTube('nada')).toBeNull();
  });
});
```

(si el archivo no existe, crear con `import { describe, expect, test } from 'vitest';` al inicio).

- [ ] **Paso 2:** `npx vitest run src/lib/enlaces.test.ts` → FALLA.
- [ ] **Paso 3: Implementar** (agregar a `enlaces.ts`; si no existe, crearlo con el comentario de cabecera `// Enlaces externos → URL de inserción. Puro, con test. Lista cerrada de proveedores (propuesta §6.3).`):

```ts
const ID_YT = /^[\w-]{11}$/;

/** ID de 11 caracteres de un video de YouTube, o null si el enlace no es de un video. */
export function idYouTube(url: string): string | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^www\./, '');
  let id: string | null | undefined;
  if (host === 'youtu.be') id = u.pathname.slice(1);
  else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com')
    id = u.pathname === '/watch' ? u.searchParams.get('v') : u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
  return id && ID_YT.test(id) ? id : null;
}
```

- [ ] **Paso 4:** test en verde; commit `Agrega extracción del ID de videos de YouTube`.

### Tarea 2: Contenido editable

**Archivos:**
- Modificar: `app/web/public/admin/config.yml` (colección `paginas`, después de `banners`)
- Modificar: `app/web/src/content.config.ts` (colección `paginas`)
- Crear: `app/web/src/content/paginas/bioingenieria.md`

**Interfaces:**
- Produce: `getEntry('paginas', 'bioingenieria')` con `{ titulo: string; bajada: string; video?: string; caracteristicas?: { titulo: string; texto: string }[] }` y cuerpo Markdown.

- [ ] **Paso 1: `config.yml`**

```yaml
  - name: paginas
    label: Páginas
    files:
      - name: bioingenieria
        label: ¿Qué es la Bioingeniería?
        file: /app/web/src/content/paginas/bioingenieria.md
        fields:
          - { name: titulo, label: Título, widget: string }
          - { name: bajada, label: Bajada, widget: text }
          - { name: video, label: Video institucional (YouTube), widget: string, type: url, required: false, hint: Enlace de YouTube. Se muestra en una ventana al hacer clic. }
          - name: caracteristicas
            label: Características de la carrera
            widget: list
            required: false
            fields:
              - { name: titulo, label: Título, widget: string }
              - { name: texto, label: Texto, widget: text }
          - { name: body, label: Presentación, widget: richtext }
```

- [ ] **Paso 2: `content.config.ts`**

```ts
// ── Páginas institucionales (colección de archivos únicos en config.yml) ──
const paginas = defineCollection({
  loader: md('paginas'),
  schema: z.object({
    titulo: z.string(),
    bajada: z.string(),
    video: z.url().optional(),
    caracteristicas: z.array(z.object({ titulo: z.string(), texto: z.string() })).optional(),
  }),
});
```

y agregar `paginas` a `collections`.

- [ ] **Paso 3:** `bioingenieria.md` con contenido de ejemplo (marcado "Contenido de ejemplo" en la bajada), 4 características (p. ej. "Formación científica", "Ingeniería aplicada", "Campo laboral", "Investigación") y un video de YouTube público cualquiera de la UdeC o el placeholder `https://www.youtube.com/watch?v=dQw4w9WgXcQ` marcado en un comentario YAML `# Contenido de ejemplo: reemplazar por el video institucional`.
- [ ] **Paso 4:** validar `config.yml` (JSON Schema + `/admin/` muestra la colección "Páginas" con su archivo); `npx astro check`.
- [ ] **Paso 5:** commit `Agrega contenido editable de ¿Qué es la Bioingeniería?`.

### Tarea 3: Modal de video

**Archivos:**
- Crear: `app/web/src/components/VideoModal.astro`

**Interfaces:**
- Produce: `<VideoModal id={string} titulo={string} />` (`id` = ID de YouTube).

- [ ] **Paso 1:**

```astro
---
import Play from 'phosphor-astro/Play.astro';
import X from 'phosphor-astro/X.astro';

interface Props { id: string; titulo: string }
const { id, titulo } = Astro.props;
---
<div class="video-modal" data-id={id} data-titulo={titulo}>
  <button type="button" data-abrir class="group relative block w-full overflow-hidden rounded-lg">
    <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" class="aspect-video w-full object-cover" />
    <span class="absolute inset-0 grid place-items-center bg-black/30 group-hover:bg-black/40">
      <span class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-primary-foreground"><Play class="size-5" aria-hidden="true" />Ver video</span>
    </span>
  </button>
  <dialog aria-labelledby={`video-${id}-titulo`} class="w-[min(64rem,calc(100vw-2rem))] rounded-lg bg-black p-0 backdrop:bg-black/80">
    <div class="flex items-center justify-between px-4 py-2 text-white">
      <h2 id={`video-${id}-titulo`} class="text-sm">{titulo}</h2>
      <button type="button" data-cerrar aria-label="Cerrar video" class="p-1"><X class="size-5" aria-hidden="true" /></button>
    </div>
    <div data-reproductor class="aspect-video w-full"></div>
  </dialog>
</div>

<script>
  for (const raiz of document.querySelectorAll<HTMLElement>('.video-modal')) {
    const dialogo = raiz.querySelector('dialog')!;
    const reproductor = raiz.querySelector<HTMLElement>('[data-reproductor]')!;
    raiz.querySelector('[data-abrir]')!.addEventListener('click', () => {
      const iframe = Object.assign(document.createElement('iframe'), {
        src: `https://www.youtube-nocookie.com/embed/${raiz.dataset.id}?autoplay=1`,
        title: raiz.dataset.titulo ?? 'Video',
        allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
        className: 'size-full',
      });
      reproductor.replaceChildren(iframe);
      dialogo.showModal();
    });
    raiz.querySelector('[data-cerrar]')!.addEventListener('click', () => dialogo.close());
    dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); }); // clic fuera
    dialogo.addEventListener('close', () => reproductor.replaceChildren()); // detiene el video
  }
</script>
```

Nota: la miniatura viene de `i.ytimg.com` (imagen, sin cookies). El foco vuelve solo al botón al cerrar un `<dialog>` modal.

- [ ] **Paso 2:** `npx astro check`; commit `Agrega modal de video con carga al abrir`.

### Tarea 4: Página `/bioingenieria`

**Archivos:**
- Crear: `app/web/src/pages/bioingenieria.astro`
- Modificar: `app/web/src/lib/navegacion.ts` (`¿Qué es la Bioingeniería?` → `disponible: true`)

- [ ] **Paso 1:** la página obtiene la entrada con un helper nuevo en `contenido.ts`:

```ts
/** Página institucional de archivo único (colección `paginas`). */
export async function pagina(id: 'bioingenieria') {
  const entrada = await getEntry('paginas', id);
  if (!entrada) throw new Error(`Falta src/content/paginas/${id}.md`);
  return entrada;
}
```

(importar `getEntry` desde `astro:content`). Estructura, siguiendo `docs/design.md`:
  1. Tile claro: `<h1>` con `titulo`, bajada en `text-xl text-muted-foreground`, y — si `idYouTube(video)` no es null — `<VideoModal id titulo="Video institucional de Bioingeniería UdeC">` a ancho `max-w-4xl`.
  2. Tile `bg-muted`: cuerpo Markdown (`render(entrada)` → `<Content />` en `prose`).
  3. Tile oscuro (`bg-foreground text-background`): "Características de la carrera", grilla `md:grid-cols-2` con `titulo`/`texto`; se omite si no hay.
  4. Cierre con dos enlaces: "Conoce a los egresados/as" → `/directorio`, y "Facultad de Ciencias Biológicas" → `URL_FCB`.
- [ ] **Paso 2:** `navegacion.ts`: `disponible: true`. Confirmar que `[seccion].astro` ya no genera `/bioingenieria`.
- [ ] **Paso 3:** `npm run build`; commit `Agrega página ¿Qué es la Bioingeniería? con video en modal`.

### Tarea 5: Verificación final

- [ ] `npm test`, `npx astro check` (0/0), `npm run build`.
- [ ] Servir `dist`: en la pestaña Red no hay peticiones a `youtube*.com` antes de abrir el modal; abrir, cerrar con Esc / ✕ / clic fuera; el audio se detiene y el foco vuelve al botón.
- [ ] Quitar temporalmente `video` del `.md` y reconstruir: la página no muestra el bloque de video (no commitear ese cambio).
- [ ] 375 px sin scroll horizontal; `/admin/` muestra "Páginas → ¿Qué es la Bioingeniería?".
