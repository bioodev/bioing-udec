import { describe, expect, test } from 'vitest';
import { indiceAnterior, indiceSiguiente, textoContador } from './galeria';

describe('indiceSiguiente / indiceAnterior', () => {
  test('avanzan y retroceden de una en una', () => {
    expect(indiceSiguiente(0, 4)).toBe(1);
    expect(indiceAnterior(2, 4)).toBe(1);
  });
  test('dan la vuelta: de la última pasa a la primera y viceversa', () => {
    expect(indiceSiguiente(3, 4)).toBe(0);
    expect(indiceAnterior(0, 4)).toBe(3);
  });
  test('con una sola imagen, siempre queda en la misma', () => {
    expect(indiceSiguiente(0, 1)).toBe(0);
    expect(indiceAnterior(0, 1)).toBe(0);
  });
});

describe('textoContador', () => {
  test('muestra la posición en base 1: "3 de 8"', () => {
    expect(textoContador(2, 8)).toBe('3 de 8');
    expect(textoContador(0, 1)).toBe('1 de 1');
  });
});
