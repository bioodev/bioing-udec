# Anuario de egresados/as en PDF — Plan de implementación

> **Para agentes:** ejecutar tarea por tarea (superpowers:executing-plans). Los pasos usan casillas (`- [ ]`).

**Meta:** página `/anuario` imprimible que reúne a todos los egresados/as del Directorio agrupados por generación; el botón "Descargar PDF" abre el diálogo de impresión del navegador ("Guardar como PDF").

**Arquitectura:** sin dependencias nuevas (decisión: página imprimible, no PDF generado en el build). Una función pura agrupa y ordena (con test). La página reutiliza `egresadosDelDirectorio()` —que ya filtra por autorización y Ficha activa— y una hoja de estilos `@media print` (A4, saltos de página por generación). El layout `Base` oculta encabezado y pie al imprimir.

**Stack:** Astro 7, Tailwind v4 (variante `print:`), Vitest, `phosphor-astro`.

**Spec:** `docs/bitacora.md` ("anuario de todos los bioingenieros. egresados en pdf") · `docs/preguntas-reunion.md` 1.8 (propuesta por defecto: ordenado por generación, mismos datos que el Directorio público) · `docs/context.md` (Perfil de egresado, Generación).

## Restricciones globales

- Rama `demo-frontend`, carpeta `app/web`. Sin push. No commitear `CLAUDE.md` ni `AGENTS.md`.
- Leer antes: `AGENTS.md` (raíz), `app/web/AGENTS.md`, `docs/context.md`.
- **Datos personales:** solo los que ya muestra el Directorio público; nunca correo ni teléfono. Solo personas con `perfil_egresado.autorizado === true` y `ficha_activa` (usar `egresadosDelDirectorio()`, no `getCollection`).
- Sin dependencias nuevas (ni Playwright ni librerías de PDF).
- Íconos Phosphor (`FilePdf`, `Printer`). Textos en español.
- Commits en español, imperativo.

## Foco de revisión

1. Egresado/a sin `generacion`: aparece en un grupo final "Generación no informada", nunca se pierde.
2. Orden: generaciones de la más antigua a la más reciente; dentro de cada una, por nombre con orden alfabético español (`localeCompare(…, 'es')`, "Ñ" después de "N", tildes ignoradas).
3. Al imprimir: sin encabezado sticky, sin pie, sin botón "Descargar PDF"; ninguna ficha se corta entre dos páginas; cada generación empieza en página nueva.
4. Enlaces profesionales impresos: se muestra la URL en texto (un PDF impreso no permite ver el destino de un enlace sin hacer clic).
5. Directorio vacío: la página dice "Aún no hay egresados/as en el Directorio." y no muestra el botón.

---

### Tarea 1: Agrupación por generación (función pura)

**Archivos:**
- Crear: `app/web/src/lib/anuario.ts`, `app/web/src/lib/anuario.test.ts`

**Interfaces:**
- Produce: `agruparPorGeneracion<T extends { nombre: string; generacion?: number }>(personas: T[]): { generacion: number | null; personas: T[] }[]`.

- [ ] **Paso 1: Test**

```ts
import { describe, expect, test } from 'vitest';
import { agruparPorGeneracion } from './anuario';

const p = (nombre: string, generacion?: number) => ({ nombre, generacion });

describe('agruparPorGeneracion', () => {
  test('agrupa, ordena generaciones ascendente y nombres en español', () => {
    const grupos = agruparPorGeneracion([p('Óscar Ruiz', 2010), p('Ana Soto', 2012), p('Ñuñez Paz', 2010), p('Nicolás Vera', 2010)]);
    expect(grupos.map((g) => g.generacion)).toEqual([2010, 2012]);
    expect(grupos[0].personas.map((x) => x.nombre)).toEqual(['Nicolás Vera', 'Ñuñez Paz', 'Óscar Ruiz']);
  });
  test('sin generación va al final con generacion null', () => {
    const grupos = agruparPorGeneracion([p('Beatriz Lagos'), p('Ana Soto', 2012)]);
    expect(grupos.map((g) => g.generacion)).toEqual([2012, null]);
    expect(grupos[1].personas[0].nombre).toBe('Beatriz Lagos');
  });
  test('lista vacía', () => expect(agruparPorGeneracion([])).toEqual([]));
});
```

- [ ] **Paso 2:** `npx vitest run src/lib/anuario.test.ts` → FALLA.
- [ ] **Paso 3: Implementar**

