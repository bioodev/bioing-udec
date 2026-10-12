import { describe, expect, test } from 'vitest';
import {
  DESCRIPCION_SITIO,
  descripcionListado,
  descripcionSitio,
  esNoindex,
  imagenSitio,
  resolverSeo,
  tituloDocumento,
  verificacionMetas,
} from './seo';

describe('tituloDocumento', () => {
  test('agrega el sufijo « · BIOING+»', () => {
    expect(tituloDocumento('Noticias')).toBe('Noticias · BIOING+');
  });

  test('no duplica el sufijo si el título ya lo trae', () => {
    expect(tituloDocumento('Noticias · BIOING+')).toBe('Noticias · BIOING+');
  });

  test('el nombre del sitio va sin sufijo', () => {
    expect(tituloDocumento('BIOING+')).toBe('BIOING+');
  });
});

describe('resolverSeo (precedencia: campo SEO → valor armado por la página)', () => {
  const armado = { titulo: 'Congreso 2026', descripcion: 'Bajada de la noticia', imagen: '/_astro/destacada.webp' };

  test('sin bloque SEO usa lo armado y no es noindex', () => {
    expect(resolverSeo(armado, undefined)).toEqual({ ...armado, noindex: false });
  });

  test('un campo SEO reemplaza solo ese valor', () => {
    const seo = { titulo: 'Congreso de Bioingeniería 2026', imagen: '/_astro/redes.png' };
    expect(resolverSeo(armado, seo)).toEqual({
      titulo: 'Congreso de Bioingeniería 2026',
      descripcion: 'Bajada de la noticia',
      imagen: '/_astro/redes.png',
      noindex: false,
    });
  });

  test('un campo SEO vacío o con solo espacios cuenta como ausente', () => {
    expect(resolverSeo(armado, { titulo: '   ', descripcion: '' })).toEqual({ ...armado, noindex: false });
  });

  test('noindex se activa solo con true', () => {
    expect(resolverSeo(armado, { noindex: true }).noindex).toBe(true);
    expect(resolverSeo(armado, { noindex: false }).noindex).toBe(false);
  });

  test('sin valor armado ni campo SEO, la descripción queda indefinida (la completa el sitio)', () => {
    expect(resolverSeo({ titulo: 'Anuncio' }, undefined).descripcion).toBeUndefined();
  });
});

describe('descripcionSitio e imagenSitio', () => {
  test('sin configuración usan el texto por defecto y ninguna imagen', () => {
    expect(descripcionSitio(undefined)).toBe(DESCRIPCION_SITIO);
    expect(imagenSitio(undefined)).toBeUndefined();
  });

  test('la descripción del panel reemplaza la del código', () => {
    expect(descripcionSitio({ descripcion: 'Sitio de la carrera.' })).toBe('Sitio de la carrera.');
  });
});

describe('descripcionListado', () => {
  test('sin valor en el panel usa el texto por defecto del código', () => {
    expect(descripcionListado('noticias', {})).toBe('Noticias de la comunidad de Bioingeniería UdeC.');
  });

  test('el valor del panel gana sobre el del código', () => {
    expect(descripcionListado('agenda', { listados: { agenda: 'Charlas y seminarios.' } })).toBe('Charlas y seminarios.');
  });

  test('inicio hereda la descripción del sitio cuando el panel no la define', () => {
    expect(descripcionListado('inicio', { descripcion: 'Sitio de la carrera.' })).toBe('Sitio de la carrera.');
  });
});

describe('verificacionMetas', () => {
  test('sin códigos no emite metas', () => {
    expect(verificacionMetas(undefined)).toEqual([]);
    expect(verificacionMetas({ google: '', bing: ' ' })).toEqual([]);
  });

  test('cada código con valor da su meta', () => {
    expect(verificacionMetas({ google: 'abc123', bing: 'DEF456' })).toEqual([
      { name: 'google-site-verification', content: 'abc123' },
      { name: 'msvalidate.01', content: 'DEF456' },
    ]);
  });
});

describe('esNoindex', () => {
  test('detecta la meta robots noindex del HTML generado', () => {
    expect(esNoindex('<head><meta name="robots" content="noindex"></head>')).toBe(true);
  });

  test('una página normal no es noindex', () => {
    expect(esNoindex('<head><meta name="description" content="x"></head>')).toBe(false);
  });
});
