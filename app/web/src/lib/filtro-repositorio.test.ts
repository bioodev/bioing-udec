import { describe, expect, test } from 'vitest';
import { coincideDocumento, TODOS } from './filtro-repositorio';

const reglamento = { texto: 'reglamento de titulacion requisitos memoria tesis', tipo: 'reglamento', temas: ['institucional'], anio: '2024' };
const sin = { texto: '', tipo: TODOS, tema: TODOS, anio: TODOS };

describe('coincideDocumento', () => {
  test('sin filtros', () => expect(coincideDocumento(reglamento, sin)).toBe(true));
  test('palabra clave sin tildes', () => {
    expect(coincideDocumento(reglamento, { ...sin, texto: 'TITULACIÓN' })).toBe(true);
    expect(coincideDocumento(reglamento, { ...sin, texto: 'tesis' })).toBe(true);
    expect(coincideDocumento(reglamento, { ...sin, texto: 'decreto' })).toBe(false);
  });
  test('tipo, tema y año', () => {
    expect(coincideDocumento(reglamento, { ...sin, tipo: 'informe' })).toBe(false);
    expect(coincideDocumento(reglamento, { ...sin, tema: 'institucional' })).toBe(true);
    expect(coincideDocumento(reglamento, { ...sin, tema: 'logros' })).toBe(false);
    expect(coincideDocumento(reglamento, { ...sin, anio: '2023' })).toBe(false);
  });
  test('todo combinado con Y', () =>
    expect(coincideDocumento(reglamento, { texto: 'memoria', tipo: 'reglamento', tema: 'institucional', anio: '2024' })).toBe(true));
});
