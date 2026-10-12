import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { actualizarScriptSrc, extraerScriptsInline, hashScript } from './csp';
import { incrustado } from './incrustados';

// Hash SHA-256 (base64) de la cadena vacía: referencia fija para el algoritmo.
const HASH_VACIO = 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';

const HEADERS = `# comentario
/*
  X-Content-Type-Options: nosniff
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:

/admin/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com

https://*.workers.dev/*
  X-Robots-Tag: noindex
`;

describe('extraerScriptsInline', () => {
  test('devuelve el texto exacto de los scripts inline ejecutables', () => {
    const html = '<script>var a = 1;</script><script type="module">import "x";</script>';
    expect(extraerScriptsInline(html)).toEqual(['var a = 1;', 'import "x";']);
  });

  test('ignora scripts con src', () => {
    const html = '<script src="/_astro/a.js"></script><script type="module" src="/b.js"></script>';
    expect(extraerScriptsInline(html)).toEqual([]);
  });

  test('ignora bloques de datos que no se ejecutan (JSON-LD, importmap, plantillas)', () => {
    const html =
      '<script type="application/ld+json">{"@context":"https://schema.org"}</script>' +
      '<script type="text/template">{{x}}</script>' +
      '<script type="application/json">{}</script>';
    expect(extraerScriptsInline(html)).toEqual([]);
  });

  test('acepta los tipos JavaScript explícitos', () => {
    const html = '<script type="text/javascript">a()</script><script type="application/javascript">b()</script>';
    expect(extraerScriptsInline(html)).toEqual(['a()', 'b()']);
  });

  test('conserva los scripts con saltos de línea y atributos extra', () => {
    const html = '<script is:inline data-x="1">\n  f();\n</script>';
    expect(extraerScriptsInline(html)).toEqual(['\n  f();\n']);
  });
});

describe('hashScript', () => {
  test('calcula el sha256 base64 con el prefijo sha256-', () => {
    expect(hashScript('')).toBe(HASH_VACIO);
  });

  test('cambia si cambia un solo carácter (incluidos los espacios)', () => {
    expect(hashScript('f();')).not.toBe(hashScript('f(); '));
  });
});

describe('actualizarScriptSrc', () => {
  test('agrega los hashes a script-src de la regla /* sin tocar otras reglas', () => {
    const salida = actualizarScriptSrc(HEADERS, [HASH_VACIO]);
    expect(salida).toContain(`script-src 'self' '${HASH_VACIO}';`);
    // /admin/* conserva su script-src original.
    expect(salida).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com");
    expect(salida).not.toMatch(new RegExp(`/admin/\\*[\\s\\S]*${HASH_VACIO}`));
    // El resto de directivas y reglas quedan igual.
    expect(salida).toContain("style-src 'self' 'unsafe-inline'; img-src 'self' data:");
    expect(salida).toContain('X-Robots-Tag: noindex');
  });

  test('es idempotente: reejecutar no duplica ni acumula hashes', () => {
    const primera = actualizarScriptSrc(HEADERS, [HASH_VACIO]);
    const segunda = actualizarScriptSrc(primera, [HASH_VACIO]);
    expect(segunda).toBe(primera);
  });

  test('reemplaza los hashes anteriores por el conjunto nuevo', () => {
    const otro = hashScript('x');
    const salida = actualizarScriptSrc(actualizarScriptSrc(HEADERS, [HASH_VACIO]), [otro]);
    expect(salida).toContain(`script-src 'self' '${otro}';`);
    expect(salida).not.toContain(HASH_VACIO);
  });

  test('sin hashes deja la directiva igual que antes', () => {
    expect(actualizarScriptSrc(HEADERS, [])).toBe(HEADERS);
  });

  test('lanza error si no hay regla /* con script-src', () => {
    expect(() => actualizarScriptSrc('/admin/*\n  Content-Security-Policy: script-src \'self\'\n', [HASH_VACIO])).toThrow(
      /regla \/\*/,
    );
  });
});

