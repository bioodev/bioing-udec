import { describe, expect, test } from 'vitest';
import { urlConFiltros } from './url-filtros';

const base = 'https://bioing.test/noticias/?tema=logros&orden=alfabetico';

describe('urlConFiltros', () => {
  test('agrega y actualiza los valores no neutros', () => {
    const url = new URL(urlConFiltros(base, { q: 'premio', orden: 'antiguas' }, ['todas']));
    expect(url.searchParams.get('q')).toBe('premio');
    expect(url.searchParams.get('orden')).toBe('antiguas');
  });

  test('quita los parámetros vacíos o iguales al valor neutro', () => {
    const url = new URL(urlConFiltros(base, { q: '', tema: 'todas', orden: 'alfabetico' }, ['todas']));
    expect(url.searchParams.has('q')).toBe(false);
    expect(url.searchParams.has('tema')).toBe(false);
    expect(url.searchParams.get('orden')).toBe('alfabetico');
  });

  test('conserva la ruta y el hash', () => {
    const url = new URL(urlConFiltros('https://bioing.test/agenda/?q=a#proximas', { q: 'b' }, []));
    expect(url.pathname).toBe('/agenda/');
    expect(url.hash).toBe('#proximas');
    expect(url.searchParams.get('q')).toBe('b');
  });

  test('no modifica el href de entrada', () => {
    urlConFiltros(base, { q: '' }, []);
    expect(base).toBe('https://bioing.test/noticias/?tema=logros&orden=alfabetico');
  });
});
