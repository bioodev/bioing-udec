// Integración de Astro: al terminar el build, quita de dist/ las rutas de las secciones que el panel apagó, sus URL
// del sitemap y los enlaces a ellas en el HTML generado (avisa cada uno). También saca del sitemap las páginas con
// «No mostrar en buscadores» (noindex, detectado en su HTML generado; ADR 0010). Va después de @astrojs/sitemap en
// astro.config.mjs para filtrar el archivo ya escrito. Decisiones: docs/adr/0008-secciones-desactivables.md y 0010.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import type { ConfigMenu } from '../lib/navegacion';
import { filtrarSitemap, quitarEnlacesInactivos, rutasInactivas } from '../lib/secciones-desactivadas';
import { esNoindex } from '../lib/seo';

export function seccionesDesactivadas(config: ConfigMenu): AstroIntegration {
  return {
    name: 'secciones-desactivadas',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const salida = fileURLToPath(dir);
        for (const ruta of rutasInactivas(config)) {
          await rm(join(salida, ruta), { recursive: true, force: true });
          logger.info(`Sección desactivada en el panel: ${ruta} no se publica.`);
        }
        const htmls = (await readdir(salida, { recursive: true })).filter((archivo) => archivo.endsWith('.html'));
        // Páginas con noindex: su ruta (p. ej. /noticias/mi-nota/) sale del sitemap.
        const noindex = new Set<string>();
        for (const archivo of htmls) {
          if (esNoindex(await readFile(join(salida, archivo), 'utf8'))) {
            noindex.add('/' + archivo.split(/[\\/]/).join('/').replace(/index\.html$/, ''));
          }
        }
        for (const archivo of await readdir(salida)) {
          if (!/^sitemap.*\.xml$/.test(archivo)) continue;
          const ruta = join(salida, archivo);
          await writeFile(ruta, filtrarSitemap(await readFile(ruta, 'utf8'), config, noindex));
        }
        for (const archivo of htmls) {
          const ruta = join(salida, archivo);
          const { html, omitidos } = quitarEnlacesInactivos(await readFile(ruta, 'utf8'), config);
          if (omitidos.length === 0) continue;
          await writeFile(ruta, html);
          for (const href of omitidos) logger.warn(`Enlace a ${href} omitido en ${archivo}: su sección está desactivada en el panel.`);
        }
      },
    },
  };
}
