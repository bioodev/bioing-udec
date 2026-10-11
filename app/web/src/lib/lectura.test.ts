import { describe, expect, test } from 'vitest';
import { minutosLectura } from './lectura';

const palabras = (n: number) => Array.from({ length: n }, () => 'palabra').join(' ');

describe('minutosLectura', () => {
  test('mínimo 1 minuto, también para un texto vacío o muy corto', () => {
    expect(minutosLectura('')).toBe(1);
    expect(minutosLectura(palabras(5))).toBe(1);
  });
  test('~200 palabras por minuto, redondeando hacia arriba', () => {
    expect(minutosLectura(palabras(200))).toBe(1);
    expect(minutosLectura(palabras(201))).toBe(2);
    expect(minutosLectura(palabras(600))).toBe(3);
  });
  test('ignora la sintaxis Markdown: encabezados, énfasis, listas y código de bloque', () => {
    const texto = '## Título\n\n- **negrita** y *cursiva*\n\n```\n' + palabras(500) + '\n```\n';
    expect(minutosLectura(texto)).toBe(1);
  });
  test('ignora URLs, imágenes y etiquetas HTML; el texto de un enlace cuenta', () => {
    const texto = `<div class="x">${palabras(150)}</div> ![foto](/img/a.jpg) [ver el informe completo](https://ejemplo.cl/${palabras(300).replace(/ /g, '-')})`;
    // 150 palabras + 4 del enlace = 154 → 1 minuto (las 300 de la URL no cuentan)
    expect(minutosLectura(texto)).toBe(1);
  });
});
