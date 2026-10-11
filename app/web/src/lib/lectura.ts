// Tiempo de lectura estimado. Puro, con test: se calcula en el build desde el cuerpo de la Noticia.
const PALABRAS_POR_MINUTO = 200;

/** Minutos de lectura (mínimo 1). Descarta la sintaxis Markdown y el HTML antes de contar. */
export function minutosLectura(texto: string): number {
  const limpio = texto
    .replace(/```[\s\S]*?```/g, ' ') // bloques de código
    .replace(/<[^>]+>/g, ' ') // etiquetas HTML
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // imágenes
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // enlaces: queda su texto
    .replace(/https?:\/\/\S+/g, ' ') // URLs sueltas
    .replace(/^\s*(?:#+|[-+*>]|\d+\.)\s+/gm, '') // encabezados, viñetas, listas, citas
    .replace(/[*_`~]+/g, ''); // énfasis y código en línea
  const palabras = limpio.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO));
}
