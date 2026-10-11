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

- SEO: `robots.txt` con `Sitemap:` relativa (Lighthouse la rechaza) → el postbuild la escribe
  absoluta usando `SITE_URL` (misma fuente que `astro.config.mjs`).
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