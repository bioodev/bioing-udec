# Instagram — Plan de implementación

> **Para agentes:** ejecutar tarea por tarea (superpowers:executing-plans). Los pasos usan casillas (`- [ ]`).

**Meta:** el Encargado de comunicaciones pega el enlace de una publicación o reel de Instagram en el CMS; el sitio la muestra en `/instagram`, en el Inicio y, opcionalmente, en una Noticia. Cada publicación se ve primero como tarjeta liviana propia y el embed oficial de Instagram se carga solo cuando la persona lo pide.

**Arquitectura:** nueva colección `instagram` (YAML) en `config.yml` y `content.config.ts`. Una función pura valida y normaliza el enlace (con test). Un componente `PublicacionInstagram.astro` muestra la tarjeta y, al hacer clic en "Ver publicación aquí", inserta el `<blockquote class="instagram-media">` y carga `https://www.instagram.com/embed.js` una sola vez. Sin API de Meta, sin token.

**Stack:** Astro 7, Sveltia CMS, Tailwind v4, Starwind UI v3, Vitest, `phosphor-astro`.

**Spec:** `docs/propuesta-desarrollo.md` §6.2 y riesgo 4 · `docs/propuesta-arquitectura-y-contenidos.md` §8.

## Restricciones globales

- Rama `demo-frontend`, carpeta `app/web`. Sin push. No commitear `CLAUDE.md` ni `AGENTS.md`.
- Leer antes: `AGENTS.md` (raíz) §Sveltia CMS y §Astro, `app/web/AGENTS.md`, `docs/context.md`.
- Un cambio del modelo de dominio va en **tres** lugares: `public/admin/config.yml`, `src/content.config.ts` y `docs/context.md`.
- Validar `config.yml` contra `https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json` y cargando `/admin/` (`python3 -m http.server` en `app/web/public`) hasta ver la pantalla de inicio de sesión sin errores.
- Nada de Meta se carga antes de un clic (privacidad y rendimiento). Ningún `<iframe>`/HTML pegado por el editor.
- Páginas consultan contenido solo vía `src/lib/contenido.ts`. Íconos Phosphor (`InstagramLogo`).
- Commits en español, imperativo.

## Foco de revisión

1. Enlaces con `?igsh=…`, `?utm_source=…`, sin `www.`, sin barra final, o de un perfil (`instagram.com/bioing.udec/`) → los dos primeros se normalizan a `https://www.instagram.com/p|reel/CODIGO/`; un perfil se rechaza (test + patrón del CMS).
2. Sin JavaScript o si `embed.js` no carga: la tarjeta sigue enlazando a la publicación en Instagram.
3. Dos tarjetas en la misma página: `embed.js` se inserta una sola vez y ambas se procesan.
4. Noticia cuyo campo `instagram` apunta a una publicación borrada o en borrador: la Noticia se muestra sin ese bloque.
5. Teclado: el botón "Ver publicación aquí" es alcanzable con Tab, tiene texto visible y el foco no se pierde tras cargar el embed.

---

### Tarea 1: Validación del enlace (función pura)

**Archivos:**
- Crear: `app/web/src/lib/instagram.ts`, `app/web/src/lib/instagram.test.ts`

**Interfaces:**
- Produce: `enlaceInstagram(url: string): string | null` (URL canónica `https://www.instagram.com/{p|reel}/{codigo}/` o `null`), `PATRON_INSTAGRAM: string` (regex para `config.yml` y Zod).

- [ ] **Paso 1: Test**

```ts
import { describe, expect, test } from 'vitest';
import { enlaceInstagram, PATRON_INSTAGRAM } from './instagram';

describe('enlaceInstagram', () => {
  test('publicación y reel, con parámetros', () => {
    expect(enlaceInstagram('https://www.instagram.com/p/C9xYz_1-ab/?igsh=MTIz')).toBe('https://www.instagram.com/p/C9xYz_1-ab/');
    expect(enlaceInstagram('https://instagram.com/reel/DAbc123')).toBe('https://www.instagram.com/reel/DAbc123/');
  });
  test('rechaza perfiles y otros sitios', () => {
    expect(enlaceInstagram('https://www.instagram.com/bioing.udec/')).toBeNull();
    expect(enlaceInstagram('https://example.com/p/abc/')).toBeNull();
    expect(enlaceInstagram('texto')).toBeNull();
  });
  test('el patrón del CMS acepta lo mismo', () => {
    const re = new RegExp(PATRON_INSTAGRAM);
    expect(re.test('https://www.instagram.com/p/C9xYz_1-ab/?igsh=MTIz')).toBe(true);
    expect(re.test('https://www.instagram.com/bioing.udec/')).toBe(false);
  });
});
```

- [ ] **Paso 2:** `npx vitest run src/lib/instagram.test.ts` → FALLA.
- [ ] **Paso 3: Implementar**

