# Repositorio — Plan de implementación

> **Para agentes:** ejecutar tarea por tarea (superpowers:executing-plans). Los pasos usan casillas (`- [ ]`).

**Meta:** sección `/repositorio` con los Documentos publicados, buscador por palabra clave y filtros por tipo, Tema y año; ficha `/repositorio/[id]` con vista previa de Google Drive y botón para abrir el archivo.

**Arquitectura:** patrón de listados del proyecto (ver `/agenda`, commit `57c5b9a`): filtro puro con test + `<script>` que filtra tarjetas con `data-*`. La conversión de un enlace de Drive a su URL de vista previa es una función pura con test. En la POC los documentos solo se enlazan desde Drive; R2 queda para producción (propuesta §6.3) y no se implementa.

**Stack:** Astro 7, Tailwind v4, Starwind UI v3 (`native-select`, `input`, `label`), Vitest, `phosphor-astro`.

**Spec:** `docs/propuesta-arquitectura-y-contenidos.md` §11 · `docs/propuesta-desarrollo.md` §6.3 · `docs/context.md` (Documento, Repositorio, Tema, Área).

## Restricciones globales

- Rama `demo-frontend`, carpeta `app/web`. Sin push. No commitear `CLAUDE.md` ni `AGENTS.md`.
- Leer antes: `AGENTS.md` (raíz), `app/web/AGENTS.md`, `docs/context.md`.
- Términos: Documento y Repositorio (evitar "archivo", "biblioteca", "recurso").
- Páginas consultan contenido solo vía `src/lib/contenido.ts`.
- Íconos solo Phosphor, `aria-hidden="true"` si son decorativos.
- `SelectTrigger`/`NativeSelect` necesita su `Label` asociado (ver `AGENTS.md` §Astro).
- No se permite pegar HTML/iframe en el CMS: el sitio genera el iframe a partir del enlace.
- Commits en español, imperativo.

## Foco de revisión

1. Enlace de Drive en sus formas comunes (`/file/d/ID/view?usp=sharing`, `/open?id=ID`, `docs.google.com/document/d/ID/edit`, `/spreadsheets/d/…`, `/presentation/d/…`) → vista previa correcta; cualquier otro enlace (o `https://drive.google.com/` sin ID) → sin iframe, solo botón "Abrir".
2. Búsqueda por palabra clave que solo está en `palabras_clave` o en la descripción, con o sin tildes.
3. Filtros combinados (tipo + Tema + año) que no dejan resultados → mensaje "sin resultados", contador en 0.
4. `?anio=2019` en la URL cuando no hay documentos de 2019 → se ignora (opción inexistente).
5. Tema referenciado que fue borrado → el documento sigue visible, sin ese Tema.

---

### Tarea 1: Vista previa de Drive (función pura)

**Archivos:**
- Crear: `app/web/src/lib/enlaces.ts`, `app/web/src/lib/enlaces.test.ts`

**Interfaces:**
- Produce: `vistaPreviaDrive(url: string): string | null` — devuelve la URL para `<iframe>` o `null` si no se reconoce.

- [ ] **Paso 1: Test**

```ts
import { describe, expect, test } from 'vitest';
import { vistaPreviaDrive } from './enlaces';

describe('vistaPreviaDrive', () => {
  test('archivo de Drive', () =>
    expect(vistaPreviaDrive('https://drive.google.com/file/d/AbC_12-x/view?usp=sharing')).toBe('https://drive.google.com/file/d/AbC_12-x/preview'));
  test('open?id=', () =>
    expect(vistaPreviaDrive('https://drive.google.com/open?id=AbC_12-x')).toBe('https://drive.google.com/file/d/AbC_12-x/preview'));
  test('Docs, Sheets y Slides', () => {
    expect(vistaPreviaDrive('https://docs.google.com/document/d/XyZ/edit')).toBe('https://docs.google.com/document/d/XyZ/preview');
    expect(vistaPreviaDrive('https://docs.google.com/spreadsheets/d/XyZ/edit#gid=0')).toBe('https://docs.google.com/spreadsheets/d/XyZ/preview');
    expect(vistaPreviaDrive('https://docs.google.com/presentation/d/XyZ/edit')).toBe('https://docs.google.com/presentation/d/XyZ/preview');
  });
  test('no reconocidos', () => {
    expect(vistaPreviaDrive('https://drive.google.com/')).toBeNull();
    expect(vistaPreviaDrive('https://drive.google.com/drive/folders/XyZ')).toBeNull();
    expect(vistaPreviaDrive('https://example.com/file/d/XyZ/view')).toBeNull();
    expect(vistaPreviaDrive('no es url')).toBeNull();
  });
});
```

- [ ] **Paso 2:** `npx vitest run src/lib/enlaces.test.ts` → FALLA.
- [ ] **Paso 3: Implementar**

