import { describe, expect, test } from 'vitest';
import { enlaceInstagram, PATRON_INSTAGRAM } from './instagram';

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