```ts
// Anuario de egresados/as: agrupación por Generación. Puro, con test.

/** Grupos por generación (más antigua primero) y, al final, los sin generación (null). Nombres en orden español. */
export function agruparPorGeneracion<T extends { nombre: string; generacion?: number }>(personas: T[]) {
  const grupos = new Map<number | null, T[]>();
  for (const x of personas) {
    const clave = x.generacion ?? null;
    grupos.set(clave, [...(grupos.get(clave) ?? []), x]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : a - b))
    .map(([generacion, xs]) => ({ generacion, personas: xs.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) }));
}
```

- [ ] **Paso 4:** test en verde; commit `Agrega agrupación por generación para el anuario`.

### Tarea 2: Layout imprimible

**Archivos:**
- Modificar: `app/web/src/layouts/Base.astro`

- [ ] **Paso 1:** agregar `print:hidden` a: el enlace "Saltar al contenido", el `<header>` y el `<footer>`.
- [ ] **Paso 2:** `npm run build` y confirmar que las demás páginas no cambian en pantalla (la variante `print:` solo aplica al imprimir).
- [ ] **Paso 3:** commit `Oculta encabezado y pie al imprimir`.

### Tarea 3: Página `/anuario`

**Archivos:**
- Crear: `app/web/src/pages/anuario.astro`
- Modificar: `app/web/src/pages/directorio.astro` (enlace al anuario bajo el subtítulo)

**Interfaces:** consume `egresadosDelDirectorio()`, `agruparPorGeneracion`, `getEntries`/`getEntry`, `existentes`.

- [ ] **Paso 1:** en el frontmatter, armar los datos igual que `directorio.astro` (áreas y organización resueltas) y mapear a `{ nombre, generacion, anioEgreso, cargo, organizacion?: string, areas: string[], enlaces: {etiqueta, url}[], id }`; luego `const grupos = agruparPorGeneracion(datos)`; `const fecha = new Date().toLocaleDateString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'long' })`.
- [ ] **Paso 2:** marcado:
  - Portada (`<header class="anuario-portada">`): "Anuario de egresados/as", "Bioingeniería · Universidad de Concepción", "N egresados/as · Actualizado al {fecha}".
  - Botón `print:hidden`: `<button type="button" id="imprimir">` con `FilePdf` "Descargar PDF", y debajo, `print:hidden`, el texto "Se abrirá la ventana de impresión: elige «Guardar como PDF»."
  - Por grupo: `<section class="anuario-grupo">` con `<h2>` "Generación {n}" o "Generación no informada", y una grilla `grid gap-4 sm:grid-cols-2 print:grid-cols-2` de fichas `<article class="anuario-ficha rounded-lg border border-border p-4">`: nombre (enlazado a `/personas/{id}` en pantalla), "Egreso {anioEgreso}", cargo · organización, áreas, y enlaces como `<a>` cuya URL se imprime (ver CSS).
  - Vacío: "Aún no hay egresados/as en el Directorio." sin botón.
- [ ] **Paso 3:** estilos:

```astro
<style>
  @media print {
    @page { size: A4; margin: 16mm 14mm; }
    :global(body) { background: white; color: black; font-size: 10pt; }
    .anuario-portada { break-after: page; padding-top: 30vh; text-align: center; }
    .anuario-grupo + .anuario-grupo { break-before: page; }
    .anuario-ficha { break-inside: avoid; border-color: #ccc; }
    .anuario-ficha a[href^='http']::after { content: ' (' attr(href) ')'; font-size: 8pt; word-break: break-all; }
  }
</style>
<script>
  document.querySelector('#imprimir')?.addEventListener('click', () => window.print());
</script>
```

- [ ] **Paso 4:** en `directorio.astro`, bajo el subtítulo: enlace "Ver anuario en PDF" (`FilePdf`, `aria-hidden`) a `/anuario`.
- [ ] **Paso 5:** `npm run build`; commit `Agrega anuario de egresados/as imprimible en PDF`.

### Tarea 4: Verificación final

- [ ] `npm test`, `npx astro check` (0/0), `npm run build`.
- [ ] `npm run datos:generar`, build, servir `dist`; abrir `/anuario` y generar el PDF con Chrome sin encabezados del navegador: portada en página 1, cada generación en página nueva, ninguna ficha cortada, sin header/footer/botón, URLs visibles. Alternativa sin interfaz: `google-chrome --headless --no-pdf-header-footer --print-to-pdf=/tmp/anuario.pdf http://localhost:4322/anuario/` y revisar el PDF.
- [ ] Confirmar que ninguna persona sin autorización aparece (una `sint-*` con `autorizado: false` no está en el PDF).
- [ ] `npm run datos:limpiar`.
