// Anuario de egresados/as: agrupación por Generación. Puro, con test.

/** Grupos por generación (más antigua primero) y, al final, los sin generación (null). Nombres en orden español. */
export function agruparPorGeneracion<T extends { nombre: string; generacion?: number }>(personas: T[]) {
  const grupos = new Map<number | null, T[]>();
  for (const x of personas) {
    const clave = x.generacion ?? null;
    grupos.set(clave, [...(grupos.get(clave) ?? []), x]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : a - b))
    .map(([generacion, xs]) => ({ generacion, personas: xs.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) }));
}
