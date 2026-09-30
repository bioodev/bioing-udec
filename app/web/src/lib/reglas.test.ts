import { describe, expect, test } from 'vitest';
import {
  actividadEsProxima, anuncioVigente, estaVigente, fechaSola, hoyEnChile, normalizar,
} from './reglas';

describe('hoyEnChile', () => {
  test('a las 01:00 UTC todavía es el día anterior en Chile', () => {
    expect(hoyEnChile(new Date('2026-10-01T01:00:00Z'))).toBe('2026-09-30');
  });
  test('a mediodía coincide con UTC', () => {
    expect(hoyEnChile(new Date('2026-10-01T15:00:00Z'))).toBe('2026-10-01');
  });
});

describe('fechaSola', () => {
  test('una fecha sin hora parseada como medianoche UTC conserva su día', () => {
    expect(fechaSola(new Date('2027-04-30'))).toBe('2027-04-30');
  });
});

describe('estaVigente', () => {
  const banner = { inicio: new Date('2026-09-01T00:00:00-03:00'), fin: new Date('2026-12-31T23:59:00-03:00') };
  test('dentro del rango', () => expect(estaVigente(banner, new Date('2026-10-15T12:00:00Z'))).toBe(true));
  test('antes del inicio', () => expect(estaVigente(banner, new Date('2026-08-31T12:00:00Z'))).toBe(false));
  test('después del fin', () => expect(estaVigente(banner, new Date('2027-01-02T12:00:00Z'))).toBe(false));
});

describe('anuncioVigente', () => {
  const limite = { fecha_limite: new Date('2026-10-15') };
  test('sin fecha límite siempre está vigente', () => expect(anuncioVigente({}, new Date('2030-01-01T00:00:00Z'))).toBe(true));
  test('antes de la fecha límite', () => expect(anuncioVigente(limite, new Date('2026-10-10T12:00:00Z'))).toBe(true));
  test('vence hoy: sigue vigente a las 23:00 de Chile', () => {
    // 2026-10-15 23:00 en Chile (UTC-3) = 2026-10-16 02:00 UTC
    expect(anuncioVigente(limite, new Date('2026-10-16T02:00:00Z'))).toBe(true);
  });
  test('al día siguiente ya no está vigente', () => expect(anuncioVigente(limite, new Date('2026-10-16T15:00:00Z'))).toBe(false));
});

describe('actividadEsProxima', () => {
  const ahora = new Date('2026-10-15T15:00:00Z');
  test('empieza mañana', () => expect(actividadEsProxima({ inicio: new Date('2026-10-16T18:00:00-03:00') }, ahora)).toBe(true));
  test('terminó ayer', () => expect(actividadEsProxima({ inicio: new Date('2026-10-14T18:00:00-03:00') }, ahora)).toBe(false));
  test('empezó ayer y termina mañana (varios días)', () => {
    expect(actividadEsProxima({ inicio: new Date('2026-10-14T09:00:00-03:00'), fin: new Date('2026-10-16T18:00:00-03:00') }, ahora)).toBe(true);
  });
});

describe('normalizar', () => {
  test('quita tildes, pasa a minúsculas y recorta', () => {
    expect(normalizar('  José PÉREZ Muñoz ')).toBe('jose perez munoz');
  });
});
