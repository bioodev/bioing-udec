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

export interface AreaContada { id: string; nombre: string; cantidad: number }

/**
 * Cuántos egresados/as tiene cada área. Recibe las áreas de cada egresado/a (una lista por persona); una misma área
 * repetida en una persona cuenta una vez. Orden alfabético por nombre.
 */
export function contarAreas(porEgresado: { id: string; nombre: string }[][]): AreaContada[] {
  const porId = new Map<string, AreaContada>();
  for (const areas of porEgresado) {
    const vistas = new Set<string>();
    for (const { id, nombre } of areas) {
      if (vistas.has(id)) continue;
      vistas.add(id);
      const existente = porId.get(id);
      if (existente) existente.cantidad++;
      else porId.set(id, { id, nombre, cantidad: 1 });
    }
  }
  return [...porId.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Las `cantidad` áreas con más egresados/as; a igualdad, por nombre. No modifica la lista de entrada. */
export function areasMasFrecuentes(areas: AreaContada[], cantidad: number): AreaContada[] {
  return [...areas].sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre, 'es')).slice(0, cantidad);
}

export interface GrupoGeneracion { generacion: number | null; ids: string[] }

/**
 * Agrupa por generación para la vista «Por generación»: la más reciente primero y «sin generación» al final.
 * Dentro de cada grupo se conserva el orden de entrada. Los grupos vacíos no existen.
 */
export function agruparPorGeneracion(items: { id: string; generacion?: number }[]): GrupoGeneracion[] {
  const grupos = new Map<number | null, string[]>();
  for (const { id, generacion } of items) {
    const clave = generacion ?? null;
    grupos.set(clave, [...(grupos.get(clave) ?? []), id]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : b - a))
    .map(([generacion, ids]) => ({ generacion, ids }));
}

/** Encabezado de un grupo de `agruparPorGeneracion`. */
export function etiquetaGrupo(generacion: number | null): string {
  return generacion === null ? 'Sin generación' : `Generación ${generacion}`;
}
