// Swipe del carrusel del Inicio (HeroCarrusel.astro): a qué slide ir al soltar un arrastre. Puro, con test.

/** Fracción del ancho que hay que arrastrar para cambiar de slide. */
export const UMBRAL_DISTANCIA = 0.2;
/** Un gesto más rápido que esto (px/ms) cuenta como swipe aunque sea corto. */
export const UMBRAL_VELOCIDAD = 0.4;
/** Por debajo de esto (px) es un toque, no un arrastre. */
export const MOVIMIENTO_MINIMO = 30;

/**
 * Devuelve -1 (slide anterior), 0 (se queda) o 1 (siguiente). `dx` es el desplazamiento horizontal: negativo hacia
 * la izquierda, que avanza.
 */
export function destinoArrastre({ dx, ancho, ms }: { dx: number; ancho: number; ms: number }): -1 | 0 | 1 {
  if (ancho <= 0 || Math.abs(dx) < MOVIMIENTO_MINIMO) return 0;
  const lejos = Math.abs(dx) >= ancho * UMBRAL_DISTANCIA;
  const rapido = Math.abs(dx) / Math.max(ms, 1) >= UMBRAL_VELOCIDAD;
  if (!lejos && !rapido) return 0;
  return dx < 0 ? 1 : -1;
}
