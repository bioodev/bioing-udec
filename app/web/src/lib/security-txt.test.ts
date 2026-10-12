// El archivo security.txt (RFC 9116) es provisional: su Contact y su Expires se cambian al migrar a la cuenta y el
// dominio de la carrera (docs/guia-mantencion.md §10). Esta prueba solo exige que el formato sea válido. No falla por
// fecha vencida (bloquearía el build el día que venza): avisa en consola cuando faltan menos de 60 días.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const texto = readFileSync(new URL('../../public/.well-known/security.txt', import.meta.url), 'utf8');
/** Campos del archivo: líneas «Clave: valor», sin los comentarios que empiezan con «#». */
const campos = (contenido: string) =>
  contenido
    .split('\n')
    .map((linea) => linea.trim())
    .filter((linea) => linea !== '' && !linea.startsWith('#'))
    .map((linea) => {
      const i = linea.indexOf(':');
      return { clave: linea.slice(0, i).trim(), valor: linea.slice(i + 1).trim() };
    });
const valor = (clave: string) => campos(texto).find((c) => c.clave === clave)?.valor;
const DIA_MS = 24 * 60 * 60 * 1000;

describe('security.txt (RFC 9116)', () => {
  it('Contact es una URL https:// o un mailto:', () => {
    expect(valor('Contact')).toMatch(/^(https:\/\/\S+|mailto:\S+@\S+)$/);
  });

  it('Expires es una fecha ISO 8601 con zona horaria', () => {
    const expires = valor('Expires') ?? '';
    expect(expires).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/);
    expect(Number.isNaN(Date.parse(expires))).toBe(false);
  });

  it('Preferred-Languages está declarado', () => {
    expect(valor('Preferred-Languages')).toMatch(/^[a-z]{2}(-[A-Za-z]{2})?(, ?[a-z]{2}(-[A-Za-z]{2})?)*$/);
  });

  it('avisa en consola si Expires vence en menos de 60 días (sin fallar)', () => {
    const vence = Date.parse(valor('Expires') ?? '');
    const dias = Math.floor((vence - Date.now()) / DIA_MS);
    if (dias < 60) console.warn(`security.txt: Expires vence en ${dias} días; renovarlo (guia-mantencion.md §10).`);
  });
});
