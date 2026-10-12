// El panel carga Sveltia CMS desde unpkg. Sin versión fija, cada versión nueva llegaría al panel sin probarla y
// podría romper la configuración, las vistas previas o chocar con la CSP de /admin/*. Esta prueba exige una versión
// exacta con su hash (integrity). Para actualizar: docs/despliegue-cloudflare.md, «Actualizar Sveltia CMS».
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../../public/admin/index.html', import.meta.url), 'utf8');
const script = html.match(/<script[^>]*sveltia-cms\.js[^>]*>/)?.[0] ?? '';

describe('carga de Sveltia CMS en el panel', () => {
  it('existe el script de Sveltia', () => {
    expect(script).not.toBe('');
  });

  it('fija una versión exacta (no «latest» ni un rango)', () => {
    expect(script).toMatch(/@sveltia\/cms@\d+\.\d+\.\d+\/dist\/sveltia-cms\.js/);
  });

  it('lleva hash de integridad y crossorigin', () => {
    expect(script).toMatch(/integrity="sha384-[A-Za-z0-9+/=]+"/);
    expect(script).toMatch(/crossorigin="anonymous"/);
  });
});