// Todo iframe que produce el parser de incrustados tiene su origen en frame-src de la regla /* (la primera
// con esa directiva, porque /admin/* viene después). Si no, el navegador lo bloquea sin avisar en el código.
describe('frame-src cubre los embeds de incrustados', () => {
  const headers = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');
  const frameSrc = headers.split('\n').find((l) => /\bframe-src\b/.test(l))!.match(/frame-src ([^;]+)/)![1]!.split(' ');

  const EJEMPLOS = [
    'https://www.youtube.com/playlist?list=PL1', 'https://open.spotify.com/track/abc', 'https://soundcloud.com/a/b',
    'https://podcasts.apple.com/cl/podcast/x/id1?i=2', 'https://vimeo.com/1/abc', 'https://www.instagram.com/p/abc/',
    'https://www.facebook.com/a/posts/1', 'https://www.google.com/maps?q=x', 'https://drive.google.com/file/d/a/view',
    'https://docs.google.com/document/d/a/edit', 'https://www.tiktok.com/@a/video/1',
    'https://www.linkedin.com/posts/a-activity-1234567890123456789-x', 'https://www.pinterest.com/pin/1/',
    'https://www.reddit.com/r/a/comments/b/', 'https://www.twitch.tv/a', 'https://clips.twitch.tv/x',
    'https://www.dailymotion.com/video/x1', 'https://www.loom.com/share/a', 'https://www.ted.com/talks/a',
    'https://giphy.com/gifs/a-b1', 'https://www.deezer.com/track/1', 'https://audiomack.com/a/song/b',
    'https://shows.acast.com/a', 'https://audioboom.com/posts/1', 'https://www.behance.net/gallery/1/a',
    'https://www.figma.com/file/a/b', 'https://www.canva.com/design/a/b/view', 'https://codepen.io/a/pen/b',
    'https://codesandbox.io/s/a', 'https://issuu.com/a/docs/b', 'https://sketchfab.com/models/0123456789abcdef0123456789abcdef',
  ];

  test.each(EJEMPLOS)('%s', (url) => {
    const inc = incrustado(url, { dominios: ['bioing.cl', 'localhost'] });
    expect(inc.tipo).toBe('iframe');
    if (inc.tipo === 'iframe') expect(frameSrc).toContain(new URL(inc.src).origin);
  });
});

// El beacon de Cloudflare Web Analytics (ADR 0012) solo se carga si hay token en el panel, pero la CSP ya lo
// permite: si alguien quita estos orígenes, la analítica falla en silencio (el navegador la bloquea sin avisar).
describe('la regla /* permite el beacon de Cloudflare Web Analytics', () => {
  const headers = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');
  const regla = headers.slice(headers.indexOf('\n/*\n'), headers.indexOf('\n/admin/*'));
  const directiva = (nombre: string) => regla.match(new RegExp(`\\b${nombre} ([^;]+)`))![1]!.split(' ');

  test('script-src admite static.cloudflareinsights.com', () => {
    expect(directiva('script-src')).toContain('https://static.cloudflareinsights.com');
  });

  test('connect-src admite cloudflareinsights.com (envío de las visitas)', () => {
    expect(directiva('connect-src')).toContain('https://cloudflareinsights.com');
  });
});

// Cabeceras de seguridad del sitio público (regla /*) y del panel (/admin/*). Guardianes: si alguien las quita o las
// debilita, la prueba falla (revisión de seguridad del 2026-10-12).
describe('cabeceras de seguridad', () => {
  const headers = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');
  const publica = headers.slice(headers.indexOf('\n/*\n'), headers.indexOf('\n/admin/*'));
  const panel = headers.slice(headers.indexOf('\n/admin/*'), headers.indexOf('\n/_astro/*'));
  const csp = publica.match(/Content-Security-Policy: ([^\n]+)/)![1]!;
  const directiva = (nombre: string) => csp.match(new RegExp(`(?:^|; )${nombre} ([^;]+)`))?.[1]?.split(' ') ?? [];

  test('la CSP pública no admite scripts inline ni eval', () => {
    expect(directiva('script-src')).not.toContain("'unsafe-inline'");
    expect(directiva('script-src')).not.toContain("'unsafe-eval'");
  });

  test('la CSP pública limita formularios, base, objetos y quién incrusta el sitio', () => {
    expect(directiva('form-action')).toEqual(["'self'"]);
    expect(directiva('base-uri')).toEqual(["'self'"]);
    expect(directiva('object-src')).toEqual(["'none'"]);
    expect(directiva('frame-ancestors')).toEqual(["'none'"]);
  });

  test.each([
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'X-Frame-Options: DENY',
    'Strict-Transport-Security: max-age=31536000; includeSubDomains',
    'Cross-Origin-Opener-Policy: same-origin',
  ])('el sitio público envía %s', (cabecera) => {
    expect(publica).toContain(`\n  ${cabecera}\n`);
  });

  test('el sitio público desactiva cámara, micrófono, ubicación, pagos y USB', () => {
    const politica = publica.match(/Permissions-Policy: ([^\n]+)/)?.[1] ?? '';
    for (const permiso of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) expect(politica).toContain(`${permiso}=()`);
  });

  test('el panel reemplaza (no suma) las cabeceras de /* que necesita distintas', () => {
    for (const nombre of ['X-Frame-Options', 'Content-Security-Policy', 'Cross-Origin-Opener-Policy']) {
      expect(panel).toContain(`! ${nombre}`);
    }
    expect(panel).toContain('Cross-Origin-Opener-Policy: same-origin-allow-popups');
  });
});
