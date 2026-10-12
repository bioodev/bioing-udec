// Contenido incrustado de Noticias y Actividades (campo `incrustados`): a partir de la URL pública que
// pega la persona, un reproductor o una tarjeta-enlace. Puro, con test. Lista cerrada de proveedores:
// para sumar uno, este archivo es el punto único (docs/guia-evolucion.md §3.6).
import { idYouTube, vistaPreviaDrive } from './enlaces';
import { embedInstagram } from './instagram';

export type Incrustado =
  | { tipo: 'iframe'; proveedor: string; src: string; alto?: number; proporcion?: '16/9'; vertical?: true }
  | { tipo: 'youtube'; id: string }
  | { tipo: 'enlace'; proveedor: string | null; url: string };

// Servicios sin reproductor por iframe estable (X, Threads, Bluesky, perfiles, enlaces cortos): tarjeta con su nombre.
const SIN_IFRAME = new Map([
  ['x.com', 'X'],
  ['twitter.com', 'X'],
  ['tiktok.com', 'TikTok'],
  ['vm.tiktok.com', 'TikTok'],
  ['vt.tiktok.com', 'TikTok'],
  ['linkedin.com', 'LinkedIn'],
  ['pin.it', 'Pinterest'],
  ['redd.it', 'Reddit'],
  ['threads.net', 'Threads'],
  ['bsky.app', 'Bluesky'],
  ['maps.app.goo.gl', 'Google Maps'],
  ['deezer.page.link', 'Deezer'],
]);

// Pinterest tiene dominios regionales: pinterest.cl, cl.pinterest.com, etc.
const PINTEREST = /^(?:[a-z]{2}\.)?pinterest\.(?:com|cl)$/;

const decodificar = (texto: string) => {
  try { return decodeURIComponent(texto); } catch { return texto; }
};

export interface OpcionesIncrustado {
  /** Dominios donde se muestra la página: Twitch exige `parent` con cada uno. Sin ellos, Twitch queda como tarjeta. */
  dominios?: string[];
}

