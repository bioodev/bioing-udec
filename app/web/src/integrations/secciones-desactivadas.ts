// Integración de Astro: al terminar el build, quita de dist/ las rutas de las secciones que el panel apagó, sus URL
// del sitemap y los enlaces a ellas en el HTML generado (avisa cada uno). Va después de @astrojs/sitemap en
// astro.config.mjs para filtrar el archivo ya escrito. Decisión: docs/adr/0008-secciones-desactivables.md.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import type { ConfigMenu } from '../lib/navegacion';
import { filtrarSitemap, quitarEnlacesInactivos, rutasInactivas } from '../lib/secciones-desactivadas';

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
        for (const archivo of await readdir(salida)) {
          if (!/^sitemap.*\.xml$/.test(archivo)) continue;
          const ruta = join(salida, archivo);
          await writeFile(ruta, filtrarSitemap(await readFile(ruta, 'utf8'), config));
        }
        for (const archivo of await readdir(salida, { recursive: true })) {
          if (!archivo.endsWith('.html')) continue;
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
