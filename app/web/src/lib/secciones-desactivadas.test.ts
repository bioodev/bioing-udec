import { describe, expect, test } from 'vitest';
import { filtrarSitemap, quitarEnlacesInactivos, rutasInactivas } from './secciones-desactivadas';

const SITIO = 'https://bioing.example';

const url = (ruta: string) => `  <url><loc>${SITIO}${ruta}</loc><lastmod>2026-10-12</lastmod></url>\n`;
const sitemap = (...rutas: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rutas.map(url).join('')}</urlset>`;

describe('rutasInactivas', () => {
  test('sin configuración no hay rutas que quitar', () => {
    expect(rutasInactivas({})).toEqual([]);
  });

  test('lista las rutas de las secciones desactivables apagadas, con el anuario del Directorio', () => {
    expect(rutasInactivas({ instagram: false, directorio: false })).toEqual(['/instagram', '/directorio', '/anuario']);
  });

  test('Noticias y Agenda nunca están en la lista', () => {
    expect(rutasInactivas({ noticias: false, agenda: false })).toEqual([]);
  });
});

describe('filtrarSitemap', () => {
  test('quita las URL de secciones apagadas y deja el resto intacto', () => {
    const xml = sitemap('/', '/noticias/', '/anuncios/', '/anuncios/oferta-1/', '/personas/ana/', '/anuario/');
    const filtrado = filtrarSitemap(xml, { anuncios: false, directorio: false });
    expect(filtrado).toBe(sitemap('/', '/noticias/', '/personas/ana/'));
  });

  test('sin secciones apagadas, el sitemap no cambia', () => {
    const xml = sitemap('/', '/anuncios/', '/instagram/');
    expect(filtrarSitemap(xml, {})).toBe(xml);
  });

  test('no toca el encabezado ni las etiquetas urlset', () => {
    const xml = sitemap('/instagram/');
    const filtrado = filtrarSitemap(xml, { instagram: false });
    expect(filtrado).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(filtrado).not.toContain('<url>');
  });
});

describe('quitarEnlacesInactivos', () => {
  test('un enlace a una sección apagada se cambia por su texto y se informa', () => {
    const html = '<p>Mira el <a href="/directorio" class="x">Directorio</a>.</p>';
    expect(quitarEnlacesInactivos(html, { directorio: false })).toEqual({
      html: '<p>Mira el Directorio.</p>',
      omitidos: ['/directorio'],
    });
  });

  test('conserva los enlaces disponibles, internos y externos, tal cual', () => {
    const html = '<a href="/noticias">Noticias</a> <a href="https://www.udec.cl" target="_blank">UdeC</a>';
    expect(quitarEnlacesInactivos(html, { directorio: false })).toEqual({ html, omitidos: [] });
  });

  test('quita también un enlace a una subruta de una sección apagada', () => {
    const { html } = quitarEnlacesInactivos('<a href="/anuncios/oferta-1">Oferta</a>', { anuncios: false });
    expect(html).toBe('Oferta');
  });

  test('no confunde otras etiquetas que empiezan con «a», ni las que no tienen href', () => {
    const html = '<abbr title="x">UdeC</abbr><a name="ancla">Ancla</a>';
    expect(quitarEnlacesInactivos(html, { anuncios: false })).toEqual({ html, omitidos: [] });
  });
});
