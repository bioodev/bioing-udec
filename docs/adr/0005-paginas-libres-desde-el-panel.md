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
2. **URL `/p/<slug>`.** El slug lo genera Sveltia a partir del título. Solo las páginas publicadas tienen
   ruta; una página en borrador responde 404.
3. **`mostrar_en`** decide dónde aparece: `ninguno` (solo por enlace, p. ej. desde un Banner), `footer`,
   `la-carrera` o `comunidad`. Los dos últimos la agregan también al pie. Las páginas van después de los
   enlaces fijos del desplegable, ordenadas por título, y su bajada es la descripción del enlace.
4. **Cálculo puro:** `menuConPaginas` y `enlacesFooter` (`src/lib/navegacion.ts`) agregan las páginas a `MENU_PRINCIPAL`
   y a `MENU` sin mutarlos. El navbar y el pie las leen en el build a través de `paginasParaMenu()`.
5. **Banners sin cambio de modelo:** el hint del campo `enlace` menciona `/p/…`. Un Banner puede enlazar a
   una página de `ninguno`.
6. **La colección `paginas` no cambia:** ¿Qué es la Bioingeniería? conserva su diseño a medida.

## Consecuencias

- Una página de texto se crea desde el panel, sin tocar código. Igual que el resto del contenido, se publica al
  guardar, tras la reconstrucción del sitio.
- Las páginas libres se indexan en el buscador general (usan `Base`, que marca el contenido para Pagefind).
- Un enlace a `/p/<slug>` que queda sin página (borrada o despublicada) **no rompe el build**: el enlace
  de un Banner es texto libre. Hay que revisar los Banners al despublicar una página.
- Cambiar la dirección de una página libre ya enlazada rompe esos enlaces; conviene revisarla antes de enlazarla.
- Un nuevo desplegable, un nuevo valor de `mostrar_en` o un diseño propio **sí** requieren código.

## Actualización 2026-10-12

- **Campos nuevos (opcionales)** en las Páginas libres, para cualquier página: `video` (enlace de YouTube, se
  muestra con `VideoModal` debajo de la bajada), `bloques_titulo` y `bloques` (lista de `{ titulo, texto }`, en
  una franja oscura después del cuerpo). Con video o bloques, la página usa el diseño de ¿Qué es la
  Bioingeniería?; sin ninguno, queda la columna de texto de siempre.
- **Migración:** ¿Qué es la Bioingeniería? pasa a ser `src/content/paginas-libres/bioingenieria.md` con
  `mostrar_en: la-carrera`. Su página en `/bioingenieria` se elimina **sin redirección** y su enlace sale de
  `MENU`; la colección `paginas` queda solo con la entrada «Inicio». Los dos botones del final pasan a enlaces en
  el cuerpo. La decisión 6 queda superada en esa parte: la página ya no tiene archivo propio.
- **Ícono móvil:** las Páginas libres usan un ícono de documento; `/p/bioingenieria` conserva el matraz.
- **Prefijo corto:** la URL pasa a `/p/<id>` por brevedad; se descartó ponerlas en la raíz para no validar choques
  con secciones. Noticias y Agenda mantienen sus rutas legibles.
- **Posición en el menú:** en «La carrera» las Páginas libres van **antes** de los enlaces fijos, para que
  ¿Qué es la Bioingeniería? quede primera (la propuesta la ubica en el primer nivel del menú); en «Comunidad»
  siguen después. Sigue sin haber un campo de orden.

## Alternativas

- **URL `/<nombre>`** (sin prefijo): descartada, choca con las secciones existentes (`/noticias`, `/agenda`…).
- **Selector de página en el Banner** (una relación con `paginas_libres`): descartado por simplicidad; el campo
  de texto basta y el Banner ya acepta URLs externas.
- **Orden manual del menú** (un campo de posición): descartado. El orden alfabético basta y no hay un número que
  mantener.
- **Páginas con diseño especial desde el panel:** descartado; siguen requiriendo código (ver `guia-evolucion.md` §3.5).
