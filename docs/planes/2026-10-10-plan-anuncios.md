# Anuncios — Plan de implementación

> **Para agentes:** ejecutar tarea por tarea (superpowers:executing-plans). Los pasos usan casillas (`- [ ]`).

**Meta:** sección `/anuncios` con Anuncios vigentes y archivo de vencidos, buscador y filtro por tipo, y ficha `/anuncios/[id]`.

**Arquitectura:** mismo patrón que `/agenda` (commit `57c5b9a`): regla pura en `src/lib/reglas.ts`, filtro puro `src/lib/filtro-anuncios.ts` con test Vitest, y la página renderiza todas las tarjetas con `data-*` para que un `<script>` las filtre. Las etiquetas del dominio viven en `src/lib/anuncios.ts`.

**Stack:** Astro 7, Tailwind v4, Starwind UI v3, Vitest, `phosphor-astro`.

**Spec:** `docs/propuesta-arquitectura-y-contenidos.md` §10 · `docs/preguntas-reunion.md` 4.1 (propuesta por defecto) · `docs/context.md` (Anuncio, Oferente, Contacto).

## Restricciones globales

- Trabajar en la rama `demo-frontend`, en `app/web`. No hacer push. No incluir `CLAUDE.md` ni `AGENTS.md` en los commits.
- Leer antes: `AGENTS.md` (raíz), `app/web/AGENTS.md`, `docs/context.md`.
- Términos de `docs/context.md`: Anuncio, Oferente, Contacto (nunca "oferta", "aviso", "publicador").
- Páginas consultan contenido solo vía `src/lib/contenido.ts` (nunca `getCollection` directo).
- Fechas solas (`AAAA-MM-DD`) se muestran con `formatoFecha` (UTC).
- Íconos solo Phosphor; `aria-hidden="true"` si son decorativos; tamaño con `size-*`.
- Textos de interfaz en español de Chile.
- Commits en español, imperativo ("Agrega …").

## Foco de revisión

1. Anuncio **sin** fecha límite: vence a los 60 días de su fecha de publicación (preguntas-reunion 4.1). El día 60 aún está vigente; el 61 no.
2. Anuncio con fecha límite = hoy en Chile: sigue vigente hasta las 23:59 hora de Chile (ya lo cubre `anuncioVigente`; no romperlo).
3. `/anuncios?tipo=xyz` con un tipo inexistente: se ignora y se muestran todos.
4. Oferente cuya Persona/Organización fue borrada: la ficha no se cae; simplemente no muestra el Oferente.
5. Sin Anuncios vigentes: la sección "Vigentes" muestra su mensaje de vacío y el archivo sigue visible.

---

### Tarea 1: Regla de vencimiento a 60 días

**Archivos:**
- Modificar: `app/web/src/lib/reglas.ts` (función `anuncioVigente`)
- Modificar: `app/web/src/lib/reglas.test.ts` (bloque `describe('anuncioVigente')`)
- Modificar: `app/web/src/lib/contenido.ts` (agregar `anunciosVencidos`)

**Interfaces:**
- Produce: `anuncioVigente(a: { fecha: Date; fecha_limite?: Date }, ahora: Date): boolean`, `DIAS_SIN_LIMITE = 60`, `anunciosVencidos(ahora?): Promise<CollectionEntry<'anuncios'>[]>` (más recientes primero).

- [ ] **Paso 1: Reemplazar el test "sin fecha límite siempre está vigente"** por:

```ts
  const sinLimite = { fecha: new Date('2026-01-01') };
  test('sin fecha límite vence a los 60 días de publicado', () => {
    expect(anuncioVigente(sinLimite, new Date('2026-03-02T12:00:00Z'))).toBe(true); // día 60
    expect(anuncioVigente(sinLimite, new Date('2026-03-03T12:00:00Z'))).toBe(false); // día 61
  });
```

y agregar `fecha: new Date('2026-01-01')` al objeto `limite` existente de ese `describe` (los demás tests no cambian).

- [ ] **Paso 2:** `cd app/web && npx vitest run src/lib/reglas.test.ts` → debe FALLAR el test nuevo.

- [ ] **Paso 3: Implementar** en `reglas.ts`:

```ts
/** Días que dura un Anuncio sin fecha límite (preguntas-reunion 4.1). */
export const DIAS_SIN_LIMITE = 60;

/** Vigente hasta el final del día límite en Chile. Sin fecha límite, vence DIAS_SIN_LIMITE días después de publicado. */
export function anuncioVigente(a: { fecha: Date; fecha_limite?: Date }, ahora: Date): boolean {
  const limite = a.fecha_limite ?? new Date(a.fecha.valueOf() + DIAS_SIN_LIMITE * 86_400_000);
  return hoyEnChile(ahora) <= fechaSola(limite);
}
```

