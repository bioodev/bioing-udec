import { describe, expect, test } from 'vitest';
import { coincideActividad, TODAS, type DatosActividad, type FiltrosAgenda } from './filtro-agenda';

const seminario: DatosActividad = { texto: 'seminario de biomateriales sala 201 fcb', tipo: 'seminario' };
const charla: DatosActividad = { texto: 'charla de acuicultura sostenible', tipo: 'charla' };
const sinFiltros: FiltrosAgenda = { texto: '', tipo: TODAS };

describe('coincideActividad', () => {
  test('sin filtros coincide todo', () => {
    expect(coincideActividad(seminario, sinFiltros)).toBe(true);
    expect(coincideActividad(charla, sinFiltros)).toBe(true);
  });
  test('el texto ignora tildes y mayúsculas', () => {
    expect(coincideActividad(charla, { ...sinFiltros, texto: 'ACUICULTURA' })).toBe(true);
    expect(coincideActividad(seminario, { ...sinFiltros, texto: 'acuicultura' })).toBe(false);
  });
  test('el texto también busca en el lugar', () => {
    expect(coincideActividad(seminario, { ...sinFiltros, texto: 'sala 201' })).toBe(true);
  });
  test('tipo: debe ser exactamente el de la actividad', () => {
    expect(coincideActividad(seminario, { ...sinFiltros, tipo: 'seminario' })).toBe(true);
    expect(coincideActividad(charla, { ...sinFiltros, tipo: 'seminario' })).toBe(false);
  });
  test('texto y tipo se combinan con Y', () => {
    expect(coincideActividad(seminario, { texto: 'biomateriales', tipo: 'seminario' })).toBe(true);
    expect(coincideActividad(seminario, { texto: 'biomateriales', tipo: 'charla' })).toBe(false);
  });
});
