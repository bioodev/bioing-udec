// Publicaciones de Instagram seleccionadas (propuesta §6.2). Puro, con test.
export const PATRON_INSTAGRAM = '^https://(www\\.)?instagram\\.com/(p|reel)/[\\w-]+/?(\\?.*)?$';

/** URL canónica de una publicación o reel, o null si el enlace no es de ese tipo. */
export function enlaceInstagram(url: string): string | null {
  if (!new RegExp(PATRON_INSTAGRAM).test(url)) return null;
  const [, tipo, codigo] = new URL(url).pathname.match(/^\/(p|reel)\/([\w-]+)/)!;
  return `https://www.instagram.com/${tipo}/${codigo}/`;
}
