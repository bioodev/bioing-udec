import { describe, expect, test } from 'vitest';
import { embedInstagram, enlaceInstagram, PATRON_INSTAGRAM } from './instagram';

describe('enlaceInstagram', () => {
  test('publicación y reel, con parámetros', () => {
    expect(enlaceInstagram('https://www.instagram.com/p/C9xYz_1-ab/?igsh=MTIz')).toBe('https://www.instagram.com/p/C9xYz_1-ab/');
    expect(enlaceInstagram('https://instagram.com/reel/DAbc123')).toBe('https://www.instagram.com/reel/DAbc123/');
  });
  test('rechaza perfiles y otros sitios', () => {
    expect(enlaceInstagram('https://www.instagram.com/bioing.udec/')).toBeNull();
    expect(enlaceInstagram('https://example.com/p/abc/')).toBeNull();
    expect(enlaceInstagram('texto')).toBeNull();
  });
  test('el patrón del CMS acepta lo mismo', () => {
    const re = new RegExp(PATRON_INSTAGRAM);
    expect(re.test('https://www.instagram.com/p/C9xYz_1-ab/?igsh=MTIz')).toBe(true);
    expect(re.test('https://www.instagram.com/bioing.udec/')).toBe(false);
  });
});

describe('embedInstagram', () => {
  test('publicación (/p/) con y sin www, con parámetros', () => {
    expect(embedInstagram('https://www.instagram.com/p/C9xYz_1-ab/')).toBe('https://www.instagram.com/p/C9xYz_1-ab/embed/captioned/');
    expect(embedInstagram('https://instagram.com/p/C9xYz_1-ab?igsh=MTIz')).toBe('https://www.instagram.com/p/C9xYz_1-ab/embed/captioned/');
  });
  test('reel (/reel/) con query string', () => {
    expect(embedInstagram('https://www.instagram.com/reel/DAbc123/?igsh=MTIz&utm=x')).toBe('https://www.instagram.com/reel/DAbc123/embed/captioned/');
    expect(embedInstagram('https://instagram.com/reel/DAbc123')).toBe('https://www.instagram.com/reel/DAbc123/embed/captioned/');
  });
  test('devuelve null para enlaces que no son publicación ni reel', () => {
    expect(embedInstagram('https://www.instagram.com/bioing.udec/')).toBeNull();
    expect(embedInstagram('https://example.com/p/abc/')).toBeNull();
    expect(embedInstagram('texto')).toBeNull();
  });
});
