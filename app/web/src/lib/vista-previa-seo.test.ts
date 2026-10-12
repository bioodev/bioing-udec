// La vista previa del panel (public/admin/vista-previa-seo-reglas.js) no importa código del sitio: copia sus reglas.
// Estas pruebas comprueban que la copia dé lo mismo que el sitio (src/lib/seo.ts y las constantes de tipos).
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import {
  avisos,
  cuandoActividad,
  resolverSeo as resolverSeoPanel,
  tituloDocumento as tituloDocumentoPanel,
  truncar,
  TIPOS,
  vistaPrevia,
} from '../../public/admin/vista-previa-seo-reglas.js';
import { resolverSeo, tituloDocumento } from './seo';
import { TIPOS_ACTIVIDAD } from './agenda';
import { TIPOS_ANUNCIO } from './anuncios';
import { TIPOS_DOCUMENTO } from './repositorio';

describe('constantes espejo del sitio', () => {
  test('los tipos de actividad, anuncio y documento son los del sitio', () => {
    expect(TIPOS.actividades).toEqual(TIPOS_ACTIVIDAD);
    expect(TIPOS.anuncios).toEqual(TIPOS_ANUNCIO);
    expect(TIPOS.documentos).toEqual(TIPOS_DOCUMENTO);
  });
});

describe('tituloDocumento y resolverSeo dan lo mismo que src/lib/seo.ts', () => {
  const titulos = ['Noticias', 'Noticias · BIOING+', 'BIOING+', '  Congreso  '];
  test.each(titulos)('título «%s»', (t) => {
    expect(tituloDocumentoPanel(t)).toBe(tituloDocumento(t));
  });

  const casos = [
    { seo: undefined },
    { seo: { titulo: '  ', descripcion: '', imagen: '', noindex: false } },
    { seo: { titulo: 'Título propio', descripcion: 'Bajada propia', imagen: '/a.png', noindex: true } },
    { seo: { noindex: true } },
  ];
  const armado = { titulo: 'Congreso 2026', descripcion: 'Bajada de la noticia', imagen: '/_astro/destacada.webp' };
  test.each(casos)('precedencia del bloque SEO %#', ({ seo }) => {
    expect(resolverSeoPanel(armado, seo)).toEqual(resolverSeo(armado, seo));
  });
});

describe('truncar', () => {
  test('deja intacto lo que cabe', () => {
    expect(truncar('Corto', 60)).toBe('Corto');
  });

  test('corta con «…» y el total no pasa del límite', () => {
    const largo = 'a'.repeat(70);
    const cortado = truncar(largo, 60);
    expect(cortado).toHaveLength(60);
    expect(cortado.endsWith('…')).toBe(true);
  });
});

// Mismo formato que formatoFechaHora (src/lib/contenido.ts): el espacio antes de «p. m.» es el de ICU.
const formatoSitio = (iso: string) =>
  new Date(iso).toLocaleString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'long', timeStyle: 'short' });

describe('cuandoActividad (igual que formatoFechaHora del sitio)', () => {
  test('una sola hora', () => {
    expect(cuandoActividad('2026-10-12T19:00:00-03:00')).toBe(formatoSitio('2026-10-12T19:00:00-03:00'));
  });

  test('con término distinto del inicio muestra el rango', () => {
    expect(cuandoActividad('2026-10-12T19:00:00-03:00', '2026-10-12T21:00:00-03:00')).toBe(
      `${formatoSitio('2026-10-12T19:00:00-03:00')} — ${formatoSitio('2026-10-12T21:00:00-03:00')}`,
    );
  });

  test('sin inicio no muestra nada', () => {
    expect(cuandoActividad(undefined)).toBe('');
  });
});

