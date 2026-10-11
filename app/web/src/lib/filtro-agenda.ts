// Filtro y pestañas del listado de Agenda. Puro: lo usan el test y el <script> de /agenda.
import { normalizar } from './reglas';

export const TODAS = 'todas';
export type EstadoActividad = 'proxima' | 'pasada';

/** textos ya normalizados; tipo y estado: `value` del esquema. */
export interface DatosActividad { texto: string; tipo: string; estado: EstadoActividad }
export interface FiltrosAgenda { texto: string; tipo: string; estado: EstadoActividad | typeof TODAS }

export function coincideActividad(a: DatosActividad, f: FiltrosAgenda): boolean {
  const texto = normalizar(f.texto);
  return (
    (texto === '' || a.texto.includes(texto)) &&
    (f.tipo === TODAS || a.tipo === f.tipo) &&
    (f.estado === TODAS || a.estado === f.estado)
  );
}

/** Partición por estado, para las pestañas Próximos / Pasados (wireframes: Agenda). */
export function particionarActividades(items: DatosActividad[]) {
  return {
    proximas: items.filter((a) => a.estado === 'proxima'),
    pasadas: items.filter((a) => a.estado === 'pasada'),
  };
}

/** Conteo de cada pestaña aplicando los filtros de texto y tipo (sin estado). */
export function contarAgenda(items: DatosActividad[], f: { texto: string; tipo: string }) {
  return {
    todas: items.filter((a) => coincideActividad(a, { ...f, estado: TODAS })).length,
    proximas: items.filter((a) => coincideActividad(a, { ...f, estado: 'proxima' })).length,
    pasadas: items.filter((a) => coincideActividad(a, { ...f, estado: 'pasada' })).length,
  };
}