```ts
// Enlaces externos → URL de inserción. Puro, con test. Lista cerrada de proveedores (propuesta §6.3).
const ID = '([\\w-]+)';

/** URL de vista previa oficial de Google para un archivo de Drive/Docs, o null si no se reconoce. */
export function vistaPreviaDrive(url: string): string | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (u.hostname === 'drive.google.com') {
    const id = u.pathname.match(new RegExp(`^/file/d/${ID}`))?.[1] ?? (u.pathname === '/open' ? u.searchParams.get('id') : null);
    return id ? `https://drive.google.com/file/d/${id}/preview` : null;
  }
  if (u.hostname === 'docs.google.com') {
    const m = u.pathname.match(new RegExp(`^/(document|spreadsheets|presentation)/d/${ID}`));
    return m ? `https://docs.google.com/${m[1]}/d/${m[2]}/preview` : null;
  }
  return null;
}
```

- [ ] **Paso 4:** test en verde; commit `Agrega vista previa de enlaces de Google Drive`.

### Tarea 2: Etiquetas, consulta y filtro puro

**Archivos:**
- Crear: `app/web/src/lib/repositorio.ts`, `app/web/src/lib/filtro-repositorio.ts`, `app/web/src/lib/filtro-repositorio.test.ts`
- Modificar: `app/web/src/lib/contenido.ts` (agregar `documentosDelRepositorio`)

**Interfaces:**
- Produce: `TIPOS_DOCUMENTO`; `TODOS = 'todos'`; `coincideDocumento(d: DatosDocumento, f: FiltrosRepositorio): boolean` con `DatosDocumento { texto: string; tipo: string; temas: string[]; anio: string }` y `FiltrosRepositorio { texto: string; tipo: string; tema: string; anio: string }`; `documentosDelRepositorio(): Promise<CollectionEntry<'documentos'>[]>` (año desc, luego título).

- [ ] **Paso 1:** `repositorio.ts` (los `value` = `config.yml`):

```ts
// Etiquetas del Repositorio, compartidas por la tarjeta, el listado y la ficha.
export const TIPOS_DOCUMENTO = {
  decreto: 'Decreto',
  reglamento: 'Reglamento',
  ley: 'Ley',
  informe: 'Informe',
  publicacion: 'Publicación',
  institucional: 'Documento institucional',
  historico: 'Documento histórico',
  academico: 'Material académico',
  otro: 'Otro',
} as const;
```

- [ ] **Paso 2: Test** `filtro-repositorio.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { coincideDocumento, TODOS } from './filtro-repositorio';

const reglamento = { texto: 'reglamento de titulacion requisitos memoria tesis', tipo: 'reglamento', temas: ['institucional'], anio: '2024' };
const sin = { texto: '', tipo: TODOS, tema: TODOS, anio: TODOS };

describe('coincideDocumento', () => {
  test('sin filtros', () => expect(coincideDocumento(reglamento, sin)).toBe(true));
  test('palabra clave sin tildes', () => {
    expect(coincideDocumento(reglamento, { ...sin, texto: 'TITULACIÓN' })).toBe(true);
    expect(coincideDocumento(reglamento, { ...sin, texto: 'tesis' })).toBe(true);
    expect(coincideDocumento(reglamento, { ...sin, texto: 'decreto' })).toBe(false);
  });
  test('tipo, tema y año', () => {
    expect(coincideDocumento(reglamento, { ...sin, tipo: 'informe' })).toBe(false);
    expect(coincideDocumento(reglamento, { ...sin, tema: 'institucional' })).toBe(true);
    expect(coincideDocumento(reglamento, { ...sin, tema: 'logros' })).toBe(false);
    expect(coincideDocumento(reglamento, { ...sin, anio: '2023' })).toBe(false);
  });
  test('todo combinado con Y', () =>
    expect(coincideDocumento(reglamento, { texto: 'memoria', tipo: 'reglamento', tema: 'institucional', anio: '2024' })).toBe(true));
});
```

- [ ] **Paso 3:** test → FALLA. **Paso 4:** implementar:

```ts
// Filtro del Repositorio. Puro: lo usan el test y el <script> de /repositorio.
import { normalizar } from './reglas';

export const TODOS = 'todos';
/** texto: título, descripción y palabras clave normalizados; temas: ids de Tema; anio como texto. */
export interface DatosDocumento { texto: string; tipo: string; temas: string[]; anio: string }
export interface FiltrosRepositorio { texto: string; tipo: string; tema: string; anio: string }

