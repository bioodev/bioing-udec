import { markdownToHtml } from 'satteri';
import { describe, expect, test } from 'vitest';
import { sanearHtml } from './sanear-html';
import { leerMarcaRecuadro, recuadros } from './recuadros';

const html = (md: string) => markdownToHtml(md, { hastPlugins: [recuadros, sanearHtml] }).html;

describe('leerMarcaRecuadro', () => {
  test.each([
    ['[!NOTA]\nHola', 'nota', 'Hola'],
    ['[!NOTA]', 'nota', ''],
    ['[!NOTE]\nHola', 'nota', 'Hola'],
    ['[!IMPORTANTE]\nHola', 'importante', 'Hola'],
    ['[!IMPORTANT]\nHola', 'importante', 'Hola'],
    ['[!CONSEJO]\nHola', 'consejo', 'Hola'],
    ['[!TIP]\nHola', 'consejo', 'Hola'],
    ['[!ATENCIÓN]\nHola', 'atencion', 'Hola'],
    ['[!ATENCION]\nHola', 'atencion', 'Hola'],
    ['[!WARNING]\nHola', 'atencion', 'Hola'],
    ['[!nota]\nHola', 'nota', 'Hola'],
    ['[!NOTA]  \nHola', 'nota', 'Hola'],
    // En el editor del panel es fácil escribir la marca y el texto en la misma línea.
    ['[!NOTA] en la misma línea', 'nota', 'en la misma línea'],
  ])('reconoce %j', (texto, tipo, resto) => {
    expect(leerMarcaRecuadro(texto)).toEqual({ tipo, resto });
  });

  test.each(['[!FOO]\nHola', 'Hola [!NOTA]', '[!NOTA]pegado', 'Texto normal', '[NOTA]\nHola'])(
    'no es un recuadro: %j',
    (texto) => {
      expect(leerMarcaRecuadro(texto)).toBeNull();
    },
  );
});

describe('recuadros (plugin de Sätteri)', () => {
  test('convierte una cita con marca en un recuadro con título e ícono', () => {
    const salida = html('> [!NOTA]\n> Hola **mundo**\n>\n> Segundo párrafo.');
    expect(salida).toContain('<aside class="recuadro recuadro-nota" role="note">');
    expect(salida).toContain('<p class="recuadro-titulo">');
    expect(salida).toContain('Nota</p>');
    expect(salida).toContain('<svg');
    expect(salida).toContain('<strong>mundo</strong>');
    expect(salida).toContain('<p>Segundo párrafo.</p>');
    expect(salida).toContain('</aside>');
    expect(salida).not.toContain('[!NOTA]');
    expect(salida).not.toContain('<blockquote');
  });

  test.each([
    ['> [!IMPORTANTE]\n> x', 'recuadro-importante', 'Importante'],
    ['> [!CONSEJO]\n> x', 'recuadro-consejo', 'Consejo'],
    ['> [!ATENCIÓN]\n> x', 'recuadro-atencion', 'Atención'],
    ['> [!WARNING]\n> x', 'recuadro-atencion', 'Atención'],
  ])('tipo de %j', (md, clase, titulo) => {
    const salida = html(md);
    expect(salida).toContain(`recuadro ${clase}`);
    expect(salida).toContain(`${titulo}</p>`);
  });

  test('una cita normal queda como cita', () => {
    expect(html('> Una cita')).toBe(markdownToHtml('> Una cita').html);
  });

  test('una marca desconocida queda como cita normal', () => {
    expect(html('> [!FOO]\n> x')).toBe(markdownToHtml('> [!FOO]\n> x').html);
  });

  test('el HTML dentro del recuadro lo sanea el saneador', () => {
    const salida = html('> [!NOTA]\n> <script>alert(1)</script>\n> Texto');
    expect(salida).toContain('recuadro-nota');
    expect(salida).not.toMatch(/<script|alert\(1\)/);
    expect(salida).toContain('Texto');
  });
});
