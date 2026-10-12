// Secciones destacadas del Inicio. Puro, con test. El orden de la lista en el CMS es el orden en la página.

/** Solo las secciones publicadas, en el orden en que están en la lista. */
export function seccionesPublicadas<T extends { publicado: boolean }>(secciones: readonly T[]): T[] {
  return secciones.filter((s) => s.publicado);
}
