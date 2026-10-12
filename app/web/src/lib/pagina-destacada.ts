// Página destacada en el Inicio: de las Páginas libres publicadas, solo una. Puro, con test.
// Si hay varias marcadas con «Destacar en el Inicio», gana la primera por título y el resto queda en `fuera`
// (para que el build avise; el sitio no falla).

interface Candidata {
  titulo: string;
  destacar_inicio: boolean;
  publicado: boolean;
}

export function paginaDestacada<T extends Candidata>(paginas: readonly T[]): { destacada: T | null; fuera: T[] } {
  const marcadas = paginas
    .filter((p) => p.publicado && p.destacar_inicio)
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
  return { destacada: marcadas[0] ?? null, fuera: marcadas.slice(1) };
}
