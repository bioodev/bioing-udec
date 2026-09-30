import { describe, expect, test } from 'vitest';
import { coincideNoticia, paginar, TODAS, type DatosNoticia, type FiltrosNoticias } from './filtro-noticias';

const premio: DatosNoticia = { texto: 'egresada obtiene premio de innovacion en salud', temas: ['logros'], personas: ['fernanda-silva', 'juan-soto'], anio: '2026' };
const charla: DatosNoticia = { texto: 'charla de acuicultura sostenible', temas: ['logros', 'vida-estudiantil'], personas: [], anio: '2025' };
const sinFiltros: FiltrosNoticias = { texto: '', tema: TODAS, persona: '', anio: TODAS };

describe('coincideNoticia', () => {
  test('sin filtros coincide todo', () => {
    expect(coincideNoticia(premio, sinFiltros)).toBe(true);
    expect(coincideNoticia(charla, sinFiltros)).toBe(true);
  });
  test('el texto ignora tildes y mayúsculas', () => {
    expect(coincideNoticia(premio, { ...sinFiltros, texto: 'INNOVACIÓN' })).toBe(true);
    expect(coincideNoticia(charla, { ...sinFiltros, texto: 'innovación' })).toBe(false);
  });
  test('tema: basta con que la noticia tenga ese tema', () => {
    expect(coincideNoticia(charla, { ...sinFiltros, tema: 'vida-estudiantil' })).toBe(true);
    expect(coincideNoticia(premio, { ...sinFiltros, tema: 'vida-estudiantil' })).toBe(false);
  });
  test('persona: la noticia debe mencionarla; vacío no filtra', () => {
    expect(coincideNoticia(premio, { ...sinFiltros, persona: 'juan-soto' })).toBe(true);
    expect(coincideNoticia(charla, { ...sinFiltros, persona: 'juan-soto' })).toBe(false);
  });
  test('año y combinación con Y', () => {
    expect(coincideNoticia(premio, { ...sinFiltros, anio: '2026', tema: 'logros' })).toBe(true);
    expect(coincideNoticia(charla, { ...sinFiltros, anio: '2026', tema: 'logros' })).toBe(false);
  });
});

describe('paginar', () => {
  const xs = Array.from({ length: 25 }, (_, i) => i);
  test('corta la página pedida', () => {
    expect(paginar(xs, 2, 12)).toEqual({ items: xs.slice(12, 24), pagina: 2, totalPaginas: 3 });
  });
  test('una página fuera de rango se ajusta a la última', () => {
    expect(paginar(xs, 9, 12).pagina).toBe(3);
    expect(paginar(xs, 9, 12).items).toEqual([24]);
  });
  test('una página menor que 1 se ajusta a la primera', () => {
    expect(paginar(xs, 0, 12).pagina).toBe(1);
  });
  test('sin resultados hay 1 página vacía', () => {
    expect(paginar([], 1, 12)).toEqual({ items: [], pagina: 1, totalPaginas: 1 });
  });
});
