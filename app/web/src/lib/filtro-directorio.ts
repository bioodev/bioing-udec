// Filtro del Directorio. Puro: lo usan el test y el <script> de /directorio.
import { normalizar } from './reglas';

export const TODAS = 'todas';

export interface DatosTarjeta { nombre: string; generacion: string; areas: string[]; organizacion: string }
export interface Filtros { texto: string; generacion: string; area: string; organizacion: string }

export function coincide(t: DatosTarjeta, f: Filtros): boolean {
  const texto = normalizar(f.texto);
  return (
    (texto === '' || t.nombre.includes(texto)) &&
    (f.generacion === TODAS || t.generacion === f.generacion) &&
    (f.area === TODAS || t.areas.includes(f.area)) &&
    (f.organizacion === TODAS || t.organizacion === f.organizacion)
  );
}
