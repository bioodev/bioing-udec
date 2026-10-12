import { describe, expect, test } from 'vitest';
import { REDES, redesVisibles, urlsRedes } from './redes';

describe('REDES', () => {
  test('orden fijo: Instagram, Facebook, X, LinkedIn, YouTube, TikTok, Threads, Bluesky, Mastodon', () => {
    expect(REDES.map((r) => r.clave)).toEqual([
      'instagram', 'facebook', 'x', 'linkedin', 'youtube', 'tiktok', 'threads', 'bluesky', 'mastodon',
    ]);
  });

  test('cada red tiene etiqueta y un ícono de Phosphor', () => {
    expect(REDES.find((r) => r.clave === 'mastodon')).toMatchObject({ etiqueta: 'Mastodon / Fediverso', icono: 'MastodonLogo' });
    expect(REDES.find((r) => r.clave === 'bluesky')).toMatchObject({ icono: 'Butterfly' });
  });
});

describe('redesVisibles', () => {
  test('sin configuración no hay redes', () => {
    expect(redesVisibles({})).toEqual([]);
  });

  test('solo muestra las redes con URL, en el orden de REDES y no en el de la configuración', () => {
    const visibles = redesVisibles({
      mastodon: 'https://mastodon.social/@bioing',
      instagram: 'https://www.instagram.com/bioing',
      linkedin: 'https://www.linkedin.com/company/bioing',
    });
    expect(visibles.map((r) => r.clave)).toEqual(['instagram', 'linkedin', 'mastodon']);
    expect(visibles[0]).toEqual({
      clave: 'instagram', etiqueta: 'Instagram', icono: 'InstagramLogo', url: 'https://www.instagram.com/bioing',
    });
  });

  test('descarta vacías, con espacios y las que no son https', () => {
    expect(redesVisibles({ instagram: '', facebook: '   ', x: 'http://x.com/bioing', tiktok: 'tiktok.com/@bioing' })).toEqual([]);
  });
});

describe('urlsRedes', () => {
  test('devuelve solo las URLs de las redes visibles, para el sameAs', () => {
    expect(urlsRedes({ instagram: 'https://www.instagram.com/bioing', youtube: '' })).toEqual([
      'https://www.instagram.com/bioing',
    ]);
    expect(urlsRedes({})).toEqual([]);
  });
});
