# 0008 · Secciones que se desactivan del todo desde el panel

- **Estado:** Accepted · 2026-10-12 · la persona responsable del proyecto decidió qué se desactiva; el mecanismo es propuesta del equipo técnico
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `0005-paginas-libres-desde-el-panel.md` · `../guia-usuario.md` §4.13 · `../architecture.md` (Secciones ocultables)

## Contexto

Hasta hoy el interruptor de cada sección fija del panel (`src/content/menu/menu.yml`) solo la quitaba del menú, del
pie y de `llms.txt`. Su página seguía publicada y, con ella, sus enlaces, su sitemap, su entrada en el buscador y su
JSON-LD. Para una sección que la carrera deja de mantener (por ejemplo Instagram o el Repositorio) eso no basta:
hace falta que deje de existir en el sitio, sin borrar el contenido, para poder volver a activarla.

## Decisión

1. **Cuatro secciones se pueden desactivar del todo**: Instagram, Directorio, Anuncios y Repositorio. El anuario
   (PDF del Directorio, `/anuario`) depende del Directorio y sale con él, porque lista datos de egresados/as.
   **Noticias y Agenda** son el núcleo: su interruptor solo las oculta del menú y del pie, como antes.
2. **Qué cambia al desactivar una sección** (`seccionActiva` en `src/lib/navegacion.ts`, función pura con test):
   - Su ruta y sus subrutas no se construyen. El build no genera el directorio de la ruta en `dist/` y el servidor
     responde 404 real (Cloudflare usa `not_found_handling: "404-page"`).
   - Sus URL salen del sitemap, del índice de Pagefind (el buscador solo indexa lo que se construye) y del JSON-LD.
   - Sale del Inicio: el bloque «Anuncios» y el bloque «En Instagram», y toda Sección destacada cuyo enlace apunte a
     la sección. Un Banner que lleva a ella tampoco se muestra.
   - Un enlace a una sección desactivada, en cualquier HTML generado, se cambia por su texto y el build avisa con la
     ruta y el archivo. No rompe el build.
   - El contenido (Anuncios, Documentos, publicaciones) no se borra: al volver a activarla, todo reaparece.
3. **Mecanismo**: una integración de Astro (`src/integrations/secciones-desactivadas.ts`, en `astro:build:done`) que
   corre después de `@astrojs/sitemap`. Quita de `dist/` las rutas inactivas, filtra el sitemap y deshace los
   enlaces en el HTML. La configuración se lee una vez en `astro.config.mjs` con `leerConfigMenu`.

## Alternativas consideradas

- **Rutas dinámicas con `getStaticPaths` que devuelven `[]`**: sirve para `anuncios/[id]` y `repositorio/[id]`, pero
  `instagram.astro`, `directorio.astro`, `anuncios/index.astro` y `repositorio/index.astro` son rutas fijas que Astro
  siempre construye. Convertirlas en dinámicas obliga a un `[seccion]` que choca con el `[seccion].astro` de las
  secciones «Próximamente». Se descartó por complejidad y por tocar páginas que no necesitan cambiar.
- **Plugin de Markdown (rehype)** para los enlaces: Astro 7 usa Sätteri por defecto y su API de plugins hast es
  distinta, con dependencias extra. Se descartó en favor de deshacer los enlaces en el HTML ya generado, que no
  depende del procesador y cubre también los componentes.
- **Solo ocultar en el panel**: es lo que ya existía; no cumple que una sección deje de publicarse.

## Consecuencias

- `npm run dev` no aplica el 404: los archivos fijos siguen servidos en desarrollo. El 404 y la ausencia de páginas
  se comprueban sobre el build (`npm run build`, `wrangler dev --env qa` o el ambiente desplegado).
- Quedan en `dist/_astro/` dos chunks de script (`directorio.astro_…js`, `anuario.astro_…js`) que ningún HTML
  referencia. No publican contenido; Astro no los quita porque su nombre no se puede asociar a la página de forma
  segura para todos los chunks.
- La lista de rutas de la integración (`RUTAS_DESACTIVABLES` en `src/lib/secciones-desactivadas.ts`) debe crecer si
  se agrega una sección desactivable nueva; `seccionDeRuta` en `navegacion.ts` debe conocerla también.
- Los avisos del build pueden ser muchos si hay contenido que enlaza a una sección apagada: revisar la salida.
