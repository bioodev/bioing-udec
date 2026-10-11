// Filtro del listado de Anuncios. Puro: lo usan el test y el <script> de /anuncios.
import { normalizar } from './reglas';

export const TODOS = 'todos';

/** texto: título y nombre del Oferente ya normalizados; tipo: `value` del esquema. */
export interface DatosAnuncio { texto: string; tipo: string }
export interface FiltrosAnuncios { texto: string; tipo: string }

export function coincideAnuncio(a: DatosAnuncio, f: FiltrosAnuncios): boolean {
  const texto = normalizar(f.texto);
  return (texto === '' || a.texto.includes(texto)) && (f.tipo === TODOS || a.tipo === f.tipo);
}
