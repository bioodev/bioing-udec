import { describe, expect, test } from 'vitest';
import { tiempoRelativo } from './tiempo-relativo';

// Chile en octubre de 2026 usa UTC-3 (horario de verano): 15:00 local = 18:00 UTC.
const ahora = new Date('2026-10-12T15:00:00-03:00');

describe('tiempoRelativo: fechas solas (AAAA-MM-DD, medianoche UTC)', () => {
  test.each([
    ['2026-10-12', 'hoy'],
    ['2026-10-11', 'ayer'],
    ['2026-10-13', 'mañana'],
    ['2026-10-10', 'anteayer'],
    ['2026-10-09', 'hace 3 días'],
    ['2026-10-08', 'hace 4 días'],
    ['2026-10-29', 'en 2 semanas'],
    ['2026-09-28', 'hace 2 semanas'],
    ['2026-10-26', 'en 2 semanas'],
    ['2026-07-12', 'hace 3 meses'],
    ['2024-10-12', 'hace 2 años'],
  ])('%s con ahora 2026-10-12 15:00 local → %s', (iso, esperado) => {
    expect(tiempoRelativo(new Date(iso), ahora, { conHora: false })).toBe(esperado);
  });

  test('compara por día de calendario de Santiago, no por UTC', () => {
    // 02:00 UTC del 12 es las 23:00 del 11 en Santiago: para la fecha «2026-10-12» es mañana.
    const madrugadaUtc = new Date('2026-10-12T02:00:00Z');
    expect(tiempoRelativo(new Date('2026-10-12'), madrugadaUtc, { conHora: false })).toBe('mañana');
  });
});

describe('tiempoRelativo: fechas con hora', () => {
  test('menos de un minuto de diferencia → ahora', () => {
    const fecha = new Date(ahora.getTime() + 10_000);
    expect(tiempoRelativo(fecha, ahora, { conHora: true })).toBe('ahora');
  });

  test('minutos antes y después', () => {
    expect(tiempoRelativo(new Date(ahora.getTime() - 5 * 60_000), ahora, { conHora: true })).toBe('hace 5 minutos');
    expect(tiempoRelativo(new Date(ahora.getTime() + 30 * 60_000), ahora, { conHora: true })).toBe('en 30 minutos');
  });

  test('horas dentro de las 24 h, aunque cambie el día', () => {
    expect(tiempoRelativo(new Date('2026-10-11T23:00:00-03:00'), new Date('2026-10-12T01:00:00-03:00'), { conHora: true })).toBe('hace 2 horas');
    expect(tiempoRelativo(new Date('2026-10-12T18:00:00-03:00'), ahora, { conHora: true })).toBe('en 3 horas');
  });

  test('más de un día: cuenta días de calendario de Santiago', () => {
    expect(tiempoRelativo(new Date('2026-10-13T20:00:00-03:00'), ahora, { conHora: true })).toBe('mañana');
    expect(tiempoRelativo(new Date('2026-10-09T09:00:00-03:00'), ahora, { conHora: true })).toBe('hace 3 días');
  });
});