```ts
// Publicaciones de Instagram seleccionadas (propuesta §6.2). Puro, con test.
export const PATRON_INSTAGRAM = '^https://(www\\.)?instagram\\.com/(p|reel)/[\\w-]+/?(\\?.*)?$';

/** URL canónica de una publicación o reel, o null si el enlace no es de ese tipo. */
export function enlaceInstagram(url: string): string | null {
  if (!new RegExp(PATRON_INSTAGRAM).test(url)) return null;
  const [, tipo, codigo] = new URL(url).pathname.match(/^\/(p|reel)\/([\w-]+)/)!;
  return `https://www.instagram.com/${tipo}/${codigo}/`;
}
```

- [ ] **Paso 4:** test en verde; commit `Agrega validación de enlaces de Instagram`.

### Tarea 2: Colección `instagram` (CMS + esquema + glosario)

**Archivos:**
- Modificar: `app/web/public/admin/config.yml` (nueva colección antes de `# ── Clasificación`; campo `instagram` en `noticias`)
- Modificar: `app/web/src/content.config.ts`
- Modificar: `docs/context.md` (término nuevo)
- Crear: `app/web/src/content/instagram/ejemplo-publicacion.yml`
- Modificar: `app/web/src/lib/contenido.ts` (`'instagram'` en `ColeccionPublicable`; `publicacionesInstagram`)

**Interfaces:**
- Produce: colección `instagram` con `{ titulo: string; enlace: string /* canónico */; fecha: Date; publicado: boolean; imagen?: ImageMetadata }`; campo `noticias.instagram?: reference('instagram')`; `publicacionesInstagram(cantidad?: number)` (más recientes primero).

- [ ] **Paso 1: `config.yml`**

```yaml
  - name: instagram
    label: Instagram
    label_singular: Publicación de Instagram
    folder: /app/web/src/content/instagram
    media_folder: /app/web/src/assets/media
    public_folder: ../../assets/media
    format: yml
    identifier_field: titulo
    summary: "{{titulo}} · {{fecha | date('YYYY-MM-DD')}} {{publicado | ternary('', '(borrador)')}}"
    fields:
      - { name: titulo, label: Descripción breve, widget: string, hint: Se usa como texto de la tarjeta y para lectores de pantalla. }
      - name: enlace
        label: Enlace de la publicación
        widget: string
        hint: Copia el enlace desde Instagram (Compartir → Copiar enlace). Solo publicaciones o reels.
        pattern: ['^https://(www\.)?instagram\.com/(p|reel)/[\w-]+/?(\?.*)?$', 'Debe ser el enlace de una publicación o reel de Instagram']
      - { name: fecha, label: Fecha, widget: datetime, type: date }
      - { name: publicado, label: Publicado, widget: boolean, default: false }
      - { name: imagen, label: Miniatura (opcional), widget: image, required: false, hint: Captura de la publicación para la tarjeta liviana. }
```

En `noticias`, después de `actividad`:

```yaml
      - { name: instagram, label: Publicación de Instagram relacionada, widget: relation, collection: instagram, display_fields: [titulo], required: false }
```

- [ ] **Paso 2: `content.config.ts`**

```ts
const instagram = defineCollection({
  loader: yml('instagram'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      enlace: z.string().regex(new RegExp(PATRON_INSTAGRAM)).transform((u) => enlaceInstagram(u)!),
      fecha: z.coerce.date(),
      publicado,
      imagen: image().optional(),
    }),
});
```

(importar `PATRON_INSTAGRAM, enlaceInstagram` desde `./lib/instagram`; agregar `instagram: reference('instagram').optional(),` al esquema de `noticias`; agregar `instagram` al objeto `collections`).

- [ ] **Paso 3: `docs/context.md`** — agregar, junto a Banner:

```md
**Publicación de Instagram**:
Publicación o reel de la cuenta de Instagram de la carrera que el Encargado de comunicaciones selecciona para mostrar en el sitio pegando su enlace; una Noticia puede tener una relacionada.
_Avoid_: Post, feed
```

- [ ] **Paso 4:** ejemplo `src/content/instagram/ejemplo-publicacion.yml` (marcado como contenido de ejemplo):

```yaml
titulo: Contenido de ejemplo — publicación de Instagram
enlace: https://www.instagram.com/p/C0000000000/
fecha: 2026-10-01
publicado: true
```

- [ ] **Paso 5:** `contenido.ts`: agregar `'instagram'` a `ColeccionPublicable` y:

```ts
export async function publicacionesInstagram(cantidad?: number) {
  const pubs = (await publicados('instagram')).sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
  return cantidad ? pubs.slice(0, cantidad) : pubs;
}
```

- [ ] **Paso 6:** validar `config.yml` contra el JSON Schema (p. ej. `npx -y ajv-cli validate --spec=draft2020 -s <schema descargado> -d public/admin/config.yml` o el validador del editor) y cargando `/admin/` en el navegador. `npx astro check` en verde.
- [ ] **Paso 7:** commit `Agrega colección de publicaciones de Instagram`.

### Tarea 3: Componente con carga bajo demanda

**Archivos:**
- Crear: `app/web/src/components/PublicacionInstagram.astro`

**Interfaces:**
- Consume: `CollectionEntry<'instagram'>`. Produce: `<PublicacionInstagram publicacion={p} />`.

