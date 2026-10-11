// Filtro del listado de Agenda. Puro: lo usan el test y el <script> de /agenda.
import { normalizar } from './reglas';

export const TODAS = 'todas';

/** texto: título y lugar ya normalizados; tipo: `value` del esquema. */
export interface DatosActividad { texto: string; tipo: string }
export interface FiltrosAgenda { texto: string; tipo: string }

export function coincideActividad(a: DatosActividad, f: FiltrosAgenda): boolean {
  const texto = normalizar(f.texto);
  return (texto === '' || a.texto.includes(texto)) && (f.tipo === TODAS || a.tipo === f.tipo);
}
