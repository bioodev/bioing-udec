// Filtro del Repositorio. Puro: lo usan el test y el <script> de /repositorio.
import { normalizar } from './reglas';

export const TODOS = 'todos';
/** texto: título, descripción y palabras clave normalizados; temas: ids de Tema; anio como texto. */
export interface DatosDocumento { texto: string; tipo: string; temas: string[]; anio: string }
export interface FiltrosRepositorio { texto: string; tipo: string; tema: string; anio: string }

export function coincideDocumento(d: DatosDocumento, f: FiltrosRepositorio): boolean {
  const texto = normalizar(f.texto);
  return (texto === '' || d.texto.includes(texto))
    && (f.tipo === TODOS || d.tipo === f.tipo)
    && (f.tema === TODOS || d.temas.includes(f.tema))
    && (f.anio === TODOS || d.anio === f.anio);
}