- [ ] **Paso 4:** en `contenido.ts`, junto a `anunciosVigentes`:

```ts
/** Anuncios visibles que ya vencieron (archivo), más recientes primero. */
export async function anunciosVencidos(ahora = new Date()) {
  const anuncios = (await anunciosVisibles(ahora)).filter((a) => !anuncioVigente(a.data, ahora));
  return anuncios.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}
```

- [ ] **Paso 5:** `npm test` y `npx astro check` en verde.
- [ ] **Paso 6:** commit `Anuncios sin fecha límite vencen a los 60 días`.

### Tarea 2: Etiquetas y filtro puro

**Archivos:**
- Crear: `app/web/src/lib/anuncios.ts`
- Crear: `app/web/src/lib/filtro-anuncios.ts`, `app/web/src/lib/filtro-anuncios.test.ts`
- Modificar: `app/web/src/components/TarjetaAnuncio.astro` (usar `TIPOS_ANUNCIO`, enlazar a la ficha)

**Interfaces:**
- Produce: `TIPOS_ANUNCIO` (record `value → etiqueta`), `TODOS = 'todos'`, `coincideAnuncio(a: DatosAnuncio, f: FiltrosAnuncios): boolean`, con `DatosAnuncio { texto: string; tipo: string }` y `FiltrosAnuncios { texto: string; tipo: string }`.

- [ ] **Paso 1:** `src/lib/anuncios.ts` (los `value` deben coincidir con `config.yml` y `content.config.ts`):

```ts
// Etiquetas de Anuncios, compartidas por la tarjeta, el listado y la ficha.
export const TIPOS_ANUNCIO = {
  trabajo: 'Oferta de trabajo',
  practica: 'Práctica profesional',
  pasantia: 'Pasantía',
  proyecto: 'Proyecto de investigación',
  convocatoria: 'Convocatoria',
  colaboracion: 'Solicitud de colaboración',
  otra: 'Otra oportunidad',
} as const;
```

- [ ] **Paso 2: Test** `filtro-anuncios.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { coincideAnuncio, TODOS } from './filtro-anuncios';

const practica = { texto: 'practica en laboratorio de genomica biotech spa', tipo: 'practica' };
const sinFiltros = { texto: '', tipo: TODOS };

describe('coincideAnuncio', () => {
  test('sin filtros coincide', () => expect(coincideAnuncio(practica, sinFiltros)).toBe(true));
  test('texto sin tildes ni mayúsculas', () => {
    expect(coincideAnuncio(practica, { ...sinFiltros, texto: 'GENÓMICA' })).toBe(true);
    expect(coincideAnuncio(practica, { ...sinFiltros, texto: 'acuicultura' })).toBe(false);
  });
  test('tipo exacto', () => {
    expect(coincideAnuncio(practica, { ...sinFiltros, tipo: 'practica' })).toBe(true);
    expect(coincideAnuncio(practica, { ...sinFiltros, tipo: 'trabajo' })).toBe(false);
  });
  test('texto y tipo con Y', () => expect(coincideAnuncio(practica, { texto: 'biotech', tipo: 'trabajo' })).toBe(false));
});
```

- [ ] **Paso 3:** correr el test → FALLA (módulo no existe).
- [ ] **Paso 4:** `filtro-anuncios.ts`:

```ts
// Filtro del listado de Anuncios. Puro: lo usan el test y el <script> de /anuncios.
import { normalizar } from './reglas';

export const TODOS = 'todos';
/** texto: título y nombre del Oferente ya normalizados; tipo: `value` del esquema. */
export interface DatosAnuncio { texto: string; tipo: string }
export interface FiltrosAnuncios { texto: string; tipo: string }

export function coincideAnuncio(a: DatosAnuncio, f: FiltrosAnuncios): boolean {
  const texto = normalizar(f.texto);
  return (texto === '' || a.texto.includes(texto)) && (f.tipo === TODOS || a.tipo === f.tipo);
}
```

- [ ] **Paso 5:** test en verde.
- [ ] **Paso 6:** en `TarjetaAnuncio.astro`, borrar la constante local `TIPO` e importar `TIPOS_ANUNCIO`; envolver el `<h3>` en `<a href={`/anuncios/${anuncio.id}`} class="hover:text-primary">…</a>`. Agregar la prop opcional `vencido?: boolean` que, si es true, muestra un `<Badge variant="secondary">Vencido</Badge>` junto al tipo y cambia "Postula hasta el" por "Cerró el".
- [ ] **Paso 7:** `npm test`, `npx astro check` en verde; commit `Agrega etiquetas y filtro puro de Anuncios`.

