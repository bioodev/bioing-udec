# Demo del frontend BIOING+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Demo navegable en local del sitio BIOING+ (Base, Inicio, detalle de Noticia, Ficha de Persona, Directorio con filtros y catálogo `/componentes`) para mostrar en la reunión con el equipo BIOING+.

**Architecture:** Sitio Astro 7 estático en `app/web`. Starwind UI (componentes Astro copiados por su CLI) sobre Tailwind v4, tematizado con los tokens de `docs/DESIGN.md`. Toda regla de negocio que dependa de fechas o filtros vive en módulos TypeScript puros (`src/lib/reglas.ts`, `src/lib/filtro-directorio.ts`) probados con Vitest; `src/lib/contenido.ts` los combina con `astro:content`; las páginas solo consultan `contenido.ts`.

**Tech Stack:** Astro 7.3, Tailwind CSS v4 (`@tailwindcss/vite`), Starwind UI (CLI `starwind`), Vitest, TypeScript estricto.

**Spec:** `docs/superpowers/specs/2026-09-30-demo-frontend-design.md`

## Global Constraints

- Todos los comandos se ejecutan desde `app/web` salvo que se indique otra cosa. Node ≥ 22.12.
- Sin React ni otro framework de islas. El único JavaScript en el navegador es el de los componentes Starwind usados y el filtro del Directorio.
- Las páginas leen contenido solo mediante `src/lib/contenido.ts`; nunca `getCollection` directo sobre colecciones con campo `publicado`.
- Tema (DESIGN.md): `--primary: #0066cc`, `--primary-foreground: #ffffff`, `--background: #ffffff`, `--foreground: #1d1d1f`, `--muted: #f5f5f7`, `--border`/`--input: #e0e0e0`, `--outline: #0071e3`, `--radius: 18px`; botones en píldora; tipografía `system-ui, -apple-system, sans-serif`. Sin modo oscuro.
- Logos de relleno como texto: "BIOING+" y "FCB UdeC".
- Textos de interfaz en español. Términos de dominio según `CONTEXT.md` (Persona, Ficha, Directorio, Organización, Área, Tema, Actividad, Anuncio, Banner).
- Fechas: con hora → `formatoFechaHora` (America/Santiago); fechas solas → `formatoFecha` (UTC). "Hoy" para vigencias es la fecha del build en America/Santiago.
- Enlace a una Ficha solo si la Persona u Organización tiene `ficha_activa`; si no, texto plano.
- `/componentes` existe solo en `npm run dev`; `npm run build` no lo genera.
- Contenido de ejemplo: cuerpo con la frase "Contenido de ejemplo. Borrar cuando haya contenido real." Nombres ficticios.

## Review Focus

- Anuncio cuya `fecha_limite` es hoy en Chile: debe seguir vigente todo ese día (Task 2, test `anuncioVigente` "vence hoy").
- Búsqueda en el Directorio con tildes o mayúsculas distintas ("perez" encuentra "Pérez"): Task 2 `normalizar`, Task 8 `coincide`.
- Persona mencionada con Ficha desactivada (juan-soto): se muestra sin enlace y no rompe el build (Task 6, verificación en HTML).
- Egresado sin `generacion` (campo pendiente de la reunión): aparece con el filtro "Todas" y desaparece al filtrar por una generación concreta (Task 8, test).
- Actividad de varios días ya iniciada pero no terminada: sigue en "Próximas" (Task 2, test `actividadEsProxima`).

---

## File Structure

```
app/web/
  package.json                       + script "test"; deps de Starwind/Tailwind/Vitest
  astro.config.mjs                   Tailwind vía @tailwindcss/vite (lo agrega starwind init)
  starwind.config.json               creado por starwind init
  vitest.config.ts                   Vitest para src/**/*.test.ts
  src/styles/starwind.css            Tailwind + variables Starwind con tokens de DESIGN.md
  src/lib/reglas.ts                  PURO: fechas en Chile, vigencias, normalizar texto
  src/lib/reglas.test.ts
  src/lib/filtro-directorio.ts       PURO: ¿una tarjeta coincide con los filtros?
  src/lib/filtro-directorio.test.ts
  src/lib/contenido.ts               + bannerVigente, noticiasRecientes, proximasActividades, anunciosVigentes, egresadosDelDirectorio
  src/lib/navegacion.ts              ítems del menú y URL de la FCB
  src/layouts/Base.astro             <html>, header fijo, menú móvil (Sheet), footer
  src/components/starwind/…          creados por la CLI de Starwind
  src/components/Banner.astro
  src/components/TarjetaNoticia.astro
  src/components/TarjetaActividad.astro
  src/components/TarjetaAnuncio.astro
  src/components/TarjetaEgresado.astro
  src/components/EnlaceFicha.astro   nombre con o sin enlace según ficha_activa
  src/pages/index.astro              Inicio
  src/pages/noticias/[id].astro
  src/pages/personas/[id].astro      (reemplaza la versión de prueba)
  src/pages/directorio.astro
  src/pages/[seccion].astro          "Próximamente"
  src/pages/[...componentes].astro   catálogo, solo en dev
  src/content/…                      contenido de ejemplo
  src/assets/media/ejemplo-*.png     imágenes de ejemplo
```

---

### Task 1: Tailwind + Starwind + tema + Vitest

**Files:**
- Create: `app/web/starwind.config.json`, `app/web/src/styles/starwind.css`, `app/web/src/components/starwind/*` (por CLI), `app/web/vitest.config.ts`, `app/web/src/lib/humo.test.ts`
- Modify: `app/web/package.json`, `app/web/astro.config.mjs`, `app/web/tsconfig.json` (por CLI)

**Interfaces:**
- Produces: alias `@/` → `src/`; componentes `@/components/starwind/{button,card,badge,select,input,label,sheet}`; clases Tailwind `bg-primary`, `text-muted-foreground`, `bg-muted`, `rounded-lg`, etc.; `npm test`.

- [ ] **Step 1: Inicializar Starwind con valores por defecto**

Run: `npx starwind@latest init --defaults`
Expected: crea `starwind.config.json` y `src/styles/starwind.css`, instala `tailwindcss@^4`, `@tailwindcss/vite`, `@tailwindcss/forms`, `tw-animate-css`, `tailwind-variants`, `tailwind-merge`, `@tabler/icons`, agrega el plugin de Tailwind a `astro.config.mjs` y el alias `@/*` a `tsconfig.json`. Si pregunta por gestor de paquetes, elegir `npm`. Si con `--defaults` usó pnpm (aparece `pnpm-lock.yaml`), borrar ese archivo y ejecutar `npm install` para que el proyecto siga con `package-lock.json`. Verificar con `git diff --stat` que `astro.config.mjs` y `tsconfig.json` cambiaron.

- [ ] **Step 2: Agregar los componentes a usar**

Run: `npx starwind@latest add button card badge select input label sheet --yes`
Expected: aparecen carpetas `src/components/starwind/{button,card,badge,select,input,label,sheet}`.

- [ ] **Step 3: Aplicar los tokens de DESIGN.md**

En `src/styles/starwind.css`, dentro del bloque `:root { … }` que creó la CLI, reemplazar los valores de estas variables (dejar las demás como están):

```css
  --background: #ffffff;
  --foreground: #1d1d1f;
  --card: #ffffff;
  --card-foreground: #1d1d1f;
  --popover: #ffffff;
  --popover-foreground: #1d1d1f;
  --primary: #0066cc;
  --primary-foreground: #ffffff;
  --primary-accent: #0066cc;
  --secondary: #f5f5f7;
  --secondary-foreground: #1d1d1f;
  --secondary-accent: #1d1d1f;
  --muted: #f5f5f7;
  --muted-foreground: #6e6e73;
  --accent: #f5f5f7;
  --accent-foreground: #1d1d1f;
  --border: #e0e0e0;
  --input: #e0e0e0;
  --outline: #0071e3;
  --radius: 18px;
```

Y al final del archivo agregar:

```css
@layer base {
  html {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  body {
    background: var(--background);
    color: var(--foreground);
  }
}
```

- [ ] **Step 4: Instalar Vitest y configurarlo**

Run: `npm install -D vitest`

Create `app/web/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
```

En `app/web/package.json`, dentro de `"scripts"`, agregar: `"test": "vitest run"`.

Create `app/web/src/lib/humo.test.ts`:

