// Enlaces externos → URL de inserción. Puro, con test. Lista cerrada de proveedores (propuesta §6.3).
const ID = '([\\w-]+)';

/** URL de vista previa oficial de Google para un archivo de Drive/Docs, o null si no se reconoce. */
export function vistaPreviaDrive(url: string): string | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (u.hostname === 'drive.google.com') {
    const id = u.pathname.match(new RegExp(`^/file/d/${ID}`))?.[1] ?? (u.pathname === '/open' ? u.searchParams.get('id') : null);
    return id ? `https://drive.google.com/file/d/${id}/preview` : null;
  }
  if (u.hostname === 'docs.google.com') {
    const m = u.pathname.match(new RegExp(`^/(document|spreadsheets|presentation)/d/${ID}`));
    return m ? `https://docs.google.com/${m[1]}/d/${m[2]}/preview` : null;
  }
  return null;
}

const ID_YT = /^[\w-]{11}$/;

/** ID de 11 caracteres de un video de YouTube, o null si el enlace no es de un video. */
export function idYouTube(url: string): string | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^www\./, '');
  let id: string | null | undefined;
  if (host === 'youtu.be') id = u.pathname.slice(1);
  else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com')
    id = u.pathname === '/watch' ? u.searchParams.get('v') : u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
  return id && ID_YT.test(id) ? id : null;
}

/** Si el enlace apunta al propio sitio: ruta relativa o mismo host que `sitio` (sin www). */
export function esInterno(url: string, sitio?: string | URL): boolean {
  if (url.startsWith('/')) return !url.startsWith('//');
  if (!sitio) return false;
  const host = (h: string) => h.replace(/^www\./, '');
  try {
    return host(new URL(url).hostname) === host(new URL(sitio).hostname);
  } catch {
    return false;
  }
}
