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

describe('Deezer', () => {
  test('track y episodio van en 152 px; con prefijo de país (/cl/)', () => {
    expect(incrustado('https://www.deezer.com/cl/track/3135556')).toEqual({
      tipo: 'iframe', proveedor: 'Deezer', src: 'https://widget.deezer.com/widget/auto/track/3135556', alto: 152,
    });
    expect(incrustado('https://deezer.com/episode/987654')).toMatchObject({ src: 'https://widget.deezer.com/widget/auto/episode/987654', alto: 152 });
  });
  test('álbum, playlist y show van en 352 px', () => {
    expect(incrustado('https://www.deezer.com/album/302127')).toMatchObject({ src: 'https://widget.deezer.com/widget/auto/album/302127', alto: 352 });
    expect(incrustado('https://www.deezer.com/playlist/1963962142')).toMatchObject({ alto: 352 });
    expect(incrustado('https://www.deezer.com/show/4321')).toMatchObject({ alto: 352 });
  });
  test('enlace corto deezer.page.link y perfiles → tarjeta', () => {
    expect(incrustado('https://deezer.page.link/AbC')).toEqual(tarjeta('https://deezer.page.link/AbC', 'Deezer'));
    expect(incrustado('https://www.deezer.com/us/artist/27')).toEqual(tarjeta('https://www.deezer.com/us/artist/27', 'Deezer'));
  });
});

describe('Audiomack', () => {
  test('canción va en 252 px; álbum y playlist en 400 px', () => {
    expect(incrustado('https://audiomack.com/artista/song/mi-tema?x=1')).toEqual({
      tipo: 'iframe', proveedor: 'Audiomack', src: 'https://audiomack.com/embed/song/artista/mi-tema', alto: 252,
    });
    expect(incrustado('https://www.audiomack.com/artista/album/disco')).toMatchObject({
      src: 'https://audiomack.com/embed/album/artista/disco', alto: 400,
    });
    expect(incrustado('https://audiomack.com/artista/playlist/lista')).toMatchObject({ alto: 400 });
  });
  test('perfil de artista → tarjeta', () => {
    expect(incrustado('https://audiomack.com/artista')).toEqual(tarjeta('https://audiomack.com/artista', 'Audiomack'));
  });
});

describe('Acast', () => {
  test('episodio va en 190 px; podcast completo en 450 px', () => {
    expect(incrustado('https://shows.acast.com/mi-show/episodes/episodio-1')).toEqual({
      tipo: 'iframe', proveedor: 'Acast', src: 'https://embed.acast.com/mi-show/episodio-1', alto: 190,
    });
    expect(incrustado('https://shows.acast.com/mi-show')).toEqual({
      tipo: 'iframe', proveedor: 'Acast', src: 'https://embed.acast.com/mi-show', alto: 450,
    });
  });
});

describe('Audioboom', () => {
  test('publicación → embed v4, 200 px, con o sin slug', () => {
    expect(incrustado('https://audioboom.com/posts/8123456-bioingenieria-en-vivo')).toEqual({
      tipo: 'iframe', proveedor: 'Audioboom', src: 'https://embeds.audioboom.com/posts/8123456/embed/v4', alto: 200,
    });
    expect(incrustado('https://audioboom.com/posts/8123456')).toMatchObject({ src: 'https://embeds.audioboom.com/posts/8123456/embed/v4' });
  });
});

describe('YouTube listas', () => {
  test('playlist → embed sin cookies de videoseries, 16/9', () => {
    expect(incrustado('https://www.youtube.com/playlist?list=PLabc-123_x')).toEqual({
      tipo: 'iframe', proveedor: 'YouTube', src: 'https://www.youtube-nocookie.com/embed/videoseries?list=PLabc-123_x', proporcion: '16/9',
    });
  });
});

describe('Vimeo privados', () => {
  test('enlace con hash (video oculto por enlace) → player con ?h=', () => {
    expect(incrustado('https://vimeo.com/76979871/a1b2c3d4e5')).toEqual({
      tipo: 'iframe', proveedor: 'Vimeo', src: 'https://player.vimeo.com/video/76979871?h=a1b2c3d4e5', proporcion: '16/9',
    });
  });
});

describe('Twitch', () => {
  const opciones = { dominios: ['bioing.cl', 'localhost'] };
  const parents = '&parent=bioing.cl&parent=localhost';

  test('canal → player en vivo, con parent por cada dominio, 16/9', () => {
    expect(incrustado('https://www.twitch.tv/bioingenieria_udec', opciones)).toEqual({
      tipo: 'iframe', proveedor: 'Twitch', src: `https://player.twitch.tv/?channel=bioingenieria_udec${parents}`, proporcion: '16/9',
    });
  });
  test('video archivado → ?video=v<id>', () => {
    expect(incrustado('https://www.twitch.tv/videos/123456789', opciones)).toMatchObject({
      src: `https://player.twitch.tv/?video=v123456789${parents}`,
    });
  });
  test('clip, en clips.twitch.tv o dentro de un canal → embed de clips', () => {
    expect(incrustado('https://clips.twitch.tv/AwkwardSalamander-abc123', opciones)).toMatchObject({
      src: `https://clips.twitch.tv/embed?clip=AwkwardSalamander-abc123${parents}`,
    });
    expect(incrustado('https://www.twitch.tv/canal/clip/AwkwardSalamander-abc123', opciones)).toMatchObject({
      src: `https://clips.twitch.tv/embed?clip=AwkwardSalamander-abc123${parents}`,
    });
  });
  test('sin dominios no hay reproductor (Twitch lo rechaza): tarjeta', () => {
    expect(incrustado('https://www.twitch.tv/bioingenieria_udec')).toEqual(tarjeta('https://www.twitch.tv/bioingenieria_udec', 'Twitch'));
  });
  test('directorio u otra página → tarjeta', () => {
    expect(incrustado('https://www.twitch.tv/directory/game/Just%20Chatting', opciones)).toEqual(
      tarjeta('https://www.twitch.tv/directory/game/Just%20Chatting', 'Twitch'),
    );
  });
});

