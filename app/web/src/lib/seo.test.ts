import { describe, expect, test } from 'vitest';
import {
  DESCRIPCION_SITIO,
  analiticaCloudflare,
  descripcionListado,
  descripcionSitio,
  esNoindex,
  imagenDeListado,
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
    expect(descripcionListado('agenda', { listados: { agenda: { descripcion: 'Charlas y seminarios.' } } })).toBe('Charlas y seminarios.');
  });

  test('un listado sin descripción en el panel (aunque tenga imagen) usa el texto por defecto', () => {
    expect(descripcionListado('agenda', { listados: { agenda: { imagen: '/_astro/agenda.webp' } } })).toBe(
      'Actividades de la comunidad de Bioingeniería UdeC: seminarios, charlas, congresos y más.',
    );
  });

  test('inicio hereda la descripción del sitio cuando el panel no la define', () => {
    expect(descripcionListado('inicio', { descripcion: 'Sitio de la carrera.' })).toBe('Sitio de la carrera.');
  });
});

describe('imagenDeListado (precedencia: imagen del listado → imagen del sitio → undefined)', () => {
  test('la imagen del listado gana sobre la del sitio', () => {
    const sitio = { imagen: '/_astro/sitio.png', listados: { agenda: { imagen: '/_astro/agenda.webp' } } };
    expect(imagenDeListado('agenda', sitio)).toBe('/_astro/agenda.webp');
  });

  test('sin imagen del listado usa la del sitio', () => {
    const sitio = { imagen: '/_astro/sitio.png', listados: { agenda: { descripcion: 'Texto' } } };
    expect(imagenDeListado('agenda', sitio)).toBe('/_astro/sitio.png');
  });

  test('una imagen vacía o con solo espacios cuenta como ausente', () => {
    expect(imagenDeListado('noticias', { imagen: '/_astro/sitio.png', listados: { noticias: { imagen: '  ' } } })).toBe('/_astro/sitio.png');
  });

  test('sin imagen en el panel no hay imagen (la página usa og-default.png)', () => {
    expect(imagenDeListado('directorio', undefined)).toBeUndefined();
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

describe('analiticaCloudflare (Cloudflare Web Analytics, sin cookies)', () => {
  const TOKEN = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';

  test('sin token no hay analítica', () => {
    expect(analiticaCloudflare(undefined)).toBeUndefined();
    expect(analiticaCloudflare({})).toBeUndefined();
    expect(analiticaCloudflare({ analitica: {} })).toBeUndefined();
    expect(analiticaCloudflare({ analitica: { cloudflare_token: '' } })).toBeUndefined();
    expect(analiticaCloudflare({ analitica: { cloudflare_token: '   ' } })).toBeUndefined();
  });

  test('un token válido arma el JSON del atributo data-cf-beacon con SPA activado', () => {
    expect(analiticaCloudflare({ analitica: { cloudflare_token: TOKEN } })).toBe(
      `{"token":"${TOKEN}","spa":true}`,
    );
  });

  test('quita los espacios alrededor del token', () => {
    expect(analiticaCloudflare({ analitica: { cloudflare_token: `  ${TOKEN}\n` } })).toBe(
      `{"token":"${TOKEN}","spa":true}`,
    );
  });

  test('un valor con comillas, etiquetas o espacios dentro no se inyecta', () => {
    expect(analiticaCloudflare({ analitica: { cloudflare_token: `${TOKEN}"}<script>` } })).toBeUndefined();
    expect(analiticaCloudflare({ analitica: { cloudflare_token: 'abc def' } })).toBeUndefined();
  });
});
