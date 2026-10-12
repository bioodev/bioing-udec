// Decide si el botón «Volver» de /buscar puede usar history.back() en vez de ir a la portada.
// Dos señales: el referrer de una carga completa del mismo sitio, y el índice de historial que
// ClientRouter incrementa en cada navegación interna (document.referrer no cambia al navegar así).

export interface DatosVolver {
  /** document.referrer: vacío si no hay página anterior o el navegador no la informa. */
  referrer: string;
  /** location.origin de la página actual. */
  origen: string;
  /** history.state.index que escribe ClientRouter; undefined si no existe. */
  indiceHistorial: number | undefined;
}

export function puedeVolverAtras({ referrer, origen, indiceHistorial }: DatosVolver): boolean {
  if (indiceHistorial !== undefined && indiceHistorial > 0) return true;
  if (!referrer) return false;
  try {
    return new URL(referrer).origin === origen;
  } catch {
    return false;
  }
}