/** Cómo se muestra una URL pegada en Noticias o Actividades: reproductor, o tarjeta si no se puede incrustar. */
export function incrustado(url: string, { dominios = [] }: OpcionesIncrustado = {}): Incrustado {
  const tarjeta = (proveedor: string | null): Incrustado => ({ tipo: 'enlace', proveedor, url });
  let u: URL;
  try { u = new URL(url); } catch { return tarjeta(null); }
  if (u.protocol !== 'https:') return tarjeta(null);

  // Sin www. ni m.: la forma canónica del host decide el proveedor y la URL de inserción.
  const host = u.hostname.replace(/^(www|m)\./, '');
  const ruta = u.pathname;
  const canonica = `https://${host}${ruta}${u.search}`;

  const yt = idYouTube(url);
  if (yt) return { tipo: 'youtube', id: yt };
  // YouTube: listas por su embed sin cookies; el resto (canales, búsquedas) queda como tarjeta.
  if (host === 'youtube.com' || host === 'youtu.be') {
    const lista = ruta === '/playlist' ? u.searchParams.get('list') : null;
    return lista && /^[\w-]+$/.test(lista)
      ? { tipo: 'iframe', proveedor: 'YouTube', src: `https://www.youtube-nocookie.com/embed/videoseries?list=${lista}`, proporcion: '16/9' }
      : tarjeta('YouTube');
  }

  if (host === 'open.spotify.com') {
    const m = ruta.match(/^\/(?:intl-[a-z]{2}\/)?(track|episode|show|playlist|album|artist)\/(\w+)\/?$/);
    if (!m) return tarjeta('Spotify');
    const alto = m[1] === 'track' || m[1] === 'episode' ? 152 : 352;
    return { tipo: 'iframe', proveedor: 'Spotify', src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, alto };
  }

  if (host === 'soundcloud.com') {
    const partes = ruta.split('/').filter(Boolean);
    const esSet = partes.length === 3 && partes[1] === 'sets';
    if (partes.length !== 2 && !esSet) return tarjeta('SoundCloud');
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://soundcloud.com/${partes.join('/')}`)}&visual=false`;
    return { tipo: 'iframe', proveedor: 'SoundCloud', src, alto: esSet ? 450 : 166 };
  }

  if (host === 'podcasts.apple.com') {
    if (ruta === '/') return tarjeta('Apple Podcasts');
    const episodio = u.searchParams.get('i');
    const sufijo = episodio && /^\d+$/.test(episodio) ? `?i=${episodio}` : '';
    return { tipo: 'iframe', proveedor: 'Apple Podcasts', src: `https://embed.podcasts.apple.com${ruta}${sufijo}`, alto: sufijo ? 175 : 450 };
  }

  // Vimeo: video público (`/<id>`) o privado por enlace (`/<id>/<hash>`, que el player pide como ?h=).
  if (host === 'vimeo.com') {
    const m = ruta.match(/^\/(\d+)(?:\/([\da-f]+))?\/?$/);
    if (!m) return tarjeta('Vimeo');
    const hash = m[2] ? `?h=${m[2]}` : '';
    return { tipo: 'iframe', proveedor: 'Vimeo', src: `https://player.vimeo.com/video/${m[1]}${hash}`, proporcion: '16/9' };
  }

  if (host === 'instagram.com') {
    const src = embedInstagram(canonica.replace(`https://${host}`, 'https://www.instagram.com'));
    return src ? { tipo: 'iframe', proveedor: 'Instagram', src, alto: 600 } : tarjeta('Instagram');
  }

  if (host === 'facebook.com' || host === 'fb.watch') {
    const plugin = (tipo: 'post' | 'video', href: string) =>
      tipo === 'post'
        ? { tipo: 'iframe' as const, proveedor: 'Facebook', src: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(href)}&show_text=true`, alto: 600 }
        : { tipo: 'iframe' as const, proveedor: 'Facebook', src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false`, proporcion: '16/9' as const };

    if (host === 'fb.watch') {
      const m = ruta.match(/^\/([\w-]+)\/?$/);
      return m ? plugin('video', `https://fb.watch/${m[1]}/`) : tarjeta('Facebook');
    }
    const video = u.searchParams.get('v');
    if (ruta === '/watch' || ruta === '/watch/') {
      return video && /^\d+$/.test(video) ? plugin('video', `https://www.facebook.com/watch/?v=${video}`) : tarjeta('Facebook');
    }
    const permalink = ruta === '/permalink.php' && u.searchParams.has('story_fbid');
    if (permalink || ruta.includes('/posts/')) return plugin('post', `https://www.facebook.com${ruta}${u.search}`);
    if (ruta.includes('/videos/')) return plugin('video', `https://www.facebook.com${ruta}`);
    return tarjeta('Facebook');
  }

  if (host === 'google.com' && ruta.startsWith('/maps')) {
    if (ruta.startsWith('/maps/embed') && u.searchParams.has('pb')) {
      return { tipo: 'iframe', proveedor: 'Google Maps', src: `https://www.google.com${ruta}${u.search}`, alto: 400 };
    }
    const place = ruta.match(/^\/maps\/place\/([^/]+)/);
    const lugar = u.searchParams.get('q') ?? (place ? decodificar(place[1]!).replace(/\+/g, ' ') : null);
    if (!lugar) return tarjeta('Google Maps');
    return { tipo: 'iframe', proveedor: 'Google Maps', src: `https://www.google.com/maps?q=${encodeURIComponent(lugar)}&output=embed`, alto: 400 };
  }

  if (host === 'drive.google.com' || host === 'docs.google.com') {
    const proveedor = host === 'docs.google.com' ? 'Google Docs' : 'Google Drive';
    const src = vistaPreviaDrive(canonica);
    return src ? { tipo: 'iframe', proveedor, src, alto: 480 } : tarjeta(proveedor);
  }

  // TikTok: video (`/@usuario/video/<id>`), reproductor vertical. Perfiles y enlaces cortos, tarjeta.
  if (host === 'tiktok.com') {
    const id = ruta.match(/^\/@[\w.]+\/video\/(\d+)\/?$/)?.[1];
    return id ? { tipo: 'iframe', proveedor: 'TikTok', src: `https://www.tiktok.com/player/v1/${id}`, alto: 740, vertical: true } : tarjeta('TikTok');
  }

  // LinkedIn: post por su URN (activity, share o ugcPost), que el embed de feed acepta tal cual.
  if (host === 'linkedin.com') {
    const decodificada = decodificar(ruta);
    const actividad = decodificada.match(/^\/posts\/[^/]*-activity-(\d+)/)?.[1];
    const feed = decodificada.match(/^\/feed\/update\/urn:li:(activity|share|ugcPost):(\d+)/);
    const urn = actividad ? `urn:li:activity:${actividad}` : feed ? `urn:li:${feed[1]}:${feed[2]}` : null;
    return urn ? { tipo: 'iframe', proveedor: 'LinkedIn', src: `https://www.linkedin.com/embed/feed/update/${urn}`, alto: 600 } : tarjeta('LinkedIn');
  }

  if (PINTEREST.test(host)) {
    const id = ruta.match(/^\/pin\/(\d+)\/?$/)?.[1];
    return id ? { tipo: 'iframe', proveedor: 'Pinterest', src: `https://assets.pinterest.com/ext/embed.html?id=${id}`, alto: 600 } : tarjeta('Pinterest');
  }

  if (host === 'reddit.com') {
    const publicacion = ruta.match(/^\/r\/\w+\/comments\/\w+(?:\/[^/]*)?\/?$/);
    return publicacion
      ? { tipo: 'iframe', proveedor: 'Reddit', src: `https://embed.reddit.com${ruta.replace(/\/?$/, '/')}`, alto: 500 }
      : tarjeta('Reddit');
  }

  // Twitch: canal, video archivado, clip (clips.twitch.tv o dentro de un canal). Necesita `parent`.
  if (host === 'twitch.tv' || host === 'clips.twitch.tv') {
    if (dominios.length === 0) return tarjeta('Twitch');
    const parents = dominios.map((d) => `&parent=${encodeURIComponent(d)}`).join('');
    const partes = ruta.split('/').filter(Boolean);
    const clip = host === 'clips.twitch.tv' && partes.length === 1 ? partes[0]
      : host === 'twitch.tv' && partes.length === 3 && partes[1] === 'clip' ? partes[2]
      : null;
    if (clip && /^[\w-]+$/.test(clip)) return { tipo: 'iframe', proveedor: 'Twitch', src: `https://clips.twitch.tv/embed?clip=${clip}${parents}`, proporcion: '16/9' };
    if (host === 'twitch.tv' && partes[0] === 'videos' && partes.length === 2 && /^\d+$/.test(partes[1]!)) {
      return { tipo: 'iframe', proveedor: 'Twitch', src: `https://player.twitch.tv/?video=v${partes[1]}${parents}`, proporcion: '16/9' };
    }
    const canal = partes.length === 1 && !RESERVADOS_TWITCH.has(partes[0]!) && /^\w+$/.test(partes[0]!) ? partes[0] : null;
    if (host === 'twitch.tv' && canal) return { tipo: 'iframe', proveedor: 'Twitch', src: `https://player.twitch.tv/?channel=${canal}${parents}`, proporcion: '16/9' };
    return tarjeta('Twitch');
  }

  // Dailymotion: video (`/video/<id>`) o enlace corto dai.ly/<id>.
  if (host === 'dailymotion.com' || host === 'dai.ly') {
    const id = (host === 'dai.ly' ? ruta.match(/^\/([\da-z]+)\/?$/i) : ruta.match(/^\/video\/([\da-z]+)\/?$/i))?.[1];
    return id ? { tipo: 'iframe', proveedor: 'Dailymotion', src: `https://www.dailymotion.com/embed/video/${id}`, proporcion: '16/9' } : tarjeta('Dailymotion');
  }

  if (host === 'loom.com') {
    const id = ruta.match(/^\/share\/(\w+)\/?$/)?.[1];
    return id ? { tipo: 'iframe', proveedor: 'Loom', src: `https://www.loom.com/embed/${id}`, proporcion: '16/9' } : tarjeta('Loom');
  }

  if (host === 'ted.com') {
    const slug = ruta.match(/^\/talks\/([\w-]+)\/?$/)?.[1];
    return slug ? { tipo: 'iframe', proveedor: 'TED', src: `https://embed.ted.com/talks/${slug}`, proporcion: '16/9' } : tarjeta('TED');
  }

  // GIPHY: el id es lo último del slug (gato-abc123) o el segmento de media.giphy.com.
  if (host === 'giphy.com' || host === 'media.giphy.com') {
    const id = (host === 'media.giphy.com' ? ruta.match(/^\/media\/([\da-z]+)\//i) : ruta.match(/^\/gifs\/(?:[^/]*-)?([\da-z]+)\/?$/i))?.[1];
    return id ? { tipo: 'iframe', proveedor: 'GIPHY', src: `https://giphy.com/embed/${id}`, alto: 400 } : tarjeta('GIPHY');
  }

  // Diseño y código: Behance, Figma, Canva, CodePen, CodeSandbox, Issuu y Sketchfab.
  if (host === 'behance.net') {
    const id = ruta.match(/^\/gallery\/(\d+)(?:\/[^/]*)?\/?$/)?.[1];
    return id ? { tipo: 'iframe', proveedor: 'Behance', src: `https://www.behance.net/embed/project/${id}?ilo0=1`, alto: 500 } : tarjeta('Behance');
  }

  if (host === 'figma.com') {
    // Sin query: los parámetros de seguimiento no van al embed.
    const archivo = ruta.match(/^\/(?:file|design|proto|board)\/[\w-]+(?:\/|$)/);
    return archivo
      ? { tipo: 'iframe', proveedor: 'Figma', src: `https://www.figma.com/embed?embed_host=bioing&url=${encodeURIComponent(`https://www.figma.com${ruta}`)}`, alto: 450 }
      : tarjeta('Figma');
  }

  if (host === 'canva.com') {
    const diseno = ruta.match(/^\/design\/[\w-]+\/[\w-]+\/view\/?$/);
    return diseno ? { tipo: 'iframe', proveedor: 'Canva', src: `https://www.canva.com${ruta.replace(/\/$/, '')}?embed`, proporcion: '16/9' } : tarjeta('Canva');
  }

  if (host === 'codepen.io') {
    const pen = ruta.match(/^\/([\w-]+)\/pen\/([\w-]+)\/?$/);
    return pen ? { tipo: 'iframe', proveedor: 'CodePen', src: `https://codepen.io/${pen[1]}/embed/${pen[2]}?default-tab=result`, alto: 400 } : tarjeta('CodePen');
  }

  if (host === 'codesandbox.io') {
    const id = ruta.match(/^\/(?:s|p\/sandbox)\/([\w-]+)\/?$/)?.[1];
    return id ? { tipo: 'iframe', proveedor: 'CodeSandbox', src: `https://codesandbox.io/embed/${id}`, alto: 500 } : tarjeta('CodeSandbox');
  }

  if (host === 'issuu.com') {
    const doc = ruta.match(/^\/([\w.-]+)\/docs\/([\w.-]+)\/?$/);
    return doc ? { tipo: 'iframe', proveedor: 'Issuu', src: `https://e.issuu.com/embed.html?d=${doc[2]}&u=${doc[1]}`, alto: 500 } : tarjeta('Issuu');
  }

  if (host === 'sketchfab.com') {
    // Los modelos llevan un id de 32 hex, al final del slug o solo.
    const id = (ruta.match(/^\/3d-models\/(?:[^/]*-)?([a-f\d]{32})\/?$/) ?? ruta.match(/^\/models\/([a-f\d]{32})\/?$/))?.[1];
    return id ? { tipo: 'iframe', proveedor: 'Sketchfab', src: `https://sketchfab.com/models/${id}/embed`, proporcion: '16/9' } : tarjeta('Sketchfab');
  }

  // Audio: Deezer (con prefijo de país), Audiomack, Acast y Audioboom.
  if (host === 'deezer.com') {
    const m = ruta.match(/^\/(?:[a-z]{2}\/)?(track|album|playlist|episode|show)\/(\d+)\/?$/);
    if (!m) return tarjeta('Deezer');
    return { tipo: 'iframe', proveedor: 'Deezer', src: `https://widget.deezer.com/widget/auto/${m[1]}/${m[2]}`, alto: m[1] === 'track' || m[1] === 'episode' ? 152 : 352 };
  }

  if (host === 'audiomack.com') {
    const m = ruta.match(/^\/([^/]+)\/(song|album|playlist)\/([^/]+)\/?$/);
    if (!m) return tarjeta('Audiomack');
    return { tipo: 'iframe', proveedor: 'Audiomack', src: `https://audiomack.com/embed/${m[2]}/${m[1]}/${m[3]}`, alto: m[2] === 'song' ? 252 : 400 };
  }

  if (host === 'shows.acast.com') {
    const episodio = ruta.match(/^\/([^/]+)\/episodes\/([^/]+)\/?$/);
    if (episodio) return { tipo: 'iframe', proveedor: 'Acast', src: `https://embed.acast.com/${episodio[1]}/${episodio[2]}`, alto: 190 };
    const show = ruta.match(/^\/([^/]+)\/?$/)?.[1];
    return show ? { tipo: 'iframe', proveedor: 'Acast', src: `https://embed.acast.com/${show}`, alto: 450 } : tarjeta('Acast');
  }

  if (host === 'audioboom.com') {
    const id = ruta.match(/^\/posts\/(\d+)(?:-[^/]*)?\/?$/)?.[1];
    return id ? { tipo: 'iframe', proveedor: 'Audioboom', src: `https://embeds.audioboom.com/posts/${id}/embed/v4`, alto: 200 } : tarjeta('Audioboom');
  }

  return tarjeta(SIN_IFRAME.get(host) ?? null);
}

// Rutas de twitch.tv que no son un canal.
const RESERVADOS_TWITCH = new Set(['directory', 'videos', 'downloads', 'jobs', 'store', 'search', 'settings']);
