import { describe, expect, test } from 'vitest';
import { BOTS_BLOQUEADOS, BOTS_PERMITIDOS, generarRobots, urlSitemap } from './robots';

const SITIO = 'https://bioing.example';

/** Bloques user-agent del texto, con sus directivas (Allow/Disallow/Crawl-delay). */
function bloques(texto: string): { agente: string; directivas: string[] }[] {
  const salida: { agente: string; directivas: string[] }[] = [];
  let actual: { agente: string; directivas: string[] } | undefined;
  for (const linea of texto.split('\n')) {
    const agente = linea.match(/^User-agent:\s*(.+)$/);
    if (agente) {
      actual = { agente: agente[1]!.trim(), directivas: [] };
      salida.push(actual);
      continue;
    }
    const directiva = linea.trim();
    if (actual && /^(Allow|Disallow|Crawl-delay):/i.test(directiva)) actual.directivas.push(directiva);
  }
  return salida;
}

describe('urlSitemap', () => {
  test('resuelve la ruta relativa contra el sitio', () => {
    expect(urlSitemap(SITIO)).toBe('https://bioing.example/sitemap-index.xml');
  });
  test('acepta un sitio con barra final', () => {
    expect(urlSitemap('https://bioing.example/')).toBe('https://bioing.example/sitemap-index.xml');
  });
});

describe('generarRobots', () => {
  const salida = generarRobots(SITIO);

  test('declara el sitemap con URL absoluta', () => {
    expect(salida).toContain('Sitemap: https://bioing.example/sitemap-index.xml');
    expect(salida).not.toContain('Sitemap: /sitemap-index.xml');
  });

  test('el bloque general permite todo y excluye /admin', () => {
    const general = bloques(salida).find((b) => b.agente === '*');
    expect(general?.directivas).toContain('Allow: /');
    expect(general?.directivas).toContain('Disallow: /admin');
    expect(general?.directivas).toContain('Crawl-delay: 1');
  });

  test('cada bot bloqueado tiene su bloque con Disallow: /', () => {
    const porAgente = bloques(salida);
    for (const agente of BOTS_BLOQUEADOS) {
      const bloque = porAgente.find((b) => b.agente === agente);
      expect(bloque?.directivas, agente).toEqual(['Disallow: /']);
    }
  });

  test('cada bot permitido tiene su bloque con Allow: /', () => {
    const porAgente = bloques(salida);
    for (const agente of BOTS_PERMITIDOS) {
      const bloque = porAgente.find((b) => b.agente === agente);
      expect(bloque?.directivas, agente).toEqual(['Allow: /']);
    }
  });

  test('ningún agente queda bloqueado y permitido a la vez', () => {
    const porAgente = bloques(salida);
    const bloqueados = new Set(BOTS_BLOQUEADOS);
    const permitidos = new Set(BOTS_PERMITIDOS);
    for (const agente of bloqueados) expect(permitidos.has(agente), agente).toBe(false);
    for (const agente of porAgente) {
      const tieneDisallow = agente.directivas.includes('Disallow: /');
      const tieneAllow = agente.directivas.includes('Allow: /');
      expect(tieneDisallow && tieneAllow, agente.agente).toBe(false);
    }
  });

  test('no hay bloques sin directivas', () => {
    for (const bloque of bloques(salida)) {
      expect(bloque.directivas.length, bloque.agente).toBeGreaterThan(0);
    }
  });
});