describe('TikTok', () => {
  test('video → player oficial, vertical (740 px) para no estirarlo', () => {
    expect(incrustado('https://www.tiktok.com/@usuario/video/7000000000000000000?lang=es')).toEqual({
      tipo: 'iframe', proveedor: 'TikTok', src: 'https://www.tiktok.com/player/v1/7000000000000000000', alto: 740, vertical: true,
    });
  });
  test('perfil y enlaces cortos vm./vt. → tarjeta', () => {
    expect(incrustado('https://www.tiktok.com/@usuario')).toEqual(tarjeta('https://www.tiktok.com/@usuario', 'TikTok'));
    expect(incrustado('https://vm.tiktok.com/ZMabc123/')).toEqual(tarjeta('https://vm.tiktok.com/ZMabc123/', 'TikTok'));
  });
});

describe('LinkedIn', () => {
  test('post con slug (activity) → embed de feed, 600 px', () => {
    expect(incrustado('https://www.linkedin.com/posts/usuario_bioing-activity-7123456789012345678-AbCd?utm=x')).toEqual({
      tipo: 'iframe', proveedor: 'LinkedIn', src: 'https://www.linkedin.com/embed/feed/update/urn:li:activity:7123456789012345678', alto: 600,
    });
  });
  test('URN de feed (share, ugcPost, codificado) → embed con el mismo URN', () => {
    expect(incrustado('https://www.linkedin.com/feed/update/urn:li:share:7123456789')).toMatchObject({
      src: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7123456789',
    });
    expect(incrustado('https://www.linkedin.com/feed/update/urn%3Ali%3AugcPost%3A99')).toMatchObject({
      src: 'https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:99',
    });
  });
  test('perfil o empresa → tarjeta', () => {
    expect(incrustado('https://www.linkedin.com/company/udec')).toEqual(tarjeta('https://www.linkedin.com/company/udec', 'LinkedIn'));
  });
});

describe('Pinterest', () => {
  test('pin → widget oficial, 600 px; dominios regionales (.cl, cl.) cuentan igual', () => {
    const src = 'https://assets.pinterest.com/ext/embed.html?id=123456789';
    expect(incrustado('https://www.pinterest.com/pin/123456789/')).toEqual({ tipo: 'iframe', proveedor: 'Pinterest', src, alto: 600 });
    expect(incrustado('https://cl.pinterest.com/pin/123456789/')).toMatchObject({ src });
    expect(incrustado('https://www.pinterest.cl/pin/123456789/')).toMatchObject({ src });
  });
  test('pin.it, tablero o perfil → tarjeta', () => {
    expect(incrustado('https://pin.it/4xYz')).toEqual(tarjeta('https://pin.it/4xYz', 'Pinterest'));
    expect(incrustado('https://www.pinterest.com/usuario/tablero/')).toEqual(tarjeta('https://www.pinterest.com/usuario/tablero/', 'Pinterest'));
  });
});

describe('Reddit', () => {
  test('publicación → embed de Reddit, 500 px, con su slug', () => {
    expect(incrustado('https://www.reddit.com/r/Biologia/comments/abc123/que_es_la_bio/?share=1')).toEqual({
      tipo: 'iframe', proveedor: 'Reddit', src: 'https://embed.reddit.com/r/Biologia/comments/abc123/que_es_la_bio/', alto: 500,
    });
  });
  test('subreddit o redd.it → tarjeta', () => {
    expect(incrustado('https://www.reddit.com/r/Biologia/')).toEqual(tarjeta('https://www.reddit.com/r/Biologia/', 'Reddit'));
    expect(incrustado('https://redd.it/abc123')).toEqual(tarjeta('https://redd.it/abc123', 'Reddit'));
  });
});

describe('Dailymotion, Loom y TED', () => {
  test('Dailymotion: video y enlace corto dai.ly → 16/9', () => {
    expect(incrustado('https://www.dailymotion.com/video/x7tgad0')).toEqual({
      tipo: 'iframe', proveedor: 'Dailymotion', src: 'https://www.dailymotion.com/embed/video/x7tgad0', proporcion: '16/9',
    });
    expect(incrustado('https://dai.ly/x7tgad0')).toMatchObject({ src: 'https://www.dailymotion.com/embed/video/x7tgad0' });
  });
  test('Loom: enlace de compartir → embed 16/9', () => {
    expect(incrustado('https://www.loom.com/share/abc123def')).toEqual({
      tipo: 'iframe', proveedor: 'Loom', src: 'https://www.loom.com/embed/abc123def', proporcion: '16/9',
    });
  });
  test('TED: charla → embed 16/9', () => {
    expect(incrustado('https://www.ted.com/talks/ken_robinson_says_schools_kill_creativity')).toEqual({
      tipo: 'iframe', proveedor: 'TED', src: 'https://embed.ted.com/talks/ken_robinson_says_schools_kill_creativity', proporcion: '16/9',
    });
  });
});

describe('servicios sin iframe (tarjeta con nombre)', () => {
  test.each([
    ['https://x.com/usuario/status/1', 'X'],
    ['https://twitter.com/usuario/status/1', 'X'],
    ['https://www.tiktok.com/@usuario', 'TikTok'],
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
