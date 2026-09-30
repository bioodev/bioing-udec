// Reglas puras (sin astro:content) para poder probarlas con Vitest.
const ZONA = 'America/Santiago';

/** "AAAA-MM-DD" del instante dado en hora de Chile. */
export function hoyEnChile(ahora: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
}

/** "AAAA-MM-DD" de una fecha sin hora (parseada como medianoche UTC). */
export function fechaSola(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function estaVigente(v: { inicio: Date; fin: Date }, ahora: Date): boolean {
  return v.inicio <= ahora && ahora <= v.fin;
}

/** Vigente hasta el final del día de fecha_limite en Chile. Sin fecha límite, siempre vigente. */
export function anuncioVigente(a: { fecha_limite?: Date }, ahora: Date): boolean {
  return !a.fecha_limite || hoyEnChile(ahora) <= fechaSola(a.fecha_limite);
}

/** Próxima (o en curso) si todavía no termina; sin fin, se usa el inicio. */
export function actividadEsProxima(a: { inicio: Date; fin?: Date }, ahora: Date): boolean {
  return (a.fin ?? a.inicio) >= ahora;
}

export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
