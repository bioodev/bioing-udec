// El favicon sale del logo del sitio (src/assets/logo.svg). Si cambia el logo, hay que regenerarlo con
// `npm run favicon`; esta prueba falla mientras no coincidan.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const leer = (ruta: string) => readFileSync(new URL(ruta, import.meta.url));
/** Ancho y alto de un PNG (cabecera IHDR). */
const medidasPng = (png: Buffer) => ({ ancho: png.readUInt32BE(16), alto: png.readUInt32BE(20) });

describe('favicon', () => {
  it('favicon.svg es idéntico al logo del sitio', () => {
    expect(leer('../../public/favicon.svg').equals(leer('../assets/logo.svg'))).toBe(true);
  });

  it('favicon.ico es un PNG de 32 × 32', () => {
    expect(medidasPng(leer('../../public/favicon.ico'))).toEqual({ ancho: 32, alto: 32 });
  });

  it('apple-touch-icon.png es un PNG de 180 × 180', () => {
    expect(medidasPng(leer('../../public/apple-touch-icon.png'))).toEqual({ ancho: 180, alto: 180 });
  });
});
