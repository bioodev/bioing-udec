import { describe, expect, test } from 'vitest';
import { seccionesPublicadas } from './secciones-inicio';

describe('seccionesPublicadas', () => {
  test('deja fuera las secciones no publicadas y conserva el orden de la lista', () => {
    const secciones = [
      { titulo: 'A', publicado: true },
      { titulo: 'B', publicado: false },
      { titulo: 'C', publicado: true },
    ];
    expect(seccionesPublicadas(secciones).map((s) => s.titulo)).toEqual(['A', 'C']);
  });

  test('sin secciones devuelve una lista vacía', () => {
    expect(seccionesPublicadas([])).toEqual([]);
  });
});
