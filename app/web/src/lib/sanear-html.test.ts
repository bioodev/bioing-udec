import { markdownToHtml } from 'satteri';
import { describe, expect, test } from 'vitest';
import { sanearHtml, urlSegura } from './sanear-html';

const html = (md: string) => markdownToHtml(md, { hastPlugins: [sanearHtml] }).html;

describe('urlSegura', () => {
  test.each(['https://www.udec.cl', 'http://x.cl', '/noticias', '#seccion', '?q=1', 'foto.png', 'mailto:a@udec.cl', 'tel:+56412204000'])('acepta %j', (url) => {
    expect(urlSegura(url)).toBe(true);
  });
  test.each(['javascript:alert(1)', ' JavaScript:alert(1)', 'java\tscript:alert(1)', 'data:text/html,x', 'vbscript:x', 'file:///etc/passwd'])('rechaza %j', (url) => {
    expect(urlSegura(url)).toBe(false);
  });
});

describe('sanearHtml (plugin de Sätteri para el cuerpo Markdown)', () => {
  test('conserva el Markdown normal del editor', () => {
    const md = '## Título\n\nTexto con **negrita**, [un enlace](https://www.udec.cl) y [otro](/noticias).\n\n- uno\n- dos\n\n![Foto](/foto.png)';
    expect(html(md)).toBe(markdownToHtml(md).html);
  });

  test.each([
    "<script>alert('x')</script>",
    '<img src="x" onerror="alert(1)">',
    '<iframe src="https://evil.example"></iframe>',
    '<meta http-equiv="refresh" content="0;url=https://evil.example">',
    '<a href="https://evil.example" style="position:fixed;inset:0">tapa todo</a>',
    '<form action="https://evil.example"><input name="clave"></form>',
    'Texto en línea con <span onclick="x">html</span>.',
  ])('quita el HTML crudo: %s', (crudo) => {
    const salida = html(`Antes\n\n${crudo}\n\nDespués`);
    expect(salida).not.toMatch(/<(script|iframe|meta|form|input|img|span)\b|onerror|onclick|style=|evil\.example/);
    expect(salida).toContain('Antes');
    expect(salida).toContain('Después');
  });

  test('un enlace de Markdown con javascript: queda como texto', () => {
    expect(html('[malo](javascript:alert(1)) y [bueno](https://udec.cl)')).toBe('<p>malo y <a href="https://udec.cl">bueno</a></p>\n');
  });

  test('una imagen de Markdown con data: se quita', () => {
    expect(html('![x](data:image/svg+xml,<svg/onload=alert(1)>)')).not.toContain('<img');
  });
});