describe('vistaPrevia', () => {
  const noticia = { titulo: 'Congreso 2026', bajada: 'Bajada de la noticia', imagen: '/assets/media/c.webp' };

  test('noticia sin bloque SEO: título con sufijo, bajada, imagen destacada y URL de noticias', () => {
    const v = vistaPrevia('noticias', noticia, { slug: 'congreso-2026' });
    expect(v.titulo).toBe('Congreso 2026 · BIOING+');
    expect(v.descripcion).toBe('Bajada de la noticia');
    expect(v.imagen).toBe('/assets/media/c.webp');
    expect(v.url).toBe('bioing…/noticias/congreso-2026');
    expect(v.noindex).toBe(false);
    expect(v.avisos).toEqual([]);
  });

  test('el bloque SEO gana sobre lo armado', () => {
    const v = vistaPrevia('noticias', { ...noticia, seo: { titulo: 'Otro título', descripcion: 'Otra bajada' } }, { slug: 'x' });
    expect(v.titulo).toBe('Otro título · BIOING+');
    expect(v.descripcion).toBe('Otra bajada');
  });

  test('actividad: la descripción armada es «tipo · cuándo», como en el sitio', () => {
    const v = vistaPrevia('actividades', { titulo: 'Charla X', tipo: 'charla', inicio: '2026-10-12T19:00:00-03:00' }, { slug: 'charla-x' });
    expect(v.url).toBe('bioing…/agenda/charla-x');
    expect(v.descripcion).toBe(`Charla · ${formatoSitio('2026-10-12T19:00:00-03:00')}`);
  });

  test('anuncio y documento arman «tipo · título» y usan su ruta', () => {
    const anuncio = vistaPrevia('anuncios', { titulo: 'Pasantía en lab', tipo: 'pasantia' }, { slug: 'p' });
    expect(anuncio.descripcion).toBe('Pasantía · Pasantía en lab');
    expect(anuncio.url).toBe('bioing…/anuncios/p');
    const doc = vistaPrevia('documentos', { titulo: 'Reglamento 1', tipo: 'reglamento' }, { slug: 'r' });
    expect(doc.url).toBe('bioing…/repositorio/r');
    expect(doc.descripcion).toBe('Reglamento · Reglamento 1');
  });

  test('sin título todavía muestra «Sin título», no un sufijo suelto', () => {
    const v = vistaPrevia('noticias', { titulo: '  ' }, { slug: 'b' });
    expect(v.titulo).toBe('Sin título · BIOING+');
  });

  test('página libre usa /p/', () => {
    const v = vistaPrevia('paginas_libres', { titulo: 'Quiénes somos', bajada: 'Somos…' }, { slug: 'quienes' });
    expect(v.url).toBe('bioing…/p/quienes');
  });

  test('sin slug muestra un marcador en la URL', () => {
    expect(vistaPrevia('noticias', noticia).url).toBe('bioing…/noticias/…');
  });

  test('título final de más de 60 caracteres se corta y avisa', () => {
    const v = vistaPrevia('noticias', { ...noticia, titulo: 'Un título muy largo para un resultado de Google, de sesenta' });
    expect(v.titulo.length).toBeLessThanOrEqual(60);
    expect(v.titulo.endsWith('…')).toBe(true);
    expect(v.avisos).toContain('Título largo: se cortará en Google.');
  });

  test('sin descripción propia avisa', () => {
    const v = vistaPrevia('noticias', { titulo: 'Sin bajada' }, { slug: 's' });
    expect(v.descripcion).toBeUndefined();
    expect(v.avisos).toContain('Sin descripción propia: se usará la descripción general del sitio.');
  });

  test('noindex se marca y avisa', () => {
    const v = vistaPrevia('noticias', { ...noticia, seo: { noindex: true } }, { slug: 'n' });
    expect(v.noindex).toBe(true);
    expect(v.avisos).toContain('Marcada como «No mostrar en buscadores»: Google no la incluirá en su índice.');
  });

  test('una colección sin vista previa SEO falla en vez de inventar valores', () => {
    expect(() => vistaPrevia('personas', {}, {})).toThrow();
  });
});

describe('avisos', () => {
  test('sin problemas no hay avisos', () => {
    expect(avisos({ titulo: 'Corto · BIOING+', descripcion: 'Algo', noindex: false })).toEqual([]);
  });
});

describe('imagen por defecto del panel', () => {
  test('public/admin/og-default.png es idéntica a src/assets/og-default.png', () => {
    const sitio = readFileSync(new URL('../assets/og-default.png', import.meta.url));
    const panel = readFileSync(new URL('../../public/admin/og-default.png', import.meta.url));
    expect(panel.equals(sitio)).toBe(true);
  });
});
