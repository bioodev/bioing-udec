import { describe, expect, it } from 'vitest';
import { destinoArrastre } from './carrusel';

describe('destinoArrastre', () => {
  const ancho = 1000;

  it('vuelve al slide actual si el arrastre es corto y lento', () => {
    expect(destinoArrastre({ dx: 100, ancho, ms: 600 })).toBe(0);
    expect(destinoArrastre({ dx: -100, ancho, ms: 600 })).toBe(0);
  });

  it('avanza al arrastrar hacia la izquierda más del umbral', () => {
    expect(destinoArrastre({ dx: -250, ancho, ms: 600 })).toBe(1);
  });

  it('retrocede al arrastrar hacia la derecha más del umbral', () => {
    expect(destinoArrastre({ dx: 250, ancho, ms: 600 })).toBe(-1);
  });

  it('un gesto rápido (swipe) cambia de slide aunque sea corto', () => {
    expect(destinoArrastre({ dx: -60, ancho, ms: 120 })).toBe(1);
    expect(destinoArrastre({ dx: 60, ancho, ms: 120 })).toBe(-1);
  });

  it('un toque casi sin movimiento no cambia de slide aunque sea rápido', () => {
    expect(destinoArrastre({ dx: -10, ancho, ms: 50 })).toBe(0);
  });

  it('sin ancho (slide no medido) no cambia', () => {
    expect(destinoArrastre({ dx: -500, ancho: 0, ms: 600 })).toBe(0);
  });
});
