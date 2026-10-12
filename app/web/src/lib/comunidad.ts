// Banda «Comunidad y documentos» del Inicio: qué tarjetas salen, las cifras del Directorio y los documentos más
// recientes del Repositorio. Puro: lo usan el test y `bandaComunidad` (src/lib/contenido.ts).

/** Tarjetas de la banda, en el orden en que salen en la página. */
export type TarjetaComunidad = 'directorio' | 'repositorio';

/** Las tarjetas que salen: el Directorio y el Repositorio pueden estar desactivados desde el panel (ADR 0008). */
export function tarjetasComunidad(directorio: boolean, repositorio: boolean): TarjetaComunidad[] {
  return [...(directorio ? ['directorio' as const] : []), ...(repositorio ? ['repositorio' as const] : [])];
}

/** Lo que hace falta de cada egresado/a para contar las cifras. */
export interface EgresadoCifra {
  generacion?: number;
  organizacion?: string;
}

export interface Cifra {
  etiqueta: string;
  valor: number;
}

/**
 * Cifras del Directorio: egresados/as, generaciones distintas y organizaciones distintas. Sin egresados/as no hay
 * cifras, y una cifra en cero no se muestra (nunca se escribe «0»).
 */
export function cifrasDelDirectorio(egresados: EgresadoCifra[]): Cifra[] {
  const generaciones = new Set(egresados.flatMap((e) => (e.generacion === undefined ? [] : [e.generacion])));
  const organizaciones = new Set(egresados.flatMap((e) => (e.organizacion ? [e.organizacion] : [])));
  return [
    { etiqueta: 'Egresados/as', valor: egresados.length },
    { etiqueta: 'Generaciones', valor: generaciones.size },
    { etiqueta: 'Organizaciones', valor: organizaciones.size },
  ].filter((c) => c.valor > 0);
}

/** Los documentos más recientes: año descendente y, dentro del año, por título (como el listado del Repositorio). */
export function ultimosDocumentos<T extends { data: { titulo: string; anio: number } }>(documentos: T[], cantidad = 4): T[] {
  return [...documentos]
    .sort((a, b) => b.data.anio - a.data.anio || a.data.titulo.localeCompare(b.data.titulo, 'es'))
    .slice(0, cantidad);
}
