import { describe, expect, test } from 'vitest';
import { coincide, TODAS, type DatosTarjeta, type Filtros } from './filtro-directorio';

const ana: DatosTarjeta = { nombre: 'ana perez', generacion: '2013', areas: ['biomateriales'], organizacion: 'laboratorio-de-biomateriales-udec' };
const sofia: DatosTarjeta = { nombre: 'sofia munoz', generacion: '', areas: ['salud'], organizacion: 'laboratorio-de-biomateriales-udec' };
const sinFiltros: Filtros = { texto: '', generacion: TODAS, area: TODAS, organizacion: TODAS };

describe('coincide', () => {
  test('sin filtros coincide todo, incluso sin generación', () => {
    expect(coincide(ana, sinFiltros)).toBe(true);
    expect(coincide(sofia, sinFiltros)).toBe(true);
  });
  test('texto con tildes y mayúsculas encuentra el nombre normalizado', () => {
    expect(coincide(ana, { ...sinFiltros, texto: 'PÉREZ' })).toBe(true);
    expect(coincide(sofia, { ...sinFiltros, texto: 'Pérez' })).toBe(false);
  });
  test('filtrar por generación excluye a quien no tiene generación', () => {
    expect(coincide(ana, { ...sinFiltros, generacion: '2013' })).toBe(true);
    expect(coincide(sofia, { ...sinFiltros, generacion: '2013' })).toBe(false);
  });
  test('área: basta con que tenga una de sus áreas', () => {
    expect(coincide({ ...ana, areas: ['salud', 'biomateriales'] }, { ...sinFiltros, area: 'biomateriales' })).toBe(true);
    expect(coincide(ana, { ...sinFiltros, area: 'salud' })).toBe(false);
  });
  test('los filtros se combinan con Y', () => {
    const f = { ...sinFiltros, organizacion: 'laboratorio-de-biomateriales-udec', area: 'salud' };
    expect(coincide(sofia, f)).toBe(true);
    expect(coincide(ana, f)).toBe(false);
  });
});
