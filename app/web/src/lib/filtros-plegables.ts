// Filtros plegables en móvil: cuántos filtros hay activos y qué dice el botón. Puro, con test.

/** Cantidad de valores elegidos: no cuentan los vacíos ni los neutros (p. ej. 'todas', 'recientes'). */
export function contarActivos(valores: string[], neutros: readonly string[]): number {
  return valores.map((v) => v.trim()).filter((v) => v !== '' && !neutros.includes(v)).length;
}

/** Texto del botón que abre y cierra los filtros. */
export function textoBotonFiltros(activos: number): string {
  if (activos === 0) return 'Filtros';
  return `Filtros · ${activos} ${activos === 1 ? 'activo' : 'activos'}`;
}

/** Estado inicial del pliegue: plegado si no hay filtros activos; desplegado si llegan filtros por la URL. */
export function estaPlegadoInicial(activos: number): boolean {
  return activos === 0;
}

/** El botón «Limpiar filtros» solo se muestra con al menos un filtro activo. */
export function mostrarLimpiar(activos: number): boolean {
  return activos > 0;
}
