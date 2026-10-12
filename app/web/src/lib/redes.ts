// Redes sociales de la comunidad (pie de página y sameAs del JSON-LD). Puro, con test.
// Cada red tiene una URL opcional en src/content/redes/redes.yml (ver public/admin/config.yml).
// Una red sin URL no se muestra. El orden lo fija REDES, no el archivo.

export type ClaveRed = 'instagram' | 'facebook' | 'x' | 'linkedin' | 'youtube' | 'tiktok' | 'threads' | 'bluesky' | 'mastodon';

/** Nombres de los íconos de Phosphor (`phosphor-astro`); el mapa a componentes vive en RedesSociales.astro. */
export type IconoRed = 'InstagramLogo' | 'FacebookLogo' | 'XLogo' | 'LinkedinLogo' | 'YoutubeLogo' | 'TiktokLogo' | 'ThreadsLogo' | 'Butterfly' | 'MastodonLogo';

export interface DefinicionRed {
  clave: ClaveRed;
  etiqueta: string;
  icono: IconoRed;
}

export const REDES: DefinicionRed[] = [
  { clave: 'instagram', etiqueta: 'Instagram', icono: 'InstagramLogo' },
  { clave: 'facebook', etiqueta: 'Facebook', icono: 'FacebookLogo' },
  { clave: 'x', etiqueta: 'X', icono: 'XLogo' },
  { clave: 'linkedin', etiqueta: 'LinkedIn', icono: 'LinkedinLogo' },
  { clave: 'youtube', etiqueta: 'YouTube', icono: 'YoutubeLogo' },
  { clave: 'tiktok', etiqueta: 'TikTok', icono: 'TiktokLogo' },
  { clave: 'threads', etiqueta: 'Threads', icono: 'ThreadsLogo' },
  { clave: 'bluesky', etiqueta: 'Bluesky', icono: 'Butterfly' },
  { clave: 'mastodon', etiqueta: 'Mastodon / Fediverso', icono: 'MastodonLogo' },
];

/** Forma del archivo del panel: una URL por red. Una clave ausente o vacía cuenta como «sin red». */
export type ConfigRedes = Partial<Record<ClaveRed, string>>;

export interface RedVisible extends DefinicionRed {
  url: string;
}

/** Las redes con URL https, en el orden de REDES. */
export function redesVisibles(config: ConfigRedes): RedVisible[] {
  return REDES.flatMap((red) => {
    const url = config[red.clave]?.trim();
    return url && url.startsWith('https://') ? [{ ...red, url }] : [];
  });
}

/** Las URLs de las redes visibles: van al `sameAs` de la Organization. */
export function urlsRedes(config: ConfigRedes): string[] {
  return redesVisibles(config).map((red) => red.url);
}