export function coincideDocumento(d: DatosDocumento, f: FiltrosRepositorio): boolean {
  const texto = normalizar(f.texto);
  return (texto === '' || d.texto.includes(texto))
    && (f.tipo === TODOS || d.tipo === f.tipo)
    && (f.tema === TODOS || d.temas.includes(f.tema))
    && (f.anio === TODOS || d.anio === f.anio);
}
```

- [ ] **Paso 5:** en `contenido.ts`:

```ts
/** Documentos publicados del Repositorio: más recientes primero y, dentro del año, por título. */
export async function documentosDelRepositorio() {
  const docs = await publicados('documentos');
  return docs.sort((a, b) => b.data.anio - a.data.anio || a.data.titulo.localeCompare(b.data.titulo, 'es'));
}
```

- [ ] **Paso 6:** `npm test`, `npx astro check`; commit `Agrega etiquetas, consulta y filtro puro del Repositorio`.

### Tarea 3: Listado `/repositorio`

**Archivos:**
- Crear: `app/web/src/components/TarjetaDocumento.astro`, `app/web/src/pages/repositorio/index.astro`
- Modificar: `app/web/src/lib/navegacion.ts` (`Repositorio` → `disponible: true`)

- [ ] **Paso 1:** `TarjetaDocumento.astro` (prop `documento: CollectionEntry<'documentos'>`, `temas: string[]` con nombres ya resueltos): ícono `FileText`, `Badge` con `TIPOS_DOCUMENTO[tipo]`, año, título enlazado a `/repositorio/${id}`, descripción en `line-clamp-2`, temas en texto atenuado. Mismo estilo de tarjeta que `TarjetaAnuncio` (`rounded-lg border border-border bg-card p-5`).
- [ ] **Paso 2:** página basada en `src/pages/noticias/index.astro` (usa selects) y `agenda/index.astro`:
  - Un `<Input type="search">` "Buscar" (placeholder "Título, descripción o palabra clave") y tres `NativeSelect` con `Label`: Tipo (solo tipos presentes), Tema (temas presentes, por nombre), Año (años presentes, desc). Primera opción de cada uno: valor `TODOS`, texto "Todos"/"Todos los años".
  - Cada `<li>` lleva `data-texto` (`normalizar(titulo + descripcion + palabras_clave.join(' '))`), `data-tipo`, `data-temas` (ids separados por espacio) y `data-anio`.
  - Script: lee `?q=&tipo=&tema=&anio=`; un valor que no está entre las opciones del select se ignora; refleja los filtros en la URL con `history.replaceState`; contador "1 documento"/"N documentos"; mensaje "No hay documentos que coincidan con los filtros.".
  - Sin documentos publicados: "Aún no hay documentos en el Repositorio."
  - Lista en una sola columna en móvil, 2 en `md`.
- [ ] **Paso 3:** `navegacion.ts`: `Repositorio` con `disponible: true`.
- [ ] **Paso 4:** `npm run build`; commit `Agrega Repositorio con buscador y filtros por tipo, tema y año`.

### Tarea 4: Ficha `/repositorio/[id]`

**Archivos:**
- Crear: `app/web/src/pages/repositorio/[id].astro`

- [ ] **Paso 1:** `getStaticPaths` con `documentosDelRepositorio()`. Contenido:
  - Badge tipo, año, `<h1>` título, descripción, Temas y Áreas (con `existentes(await getEntries(...))`), palabras clave como `Badge variant="outline"`.
  - Si `vistaPreviaDrive(enlace)` devuelve URL: `<iframe src={vista} title={`Vista previa: ${titulo}`} loading="lazy" class="mt-8 aspect-[3/4] w-full rounded-lg border border-border md:aspect-[4/3]" allow="autoplay"></iframe>`.
  - Siempre: botón `Button as="a"` "Abrir documento" (`ArrowSquareOut`) a `enlace`, `target="_blank" rel="noopener"`, y la nota en texto atenuado "Si la vista previa no carga, abre el documento en una pestaña nueva.".
  - "← Volver al Repositorio".
- [ ] **Paso 2:** reemplazar en el contenido de ejemplo **no sintético** (`src/content/documentos/*.yml` sin prefijo `sint-`) un `enlace` por un PDF público real de Drive, p. ej. cualquier archivo compartido "cualquier persona con el enlace" que el responsable indique; si no hay uno, dejarlo y verificar solo que se muestra el botón.
- [ ] **Paso 3:** `npm run build`; commit `Agrega ficha de Documento con vista previa de Drive`.

### Tarea 5: Verificación final

- [ ] `npm test`, `npx astro check` (0/0), `npm run build` sin `[ERROR]` nuevos.
- [ ] `npm run datos:generar` + build + `python3 -m http.server -d dist 4322`; probar `/repositorio`, `?tipo=reglamento&anio=2024`, un `?anio=` inexistente, una ficha con enlace no reconocido.
- [ ] 375 px sin scroll horizontal. `npm run datos:limpiar` al terminar.
