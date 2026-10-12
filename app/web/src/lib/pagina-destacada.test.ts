import { describe, expect, test } from 'vitest';
import { paginaDestacada } from './pagina-destacada';

const pagina = (titulo: string, extra: { destacar_inicio?: boolean; publicado?: boolean } = {}) => ({
  titulo,
  destacar_inicio: extra.destacar_inicio ?? true,
  publicado: extra.publicado ?? true,
});

describe('paginaDestacada', () => {
  test('sin páginas marcadas no hay destacada y nada queda fuera', () => {
    const paginas = [pagina('Becas', { destacar_inicio: false })];
    expect(paginaDestacada(paginas)).toEqual({ destacada: null, fuera: [] });
  });

  test('una sola página marcada y publicada es la destacada', () => {
    const paginas = [pagina('Becas', { destacar_inicio: false }), pagina('¿Qué es?')];
    expect(paginaDestacada(paginas)).toEqual({ destacada: paginas[1], fuera: [] });
  });

  test('una página marcada pero en borrador no se destaca', () => {
    const paginas = [pagina('¿Qué es?', { publicado: false })];
    expect(paginaDestacada(paginas)).toEqual({ destacada: null, fuera: [] });
  });

  test('si hay varias marcadas gana la primera por título y las demás quedan fuera, en orden', () => {
    const zeta = pagina('Zeta');
    const congresos = pagina('Congresos');
    const becas = pagina('Becas');
    const resultado = paginaDestacada([zeta, congresos, becas]);
    expect(resultado.destacada).toBe(becas);
    expect(resultado.fuera).toEqual([congresos, zeta]);
  });

  test('no modifica la lista recibida', () => {
    const paginas = [pagina('Zeta'), pagina('Becas')];
    const copia = [...paginas];
    paginaDestacada(paginas);
    expect(paginas).toEqual(copia);
  });
});
