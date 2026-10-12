import { describe, expect, test } from 'vitest';
import { UMBRAL_OCULTAR, ocultarHeader } from './ocultar-header';

describe('ocultarHeader', () => {
  test('nunca se oculta cerca del inicio de la página', () => {
    expect(ocultarHeader(0, 0, false)).toBe(false);
    expect(ocultarHeader(UMBRAL_OCULTAR, 0, false)).toBe(false);
  });

  test('se oculta al bajar pasado el umbral', () => {
    expect(ocultarHeader(UMBRAL_OCULTAR + 1, UMBRAL_OCULTAR, false)).toBe(true);
    expect(ocultarHeader(900, 850, false)).toBe(true);
  });

  test('reaparece al subir, aunque siga lejos del inicio', () => {
    expect(ocultarHeader(900, 950, true)).toBe(false);
    expect(ocultarHeader(400, 401, true)).toBe(false);
  });

  test('sin movimiento conserva el estado anterior', () => {
    expect(ocultarHeader(500, 500, true)).toBe(true);
    expect(ocultarHeader(500, 500, false)).toBe(false);
  });

  test('vuelve a mostrarse al llegar arriba, aunque se haya bajado de golpe', () => {
    expect(ocultarHeader(40, 900, true)).toBe(false);
  });
});
