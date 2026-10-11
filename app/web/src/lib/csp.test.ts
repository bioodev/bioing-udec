import { describe, expect, test } from 'vitest';
import { actualizarScriptSrc, extraerScriptsInline, hashScript } from './csp';

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