```ts
import { expect, test } from 'vitest';

test('vitest funciona', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 5: Verificar**

Run: `npm test && npx astro check && npm run build`
Expected: 1 test pasa; `astro check` 0 errors; build completo.

- [ ] **Step 6: Borrar la prueba de humo y hacer commit**

```bash
rm src/lib/humo.test.ts
git add -A
git commit -m "Agrega Tailwind v4, Starwind UI con tokens de DESIGN.md y Vitest"
```

---

### Task 2: Reglas puras (fechas, vigencias, normalizar) con TDD

**Files:**
- Create: `app/web/src/lib/reglas.ts`, `app/web/src/lib/reglas.test.ts`

**Interfaces:**
- Produces:
  - `hoyEnChile(ahora: Date): string` → `"AAAA-MM-DD"` en America/Santiago
  - `fechaSola(d: Date): string` → `"AAAA-MM-DD"` en UTC (para fechas sin hora)
  - `estaVigente(v: { inicio: Date; fin: Date }, ahora: Date): boolean`
  - `anuncioVigente(a: { fecha_limite?: Date }, ahora: Date): boolean`
  - `actividadEsProxima(a: { inicio: Date; fin?: Date }, ahora: Date): boolean`
  - `normalizar(texto: string): string`

- [ ] **Step 1: Escribir los tests**

Create `app/web/src/lib/reglas.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import {
  actividadEsProxima, anuncioVigente, estaVigente, fechaSola, hoyEnChile, normalizar,
} from './reglas';

describe('hoyEnChile', () => {
  test('a las 01:00 UTC todavía es el día anterior en Chile', () => {
    expect(hoyEnChile(new Date('2026-10-01T01:00:00Z'))).toBe('2026-09-30');
  });
  test('a mediodía coincide con UTC', () => {
    expect(hoyEnChile(new Date('2026-10-01T15:00:00Z'))).toBe('2026-10-01');
  });
});

describe('fechaSola', () => {
  test('una fecha sin hora parseada como medianoche UTC conserva su día', () => {
    expect(fechaSola(new Date('2027-04-30'))).toBe('2027-04-30');
  });
});

describe('estaVigente', () => {
  const banner = { inicio: new Date('2026-09-01T00:00:00-03:00'), fin: new Date('2026-12-31T23:59:00-03:00') };
  test('dentro del rango', () => expect(estaVigente(banner, new Date('2026-10-15T12:00:00Z'))).toBe(true));
  test('antes del inicio', () => expect(estaVigente(banner, new Date('2026-08-31T12:00:00Z'))).toBe(false));
  test('después del fin', () => expect(estaVigente(banner, new Date('2027-01-02T12:00:00Z'))).toBe(false));
});

describe('anuncioVigente', () => {
  const limite = { fecha_limite: new Date('2026-10-15') };
  test('sin fecha límite siempre está vigente', () => expect(anuncioVigente({}, new Date('2030-01-01T00:00:00Z'))).toBe(true));
  test('antes de la fecha límite', () => expect(anuncioVigente(limite, new Date('2026-10-10T12:00:00Z'))).toBe(true));
  test('vence hoy: sigue vigente a las 23:00 de Chile', () => {
    // 2026-10-15 23:00 en Chile (UTC-3) = 2026-10-16 02:00 UTC
    expect(anuncioVigente(limite, new Date('2026-10-16T02:00:00Z'))).toBe(true);
  });
  test('al día siguiente ya no está vigente', () => expect(anuncioVigente(limite, new Date('2026-10-16T15:00:00Z'))).toBe(false));
});

describe('actividadEsProxima', () => {
  const ahora = new Date('2026-10-15T15:00:00Z');
  test('empieza mañana', () => expect(actividadEsProxima({ inicio: new Date('2026-10-16T18:00:00-03:00') }, ahora)).toBe(true));
  test('terminó ayer', () => expect(actividadEsProxima({ inicio: new Date('2026-10-14T18:00:00-03:00') }, ahora)).toBe(false));
  test('empezó ayer y termina mañana (varios días)', () => {
    expect(actividadEsProxima({ inicio: new Date('2026-10-14T09:00:00-03:00'), fin: new Date('2026-10-16T18:00:00-03:00') }, ahora)).toBe(true);
  });
});

describe('normalizar', () => {
  test('quita tildes, pasa a minúsculas y recorta', () => {
    expect(normalizar('  José PÉREZ Muñoz ')).toBe('jose perez munoz');
  });
});
```

- [ ] **Step 2: Correr y ver que fallan**

Run: `npm test`
Expected: FAIL — `Cannot find module './reglas'` (o similar).

- [ ] **Step 3: Implementar**

Create `app/web/src/lib/reglas.ts`:

```ts
// Reglas puras (sin astro:content) para poder probarlas con Vitest.
const ZONA = 'America/Santiago';

/** "AAAA-MM-DD" del instante dado en hora de Chile. */
export function hoyEnChile(ahora: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
}

