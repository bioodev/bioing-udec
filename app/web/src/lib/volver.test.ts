import { describe, expect, test } from 'vitest';
import { puedeVolverAtras } from './volver';

const ORIGEN = 'https://bioing.example';

describe('puedeVolverAtras', () => {
  test('sí vuelve si la página anterior es del mismo sitio (carga completa)', () => {
    expect(puedeVolverAtras({ referrer: `${ORIGEN}/noticias`, origen: ORIGEN, indiceHistorial: 0 })).toBe(true);
  });

  test('sí vuelve si se llegó con la navegación interna (ClientRouter), aunque el referrer sea externo', () => {
    expect(puedeVolverAtras({ referrer: 'https://buscador.ejemplo/?q=bio', origen: ORIGEN, indiceHistorial: 2 })).toBe(true);
  });

  test('no vuelve si se abrió directo desde fuera del sitio', () => {
    expect(puedeVolverAtras({ referrer: 'https://buscador.ejemplo/', origen: ORIGEN, indiceHistorial: 0 })).toBe(false);
  });

  test('no vuelve si se escribió la URL (sin referrer ni historial del sitio)', () => {
    expect(puedeVolverAtras({ referrer: '', origen: ORIGEN, indiceHistorial: 0 })).toBe(false);
    expect(puedeVolverAtras({ referrer: '', origen: ORIGEN, indiceHistorial: undefined })).toBe(false);
  });

  test('un referrer que solo empieza igual no cuenta como mismo origen', () => {
    expect(puedeVolverAtras({ referrer: `${ORIGEN}.evil.example/`, origen: ORIGEN, indiceHistorial: 0 })).toBe(false);
  });
});
