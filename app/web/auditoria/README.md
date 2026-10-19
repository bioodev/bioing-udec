# Auditoría Lighthouse (Fase A — A6)

Resumen de la auditoría de calidad (accesibilidad + rendimiento + buenas prácticas + SEO)
sobre las páginas clave del sitio, ejecutada el 2026-10-11 con Lighthouse 13.5.0 (headless,
viewport móvil), sirviendo `dist/` con `python3 -m http.server 4820 -d dist`.

Puntajes por página (antes → después) en `resumen-lighthouse.csv`. Categorías: rendimiento,
accesibilidad, buenas prácticas y SEO; objetivo ≥ 90 en las cuatro (cumplido).

## Reproducir

```sh
npm run build && npm run postbuild
python3 -m http.server 4820 -d dist
npx lighthouse http://localhost:4820/ --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/lh.json --chrome-flags="--headless=new --no-sandbox"
```

## Hallazgos corregidos (resumen)

- SEO: `robots.txt` con `Sitemap:` relativa (Lighthouse la rechaza) → primero el postbuild la escribía
  absoluta usando `SITE_URL`; desde 2026-10-11 `robots.txt` es una ruta generada
  (`src/pages/robots.txt.ts`) que usa `Astro.site`, y el parche del postbuild se eliminó
  (el archivo estático `public/robots.txt` ganaba al generado).
- SEO/A11y: CTA «Más información» repetido e inespecífico → texto accesible único por actividad
  (`sr-only` con el título).
- A11y: enlaces a Fichas dentro de párrafos muted indistinguibles → subrayado persistente.
- A11y: jerarquía de encabezados en `/instagram` (h1→h3) → `h2` sr-only intermedio; `h1` de
  respaldo en Inicio si no hay Banners.
- A11y: foco visible para enlaces sin indicador propio → regla global `a:focus-visible`.
- A11y: aria-live del buscador Pagefind apuntaba a una clase inexistente (`.pagefind-ui__result-count`)
  → ahora apunta a `.pagefind-ui__message` y observa también cambios de texto.

QA adicional: recorrido por teclado sin trampas de foco (salto al contenido, Select/Combobox
abren con Enter y devuelven el foco con Esc, pestañas de Agenda operables), y sin desbordes
horizontales a 375 px.

## Control rápido (2026-10-18, Bloque 3.1)

Corrida de control con el mismo método de arriba (build local, `python3 -m http.server`, Lighthouse
13.5.0 headless, viewport móvil) para detectar regresiones de las tandas visuales posteriores a la
Fase A. Resultados en `lighthouse-2026-10-18-control.csv`; **no** reemplaza a `resumen-lighthouse.csv`.

Páginas: las 13 del CSV de la Fase A (la de «bioingeniería» ahora es `/p/bioingenieria`) más un
Anuncio individual (`/anuncios/busqueda-ingeniero-procesos`). No es la medición oficial: esa va sobre
el build real de Cloudflare y con el contenido real (`pendientes-infra.md`).

Para separar la regresión real del ruido del entorno, la Fase A se volvió a medir en el mismo equipo
y seguido de la corrida actual (worktree en `df53096` con su propio `npm ci` y build): reprodujo el CSV
tal cual (Inicio 98, Noticias 95…). Las diferencias son del código, no de la máquina.

Hallazgos:

- **Rendimiento**: baja de 4 a 19 puntos en todas las páginas. El peso de la página sube de ~150 KiB a
  ~750 KiB en el Inicio. Causas principales:
  - **Pagefind component UI** (`pagefind-component-ui.js` 172 KiB + `.css` 41 KiB) se descarga en todas
    las páginas por `requestIdleCallback` (`src/scripts/buscador.ts`): es el ítem más grande.
  - **GSAP** 68 KiB más el script del carrusel 42 KiB (animaciones y hero).
  - CSS base de 74 KiB a 104 KiB.
  - Imagen del hero: 86 KiB para una caja de 412 × 512; el `sizes="100vw"` no considera el parallax al
    175 % y `image-delivery-insight` estima 58 KiB de sobra.
- **Noticias**: CLS 0,121 por la animación de entrada de la lista (`data-animar="grilla"`).
- **Instagram**: buenas prácticas 100 → 77 por la cookie de terceros del embed (ADR 0014: se carga al
  acercarse a la tarjeta). Es una consecuencia asumida de esa decisión.
- **Accesibilidad y SEO**: siguen en 100 en todas las páginas.

No se tocó código: ajustar `widths`/`sizes` o diferir la carga de Pagefind es trabajo del Bloque 5
(`pendientes-infra.md`, «Rendimiento con contenido real»). La medición oficial, sobre el build de
Cloudflare, queda para después del Bloque 2.2.