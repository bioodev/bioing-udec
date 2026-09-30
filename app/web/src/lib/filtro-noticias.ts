// Filtro y paginación del listado de Noticias. Puro: lo usan el test y el <script> de /noticias.
import { normalizar } from './reglas';

export const TODAS = 'todas';

/** texto: título y bajada ya normalizados; temas y personas: ids. */
export interface DatosNoticia { texto: string; temas: string[]; personas: string[]; anio: string }
/** persona: id de la Persona o '' (sin filtro, lo que deja el Combobox al borrarlo). */
export interface FiltrosNoticias { texto: string; tema: string; persona: string; anio: string }

export function coincideNoticia(n: DatosNoticia, f: FiltrosNoticias): boolean {
  const texto = normalizar(f.texto);
  return (
    (texto === '' || n.texto.includes(texto)) &&
    (f.tema === TODAS || n.temas.includes(f.tema)) &&
    (f.persona === '' || n.personas.includes(f.persona)) &&
    (f.anio === TODAS || n.anio === f.anio)
  );
}

export function paginar<T>(items: T[], pagina: number, porPagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));
  const actual = Math.min(Math.max(1, pagina), totalPaginas);
  return { items: items.slice((actual - 1) * porPagina, actual * porPagina), pagina: actual, totalPaginas };
}