### Tarea 3: Listado `/anuncios`

**Archivos:**
- Crear: `app/web/src/pages/anuncios/index.astro`
- Modificar: `app/web/src/lib/navegacion.ts` (`Anuncios` → `disponible: true`)

**Interfaces:** consume `anunciosVigentes`, `anunciosVencidos`, `TIPOS_ANUNCIO`, `coincideAnuncio`, `TODOS`, `TarjetaAnuncio` (prop `vencido`).

- [ ] **Paso 1:** copiar `src/pages/agenda/index.astro` como base y adaptar:
  - Secciones: `{ id: 'vigentes', titulo: 'Oportunidades vigentes', vacio: 'No hay oportunidades vigentes por ahora.' }` y `{ id: 'archivo', titulo: 'Archivo', vacio: 'Aún no hay anuncios en el archivo.' }`. El archivo pasa `vencido` a la tarjeta.
  - `data-texto` = `normalizar(`${titulo} ${nombreOferente}`)`. El nombre del Oferente se obtiene con `getEntry` según `oferente.tipo` (patrón de organizadores en `agenda/[id].astro`); si la entrada no existe, cadena vacía.
  - Chips por tipo con `TIPOS_ANUNCIO` y el valor `TODOS`; parámetros de URL `?q=` y `?tipo=`; un `tipo` desconocido en la URL se ignora (ya lo hace el patrón de Agenda con `chips.some(...)`).
  - Contador: "1 anuncio" / "N anuncios". Mensaje sin resultados: "No hay anuncios que coincidan con los filtros."
  - `<Base titulo="Anuncios" descripcion="Oportunidades para la comunidad de Bioingeniería UdeC: trabajo, prácticas, pasantías y convocatorias.">`
  - Bajo el título, un párrafo: "¿Tienes una oportunidad para la comunidad? Escríbele a la persona encargada de comunicaciones." (sin enlace por ahora).
- [ ] **Paso 2:** `navegacion.ts`: `Anuncios` con `disponible: true`.
- [ ] **Paso 3:** `npm run build`; confirmar que existe `dist/anuncios/index.html` y que no hay `[ERROR]` nuevos.
- [ ] **Paso 4:** commit `Agrega listado de Anuncios con vigentes, archivo, buscador y filtro por tipo`.

### Tarea 4: Ficha `/anuncios/[id]`

**Archivos:**
- Crear: `app/web/src/pages/anuncios/[id].astro`

- [ ] **Paso 1:** `getStaticPaths` con `anunciosVisibles()` (incluye vencidos). Contenido, en este orden, con el estilo de `agenda/[id].astro`:
  - Badges: tipo (`TIPOS_ANUNCIO`) y "Vencido" si `!anuncioVigente(data, new Date())`.
  - `<h1>` título.
  - `<dl>`: Publicado el `formatoFecha(fecha)`; Postula hasta `formatoFecha(fecha_limite)` si existe; Oferente con `EnlaceFicha` (si la entrada existe); Áreas (`existentes(await getEntries(areas ?? []))`) separadas por " · "; Contacto (texto libre; si parece correo `/^\S+@\S+$/` se muestra como `mailto:`).
  - Cuerpo con `<Content />` dentro de `prose`, igual que la ficha de Agenda.
  - Botón "Más información" (`ArrowSquareOut`) a `enlace` con `target="_blank" rel="noopener"`, solo si existe y el Anuncio está vigente.
  - Enlace "← Volver a Anuncios".
- [ ] **Paso 2:** `npm run build`; abrir `dist/anuncios/<algún-id>/index.html` y verificar los campos.
- [ ] **Paso 3:** commit `Agrega ficha de Anuncio`.

### Tarea 5: Verificación final

- [ ] `npm test`, `npx astro check` (0 errores, 0 warnings), `npm run build` sin referencias rotas nuevas.
- [ ] Revisión visual: `npm run datos:generar`, build, `python3 -m http.server -d dist 4322` y navegar `/anuncios`, `/anuncios?tipo=practica`, una ficha vigente, una vencida, y la Ficha de una Persona con Anuncios (la tarjeta enlaza).
- [ ] Ancho de 375 px sin scroll horizontal.
- [ ] `npm run datos:limpiar` antes de terminar (no commitear `sint-*`).
