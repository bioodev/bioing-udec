import { describe, expect, test } from 'vitest';
import { enlaceDelSitio, urlWeb } from './urls';

const PELIGROSAS = ['javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', 'file:///etc/passwd'];

describe('urlWeb (dirección externa de un campo del panel)', () => {
  test('acepta https y http', () => {
    expect(urlWeb.safeParse('https://www.udec.cl/x?y=1').success).toBe(true);
    expect(urlWeb.safeParse('http://www.udec.cl').success).toBe(true);
  });
  test.each(PELIGROSAS)('rechaza %s', (url) => {
    expect(urlWeb.safeParse(url).success).toBe(false);
  });
});

describe('enlaceDelSitio (ruta interna o dirección externa, p. ej. el enlace de un Banner)', () => {
  test('acepta rutas internas y direcciones web', () => {
    for (const url of ['/noticias/mi-noticia', '/p/bioingenieria', '/', 'https://www.udec.cl', 'http://www.udec.cl']) {
      expect(enlaceDelSitio.safeParse(url).success).toBe(true);
    }
  });
  test('rechaza rutas que salen del sitio y textos sueltos', () => {
    for (const url of ['//evil.com', 'udec.cl', 'noticias', '']) expect(enlaceDelSitio.safeParse(url).success).toBe(false);
  });
  test.each(PELIGROSAS)('rechaza %s', (url) => {
    expect(enlaceDelSitio.safeParse(url).success).toBe(false);
  });
});