- [ ] **Paso 1:** estructura:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import InstagramLogo from 'phosphor-astro/InstagramLogo.astro';
import ArrowSquareOut from 'phosphor-astro/ArrowSquareOut.astro';
import { formatoFecha } from '@/lib/contenido';

interface Props { publicacion: CollectionEntry<'instagram'> }
const { titulo, enlace, fecha, imagen } = Astro.props.publicacion.data;
---
<article class="publicacion-ig rounded-lg border border-border bg-card p-5" data-enlace={enlace}>
  {imagen && <Image src={imagen} alt="" widths={[320, 640]} sizes="(min-width: 768px) 33vw, 100vw" class="mb-4 aspect-square w-full rounded-md object-cover" />}
  <p class="flex items-center gap-1.5 text-sm text-muted-foreground"><InstagramLogo class="size-4" aria-hidden="true" />{formatoFecha(fecha)}</p>
  <h3 class="mt-2 font-semibold leading-snug">{titulo}</h3>
  <div class="mt-4 flex flex-wrap gap-3 text-sm">
    <button type="button" data-cargar class="rounded-full bg-primary px-4 py-1.5 text-primary-foreground hover:opacity-90">Ver publicación aquí</button>
    <a href={enlace} target="_blank" rel="noopener" class="inline-flex items-center gap-1 hover:text-primary">Abrir en Instagram<ArrowSquareOut class="size-4" aria-hidden="true" /></a>
  </div>
  <p class="mt-2 text-xs text-muted-foreground">Al verla aquí se carga contenido de Instagram (Meta).</p>
  <div data-embed></div>
</article>

<script>
  declare global { interface Window { instgrm?: { Embeds: { process(): void } } } }
  let script: Promise<void> | undefined;
  const cargarScript = () => (script ??= new Promise((ok, error) => {
    const s = Object.assign(document.createElement('script'), { src: 'https://www.instagram.com/embed.js', async: true, onload: () => ok(), onerror: error });
    document.body.append(s);
  }));

  for (const tarjeta of document.querySelectorAll<HTMLElement>('.publicacion-ig')) {
    const boton = tarjeta.querySelector<HTMLButtonElement>('[data-cargar]')!;
    boton.addEventListener('click', async () => {
      const bq = document.createElement('blockquote');
      bq.className = 'instagram-media';
      bq.dataset.instgrmPermalink = tarjeta.dataset.enlace;
      bq.dataset.instgrmVersion = '14';
      bq.innerHTML = `<a href="${tarjeta.dataset.enlace}">Ver en Instagram</a>`;
      tarjeta.querySelector('[data-embed]')!.append(bq);
      boton.remove();
      tarjeta.querySelector<HTMLAnchorElement>('a')?.focus();
      try { await cargarScript(); window.instgrm?.Embeds.process(); } catch { /* queda el enlace */ }
    });
  }
</script>
```

- [ ] **Paso 2:** `npx astro check`; commit `Agrega tarjeta de Instagram con carga bajo demanda`.

### Tarea 4: Página `/instagram`, Inicio y Noticia

**Archivos:**
- Crear: `app/web/src/pages/instagram.astro`
- Modificar: `app/web/src/lib/navegacion.ts` (`Instagram` → `disponible: true`)
- Modificar: `app/web/src/pages/index.astro` (sección después de Anuncios)
- Modificar: `app/web/src/pages/noticias/[id].astro` (bloque al final del cuerpo)

- [ ] **Paso 1:** `/instagram`: `<Base titulo="Instagram" …>`, `<h1>Instagram</h1>`, texto "Publicaciones seleccionadas de la cuenta de Bioingeniería UdeC.", enlace al perfil (constante `URL_INSTAGRAM = 'https://www.instagram.com/'` en `navegacion.ts` con comentario "Pendiente: cuenta oficial (preguntas-reunion 6.2)"), grilla `md:grid-cols-2 lg:grid-cols-3` con `PublicacionInstagram`. Vacío: "Aún no hay publicaciones seleccionadas.".
- [ ] **Paso 2:** el `[seccion].astro` deja de generar `/instagram` al poner `disponible: true`; comprobar que el build no avisa de rutas duplicadas.
- [ ] **Paso 3:** Inicio: si `publicacionesInstagram(3)` no está vacío, sección "En Instagram" con 3 tarjetas y enlace "Ver más" a `/instagram`.
- [ ] **Paso 4:** Noticia: `const ig = noticia.data.instagram && (await getEntry(noticia.data.instagram));` mostrar `<PublicacionInstagram>` solo si `ig?.data.publicado`.
- [ ] **Paso 5:** `npm run build`; commit `Agrega sección Instagram, bloque en Inicio y en Noticias`.

### Tarea 5: Verificación final

- [ ] `npm test`, `npx astro check` (0/0), `npm run build`.
- [ ] Servir `dist`; en `/instagram`, revisar en la pestaña Red que **no** hay peticiones a `instagram.com`/`cdninstagram.com` antes del clic; tras el clic, el embed carga (con una publicación pública real, reemplazando temporalmente el enlace de ejemplo, sin commitearlo).
- [ ] `/admin/` carga sin errores de configuración; en la colección Instagram, un enlace de perfil muestra el mensaje de validación.
