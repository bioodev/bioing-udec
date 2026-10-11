import { describe, expect, test } from 'vitest';
import { coincideNoticia, ordenarNoticias, paginar, TODAS, type DatosNoticia, type FiltrosNoticias } from './filtro-noticias';

const premio: DatosNoticia = { texto: 'egresada obtiene premio de innovacion en salud', temas: ['logros'], etiquetas: ['premio', 'innovacion'], personas: ['fernanda-silva', 'juan-soto'], anio: '2026' };
const charla: DatosNoticia = { texto: 'charla de acuicultura sostenible', temas: ['logros', 'vida-estudiantil'], etiquetas: ['acuicultura'], personas: [], anio: '2025' };
const sinFiltros: FiltrosNoticias = { texto: '', tema: TODAS, etiqueta: TODAS, persona: '', anio: TODAS };

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
  test('etiqueta: la noticia debe llevar esa etiqueta; TODAS no filtra', () => {
    expect(coincideNoticia(premio, { ...sinFiltros, etiqueta: 'innovacion' })).toBe(true);
    expect(coincideNoticia(charla, { ...sinFiltros, etiqueta: 'innovacion' })).toBe(false);
    expect(coincideNoticia(premio, { ...sinFiltros, etiqueta: TODAS })).toBe(true);
  });
  test('año y combinación con Y', () => {
    expect(coincideNoticia(premio, { ...sinFiltros, anio: '2026', tema: 'logros' })).toBe(true);
    expect(coincideNoticia(charla, { ...sinFiltros, anio: '2026', tema: 'logros' })).toBe(false);
  });
});

describe('ordenarNoticias', () => {
  type Ordenable = { fecha: Date; titulo: string };
  const enero: Ordenable = { fecha: new Date('2026-01-01'), titulo: 'Beta' };
  const marzo: Ordenable = { fecha: new Date('2026-03-10'), titulo: 'Águila' };
  const agosto: Ordenable = { fecha: new Date('2026-08-01'), titulo: 'Cabra' };

  test('recientes: fecha descendente (por defecto)', () => {
    expect(ordenarNoticias([enero, agosto, marzo], 'recientes', false).map((x) => x.titulo)).toEqual(['Cabra', 'Águila', 'Beta']);
  });
  test('antiguas: fecha ascendente', () => {
    expect(ordenarNoticias([agosto, enero, marzo], 'antiguas', false).map((x) => x.titulo)).toEqual(['Beta', 'Águila', 'Cabra']);
  });
  test('alfabetico: título con collation en español', () => {
    expect(ordenarNoticias([agosto, enero, marzo], 'alfabetico', false).map((x) => x.titulo)).toEqual(['Águila', 'Beta', 'Cabra']);
  });
  test('relevancia sin búsqueda activa cae a recientes', () => {
    expect(ordenarNoticias([enero, agosto], 'relevancia', false).map((x) => x.titulo)).toEqual(['Cabra', 'Beta']);
  });
  test('relevancia con búsqueda activa conserva el orden del listado', () => {
    expect(ordenarNoticias([enero, marzo, agosto], 'relevancia', true).map((x) => x.titulo)).toEqual(['Beta', 'Águila', 'Cabra']);
  });
  test('no muta el arreglo de entrada (ordena una copia)', () => {
    const entrada: Ordenable[] = [marzo, enero, agosto];
    const salida = ordenarNoticias(entrada, 'alfabetico', false);
    expect(salida.map((x) => x.titulo)).toEqual(['Águila', 'Beta', 'Cabra']);
    expect(entrada.map((x) => x.titulo)).toEqual(['Águila', 'Beta', 'Cabra']);
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
