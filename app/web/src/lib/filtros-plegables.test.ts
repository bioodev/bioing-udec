import { describe, expect, test } from 'vitest';
import { contarActivos, textoBotonFiltros } from './filtros-plegables';

describe('contarActivos', () => {
  test('no cuenta los valores vacíos ni los neutros', () => {
    expect(contarActivos(['', 'todas', 'recientes', 'todos'], ['todas', 'todos', 'recientes'])).toBe(0);
  });

  test('cuenta cada valor elegido', () => {
    expect(contarActivos(['logros', '', '2025', 'todas'], ['todas'])).toBe(2);
  });

  test('ignora espacios alrededor', () => {
    expect(contarActivos(['  ', ' todas '], ['todas'])).toBe(0);
  });
});

describe('textoBotonFiltros', () => {
  test('sin filtros activos solo dice Filtros', () => {
    expect(textoBotonFiltros(0)).toBe('Filtros');
  });

  test('con filtros activos muestra la cantidad en singular o plural', () => {
    expect(textoBotonFiltros(1)).toBe('Filtros · 1 activo');
    expect(textoBotonFiltros(3)).toBe('Filtros · 3 activos');
  });
});
