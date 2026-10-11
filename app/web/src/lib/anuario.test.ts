import { describe, expect, test } from 'vitest';
import { agruparPorGeneracion } from './anuario';

const p = (nombre: string, generacion?: number) => ({ nombre, generacion });

describe('agruparPorGeneracion', () => {
  test('agrupa, ordena generaciones ascendente y nombres en español', () => {
    const grupos = agruparPorGeneracion([p('Óscar Ruiz', 2010), p('Ana Soto', 2012), p('Ñuñez Paz', 2010), p('Nicolás Vera', 2010)]);
    expect(grupos.map((g) => g.generacion)).toEqual([2010, 2012]);
    expect(grupos[0].personas.map((x) => x.nombre)).toEqual(['Nicolás Vera', 'Ñuñez Paz', 'Óscar Ruiz']);
  });
  test('sin generación va al final con generacion null', () => {
    const grupos = agruparPorGeneracion([p('Beatriz Lagos'), p('Ana Soto', 2012)]);
    expect(grupos.map((g) => g.generacion)).toEqual([2012, null]);
    expect(grupos[1].personas[0].nombre).toBe('Beatriz Lagos');
  });
  test('lista vacía', () => expect(agruparPorGeneracion([])).toEqual([]));
});
