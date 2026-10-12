import { describe, expect, test } from 'vitest';
import { cifrasDelDirectorio, tarjetasComunidad, ultimosDocumentos } from './comunidad';

const doc = (id: string, titulo: string, anio: number) => ({ id, data: { titulo, anio } });

describe('tarjetasComunidad', () => {
  test('con las dos secciones activas salen el Directorio y el Repositorio, en ese orden', () => {
    expect(tarjetasComunidad(true, true)).toEqual(['directorio', 'repositorio']);
  });

  test('una sección desactivada no sale', () => {
    expect(tarjetasComunidad(false, true)).toEqual(['repositorio']);
    expect(tarjetasComunidad(true, false)).toEqual(['directorio']);
  });

  test('si ambas están desactivadas, la banda no tiene tarjetas', () => {
    expect(tarjetasComunidad(false, false)).toEqual([]);
  });
});

describe('cifrasDelDirectorio', () => {
  test('sin egresados/as no hay cifras (ni ceros)', () => {
    expect(cifrasDelDirectorio([])).toEqual([]);
  });

  test('cuenta egresados/as, generaciones y organizaciones distintas', () => {
    const cifras = cifrasDelDirectorio([
      { generacion: 2013, organizacion: 'lab-a' },
      { generacion: 2013, organizacion: 'lab-a' },
      { generacion: 2015, organizacion: 'empresa-b' },
    ]);
    expect(cifras).toEqual([
      { etiqueta: 'Egresados/as', valor: 3 },
      { etiqueta: 'Generaciones', valor: 2 },
      { etiqueta: 'Organizaciones', valor: 2 },
    ]);
  });

  test('omite las cifras en cero: sin organizaciones no aparece la de organizaciones', () => {
    const cifras = cifrasDelDirectorio([{ generacion: 2013 }, { generacion: 2014 }]);
    expect(cifras.map((c) => c.etiqueta)).toEqual(['Egresados/as', 'Generaciones']);
  });
});

describe('ultimosDocumentos', () => {
  test('ordena por año descendente y, dentro del año, por título', () => {
    const docs = [doc('a', 'Reglamento', 2020), doc('b', 'Decreto', 2024), doc('c', 'Acta', 2020)];
    expect(ultimosDocumentos(docs).map((d) => d.id)).toEqual(['b', 'c', 'a']);
  });

  test('por defecto devuelve hasta cuatro documentos', () => {
    const docs = [1, 2, 3, 4, 5, 6].map((n) => doc(`d${n}`, `Doc ${n}`, 2020 + n));
    expect(ultimosDocumentos(docs)).toHaveLength(4);
  });

  test('no modifica el arreglo recibido', () => {
    const docs = [doc('a', 'Z', 2019), doc('b', 'A', 2024)];
    ultimosDocumentos(docs);
    expect(docs.map((d) => d.id)).toEqual(['a', 'b']);
  });
});
