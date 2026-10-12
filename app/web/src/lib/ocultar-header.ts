// Header que se oculta al bajar y reaparece al subir. Puro, con test; el script solo lo aplica.

/** Scroll mínimo antes de ocultar: evita que el header parpadee al inicio de la página. */
export const UMBRAL_OCULTAR = 80;

/** Si el header debe estar oculto, dado el scroll actual, el anterior y su estado previo. */
export function ocultarHeader(y: number, yAnterior: number, ocultoAntes: boolean): boolean {
  if (y <= UMBRAL_OCULTAR) return false;
  if (y > yAnterior) return true;
  if (y < yAnterior) return false;
  return ocultoAntes;
}
