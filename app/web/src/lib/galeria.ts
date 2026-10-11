// Navegación de la galería de una Noticia. Puro, con test: el lightbox la usa desde el navegador.

/** Índice de la imagen siguiente; después de la última vuelve a la primera. */
export function indiceSiguiente(actual: number, total: number): number {
  return (actual + 1) % total;
}

/** Índice de la imagen anterior; antes de la primera va a la última. */
export function indiceAnterior(actual: number, total: number): number {
  return (actual - 1 + total) % total;
}

/** Contador visible para el lector, en base 1: "3 de 8". */
export function textoContador(actual: number, total: number): string {
  return `${actual + 1} de ${total}`;
}
