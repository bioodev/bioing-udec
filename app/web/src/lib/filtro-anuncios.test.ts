import { describe, expect, test } from 'vitest';
import { coincideAnuncio, TODOS } from './filtro-anuncios';

const practica = { texto: 'practica en laboratorio de genomica biotech spa', tipo: 'practica' };
const sinFiltros = { texto: '', tipo: TODOS };

describe('coincideAnuncio', () => {
  test('sin filtros coincide', () => expect(coincideAnuncio(practica, sinFiltros)).toBe(true));
  test('texto sin tildes ni mayúsculas', () => {
    expect(coincideAnuncio(practica, { ...sinFiltros, texto: 'GENÓMICA' })).toBe(true);
    expect(coincideAnuncio(practica, { ...sinFiltros, texto: 'acuicultura' })).toBe(false);
  });
  test('tipo exacto', () => {
    expect(coincideAnuncio(practica, { ...sinFiltros, tipo: 'practica' })).toBe(true);
    expect(coincideAnuncio(practica, { ...sinFiltros, tipo: 'trabajo' })).toBe(false);
  });
  test('texto y tipo con Y', () => expect(coincideAnuncio(practica, { texto: 'biotech', tipo: 'trabajo' })).toBe(false));
});
