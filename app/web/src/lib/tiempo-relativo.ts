// Texto de «hace tanto tiempo» junto a una fecha (p. ej. «hace 3 días», «en 2 semanas», «ayer»).
// Se calcula en el navegador, no en el build: el sitio se reconstruye una vez al día y el texto
// quedaría viejo. Lo usa src/scripts/tiempo-relativo.ts.
//
// Dos clases de fecha, como en AGENTS.md («Fechas»):
//  - con hora (ISO con offset): se compara el instante y, de día en adelante, el día de calendario de Santiago;
//  - solo fecha (AAAA-MM-DD, medianoche UTC): el día es el de la cadena, sin volver a convertirlo.

const ZONA = 'America/Santiago';
const DIA = 86_400_000;
const HORA = 3_600_000;
const MINUTO = 60_000;

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const formatoDia = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Intl dice «dentro de …» para el futuro; el sitio usa «en …» (p. ej. «en 2 semanas»). */
function formatear(valor: number, unidad: Intl.RelativeTimeFormatUnit): string {
  return rtf.format(valor, unidad).replace(/^dentro de /, 'en ');
}

/** Días desde la época del día de calendario de `d` (en Santiago, o la fecha sola tal cual). */
function diaDeCalendario(d: Date, conHora: boolean): number {
  const iso = conHora ? formatoDia.format(d) : d.toISOString().slice(0, 10);
  return Date.parse(`${iso}T00:00:00Z`) / DIA;
}

/**
 * Texto relativo de `fecha` respecto de `ahora`. Negativo = pasado («hace …»), positivo = futuro («en …»).
 * Las unidades suben según la diferencia: minutos y horas solo dentro de las 24 h de un instante con hora;
 * después, días (hasta 6), semanas (hasta 29), meses (hasta 364) y años.
 */
export function tiempoRelativo(fecha: Date, ahora: Date, { conHora }: { conHora: boolean }): string {
  const ms = fecha.getTime() - ahora.getTime();

  if (conHora) {
    if (Math.abs(ms) < MINUTO) return 'ahora';
    if (Math.abs(ms) < HORA) return formatear(Math.trunc(ms / MINUTO), 'minute');
    if (Math.abs(ms) < DIA) return formatear(Math.trunc(ms / HORA), 'hour');
  }

  const dias = diaDeCalendario(fecha, conHora) - diaDeCalendario(ahora, true);
  if (Math.abs(dias) < 7) return formatear(dias, 'day');
  if (Math.abs(dias) < 30) return formatear(Math.trunc(dias / 7), 'week');
  if (Math.abs(dias) < 365) return formatear(Math.trunc(dias / 30), 'month');
  return formatear(Math.trunc(dias / 365), 'year');
}
