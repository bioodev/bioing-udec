// Noticias relacionadas ("Te puede interesar"). Puro, con test: la página no calcula nada.

/** Lo que el ranking necesita de una Noticia. */
export interface Relacionable {
  id: string;
  fecha: Date;
  temas: string[];
  etiquetas: string[];
  areas: string[];
}

const PESO = { temas: 3, etiquetas: 2, areas: 1 } as const;

const compartidos = (a: string[], b: string[]) => a.filter((x) => b.includes(x)).length;

function puntaje(actual: Relacionable, otra: Relacionable): number {
  return (
    PESO.temas * compartidos(actual.temas, otra.temas) +
    PESO.etiquetas * compartidos(actual.etiquetas, otra.etiquetas) +
    PESO.areas * compartidos(actual.areas, otra.areas)
  );
}

/**
 * Las `n` noticias más parecidas a `actual`: por Temas compartidos (×3), Etiquetas (×2) y Áreas (×1).
 * Desempate por fecha más reciente; si faltan coincidencias, completa con las más recientes.
 * `todas` debe traer solo noticias visibles (ver `relacionadasDe` en contenido.ts).
 */
export function noticiasRelacionadas<T extends Relacionable>(actual: Relacionable, todas: T[], n = 3): T[] {
  return todas
    .filter((otra) => otra.id !== actual.id)
    .sort((a, b) => puntaje(actual, b) - puntaje(actual, a) || b.fecha.valueOf() - a.fecha.valueOf())
    .slice(0, n);
}
