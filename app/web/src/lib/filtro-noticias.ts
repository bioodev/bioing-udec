// Filtro, orden y paginación del listado de Noticias. Puro: lo usan el test y el <script> de /noticias.
import { normalizar } from './reglas';

export const TODAS = 'todas';

export type OrdenNoticias = 'recientes' | 'antiguas' | 'alfabetico' | 'relevancia';
/** Órdenes disponibles del control "Ordenar por" (wireframes: Noticias). */
export const ORDENES_NOTICIAS: readonly OrdenNoticias[] = ['recientes', 'antiguas', 'alfabetico', 'relevancia'];

/** texto: título y bajada ya normalizados; temas, etiquetas y personas: ids/valores; anio como texto. */
export interface DatosNoticia { texto: string; temas: string[]; etiquetas: string[]; personas: string[]; anio: string }
/** persona: id de la Persona o '' (sin filtro, lo que deja el Combobox al borrarlo). */
export interface FiltrosNoticias { texto: string; tema: string; etiqueta: string; persona: string; anio: string }

export function coincideNoticia(n: DatosNoticia, f: FiltrosNoticias): boolean {
  const texto = normalizar(f.texto);
  return (
    (texto === '' || n.texto.includes(texto)) &&
    (f.tema === TODAS || n.temas.includes(f.tema)) &&
    (f.etiqueta === TODAS || n.etiquetas.includes(f.etiqueta)) &&
    (f.persona === '' || n.personas.includes(f.persona)) &&
    (f.anio === TODAS || n.anio === f.anio)
  );
}

/**
 * Orden del listado (sobre una copia):
 * - recientes: fecha descendente (por defecto)
 * - antiguas: fecha ascendente
 * - alfabetico: título con collation en español
 * - relevancia: solo con búsqueda activa conserva el orden del listado (fecha desc);
 *   sin búsqueda cae a recientes.
 */
export function ordenarNoticias<T extends { fecha: Date; titulo: string }>(
  items: readonly T[],
  orden: OrdenNoticias,
  hayBusqueda: boolean,
): T[] {
  const copia = [...items];
  const efectivo: OrdenNoticias = orden === 'relevancia' && !hayBusqueda ? 'recientes' : orden;
  switch (efectivo) {
    case 'recientes':
      return copia.sort((a, b) => b.fecha.valueOf() - a.fecha.valueOf());
    case 'antiguas':
      return copia.sort((a, b) => a.fecha.valueOf() - b.fecha.valueOf());
    case 'alfabetico':
      return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    case 'relevancia':
      return copia;
  }
}

export function paginar<T>(items: T[], pagina: number, porPagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
  const actual = Math.min(Math.max(1, pagina), totalPaginas);
  return { items: items.slice((actual - 1) * porPagina, actual * porPagina), pagina: actual, totalPaginas };
}