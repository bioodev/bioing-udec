import { describe, expect, test } from 'vitest';
import {
  agruparPorGeneracion,
  areasMasFrecuentes,
  coincide,
  contarAreas,
  etiquetaGrupo,
  TODAS,
  type DatosTarjeta,
  type Filtros,
} from './filtro-directorio';

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

describe('contarAreas', () => {
  test('sin egresados/as no hay áreas', () => {
    expect(contarAreas([])).toEqual([]);
  });

  test('cuenta cuántos egresados/as tiene cada área, ordenadas por nombre', () => {
    const salud = { id: 'salud', nombre: 'Salud' };
    const biomat = { id: 'biomateriales', nombre: 'Biomateriales' };
    const areas = contarAreas([[biomat], [salud, biomat], []]);
    expect(areas).toEqual([
      { id: 'biomateriales', nombre: 'Biomateriales', cantidad: 2 },
      { id: 'salud', nombre: 'Salud', cantidad: 1 },
    ]);
  });

  test('una misma área repetida en una persona cuenta una sola vez', () => {
    const salud = { id: 'salud', nombre: 'Salud' };
    expect(contarAreas([[salud, salud]])).toEqual([{ id: 'salud', nombre: 'Salud', cantidad: 1 }]);
  });
});

describe('areasMasFrecuentes', () => {
  const areas = [
    { id: 'salud', nombre: 'Salud', cantidad: 3 },
    { id: 'ambiente', nombre: 'Ambiente', cantidad: 1 },
    { id: 'biomateriales', nombre: 'Biomateriales', cantidad: 3 },
    { id: 'alimentos', nombre: 'Alimentos', cantidad: 2 },
  ];

  test('primero las de más egresados/as; a igualdad, por nombre', () => {
    expect(areasMasFrecuentes(areas, 3).map((a) => a.id)).toEqual(['biomateriales', 'salud', 'alimentos']);
  });

  test('no cambia la lista de entrada', () => {
    areasMasFrecuentes(areas, 2);
    expect(areas[0].id).toBe('salud');
  });
});

describe('agruparPorGeneracion', () => {
  test('la generación más reciente va primero y sin generación, al final', () => {
    const grupos = agruparPorGeneracion([
      { id: 'a', generacion: 2012 },
      { id: 'b' },
      { id: 'c', generacion: 2015 },
      { id: 'd', generacion: 2012 },
    ]);
    expect(grupos).toEqual([
      { generacion: 2015, ids: ['c'] },
      { generacion: 2012, ids: ['a', 'd'] },
      { generacion: null, ids: ['b'] },
    ]);
  });

  test('conserva el orden de entrada dentro de cada grupo', () => {
    const grupos = agruparPorGeneracion([{ id: 'z', generacion: 2010 }, { id: 'a', generacion: 2010 }]);
    expect(grupos[0].ids).toEqual(['z', 'a']);
  });

  test('no devuelve grupos vacíos', () => {
    expect(agruparPorGeneracion([])).toEqual([]);
  });
});

describe('etiquetaGrupo', () => {
  test('nombra la generación o la falta de ella', () => {
    expect(etiquetaGrupo(2012)).toBe('Generación 2012');
    expect(etiquetaGrupo(null)).toBe('Sin generación');
  });
});
