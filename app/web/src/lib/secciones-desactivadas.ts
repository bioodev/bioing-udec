// Secciones que el panel apagó (src/content/menu/menu.yml): qué rutas se quitan del build, qué URL del sitemap
// y qué enlaces de los Markdown se omiten. Puro, con test; lo usan astro.config.mjs y la integración del build.
// Decisión: docs/adr/0008-secciones-desactivables.md.
import { enlaceDisponible, seccionActiva, type ConfigMenu } from './navegacion';

/** Rutas de primer nivel que el build quita cuando su sección está apagada. El anuario sale con el Directorio. */
export const RUTAS_DESACTIVABLES = ['/instagram', '/directorio', '/anuario', '/anuncios', '/repositorio'];

/** Rutas de `RUTAS_DESACTIVABLES` que no se publican con esta configuración. */
export const rutasInactivas = (config: ConfigMenu): string[] =>
  RUTAS_DESACTIVABLES.filter((ruta) => !seccionActiva(ruta, config));

/**
 * Quita del sitemap las URL cuya ruta ya no se publica, y las de `excluidas` (páginas con noindex, ver seo.ts).
 * `xml` es el contenido de un `sitemap-*.xml`.
 */
export function filtrarSitemap(xml: string, config: ConfigMenu, excluidas: ReadonlySet<string> = new Set()): string {
  return xml.replace(/[ \t]*<url>[\s\S]*?<\/url>\r?\n?/g, (bloque) => {
    const loc = bloque.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) return bloque;
    const ruta = new URL(loc).pathname;
    return seccionActiva(ruta, config) && !excluidas.has(ruta) ? bloque : '';
  });
}

const ENLACE = /<a\b([^>]*)>([\s\S]*?)<\/a>/g;
const HREF = /\bhref="([^"]*)"/;

/**
 * Deshace en un HTML ya generado los enlaces a secciones apagadas: el enlace se cambia por su texto. Así ningún
 * contenido (Markdown, Banner, Enlaces) deja una ruta muerta. Devuelve los href omitidos para avisar en el build.
 */
export function quitarEnlacesInactivos(html: string, config: ConfigMenu): { html: string; omitidos: string[] } {
  const omitidos: string[] = [];
  const limpio = html.replace(ENLACE, (completo, atributos: string, interior: string) => {
    const href = atributos.match(HREF)?.[1];
    if (href === undefined || enlaceDisponible(href.replaceAll('&amp;', '&'), config)) return completo;
    omitidos.push(href);
    return interior;
  });
  return { html: limpio, omitidos };
}