/** "AAAA-MM-DD" de una fecha sin hora (parseada como medianoche UTC). */
export function fechaSola(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function estaVigente(v: { inicio: Date; fin: Date }, ahora: Date): boolean {
  return v.inicio <= ahora && ahora <= v.fin;
}

/** Vigente hasta el final del día de fecha_limite en Chile. Sin fecha límite, siempre vigente. */
export function anuncioVigente(a: { fecha_limite?: Date }, ahora: Date): boolean {
  return !a.fecha_limite || hoyEnChile(ahora) <= fechaSola(a.fecha_limite);
}

/** Próxima (o en curso) si todavía no termina; sin fin, se usa el inicio. */
export function actividadEsProxima(a: { inicio: Date; fin?: Date }, ahora: Date): boolean {
  return (a.fin ?? a.inicio) >= ahora;
}

export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
```

- [ ] **Step 4: Correr y ver que pasan**

Run: `npm test`
Expected: PASS, 14 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/reglas.ts src/lib/reglas.test.ts
git commit -m "Agrega reglas de vigencia y normalización con tests"
```

---

### Task 3: Consultas de contenido para las páginas

**Files:**
- Modify: `app/web/src/lib/contenido.ts` (agregar al final)

**Interfaces:**
- Consumes: `estaVigente`, `anuncioVigente`, `actividadEsProxima` de Task 2; `publicados` existente.
- Produces:
  - `bannerVigente(ahora?: Date): Promise<CollectionEntry<'banners'> | undefined>`
  - `noticiasRecientes(cantidad?: number): Promise<CollectionEntry<'noticias'>[]>` (por `fecha` descendente)
  - `proximasActividades(ahora?: Date): Promise<CollectionEntry<'actividades'>[]>` (por `inicio` ascendente)
  - `anunciosVigentes(ahora?: Date): Promise<CollectionEntry<'anuncios'>[]>` (por `fecha` descendente)
  - `egresadosDelDirectorio(): Promise<CollectionEntry<'personas'>[]>` (por `nombre`, locale `es`)

- [ ] **Step 1: Agregar las consultas**

Al inicio de `app/web/src/lib/contenido.ts`, junto al import existente, agregar:

```ts
import { actividadEsProxima, anuncioVigente, estaVigente } from './reglas';
```

Al final del archivo agregar:

```ts
// ── Consultas para las páginas ("ahora" = momento del build) ─────────

export async function bannerVigente(ahora = new Date()) {
  const vigentes = (await publicados('banners')).filter((b) => estaVigente(b.data, ahora));
  return vigentes.sort((a, b) => b.data.inicio.valueOf() - a.data.inicio.valueOf())[0];
}

export async function noticiasRecientes(cantidad = 3) {
  const noticias = await publicados('noticias');
  return noticias.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf()).slice(0, cantidad);
}

export async function proximasActividades(ahora = new Date()) {
  const actividades = (await publicados('actividades')).filter((a) => actividadEsProxima(a.data, ahora));
  return actividades.sort((a, b) => a.data.inicio.valueOf() - b.data.inicio.valueOf());
}

export async function anunciosVigentes(ahora = new Date()) {
  const anuncios = (await publicados('anuncios')).filter((a) => anuncioVigente(a.data, ahora));
  return anuncios.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}

/** Personas con Perfil de egresado autorizado y Ficha activa. */
export async function egresadosDelDirectorio() {
  const personas = await getCollection(
    'personas',
    ({ data }) => data.ficha_activa && data.perfil_egresado?.autorizado === true,
  );
  return personas.sort((a, b) => a.data.nombre.localeCompare(b.data.nombre, 'es'));
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx astro check && npm test`
Expected: 0 errors; tests de Task 2 siguen pasando.

- [ ] **Step 3: Commit**

```bash
git add src/lib/contenido.ts
git commit -m "Agrega consultas de Inicio y Directorio a lib/contenido"
```

---

### Task 4: Contenido de ejemplo

**Files:**
- Create: archivos en `app/web/src/content/{areas,organizaciones,personas,noticias,actividades,anuncios,banners}/` y `app/web/src/assets/media/ejemplo-{azul,verde,gris}.png`

**Interfaces:**
- Produces: ids de ejemplo usados en la verificación de tareas siguientes: Personas `ana-perez` (egresada, Ficha activa), `juan-soto` (Ficha desactivada), `sofia-munoz` (egresada sin `generacion`); Banner vigente `bienvenida-bioing`.

- [ ] **Step 1: Imágenes de ejemplo**

Run (desde `app/web`):

```bash
python3 - <<'EOF'
import zlib, struct
def png(w, h, rgb):
    raw = b''.join(b'\x00' + bytes(rgb) * w for _ in range(h))
    c = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + c(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + c(b'IDAT', zlib.compress(raw)) + c(b'IEND', b'')
for nombre, rgb in {'azul': (0, 102, 204), 'verde': (52, 132, 92), 'gris': (110, 110, 115)}.items():
    open(f'src/assets/media/ejemplo-{nombre}.png', 'wb').write(png(1200, 675, rgb))
EOF
```

- [ ] **Step 2: Áreas y Organizaciones**

```bash
cd src/content
for a in "acuicultura:Acuicultura" "industria-alimentaria:Industria alimentaria" "salud:Salud" "medio-ambiente:Medio ambiente"; do
  printf 'nombre: %s\n' "${a#*:}" > "areas/${a%%:*}.yml"
done
cat > organizaciones/acuicola-del-sur-ejemplo.yml <<'EOF'
nombre: Acuícola del Sur (ejemplo)
tipo: empresa
EOF
cat > organizaciones/alimentos-bio-ejemplo.yml <<'EOF'
nombre: Alimentos Bío (ejemplo)
tipo: empresa
EOF
cat > organizaciones/centro-de-estudiantes-bioingenieria.yml <<'EOF'
nombre: Centro de Estudiantes de Bioingeniería
tipo: agrupacion
EOF
cd ../..
```

- [ ] **Step 3: Personas (9 nuevas; `ana-perez` y `juan-soto` ya existen)**

Run desde `app/web/src/content/personas`:

```bash
p() { # id nombre descripcion generacion anio area organizacion cargo
  { echo "nombre: $2"; echo "descripcion: $3"; echo "perfil_egresado:"; echo "  autorizado: true"
    [ -n "$4" ] && echo "  generacion: $4"
    echo "  anio_egreso: $5"; echo "  areas:"; echo "    - $6"; echo "  organizacion: $7"; echo "  cargo: $8"; } > "$1.yml"; }
p sofia-munoz "Sofía Muñoz" "Bioingeniera" "" 2021 salud laboratorio-de-biomateriales-udec "Investigadora asistente"
p diego-rojas "Diego Rojas" "Bioingeniero" 2012 2018 acuicultura acuicola-del-sur-ejemplo "Jefe de producción"
p camila-herrera "Camila Herrera" "Bioingeniera" 2014 2020 industria-alimentaria alimentos-bio-ejemplo "Ingeniera de procesos"
p matias-vargas "Matías Vargas" "Bioingeniero" 2010 2016 medio-ambiente acuicola-del-sur-ejemplo "Encargado ambiental"
p valentina-castro "Valentina Castro" "Bioingeniera" 2015 2021 biomateriales laboratorio-de-biomateriales-udec "Tesista de doctorado"
p tomas-reyes "Tomás Reyes" "Bioingeniero" 2011 2017 industria-alimentaria alimentos-bio-ejemplo "Gerente de calidad"
p fernanda-silva "Fernanda Silva" "Bioingeniera" 2013 2019 salud laboratorio-de-biomateriales-udec "Investigadora"
cat > ignacio-morales.yml <<'EOF'
nombre: Ignacio Morales
descripcion: Egresado que no autorizó publicar su perfil
perfil_egresado:
  autorizado: false
  anio_egreso: 2019
EOF
cat > profesora-lopez.yml <<'EOF'
nombre: Carolina López
descripcion: Académica FCB
EOF
```

Luego agregar `generacion: 2013` a `ana-perez.yml` (dentro de `perfil_egresado`, antes de `anio_egreso`).

- [ ] **Step 4: Actividades (2 nuevas; el seminario de abril 2027 ya existe)**

Run desde `app/web/src/content/actividades`:

```bash
cat > charla-acuicultura-sostenible.md <<'EOF'
---
titulo: Charla de acuicultura sostenible
publicado: true
tipo: charla
inicio: 2026-06-12T17:00:00-04:00
modalidad: hibrida
lugar: Sala 201, FCB
organizadores:
  - tipo: persona
    persona: profesora-lopez
expositores:
  - diego-rojas
areas:
  - acuicultura
---
Contenido de ejemplo. Borrar cuando haya contenido real.
EOF
cat > encuentro-de-egresados-2026.md <<'EOF'
---
titulo: Encuentro de egresados 2026
publicado: true
tipo: encuentro
inicio: 2026-11-20T19:00:00-03:00
modalidad: presencial
lugar: Casa del Deporte UdeC
organizadores:
  - tipo: organizacion
    organizacion: centro-de-estudiantes-bioingenieria
  - tipo: persona
    persona: camila-herrera
imagen: ../../assets/media/ejemplo-verde.png
---
Contenido de ejemplo. Borrar cuando haya contenido real.
EOF
```

- [ ] **Step 5: Noticias (3 nuevas; hay 2 existentes)**

Run desde `app/web/src/content/noticias`:

```bash
n() { # id titulo fecha imagen personas(csv) actividad
  { echo "---"; echo "titulo: $2"; echo "fecha: $3"; echo "publicado: true"
    [ -n "$4" ] && echo "imagen: ../../assets/media/$4"
    echo "temas:"; echo "  - logros"; echo "personas_mencionadas:"
    for x in ${5//,/ }; do echo "  - $x"; done
    [ -n "$6" ] && echo "actividad: $6"
    echo "---"; echo "Contenido de ejemplo. Borrar cuando haya contenido real."; } > "$1.md"; }
n charla-acuicultura-convoca-estudiantes "Charla de acuicultura sostenible convocó a más de 80 estudiantes" 2026-06-15 ejemplo-verde.png diego-rojas,profesora-lopez charla-acuicultura-sostenible
n egresada-premio-innovacion "Egresada obtiene premio de innovación en salud" 2026-08-20 ejemplo-azul.png fernanda-silva,juan-soto ""
n nueva-generacion-bioingenieria "Nueva generación inicia su formación en Bioingeniería" 2026-03-10 "" camila-herrera ""
```

- [ ] **Step 6: Anuncio y Banner vigentes**

```bash
cat > src/content/anuncios/busqueda-ingeniero-procesos.md <<'EOF'
---
titulo: Se busca ingeniero/a de procesos
publicado: true
tipo: trabajo
oferente:
  tipo: organizacion
  organizacion: alimentos-bio-ejemplo
areas:
  - industria-alimentaria
fecha: 2026-09-15
fecha_limite: 2026-12-31
contacto: postulaciones@ejemplo.cl
---
Contenido de ejemplo. Borrar cuando haya contenido real.
EOF
cat > src/content/banners/bienvenida-bioing.yml <<'EOF'
titulo: Bienvenidos a BIOING+
texto: La plataforma de la comunidad de Bioingeniería UdeC.
publicado: true
imagen: ../../assets/media/ejemplo-azul.png
enlace: /directorio
inicio: 2026-09-01T00:00:00-03:00
fin: 2027-06-30T23:59:00-04:00
EOF
```

- [ ] **Step 7: Verificar**

Run: `npx astro check && npm run build 2>&1 | grep -iE "error|invalid content reference|page\(s\) built"`
Expected: 0 errors en check; ninguna línea `Invalid content reference`; build termina.

- [ ] **Step 8: Commit**

```bash
git add src/content src/assets
git commit -m "Agrega contenido de ejemplo para la demo"
```

---

### Task 5: Layout Base, navegación y "Próximamente"

**Files:**
- Create: `app/web/src/lib/navegacion.ts`, `app/web/src/layouts/Base.astro`, `app/web/src/pages/[seccion].astro`
- Modify: `app/web/src/pages/index.astro` (usar Base, contenido provisional)

**Interfaces:**
- Produces:
  - `navegacion.ts`: `export const MENU: { etiqueta: string; href: string; disponible: boolean }[]`, `export const URL_FCB: string`
  - `Base.astro` props: `interface Props { titulo: string; descripcion?: string }`; slot por defecto = contenido de la página.

- [ ] **Step 1: Navegación**

Create `app/web/src/lib/navegacion.ts`:

```ts
// Menú principal (propuesta, sección 3). disponible: false → página "Próximamente".
export const MENU = [
  { etiqueta: 'Inicio', href: '/', disponible: true },
  { etiqueta: '¿Qué es la Bioingeniería?', href: '/bioingenieria', disponible: false },
  { etiqueta: 'Noticias', href: '/noticias', disponible: false },
  { etiqueta: 'Agenda', href: '/agenda', disponible: false },
  { etiqueta: 'Instagram', href: '/instagram', disponible: false },
  { etiqueta: 'Directorio', href: '/directorio', disponible: true },
  { etiqueta: 'Anuncios', href: '/anuncios', disponible: false },
  { etiqueta: 'Repositorio', href: '/repositorio', disponible: false },
];

// Pendiente de confirmar con el equipo BIOING+ la URL exacta de la FCB.
export const URL_FCB = 'https://www.udec.cl';
```

- [ ] **Step 2: Layout Base**

Create `app/web/src/layouts/Base.astro`:

```astro
---
import '@/styles/starwind.css';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/starwind/sheet';
import IconMenu from '@tabler/icons/outline/menu-2.svg';
import { MENU, URL_FCB } from '@/lib/navegacion';

interface Props { titulo: string; descripcion?: string }
const { titulo, descripcion = 'Plataforma de la comunidad de Bioingeniería de la Universidad de Concepción.' } = Astro.props;
const actual = Astro.url.pathname;
const esActual = (href: string) => (href === '/' ? actual === '/' : actual.startsWith(href));
---
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={descripcion} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{titulo === 'BIOING+' ? titulo : `${titulo} · BIOING+`}</title>
  </head>
  <body class="min-h-screen flex flex-col">
    <a href="#contenido" class="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:p-2 focus:bg-background">Saltar al contenido</a>
    <header class="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <a href="/" class="font-semibold tracking-tight text-lg">BIOING+</a>
        <nav aria-label="Principal" class="hidden lg:flex flex-1 items-center gap-5 text-sm">
          {MENU.map((item) => (
            <a href={item.href} aria-current={esActual(item.href) ? 'page' : undefined}
               class:list={['hover:text-primary', esActual(item.href) ? 'text-primary' : 'text-foreground']}>
              {item.etiqueta}
            </a>
          ))}
        </nav>
        <a href={URL_FCB} class="ml-auto hidden lg:inline text-sm text-muted-foreground hover:text-primary">FCB UdeC ↗</a>
        <div class="ml-auto lg:hidden">
          <Sheet>
            <SheetTrigger aria-label="Abrir menú" class="p-2"><IconMenu aria-hidden="true" /></SheetTrigger>
            <SheetContent side="left">
              <SheetHeader><SheetTitle>BIOING+</SheetTitle></SheetHeader>
              <nav aria-label="Principal (móvil)" class="grid gap-1 px-4">
                {MENU.map((item) => (
                  <SheetClose asChild>
                    <a href={item.href} aria-current={esActual(item.href) ? 'page' : undefined}
                       class="rounded-md px-2 py-2 hover:bg-muted">{item.etiqueta}</a>
                  </SheetClose>
                ))}
                <a href={URL_FCB} class="mt-4 px-2 py-2 text-muted-foreground">Facultad de Ciencias Biológicas ↗</a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

    <main id="contenido" class="flex-1">
      <slot />
    </main>

    <footer class="bg-muted text-sm">
      <div class="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p class="font-semibold">BIOING+</p>
          <p class="text-muted-foreground">FCB UdeC · Universidad de Concepción</p>
        </div>
        <nav aria-label="Pie de página" class="grid gap-1">
          <a href={URL_FCB} class="hover:text-primary">Facultad de Ciencias Biológicas</a>
          <a href="/instagram" class="hover:text-primary">Instagram</a>
          <a href="/directorio" class="hover:text-primary">Directorio de egresados/as</a>
        </nav>
        <p class="text-muted-foreground">Contacto: pendiente de definir con el equipo BIOING+.</p>
      </div>
    </footer>
  </body>
</html>
```

- [ ] **Step 3: Página "Próximamente"**

Create `app/web/src/pages/[seccion].astro`:

```astro
---
import Base from '@/layouts/Base.astro';
import { MENU } from '@/lib/navegacion';

export function getStaticPaths() {
  return MENU.filter((i) => !i.disponible).map((i) => ({
    params: { seccion: i.href.slice(1) },
    props: { etiqueta: i.etiqueta },
  }));
}
const { etiqueta } = Astro.props;
---
<Base titulo={etiqueta}>
  <section class="mx-auto max-w-3xl px-4 py-24 text-center">
    <h1 class="text-4xl font-semibold tracking-tight">{etiqueta}</h1>
    <p class="mt-4 text-muted-foreground">Esta sección estará disponible próximamente.</p>
  </section>
</Base>
```

- [ ] **Step 4: Inicio provisional con Base**

Replace `app/web/src/pages/index.astro` con:

```astro
---
import Base from '@/layouts/Base.astro';
---
<Base titulo="BIOING+">
  <section class="mx-auto max-w-6xl px-4 py-24">
    <h1 class="text-5xl font-semibold tracking-tight">BIOING+</h1>
  </section>
</Base>
```

- [ ] **Step 5: Verificar**

Run: `npx astro check && npm run build && ls dist/agenda dist/repositorio && grep -c 'aria-current="page"' dist/agenda/index.html`
Expected: 0 errors; existen `dist/agenda/index.html` y `dist/repositorio/index.html`; el grep cuenta ≥ 1.

Luego con `npm run dev` (en segundo plano: `npx astro dev --background`) abrir `http://localhost:4321/` en el navegador a 1280 px y 390 px de ancho: el menú se ve completo en escritorio; en móvil el botón abre el panel lateral, Escape lo cierra y el foco vuelve al botón.

- [ ] **Step 6: Commit**

```bash
git add src/lib/navegacion.ts src/layouts/Base.astro "src/pages/[seccion].astro" src/pages/index.astro
git commit -m "Agrega layout Base con menú fijo, menú móvil, footer y páginas Próximamente"
```

---

### Task 6: Componentes propios

**Files:**
- Create: `app/web/src/components/{EnlaceFicha,Banner,TarjetaNoticia,TarjetaActividad,TarjetaAnuncio,TarjetaEgresado}.astro`

**Interfaces:**
- Consumes: `formatoFecha`, `formatoFechaHora` de `contenido.ts`; `CollectionEntry` de `astro:content`.
- Produces (props):
  - `EnlaceFicha`: `{ coleccion: 'personas' | 'organizaciones'; entrada: CollectionEntry<'personas'> | CollectionEntry<'organizaciones'> }` → `<a>` a la Ficha si `ficha_activa`, si no `<span>`. Solo existe la ruta de Personas; para Organizaciones siempre `<span>` hasta que exista su Ficha.
  - `Banner`: `{ banner: CollectionEntry<'banners'> }`
  - `TarjetaNoticia`: `{ noticia: CollectionEntry<'noticias'> }`
  - `TarjetaActividad`: `{ actividad: CollectionEntry<'actividades'> }`
  - `TarjetaAnuncio`: `{ anuncio: CollectionEntry<'anuncios'> }`
  - `TarjetaEgresado`: `{ persona: CollectionEntry<'personas'>; areas: string[]; organizacion?: string }` (nombres ya resueltos) — renderiza `<li>` con `data-nombre`, `data-generacion`, `data-areas`, `data-organizacion` para el filtro.

- [ ] **Step 1: EnlaceFicha**

```astro
---
// app/web/src/components/EnlaceFicha.astro
import type { CollectionEntry } from 'astro:content';

interface Props {
  coleccion: 'personas' | 'organizaciones';
  entrada: CollectionEntry<'personas'> | CollectionEntry<'organizaciones'>;
}
const { coleccion, entrada } = Astro.props;
// Por ahora solo existe la Ficha de Persona (la de Organización está fuera de alcance).
const href = coleccion === 'personas' && entrada.data.ficha_activa ? `/personas/${entrada.id}` : undefined;
---
{href ? <a href={href} class="text-primary hover:underline">{entrada.data.nombre}</a> : <span>{entrada.data.nombre}</span>}
```

- [ ] **Step 2: Banner**

```astro
---
// app/web/src/components/Banner.astro
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { Button } from '@/components/starwind/button';

interface Props { banner: CollectionEntry<'banners'> }
const { banner } = Astro.props;
const externo = /^https?:\/\//.test(banner.data.enlace);
---
<section class="relative isolate overflow-hidden bg-foreground text-background">
  <Image src={banner.data.imagen} alt="" class="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" widths={[640, 1280, 1920]} sizes="100vw" priority />
  <div class="mx-auto max-w-6xl px-4 py-24 text-center">
    <h1 class="text-4xl font-semibold tracking-tight sm:text-6xl">{banner.data.titulo}</h1>
    {banner.data.texto && <p class="mx-auto mt-4 max-w-2xl text-lg opacity-90">{banner.data.texto}</p>}
    <Button href={banner.data.enlace} class="mt-8 rounded-full" {...(externo ? { target: '_blank', rel: 'noopener' } : {})}>Ver más</Button>
  </div>
</section>
```

- [ ] **Step 3: TarjetaNoticia, TarjetaActividad, TarjetaAnuncio**

```astro
---
// app/web/src/components/TarjetaNoticia.astro
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { formatoFecha } from '@/lib/contenido';

interface Props { noticia: CollectionEntry<'noticias'> }
const { noticia } = Astro.props;
---
<article class="overflow-hidden rounded-lg border border-border bg-card">
  {noticia.data.imagen
    ? <Image src={noticia.data.imagen} alt="" class="aspect-video w-full object-cover" widths={[400, 800]} sizes="(min-width: 768px) 33vw, 100vw" />
    : <div class="aspect-video w-full bg-muted" aria-hidden="true"></div>}
  <div class="p-5">
    <p class="text-sm text-muted-foreground"><time datetime={noticia.data.fecha.toISOString().slice(0, 10)}>{formatoFecha(noticia.data.fecha)}</time></p>
    <h3 class="mt-1 text-lg font-semibold leading-snug"><a href={`/noticias/${noticia.id}`} class="hover:text-primary">{noticia.data.titulo}</a></h3>
    {noticia.data.bajada && <p class="mt-2 text-sm text-muted-foreground">{noticia.data.bajada}</p>}
  </div>
</article>
```

```astro
---
// app/web/src/components/TarjetaActividad.astro
import type { CollectionEntry } from 'astro:content';
import { Badge } from '@/components/starwind/badge';
import { formatoFechaHora } from '@/lib/contenido';

interface Props { actividad: CollectionEntry<'actividades'> }
const { actividad } = Astro.props;
const MODALIDAD = { presencial: 'Presencial', 'en-linea': 'En línea', hibrida: 'Híbrida' } as const;
---
<article class="rounded-lg border border-border bg-card p-5">
  <p class="text-sm font-medium text-primary"><time datetime={actividad.data.inicio.toISOString()}>{formatoFechaHora(actividad.data.inicio)}</time></p>
  <h3 class="mt-1 text-lg font-semibold leading-snug">{actividad.data.titulo}</h3>
  <p class="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
    <Badge variant="default">{MODALIDAD[actividad.data.modalidad]}</Badge>
    {actividad.data.lugar && <span>{actividad.data.lugar}</span>}
  </p>
</article>
```

```astro
---
// app/web/src/components/TarjetaAnuncio.astro
import type { CollectionEntry } from 'astro:content';
import { Badge } from '@/components/starwind/badge';
import { formatoFecha } from '@/lib/contenido';

interface Props { anuncio: CollectionEntry<'anuncios'> }
const { anuncio } = Astro.props;
const TIPO = {
  trabajo: 'Trabajo', practica: 'Práctica', pasantia: 'Pasantía', proyecto: 'Proyecto',
  convocatoria: 'Convocatoria', colaboracion: 'Colaboración', otra: 'Oportunidad',
} as const;
---
<article class="rounded-lg border border-border bg-card p-5">
  <Badge variant="default">{TIPO[anuncio.data.tipo]}</Badge>
  <h3 class="mt-2 text-lg font-semibold leading-snug">{anuncio.data.titulo}</h3>
  {anuncio.data.fecha_limite && <p class="mt-1 text-sm text-muted-foreground">Postula hasta el {formatoFecha(anuncio.data.fecha_limite)}</p>}
  <p class="mt-2 text-sm">Contacto: {anuncio.data.contacto}</p>
</article>
```

- [ ] **Step 4: TarjetaEgresado**

```astro
---
// app/web/src/components/TarjetaEgresado.astro
import type { CollectionEntry } from 'astro:content';
import { normalizar } from '@/lib/reglas';

interface Props { persona: CollectionEntry<'personas'>; areas: string[]; organizacion?: string }
const { persona, areas, organizacion } = Astro.props;
const perfil = persona.data.perfil_egresado!;
---
<li class="rounded-lg border border-border bg-card p-5"
    data-nombre={normalizar(persona.data.nombre)}
    data-generacion={perfil.generacion?.toString() ?? ''}
    data-areas={(perfil.areas ?? []).map((a) => a.id).join(' ')}
    data-organizacion={perfil.organizacion?.id ?? ''}>
  <h3 class="font-semibold"><a href={`/personas/${persona.id}`} class="hover:text-primary">{persona.data.nombre}</a></h3>
  <p class="mt-1 text-sm text-muted-foreground">
    {[perfil.cargo, organizacion].filter(Boolean).join(' · ')}
  </p>
  <p class="mt-2 text-xs text-muted-foreground">
    {perfil.generacion ? `Generación ${perfil.generacion} · ` : ''}Egreso {perfil.anio_egreso}{areas.length > 0 && ` · ${areas.join(', ')}`}
  </p>
</li>
```

- [ ] **Step 5: Verificar tipos**

Run: `npx astro check`
Expected: 0 errors. Si `Badge` no acepta `variant="default"`, revisar las variantes en `src/components/starwind/badge/Badge.astro` y usar la variante base que exista. Si `Button` no acepta `href` (no renderiza un `<a>`), reemplazarlo en `Banner.astro` por `<a href=… class="mt-8 inline-block rounded-full bg-primary px-6 py-2 text-primary-foreground hover:opacity-90">Ver más</a>`.

- [ ] **Step 6: Commit**

```bash
git add src/components/*.astro
git commit -m "Agrega componentes propios: Banner, tarjetas y EnlaceFicha"
```

---

### Task 7: Inicio, detalle de Noticia y Ficha de Persona

**Files:**
- Modify: `app/web/src/pages/index.astro`, `app/web/src/pages/personas/[id].astro`
- Create: `app/web/src/pages/noticias/[id].astro`

**Interfaces:**
- Consumes: `bannerVigente`, `noticiasRecientes`, `proximasActividades`, `anunciosVigentes`, `publicados`, `vinculosDe`, `formatoFecha`, `formatoFechaHora` (contenido.ts); componentes de Task 6; `Base` de Task 5.

- [ ] **Step 1: Inicio**

Replace `app/web/src/pages/index.astro`:

```astro
---
import Base from '@/layouts/Base.astro';
import Banner from '@/components/Banner.astro';
import TarjetaNoticia from '@/components/TarjetaNoticia.astro';
import TarjetaActividad from '@/components/TarjetaActividad.astro';
import TarjetaAnuncio from '@/components/TarjetaAnuncio.astro';
import { anunciosVigentes, bannerVigente, noticiasRecientes, proximasActividades } from '@/lib/contenido';

const [banner, noticias, actividades, anuncios] = await Promise.all([
  bannerVigente(), noticiasRecientes(3), proximasActividades(), anunciosVigentes(),
]);
---
<Base titulo="BIOING+">
  {banner ? <Banner banner={banner} /> : (
    <section class="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 class="text-5xl font-semibold tracking-tight">BIOING+</h1>
      <p class="mt-4 text-lg text-muted-foreground">La comunidad de Bioingeniería de la Universidad de Concepción.</p>
    </section>
  )}

  {noticias.length > 0 && (
    <section class="mx-auto max-w-6xl px-4 py-16">
      <h2 class="text-3xl font-semibold tracking-tight">Noticias recientes</h2>
      <div class="mt-8 grid gap-6 md:grid-cols-3">{noticias.map((n) => <TarjetaNoticia noticia={n} />)}</div>
    </section>
  )}

  {actividades.length > 0 && (
    <section class="bg-muted">
      <div class="mx-auto max-w-6xl px-4 py-16">
        <h2 class="text-3xl font-semibold tracking-tight">Próximas actividades</h2>
        <div class="mt-8 grid gap-6 md:grid-cols-3">{actividades.slice(0, 3).map((a) => <TarjetaActividad actividad={a} />)}</div>
      </div>
    </section>
  )}

  {anuncios.length > 0 && (
    <section class="mx-auto max-w-6xl px-4 py-16">
      <h2 class="text-3xl font-semibold tracking-tight">Anuncios</h2>
      <div class="mt-8 grid gap-6 md:grid-cols-3">{anuncios.slice(0, 3).map((a) => <TarjetaAnuncio anuncio={a} />)}</div>
    </section>
  )}

  <section class="bg-foreground text-background">
    <div class="mx-auto max-w-6xl px-4 py-16 text-center">
      <h2 class="text-3xl font-semibold tracking-tight">Directorio de bioingenieros/as</h2>
      <p class="mx-auto mt-3 max-w-xl opacity-80">Encuentra egresados/as por generación, área y organización.</p>
      <a href="/directorio" class="mt-6 inline-block rounded-full bg-primary px-6 py-2 text-primary-foreground hover:opacity-90">Ir al Directorio</a>
    </div>
  </section>
</Base>
```

- [ ] **Step 2: Detalle de Noticia**

Create `app/web/src/pages/noticias/[id].astro`:

```astro
---
import { getEntries, getEntry, render, type CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import Base from '@/layouts/Base.astro';
import EnlaceFicha from '@/components/EnlaceFicha.astro';
import { formatoFecha, formatoFechaHora, publicados } from '@/lib/contenido';

export async function getStaticPaths() {
  const noticias = await publicados('noticias');
  return noticias.map((noticia) => ({ params: { id: noticia.id }, props: { noticia } }));
}

interface Props { noticia: CollectionEntry<'noticias'> }
const { noticia } = Astro.props;
const { Content } = await render(noticia);
const personas = await getEntries(noticia.data.personas_mencionadas ?? []);
const organizaciones = await getEntries(noticia.data.organizaciones_mencionadas ?? []);
const actividad = noticia.data.actividad ? await getEntry(noticia.data.actividad) : undefined;
const cobertura = actividad?.data.publicado ? actividad : undefined;
---
<Base titulo={noticia.data.titulo} descripcion={noticia.data.bajada}>
  <article class="mx-auto max-w-3xl px-4 py-12">
    <p class="text-sm text-muted-foreground"><time datetime={noticia.data.fecha.toISOString().slice(0, 10)}>{formatoFecha(noticia.data.fecha)}</time></p>
    <h1 class="mt-2 text-4xl font-semibold tracking-tight">{noticia.data.titulo}</h1>
    {noticia.data.bajada && <p class="mt-4 text-xl text-muted-foreground">{noticia.data.bajada}</p>}
    {noticia.data.imagen && <Image src={noticia.data.imagen} alt="" class="mt-8 w-full rounded-lg" widths={[768, 1536]} sizes="(min-width: 768px) 768px, 100vw" />}
    <div class="prose mt-8 max-w-none"><Content /></div>

    {cobertura && (
      <aside class="mt-10 rounded-lg bg-muted p-5">
        <p class="text-sm text-muted-foreground">Cobertura de la actividad</p>
        <p class="font-semibold">{cobertura.data.titulo} · {formatoFechaHora(cobertura.data.inicio)}</p>
      </aside>
    )}

    {(personas.length > 0 || organizaciones.length > 0) && (
      <section class="mt-10 border-t border-border pt-6 text-sm">
        {personas.length > 0 && (
          <p><span class="text-muted-foreground">Personas: </span>
            {personas.map((p, i) => <>{i > 0 && ', '}<EnlaceFicha coleccion="personas" entrada={p} /></>)}
          </p>
        )}
        {organizaciones.length > 0 && (
          <p class="mt-2"><span class="text-muted-foreground">Organizaciones: </span>
            {organizaciones.map((o, i) => <>{i > 0 && ', '}<EnlaceFicha coleccion="organizaciones" entrada={o} /></>)}
          </p>
        )}
      </section>
    )}
  </article>
</Base>
```

Nota: la clase `prose` requiere `@tailwindcss/typography`; si no está instalado, el cuerpo se ve sin estilos de tipografía pero legible. No instalarlo en esta tarea.

- [ ] **Step 3: Ficha de Persona**

Replace `app/web/src/pages/personas/[id].astro`:

```astro
---
import { getCollection, getEntries, getEntry, type CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import Base from '@/layouts/Base.astro';
import TarjetaNoticia from '@/components/TarjetaNoticia.astro';
import TarjetaActividad from '@/components/TarjetaActividad.astro';
import TarjetaAnuncio from '@/components/TarjetaAnuncio.astro';
import { vinculosDe } from '@/lib/contenido';

export async function getStaticPaths() {
  const personas = await getCollection('personas', ({ data }) => data.ficha_activa);
  return personas.map((persona) => ({ params: { id: persona.id }, props: { persona } }));
}

interface Props { persona: CollectionEntry<'personas'> }
const { persona } = Astro.props;
const perfil = persona.data.perfil_egresado?.autorizado ? persona.data.perfil_egresado : undefined;
const organizacion = perfil?.organizacion ? await getEntry(perfil.organizacion) : undefined;
const areas = perfil?.areas ? await getEntries(perfil.areas) : [];
const { noticias, organiza, expone, ofrece } = await vinculosDe('personas', persona.id);
---
<Base titulo={persona.data.nombre}>
  <section class="bg-muted">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center">
      {persona.data.foto
        ? <Image src={persona.data.foto} alt={persona.data.nombre} width={160} height={160} class="h-40 w-40 rounded-full object-cover" />
        : <div class="flex h-40 w-40 items-center justify-center rounded-full bg-background text-5xl font-semibold text-muted-foreground" aria-hidden="true">{persona.data.nombre.charAt(0)}</div>}
      <div>
        <h1 class="text-4xl font-semibold tracking-tight">{persona.data.nombre}</h1>
        {persona.data.descripcion && <p class="mt-2 text-lg text-muted-foreground">{persona.data.descripcion}</p>}
        {perfil && (
          <dl class="mt-4 grid gap-1 text-sm">
            {perfil.cargo && <div><dt class="inline text-muted-foreground">Cargo: </dt><dd class="inline">{perfil.cargo}{organizacion && ` · ${organizacion.data.nombre}`}</dd></div>}
            <div><dt class="inline text-muted-foreground">Egreso: </dt><dd class="inline">{perfil.anio_egreso}{perfil.generacion && ` (generación ${perfil.generacion})`}</dd></div>
            {areas.length > 0 && <div><dt class="inline text-muted-foreground">Áreas: </dt><dd class="inline">{areas.map((a) => a.data.nombre).join(', ')}</dd></div>}
            {perfil.enlaces?.map((e) => <div><dd><a href={e.url} class="text-primary hover:underline" rel="noopener" target="_blank">{e.etiqueta} ↗</a></dd></div>)}
          </dl>
        )}
      </div>
    </div>
  </section>

  <div class="mx-auto max-w-6xl px-4 py-12 grid gap-12">
    {expone.length > 0 && <section><h2 class="text-2xl font-semibold">Expuso en</h2><div class="mt-6 grid gap-6 md:grid-cols-3">{expone.map((a) => <TarjetaActividad actividad={a} />)}</div></section>}
    {organiza.length > 0 && <section><h2 class="text-2xl font-semibold">Organizó</h2><div class="mt-6 grid gap-6 md:grid-cols-3">{organiza.map((a) => <TarjetaActividad actividad={a} />)}</div></section>}
    {noticias.length > 0 && <section><h2 class="text-2xl font-semibold">Noticias</h2><div class="mt-6 grid gap-6 md:grid-cols-3">{noticias.map((n) => <TarjetaNoticia noticia={n} />)}</div></section>}
    {ofrece.length > 0 && <section><h2 class="text-2xl font-semibold">Oportunidades que ofrece</h2><div class="mt-6 grid gap-6 md:grid-cols-3">{ofrece.map((a) => <TarjetaAnuncio anuncio={a} />)}</div></section>}
  </div>
</Base>
```

- [ ] **Step 4: Verificar en el HTML generado**

Run:

```bash
npx astro check && npm run build
grep -c 'Noticias recientes' dist/index.html
grep -o 'href="/personas/fernanda-silva"' dist/noticias/egresada-premio-innovacion/index.html
grep -c 'href="/personas/juan-soto"' dist/noticias/egresada-premio-innovacion/index.html
grep -o 'Juan Soto' dist/noticias/egresada-premio-innovacion/index.html
test ! -e dist/personas/juan-soto && echo "sin ficha: ok"
grep -o 'Cobertura de la actividad' dist/noticias/charla-acuicultura-convoca-estudiantes/index.html
grep -c 'generación' dist/personas/ignacio-morales/index.html
```

Expected: `1`; el enlace a fernanda-silva aparece; `0` enlaces a juan-soto; el texto `Juan Soto` sí aparece; `sin ficha: ok`; aparece `Cobertura de la actividad`; `0` (Ignacio no autorizó: su Ficha no muestra datos de egresado).

- [ ] **Step 5: Revisión visual**

Con el servidor de desarrollo corriendo, capturar `/`, `/noticias/egresada-premio-innovacion` y `/personas/ana-perez` a 1280 px y 390 px. Verificar: nada se desborda horizontalmente; el Banner muestra título legible sobre la imagen; las secciones vacías no aparecen.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro src/pages/noticias src/pages/personas
git commit -m "Agrega Inicio, detalle de Noticia y Ficha de Persona"
```

---

### Task 8: Directorio con filtros (TDD del filtro)

**Files:**
- Create: `app/web/src/lib/filtro-directorio.ts`, `app/web/src/lib/filtro-directorio.test.ts`, `app/web/src/pages/directorio.astro`

**Interfaces:**
- Consumes: `normalizar` (Task 2), `egresadosDelDirectorio` (Task 3), `TarjetaEgresado` (Task 6), `Base` (Task 5).
- Produces:
  - `TODAS = 'todas'`
  - `interface DatosTarjeta { nombre: string; generacion: string; areas: string[]; organizacion: string }` (`nombre` ya normalizado)
  - `interface Filtros { texto: string; generacion: string; area: string; organizacion: string }`
  - `coincide(t: DatosTarjeta, f: Filtros): boolean`

- [ ] **Step 1: Tests del filtro**

Create `app/web/src/lib/filtro-directorio.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { coincide, TODAS, type DatosTarjeta, type Filtros } from './filtro-directorio';

const ana: DatosTarjeta = { nombre: 'ana perez', generacion: '2013', areas: ['biomateriales'], organizacion: 'laboratorio-de-biomateriales-udec' };
const sofia: DatosTarjeta = { nombre: 'sofia munoz', generacion: '', areas: ['salud'], organizacion: 'laboratorio-de-biomateriales-udec' };
const sinFiltros: Filtros = { texto: '', generacion: TODAS, area: TODAS, organizacion: TODAS };

describe('coincide', () => {
  test('sin filtros coincide todo, incluso sin generación', () => {
    expect(coincide(ana, sinFiltros)).toBe(true);
    expect(coincide(sofia, sinFiltros)).toBe(true);
  });
  test('texto con tildes y mayúsculas encuentra el nombre normalizado', () => {
    expect(coincide(ana, { ...sinFiltros, texto: 'PÉREZ' })).toBe(true);
    expect(coincide(sofia, { ...sinFiltros, texto: 'Pérez' })).toBe(false);
  });
  test('filtrar por generación excluye a quien no tiene generación', () => {
    expect(coincide(ana, { ...sinFiltros, generacion: '2013' })).toBe(true);
    expect(coincide(sofia, { ...sinFiltros, generacion: '2013' })).toBe(false);
  });
  test('área: basta con que tenga una de sus áreas', () => {
    expect(coincide({ ...ana, areas: ['salud', 'biomateriales'] }, { ...sinFiltros, area: 'biomateriales' })).toBe(true);
    expect(coincide(ana, { ...sinFiltros, area: 'salud' })).toBe(false);
  });
  test('los filtros se combinan con Y', () => {
    const f = { ...sinFiltros, organizacion: 'laboratorio-de-biomateriales-udec', area: 'salud' };
    expect(coincide(sofia, f)).toBe(true);
    expect(coincide(ana, f)).toBe(false);
  });
});
```

- [ ] **Step 2: Correr y ver que falla**

Run: `npm test`
Expected: FAIL — no existe `./filtro-directorio`.

- [ ] **Step 3: Implementar el filtro**

Create `app/web/src/lib/filtro-directorio.ts`:

```ts
// Filtro del Directorio. Puro: lo usan el test y el <script> de /directorio.
import { normalizar } from './reglas';

export const TODAS = 'todas';

export interface DatosTarjeta { nombre: string; generacion: string; areas: string[]; organizacion: string }
export interface Filtros { texto: string; generacion: string; area: string; organizacion: string }

export function coincide(t: DatosTarjeta, f: Filtros): boolean {
  const texto = normalizar(f.texto);
  return (
    (texto === '' || t.nombre.includes(texto)) &&
    (f.generacion === TODAS || t.generacion === f.generacion) &&
    (f.area === TODAS || t.areas.includes(f.area)) &&
    (f.organizacion === TODAS || t.organizacion === f.organizacion)
  );
}
```

- [ ] **Step 4: Correr y ver que pasa**

Run: `npm test`
Expected: PASS (tests de Task 2 + 5 de este archivo).

- [ ] **Step 5: Página del Directorio**

Create `app/web/src/pages/directorio.astro`:

```astro
---
import { getEntries, getEntry } from 'astro:content';
import Base from '@/layouts/Base.astro';
import TarjetaEgresado from '@/components/TarjetaEgresado.astro';
import { Input } from '@/components/starwind/input';
import { Label } from '@/components/starwind/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/starwind/select';
import { egresadosDelDirectorio } from '@/lib/contenido';
import { TODAS } from '@/lib/filtro-directorio';

const egresados = await Promise.all(
  (await egresadosDelDirectorio()).map(async (persona) => {
    const perfil = persona.data.perfil_egresado!;
    const areas = perfil.areas ? await getEntries(perfil.areas) : [];
    const organizacion = perfil.organizacion ? await getEntry(perfil.organizacion) : undefined;
    return { persona, areas, organizacion };
  }),
);

const unicos = <T,>(xs: T[], clave: (x: T) => string) => [...new Map(xs.map((x) => [clave(x), x])).values()];
const generaciones = [...new Set(egresados.map((e) => e.persona.data.perfil_egresado!.generacion).filter((g): g is number => g !== undefined))].sort();
const areas = unicos(egresados.flatMap((e) => e.areas), (a) => a.id).sort((a, b) => a.data.nombre.localeCompare(b.data.nombre, 'es'));
const organizaciones = unicos(egresados.flatMap((e) => (e.organizacion ? [e.organizacion] : [])), (o) => o.id).sort((a, b) => a.data.nombre.localeCompare(b.data.nombre, 'es'));
---
<Base titulo="Directorio" descripcion="Directorio de bioingenieros/as egresados/as de la Universidad de Concepción.">
  <section class="mx-auto max-w-6xl px-4 py-12">
    <h1 class="text-4xl font-semibold tracking-tight">Directorio de bioingenieros/as</h1>
    <p class="mt-2 text-muted-foreground">Egresados/as que autorizaron publicar su perfil.</p>

    <form id="filtros" class="mt-8 grid gap-4 md:grid-cols-4" role="search" onsubmit="return false">
      <div class="grid gap-2">
        <Label for="texto">Nombre</Label>
        <Input id="texto" name="texto" type="search" placeholder="Buscar por nombre" autocomplete="off" />
      </div>
      <div class="grid gap-2">
        <Label for="generacion">Generación</Label>
        <Select id="generacion" name="generacion" defaultValue={TODAS}>
          <SelectTrigger class="w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todas</SelectItem>
            {generaciones.map((g) => <SelectItem value={String(g)}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div class="grid gap-2">
        <Label for="area">Área</Label>
        <Select id="area" name="area" defaultValue={TODAS}>
          <SelectTrigger class="w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todas</SelectItem>
            {areas.map((a) => <SelectItem value={a.id}>{a.data.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div class="grid gap-2">
        <Label for="organizacion">Organización</Label>
        <Select id="organizacion" name="organizacion" defaultValue={TODAS}>
          <SelectTrigger class="w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todas</SelectItem>
            {organizaciones.map((o) => <SelectItem value={o.id}>{o.data.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </form>

    <p id="contador" class="mt-6 text-sm text-muted-foreground" aria-live="polite">{egresados.length} egresados/as</p>
    <ul id="resultados" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {egresados.map((e) => (
        <TarjetaEgresado persona={e.persona} areas={e.areas.map((a) => a.data.nombre)} organizacion={e.organizacion?.data.nombre} />
      ))}
    </ul>
    <p id="sin-resultados" class="mt-8 hidden text-center text-muted-foreground">No hay egresados/as que coincidan con los filtros.</p>
  </section>
</Base>

<script>
  import { coincide, TODAS, type Filtros } from '@/lib/filtro-directorio';

  const form = document.querySelector<HTMLFormElement>('#filtros')!;
  const tarjetas = [...document.querySelectorAll<HTMLLIElement>('#resultados > li')];
  const contador = document.querySelector('#contador')!;
  const sinResultados = document.querySelector('#sin-resultados')!;

  function aplicar() {
    const d = new FormData(form);
    const valor = (k: string) => (d.get(k) as string | null) || TODAS;
    const filtros: Filtros = {
      texto: (d.get('texto') as string | null) ?? '',
      generacion: valor('generacion'),
      area: valor('area'),
      organizacion: valor('organizacion'),
    };
    let visibles = 0;
    for (const li of tarjetas) {
      const ok = coincide({
        nombre: li.dataset.nombre ?? '',
        generacion: li.dataset.generacion ?? '',
        areas: (li.dataset.areas ?? '').split(' ').filter(Boolean),
        organizacion: li.dataset.organizacion ?? '',
      }, filtros);
      li.hidden = !ok;
      if (ok) visibles++;
    }
    contador.textContent = `${visibles} egresados/as`;
    sinResultados.classList.toggle('hidden', visibles > 0);
  }

  form.addEventListener('input', aplicar);
  document.addEventListener('starwind-select:change', () => queueMicrotask(aplicar));
</script>
```

- [ ] **Step 6: Verificar build y HTML**

Run:

```bash
npx astro check && npm test && npm run build
grep -o 'data-nombre="[^"]*"' dist/directorio/index.html | sort
grep -c 'ignacio-morales\|juan-soto\|profesora-lopez' dist/directorio/index.html
```

Expected: 8 `data-nombre` (ana perez, camila herrera, diego rojas, fernanda silva, matias vargas, sofia munoz, tomas reyes, valentina castro); `0` apariciones de personas sin perfil autorizado o sin Ficha. Si hay más, revisar si alguien agregó Personas con perfil autorizado desde el admin y ajustar la cuenta.

- [ ] **Step 7: Verificar el filtro en el navegador**

Con el servidor de desarrollo, en `/directorio`:
1. Escribir `perez` → queda solo Ana Pérez; contador "1 egresados/as".
2. Borrar texto, elegir Área "Salud" → Sofía Muñoz y Fernanda Silva.
3. Además elegir Generación "2013" → solo Fernanda Silva (Sofía no tiene generación).
4. Elegir Organización "Acuícola del Sur (ejemplo)" con Área "Salud" → mensaje "No hay egresados/as que coincidan".
5. Volver todo a "Todas" → aparecen todos.

Si el evento `starwind-select:change` no actualiza el `<select>` oculto antes de leer `FormData` (paso 2 no filtra), cambiar `queueMicrotask(aplicar)` por `setTimeout(aplicar, 0)` y repetir.

- [ ] **Step 8: Commit**

```bash
git add src/lib/filtro-directorio.ts src/lib/filtro-directorio.test.ts src/pages/directorio.astro
git commit -m "Agrega Directorio con filtros por nombre, generación, área y organización"
```

---

### Task 9: Catálogo `/componentes` (solo desarrollo)

**Files:**
- Create: `app/web/src/pages/[...componentes].astro`

**Interfaces:**
- Consumes: componentes de Task 6; `Button`, `Badge`, `Card`, `Input` de Starwind; consultas de Task 3.

- [ ] **Step 1: Página del catálogo**

Create `app/web/src/pages/[...componentes].astro`:

```astro
---
// Catálogo de componentes. Solo existe en `npm run dev`.
import Base from '@/layouts/Base.astro';
import Banner from '@/components/Banner.astro';
import TarjetaNoticia from '@/components/TarjetaNoticia.astro';
import TarjetaActividad from '@/components/TarjetaActividad.astro';
import TarjetaAnuncio from '@/components/TarjetaAnuncio.astro';
import TarjetaEgresado from '@/components/TarjetaEgresado.astro';
import { Button } from '@/components/starwind/button';
import { Badge } from '@/components/starwind/badge';
import { Input } from '@/components/starwind/input';
import { anunciosVigentes, bannerVigente, egresadosDelDirectorio, publicados } from '@/lib/contenido';

export function getStaticPaths() {
  return import.meta.env.DEV ? [{ params: { componentes: 'componentes' } }] : [];
}

const banner = await bannerVigente();
const noticias = await publicados('noticias');
const conImagen = noticias.find((n) => n.data.imagen);
const sinImagen = noticias.find((n) => !n.data.imagen);
const actividad = (await publicados('actividades'))[0];
const anuncio = (await anunciosVigentes())[0];
const egresado = (await egresadosDelDirectorio())[0];
const colores = ['primary', 'background', 'foreground', 'muted', 'muted-foreground', 'border', 'outline'];
---
<Base titulo="Componentes">
  <div class="mx-auto grid max-w-6xl gap-16 px-4 py-12">
    <section>
      <h2 class="text-2xl font-semibold">Colores</h2>
      <div class="mt-4 flex flex-wrap gap-4">
        {colores.map((c) => <div class="text-xs"><div class="h-16 w-24 rounded-lg border border-border" style={`background: var(--${c})`}></div>{c}</div>)}
      </div>
    </section>
    <section>
      <h2 class="text-2xl font-semibold">Tipografía</h2>
      <p class="text-5xl font-semibold tracking-tight">Título principal</p>
      <p class="text-3xl font-semibold tracking-tight">Título de sección</p>
      <p>Texto de cuerpo. <span class="text-muted-foreground">Texto secundario.</span></p>
    </section>
    <section>
      <h2 class="text-2xl font-semibold">Starwind</h2>
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <Button class="rounded-full">Primario</Button>
        <Button variant="outline" class="rounded-full">Contorno</Button>
        <Badge>Badge</Badge>
        <Input placeholder="Input" class="max-w-xs" />
      </div>
    </section>
    {banner && <section><h2 class="text-2xl font-semibold">Banner</h2><div class="mt-4"><Banner banner={banner} /></div></section>}
    <section>
      <h2 class="text-2xl font-semibold">Tarjetas</h2>
      <div class="mt-4 grid gap-6 md:grid-cols-3">
        {conImagen && <TarjetaNoticia noticia={conImagen} />}
        {sinImagen && <TarjetaNoticia noticia={sinImagen} />}
        {actividad && <TarjetaActividad actividad={actividad} />}
        {anuncio && <TarjetaAnuncio anuncio={anuncio} />}
      </div>
      {egresado && <ul class="mt-6 grid gap-4 md:grid-cols-3"><TarjetaEgresado persona={egresado} areas={['Área de ejemplo']} organizacion="Organización de ejemplo" /></ul>}
    </section>
  </div>
</Base>
```

- [ ] **Step 2: Verificar que existe en dev y no en build**

Run:

```bash
npx astro check && npm run build && test ! -e dist/componentes && echo "no publicado: ok"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/componentes
```

Expected: `no publicado: ok`; con el servidor de desarrollo corriendo, `200`.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/[...componentes].astro"
git commit -m "Agrega catálogo /componentes solo para desarrollo"
```

---

### Task 10: Revisión final de accesibilidad y responsive

**Files:**
- Modify: los archivos donde aparezcan problemas.

- [ ] **Step 1: Cargar la guía de revisión**

Leer `/home/bioodev/.claude/skills/astro-framework/references/accessibility-and-review.md` y aplicar su checklist a `Base.astro`, `index.astro`, `noticias/[id].astro`, `personas/[id].astro` y `directorio.astro`.

- [ ] **Step 2: Revisión con el navegador**

Para `/`, `/noticias/egresada-premio-innovacion`, `/personas/ana-perez` y `/directorio`, a 1280 px y 390 px:
- Sin scroll horizontal.
- Recorrido con Tab: foco visible en todos los enlaces, botones y controles; el menú móvil se abre con Enter y se cierra con Escape.
- Contraste: `--muted-foreground` (#6e6e73) sobre `--muted` (#f5f5f7) y sobre blanco debe cumplir 4.5:1 para texto normal; el texto del Banner sobre la imagen debe ser legible.
- Imágenes decorativas con `alt=""`; foto de Persona con su nombre como `alt`.

Corregir lo que falle.

- [ ] **Step 3: Verificación completa**

Run: `npm test && npx astro check && npm run build 2>&1 | grep -iE "error|invalid content reference"; echo "exit grep: $?"`
Expected: tests pasan; 0 errors; el grep no encuentra nada (`exit grep: 1`).

- [ ] **Step 4: Actualizar CLAUDE.md**

En la sección "Comandos" de `CLAUDE.md` (raíz del repo), agregar la línea `npm test             # Vitest: reglas puras en src/lib/*.test.ts` y quitar "No hay tests ni linter todavía." reemplazándolo por "No hay linter todavía.". En la sección "Astro", agregar: "Starwind UI: componentes en `src/components/starwind/` (se agregan con `npx starwind@latest add <nombre>`); el tema está en `src/styles/starwind.css`. Las reglas con fechas o filtros van en módulos puros (`src/lib/reglas.ts`, `src/lib/filtro-directorio.ts`) con tests."

- [ ] **Step 5: Commit y push**

```bash
git add -A
git commit -m "Revisión de accesibilidad y responsive de la demo; actualiza CLAUDE.md"
git push origin main
```
