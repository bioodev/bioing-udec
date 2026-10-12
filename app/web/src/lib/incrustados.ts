// Contenido incrustado de Noticias y Actividades (campo `incrustados`): a partir de la URL pública que
// pega la persona, un reproductor o una tarjeta-enlace. Puro, con test. Lista cerrada de proveedores:
// para sumar uno, este archivo es el punto único (docs/guia-evolucion.md §3.6).
import { idYouTube, vistaPreviaDrive } from './enlaces';
import { embedInstagram } from './instagram';

export type Incrustado =
  | { tipo: 'iframe'; proveedor: string; src: string; alto?: number; proporcion?: '16/9' }
  | { tipo: 'youtube'; id: string }
  | { tipo: 'enlace'; proveedor: string | null; url: string };

// Servicios que no se incrustan (la CSP no deja sus scripts): se muestran como tarjeta con su nombre.
const SIN_IFRAME = new Map([
  ['x.com', 'X'],
  ['twitter.com', 'X'],
  ['tiktok.com', 'TikTok'],
  ['linkedin.com', 'LinkedIn'],
  ['threads.net', 'Threads'],
  ['bsky.app', 'Bluesky'],
  ['maps.app.goo.gl', 'Google Maps'],
]);

const decodificar = (texto: string) => {
  try { return decodeURIComponent(texto); } catch { return texto; }
};

/** Cómo se muestra una URL pegada en Noticias o Actividades: reproductor, o tarjeta si no se puede incrustar. */
export function incrustado(url: string): Incrustado {
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
  if (host === 'youtube.com' || host === 'youtu.be') return tarjeta('YouTube');

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

  if (host === 'vimeo.com') {
    const m = ruta.match(/^\/(\d+)\/?$/);
    return m ? { tipo: 'iframe', proveedor: 'Vimeo', src: `https://player.vimeo.com/video/${m[1]}`, proporcion: '16/9' } : tarjeta('Vimeo');
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

  return tarjeta(SIN_IFRAME.get(host) ?? null);
}
