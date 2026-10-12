# 0005 · Páginas libres creadas desde el panel

- **Estado:** Accepted · 2026-10-11
- **Decisores:** proveedor
- **Contexto relacionado:** `../guia-evolucion.md` §3.5 · `../guia-usuario.md` §4.12

## Contexto

La colección `paginas` es de archivos únicos con una lista fija (`bioingenieria` e `inicio`). Para tener otra
página hacía falta código: una ruta, una entrada en `MENU` y, si debía aparecer en el menú, tocar el navbar. La
carrera pidió poder crear páginas desde el panel, algunas enlazadas desde un Banner y otras dentro del menú
«La carrera» o «Comunidad».

## Decisión

1. **Colección nueva de tipo carpeta** `paginas_libres` (`src/content/paginas-libres/`), creable desde el panel.
   Campos: título, publicado, bajada (obligatoria), imagen con texto alternativo, `mostrar_en` y cuerpo.
2. **URL `/paginas/<slug>`.** El slug lo genera Sveltia a partir del título. Solo las páginas publicadas tienen
   ruta; una página en borrador responde 404.
3. **`mostrar_en`** decide dónde aparece: `ninguno` (solo por enlace, p. ej. desde un Banner), `footer`,
   `la-carrera` o `comunidad`. Los dos últimos la agregan también al pie. Las páginas van después de los
   enlaces fijos del desplegable, ordenadas por título, y su bajada es la descripción del enlace.
4. **Cálculo puro:** `menuConPaginas` y `enlacesFooter` (`src/lib/navegacion.ts`) agregan las páginas a `MENU_PRINCIPAL`
   y a `MENU` sin mutarlos. El navbar y el pie las leen en el build a través de `paginasParaMenu()`.
5. **Banners sin cambio de modelo:** el hint del campo `enlace` menciona `/paginas/…`. Un Banner puede enlazar a
   una página de `ninguno`.
6. **La colección `paginas` no cambia:** ¿Qué es la Bioingeniería? conserva su diseño a medida.

## Consecuencias

- Una página de texto se crea desde el panel, sin tocar código. Igual que el resto del contenido, se publica al
  guardar, tras la reconstrucción del sitio.
- Las páginas libres se indexan en el buscador general (usan `Base`, que marca el contenido para Pagefind).
- Un enlace a `/paginas/<slug>` que queda sin página (borrada o despublicada) **no rompe el build**: el enlace
  de un Banner es texto libre. Hay que revisar los Banners al despublicar una página.
- Cambiar la dirección de una página libre ya enlazada rompe esos enlaces; conviene revisarla antes de enlazarla.
- Un nuevo desplegable, un nuevo valor de `mostrar_en` o un diseño propio **sí** requieren código.

## Alternativas

- **URL `/<nombre>`** (sin prefijo): descartada, choca con las secciones existentes (`/noticias`, `/agenda`…).
- **Selector de página en el Banner** (una relación con `paginas_libres`): descartado por simplicidad; el campo
  de texto basta y el Banner ya acepta URLs externas.
- **Orden manual del menú** (un campo de posición): descartado. El orden alfabético basta y no hay un número que
  mantener.
- **Páginas con diseño especial desde el panel:** descartado; siguen requiriendo código (ver `guia-evolucion.md` §3.5).
