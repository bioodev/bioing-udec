import { describe, expect, test } from 'vitest';
import { coincideActividad, contarAgenda, particionarActividades, TODAS, type DatosActividad, type FiltrosAgenda } from './filtro-agenda';

const seminario: DatosActividad = { texto: 'seminario de biomateriales sala 201 fcb', tipo: 'seminario', estado: 'proxima' };
const charla: DatosActividad = { texto: 'charla de acuicultura sostenible', tipo: 'charla', estado: 'pasada' };
const sinFiltros: FiltrosAgenda = { texto: '', tipo: TODAS, estado: TODAS };

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
    expect(coincideActividad(seminario, { texto: 'biomateriales', tipo: 'seminario', estado: TODAS })).toBe(true);
    expect(coincideActividad(seminario, { texto: 'biomateriales', tipo: 'charla', estado: TODAS })).toBe(false);
  });
  test('estado (pestañas): próxima/pasada; TODAS no filtra', () => {
    expect(coincideActividad(seminario, { ...sinFiltros, estado: 'proxima' })).toBe(true);
    expect(coincideActividad(charla, { ...sinFiltros, estado: 'proxima' })).toBe(false);
    expect(coincideActividad(charla, { ...sinFiltros, estado: 'pasada' })).toBe(true);
    expect(coincideActividad(seminario, { ...sinFiltros, estado: TODAS })).toBe(true);
  });
});

describe('particionarActividades', () => {
  test('separa próximas y pasadas', () => {
    const mezcla: DatosActividad[] = [charla, seminario, { ...charla, texto: 'otra charla' }];
    const { proximas, pasadas } = particionarActividades(mezcla);
    expect(proximas).toEqual([seminario]);
    expect(pasadas).toHaveLength(2);
  });
});

describe('contarAgenda', () => {
  const agenda: DatosActividad[] = [seminario, charla, { ...seminario, texto: 'seminario de verano', estado: 'pasada' }];
  test('cuenta cada pestaña sin aplicar estado', () => {
    expect(contarAgenda(agenda, { texto: '', tipo: TODAS })).toEqual({ todas: 3, proximas: 1, pasadas: 2 });
  });
  test('respeta los filtros de texto y tipo', () => {
    expect(contarAgenda(agenda, { texto: 'seminario', tipo: TODAS })).toEqual({ todas: 2, proximas: 1, pasadas: 1 });
    expect(contarAgenda(agenda, { texto: '', tipo: 'charla' })).toEqual({ todas: 1, proximas: 0, pasadas: 1 });
  });
});