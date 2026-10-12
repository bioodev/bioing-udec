import { describe, expect, test } from 'vitest';
import { incrustado } from './incrustados';

const tarjeta = (url: string, proveedor: string | null) => ({ tipo: 'enlace', proveedor, url });

describe('Spotify', () => {
  test('track y episodio van en 152 px', () => {
    expect(incrustado('https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC')).toEqual({
      tipo: 'iframe', proveedor: 'Spotify', src: 'https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC', alto: 152,
    });
    expect(incrustado('https://open.spotify.com/episode/abc123')).toMatchObject({ src: 'https://open.spotify.com/embed/episode/abc123', alto: 152 });
  });
  test('playlist, álbum, show y artista van en 352 px; con prefijo de idioma y ?si=', () => {
    expect(incrustado('https://open.spotify.com/intl-es/playlist/37i9dQZF1DX?si=abc')).toMatchObject({ src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX', alto: 352 });
    expect(incrustado('https://open.spotify.com/album/1A2b3C')).toMatchObject({ src: 'https://open.spotify.com/embed/album/1A2b3C', alto: 352 });
    expect(incrustado('https://open.spotify.com/show/9xYz')).toMatchObject({ alto: 352 });
    expect(incrustado('https://open.spotify.com/artist/7Ab')).toMatchObject({ alto: 352 });
  });
  test('perfil de usuario no reconocido → tarjeta con el nombre del servicio', () => {
    expect(incrustado('https://open.spotify.com/user/xyz')).toEqual(tarjeta('https://open.spotify.com/user/xyz', 'Spotify'));
  });
});

describe('SoundCloud', () => {
  test('pista (166 px) y set (450 px); sin www ni m. y sin parámetros de seguimiento', () => {
    expect(incrustado('https://soundcloud.com/artista/pista')).toEqual({
      tipo: 'iframe',
      proveedor: 'SoundCloud',
      src: 'https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fartista%2Fpista&visual=false',
      alto: 166,
    });
    expect(incrustado('https://m.soundcloud.com/artista/sets/lista?utm_source=x')).toMatchObject({
      src: 'https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fartista%2Fsets%2Flista&visual=false',
      alto: 450,
    });
  });
  test('raíz o perfil no reconocidos → tarjeta', () => {
    expect(incrustado('https://soundcloud.com/artista')).toEqual(tarjeta('https://soundcloud.com/artista', 'SoundCloud'));
  });
});

describe('Apple Podcasts', () => {
  test('episodio con ?i= va en 175 px y conserva solo ese parámetro', () => {
    expect(incrustado('https://podcasts.apple.com/cl/podcast/nombre/id123456?i=1000654321&uo=4')).toEqual({
      tipo: 'iframe',
      proveedor: 'Apple Podcasts',
      src: 'https://embed.podcasts.apple.com/cl/podcast/nombre/id123456?i=1000654321',
      alto: 175,
    });
  });
  test('podcast completo va en 450 px', () => {
    expect(incrustado('https://www.podcasts.apple.com/cl/podcast/nombre/id123456')).toMatchObject({
      src: 'https://embed.podcasts.apple.com/cl/podcast/nombre/id123456',
      alto: 450,
    });
  });
  test('raíz no reconocida → tarjeta', () => {
    expect(incrustado('https://podcasts.apple.com/')).toEqual(tarjeta('https://podcasts.apple.com/', 'Apple Podcasts'));
  });
});

describe('YouTube', () => {
  test('video → { tipo: youtube } con el id', () => {
    expect(incrustado('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({ tipo: 'youtube', id: 'dQw4w9WgXcQ' });
    expect(incrustado('https://youtu.be/dQw4w9WgXcQ?si=abc')).toEqual({ tipo: 'youtube', id: 'dQw4w9WgXcQ' });
  });
  test('canal no reconocido → tarjeta', () => {
    expect(incrustado('https://www.youtube.com/@canal')).toEqual(tarjeta('https://www.youtube.com/@canal', 'YouTube'));
  });
});

describe('Vimeo', () => {
  test('video por número → reproductor 16/9, con m. y barra final', () => {
    expect(incrustado('https://vimeo.com/76979871')).toEqual({
      tipo: 'iframe', proveedor: 'Vimeo', src: 'https://player.vimeo.com/video/76979871', proporcion: '16/9',
    });
    expect(incrustado('https://www.vimeo.com/76979871/')).toMatchObject({ src: 'https://player.vimeo.com/video/76979871' });
  });
  test('canal no reconocido → tarjeta', () => {
    expect(incrustado('https://vimeo.com/channels/staffpicks')).toEqual(tarjeta('https://vimeo.com/channels/staffpicks', 'Vimeo'));
  });
});

describe('Instagram', () => {
  test('publicación y reel → embed con texto, 600 px', () => {
    expect(incrustado('https://www.instagram.com/p/C3abc_-X/')).toEqual({
      tipo: 'iframe', proveedor: 'Instagram', src: 'https://www.instagram.com/p/C3abc_-X/embed/captioned/', alto: 600,
    });
    expect(incrustado('https://instagram.com/reel/C3abc/?igsh=x')).toMatchObject({
      src: 'https://www.instagram.com/reel/C3abc/embed/captioned/',
    });
  });
  test('perfil → tarjeta', () => {
    expect(incrustado('https://www.instagram.com/bioingenieria_udec/')).toEqual(tarjeta('https://www.instagram.com/bioingenieria_udec/', 'Instagram'));
  });
});

describe('Facebook', () => {
  const plugin = (plugin: string, href: string, extra: string) =>
    `https://www.facebook.com/plugins/${plugin}.php?href=${encodeURIComponent(href)}&${extra}`;

  test('publicación → plugin de post con texto, 600 px', () => {
    // Los posts con story_fbid necesitan la query: se conserva.
    const href = 'https://www.facebook.com/permalink.php?story_fbid=1&id=2';
    expect(incrustado(href)).toEqual({ tipo: 'iframe', proveedor: 'Facebook', src: plugin('post', href, 'show_text=true'), alto: 600 });
  });
  test('video → plugin de video 16/9, sin texto', () => {
    const href = 'https://www.facebook.com/bioingenieria.udec/videos/1234567890';
    expect(incrustado(href)).toEqual({ tipo: 'iframe', proveedor: 'Facebook', src: plugin('video', href, 'show_text=false'), proporcion: '16/9' });
  });
  test('watch?v= y fb.watch son videos', () => {
    expect(incrustado('https://www.facebook.com/watch?v=1234567890')).toMatchObject({
      src: plugin('video', 'https://www.facebook.com/watch/?v=1234567890', 'show_text=false'),
    });
    expect(incrustado('https://fb.watch/abc123/')).toMatchObject({ src: plugin('video', 'https://fb.watch/abc123/', 'show_text=false') });
  });
  test('página o perfil → tarjeta', () => {
    expect(incrustado('https://www.facebook.com/bioingenieria.udec')).toEqual(tarjeta('https://www.facebook.com/bioingenieria.udec', 'Facebook'));
  });
});

describe('Google Maps', () => {
  test('embed tal cual', () => {
    expect(incrustado('https://www.google.com/maps/embed?pb=!1m18!1m12')).toEqual({
      tipo: 'iframe', proveedor: 'Google Maps', src: 'https://www.google.com/maps/embed?pb=!1m18!1m12', alto: 400,
    });
  });
  test('?q= y /place/ se convierten en el embed de búsqueda', () => {
    const q = encodeURIComponent('Universidad de Concepción');
    expect(incrustado('https://www.google.com/maps?q=Universidad+de+Concepción')).toMatchObject({
      src: `https://www.google.com/maps?q=${q}&output=embed`, alto: 400,
    });
    expect(incrustado('https://www.google.com/maps/place/Universidad+de+Concepci%C3%B3n/@-36.8,-73.0,17z')).toMatchObject({
      src: `https://www.google.com/maps?q=${q}&output=embed`,
    });
  });
  test('enlace corto no se resuelve → tarjeta «Google Maps»; búsqueda web → tarjeta sin proveedor', () => {
    expect(incrustado('https://maps.app.goo.gl/AbC123')).toEqual(tarjeta('https://maps.app.goo.gl/AbC123', 'Google Maps'));
    expect(incrustado('https://www.google.com/search?q=bioingenieria')).toEqual(tarjeta('https://www.google.com/search?q=bioingenieria', null));
  });
});

describe('Drive y Docs', () => {
  test('archivo de Drive y documento de Docs → vista previa, 480 px', () => {
    expect(incrustado('https://drive.google.com/file/d/AbC_12-x/view?usp=sharing')).toEqual({
      tipo: 'iframe', proveedor: 'Google Drive', src: 'https://drive.google.com/file/d/AbC_12-x/preview', alto: 480,
    });
    expect(incrustado('https://docs.google.com/document/d/XyZ/edit')).toMatchObject({
      proveedor: 'Google Docs', src: 'https://docs.google.com/document/d/XyZ/preview',
    });
  });
  test('carpeta de Drive → tarjeta', () => {
    expect(incrustado('https://drive.google.com/drive/folders/XyZ')).toEqual(tarjeta('https://drive.google.com/drive/folders/XyZ', 'Google Drive'));
  });
});

describe('servicios sin iframe (tarjeta con nombre)', () => {
  test.each([
    ['https://x.com/usuario/status/1', 'X'],
    ['https://twitter.com/usuario/status/1', 'X'],
    ['https://www.tiktok.com/@usuario/video/123', 'TikTok'],
    ['https://www.linkedin.com/posts/abc', 'LinkedIn'],
    ['https://www.threads.net/@usuario/post/ABC', 'Threads'],
    ['https://bsky.app/profile/x.bsky.social/post/abc', 'Bluesky'],
  ])('%s → %s', (url, proveedor) => {
    expect(incrustado(url)).toEqual(tarjeta(url, proveedor));
  });
});

describe('otras URLs', () => {
  test('https de otro sitio → tarjeta sin proveedor', () => {
    expect(incrustado('https://ejemplo.cl/nota')).toEqual(tarjeta('https://ejemplo.cl/nota', null));
  });
  test('lo que no es URL, o no es https, no rompe: tarjeta sin proveedor', () => {
    expect(incrustado('no es una url')).toEqual(tarjeta('no es una url', null));
    expect(incrustado('http://open.spotify.com/track/abc')).toEqual(tarjeta('http://open.spotify.com/track/abc', null));
    expect(incrustado('javascript:alert(1)')).toEqual(tarjeta('javascript:alert(1)', null));
  });
});
