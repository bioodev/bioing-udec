import { describe, expect, test } from 'vitest';
import { noticiasRelacionadas, type Relacionable } from './relacionadas';

type Candidata = Relacionable & { titulo: string };
const nota = (id: string, fecha: string, datos: Partial<Omit<Candidata, 'id' | 'fecha' | 'titulo'>> = {}): Candidata => ({
  id,
  titulo: id,
  fecha: new Date(fecha),
  temas: [],
  etiquetas: [],
  areas: [],
  ...datos,
});

const actual = nota('actual', '2026-06-01', { temas: ['logros'], etiquetas: ['premio'], areas: ['biotecnologia'] });

describe('noticiasRelacionadas', () => {
  test('excluye la noticia actual', () => {
    const todas = [actual, nota('otra', '2026-05-01')];
    expect(noticiasRelacionadas(actual, todas).map((n) => n.id)).toEqual(['otra']);
  });
  test('puntaje: un Tema (×3) pesa más que una Etiqueta (×2)', () => {
    const conTema = nota('con-tema', '2026-01-01', { temas: ['logros'] });
    const conEtiqueta = nota('con-etiqueta', '2026-05-01', { etiquetas: ['premio'] });
    expect(noticiasRelacionadas(actual, [conEtiqueta, conTema], 2).map((n) => n.id)).toEqual(['con-tema', 'con-etiqueta']);
  });
  test('puntaje: una Etiqueta (×2) pesa más que un Área (×1)', () => {
    const conArea = nota('con-area', '2026-05-01', { areas: ['biotecnologia'] });
    const conEtiqueta = nota('con-etiqueta', '2026-01-01', { etiquetas: ['premio'] });
    expect(noticiasRelacionadas(actual, [conArea, conEtiqueta], 2).map((n) => n.id)).toEqual(['con-etiqueta', 'con-area']);
  });
  test('los puntajes se suman: Tema + Etiqueta (5) supera a Tema + Área (4)', () => {
    const temaYEtiqueta = nota('tema-etiqueta', '2024-01-01', { temas: ['logros'], etiquetas: ['premio'] });
    const temaYArea = nota('tema-area', '2026-05-01', { temas: ['logros'], areas: ['biotecnologia'] });
    expect(noticiasRelacionadas(actual, [temaYArea, temaYEtiqueta], 2).map((n) => n.id)).toEqual(['tema-etiqueta', 'tema-area']);
  });
  test('desempata por la fecha más reciente', () => {
    const vieja = nota('vieja', '2025-01-01', { temas: ['logros'] });
    const nueva = nota('nueva', '2026-03-01', { temas: ['logros'] });
    expect(noticiasRelacionadas(actual, [vieja, nueva], 2).map((n) => n.id)).toEqual(['nueva', 'vieja']);
  });
  test('si faltan coincidencias, completa con las más recientes', () => {
    const sinRelacion1 = nota('s1', '2024-01-01');
    const sinRelacion2 = nota('s2', '2026-02-01');
    const coincide = nota('c', '2023-01-01', { temas: ['logros'] });
    expect(noticiasRelacionadas(actual, [sinRelacion1, sinRelacion2, coincide], 3).map((n) => n.id)).toEqual(['c', 's2', 's1']);
  });
  test('devuelve como máximo n (3 por defecto)', () => {
    const todas = ['a', 'b', 'c', 'd', 'e'].map((id, i) => nota(id, `2026-0${i + 1}-01`));
    expect(noticiasRelacionadas(actual, todas)).toHaveLength(3);
    expect(noticiasRelacionadas(actual, todas, 1)).toHaveLength(1);
  });
  test('sin otras noticias devuelve una lista vacía', () => {
    expect(noticiasRelacionadas(actual, [actual])).toEqual([]);
  });
});
