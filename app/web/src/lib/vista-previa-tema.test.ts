// La vista previa del panel (public/admin/vista-previa-tema-reglas.js) no importa código del sitio: su regla es propia.
// Estas pruebas fijan qué tema recibe el iframe de cada vista previa.
import { describe, expect, test } from 'vitest';
import { temaEfectivo } from '../../public/admin/vista-previa-tema-reglas.js';

describe('temaEfectivo', () => {
  test('el tema que fijó el panel gana al del sistema', () => {
    expect(temaEfectivo('dark', false)).toBe('dark');
    expect(temaEfectivo('light', true)).toBe('light');
  });

  test('sin tema del panel, sigue al sistema', () => {
    expect(temaEfectivo(undefined, true)).toBe('dark');
    expect(temaEfectivo(undefined, false)).toBe('light');
  });

  test('un valor desconocido se trata como ausente', () => {
    expect(temaEfectivo('auto', true)).toBe('dark');
    expect(temaEfectivo('', false)).toBe('light');
  });
});
