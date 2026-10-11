// Mapeo puro entrada → ítem RSS (sin astro:content). Las páginas de los feeds
// resuelven las referencias (Temas, Áreas, Organizadores) y filtran con los helpers
// de src/lib/contenido.ts (`noticiasVisibles()`, `publicados()`), de modo que aquí no
// se duplica ninguna regla de visibilidad y el módulo se prueba con Vitest sin build.
import type { RSSFeedItem } from '@astrojs/rss';

export type Sitio = URL | string;

/** Datos mínimos de una Noticia para publicarla en el feed. */
export interface NoticiaFeedable {
  id: string;
  titulo: string;
  fecha: Date;
  bajada?: string;
  /** Nombres de los Temas de la Noticia, ya resueltos. */
  temas?: string[];
}

/** Datos mínimos de una Actividad para publicarla en el feed. */
export interface ActividadFeedable {
  id: string;
  titulo: string;
  inicio: Date;
  /** Etiqueta legible del tipo (p. ej. "Seminario"). */
  tipo: string;
  lugar?: string;
  /** Nombres de las Áreas de la Actividad, ya resueltas. */
  areas?: string[];
  /** Nombres de los Organizadores (Persona u Organización), ya resueltos. */
  organizadores?: string[];
}

/** Un arreglo vacío no se emite: RSS omite el elemento y así no ensucia el XML. */
const noVacio = (xs?: string[]) => (xs && xs.length > 0 ? xs : undefined);

/** Ítem RSS de una Noticia: enlace a su Ficha, fecha de publicación y Temas como categorías. */
export function itemNoticia(n: NoticiaFeedable, site: Sitio): RSSFeedItem {
  return {
    title: n.titulo,
    link: new URL(`/noticias/${n.id}`, site).href,
    pubDate: n.fecha,
    description: n.bajada,
    categories: noVacio(n.temas),
  };
}

/**
 * Ítem RSS de una Actividad: enlace a su Ficha, inicio como fecha y Áreas como categorías.
 * `author` son los Organizadores, que son su atribución real (no se inventa autoría).
 */
export function itemActividad(a: ActividadFeedable, site: Sitio): RSSFeedItem {
  return {
    title: a.titulo,
    link: new URL(`/agenda/${a.id}`, site).href,
    pubDate: a.inicio,
    description: [a.tipo, a.lugar].filter(Boolean).join(' · '),
    categories: noVacio(a.areas),
    author: noVacio(a.organizadores)?.join(', '),
  };
}
