import { describe, expect, test } from 'vitest';
import { nombreQr, qrDataUrl, qrSvg } from './qr';

const url = 'https://bioing.example/noticias/congreso-2026';

describe('qrSvg', () => {
  test('devuelve un SVG con viewBox', () => {
    const svg = qrSvg(url);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
  });
  test('cambia con la URL codificada', () => {
    expect(qrSvg(url)).not.toBe(qrSvg('https://bioing.example/noticias/otra'));
  });
  test('es determinista: la misma URL da el mismo SVG', () => {
    expect(qrSvg(url)).toBe(qrSvg(url));
  });
  test('usa colores fijos (oscuro sobre claro), no los del tema', () => {
    const svg = qrSvg(url);
    expect(svg).toContain('#000000');
    expect(svg).toContain('#ffffff');
  });
});

describe('qrDataUrl', () => {
  test('codifica el SVG como data URL, reversible con decodeURIComponent', () => {
    const data = qrDataUrl(url);
    expect(data.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(data.slice('data:image/svg+xml;charset=utf-8,'.length))).toBe(qrSvg(url));
  });
});

describe('nombreQr', () => {
  test('toma el último segmento de la ruta de la ficha', () => {
    expect(nombreQr(url)).toBe('codigo-qr-congreso-2026.svg');
  });
  test('en la portada usa un nombre genérico', () => {
    expect(nombreQr('https://bioing.example/')).toBe('codigo-qr-bioing.svg');
  });
  test('ignora la barra final y el query', () => {
    expect(nombreQr('https://bioing.example/agenda/charla/?ref=x')).toBe('codigo-qr-charla.svg');
  });
});
