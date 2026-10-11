import { describe, expect, test } from 'vitest';
import { itemActividad, itemNoticia } from './feeds';

const SITIO = 'https://bioing.example';

describe('itemNoticia', () => {
  const base = {
    id: 'egresada-premio',
    titulo: 'Egresada obtiene premio de innovación',
    fecha: new Date('2026-08-20T00:00:00Z'),
    bajada: 'Reconocimiento a su labor en salud.',
  };

  test('arma título, enlace absoluto y pubDate con la fecha de la Noticia', () => {
    const item = itemNoticia(base, SITIO);
    expect(item.title).toBe('Egresada obtiene premio de innovación');
    expect(item.link).toBe('https://bioing.example/noticias/egresada-premio');
    expect(item.pubDate).toBe(base.fecha);
  });

  test('usa la bajada como descripción', () => {
    expect(itemNoticia(base, SITIO).description).toBe('Reconocimiento a su labor en salud.');
  });

  test('los Temas ya resueltos van como categorías', () => {
    const item = itemNoticia({ ...base, temas: ['Logros', 'Vida estudiantil'] }, SITIO);
    expect(item.categories).toEqual(['Logros', 'Vida estudiantil']);
  });

  test('sin Temas no emite categorías (arreglo vacío no cuenta)', () => {
    expect(itemNoticia(base, SITIO).categories).toBeUndefined();
    expect(itemNoticia({ ...base, temas: [] }, SITIO).categories).toBeUndefined();
  });

  test('sin bajada la descripción queda vacía y el ítem sigue válido', () => {
    const item = itemNoticia({ ...base, bajada: undefined }, SITIO);
    expect(item.description).toBeUndefined();
    expect(item.title).toBeTruthy();
    expect(item.link).toBeTruthy();
  });

  test('acepta el sitio como URL además de cadena', () => {
    expect(itemNoticia(base, new URL(SITIO)).link).toBe('https://bioing.example/noticias/egresada-premio');
  });

  test('no declara autoría: en Noticias solo hay Personas mencionadas', () => {
    expect(itemNoticia(base, SITIO).author).toBeUndefined();
  });
});

describe('itemActividad', () => {
  const base = {
    id: 'charla-acuicultura',
    titulo: 'Charla de acuicultura sostenible',
    inicio: new Date('2026-06-12T21:00:00Z'),
    tipo: 'Charla',
  };

  test('arma título, enlace absoluto y pubDate con el inicio', () => {
    const item = itemActividad(base, SITIO);
    expect(item.title).toBe('Charla de acuicultura sostenible');
    expect(item.link).toBe('https://bioing.example/agenda/charla-acuicultura');
    expect(item.pubDate).toBe(base.inicio);
  });

  test('la descripción compone el tipo y, si hay, el lugar', () => {
    expect(itemActividad(base, SITIO).description).toBe('Charla');
    expect(itemActividad({ ...base, lugar: 'Sala 201, FCB' }, SITIO).description).toBe('Charla · Sala 201, FCB');
  });

  test('las Áreas ya resueltas van como categorías', () => {
    expect(itemActividad({ ...base, areas: ['Acuicultura'] }, SITIO).categories).toEqual(['Acuicultura']);
    expect(itemActividad(base, SITIO).categories).toBeUndefined();
  });

  test('los Organizadores van como autor', () => {
    const item = itemActividad({ ...base, organizadores: ['Profesora López', 'FCB UdeC'] }, SITIO);
    expect(item.author).toBe('Profesora López, FCB UdeC');
    expect(itemActividad(base, SITIO).author).toBeUndefined();
  });
});
