import { describe, expect, test } from 'vitest';
import { MENU, MENU_PRINCIPAL, entradaActiva, esActual, type EnlaceMenu } from './navegacion';

const enlaces = (): EnlaceMenu[] =>
  MENU_PRINCIPAL.flatMap((entrada) => (entrada.tipo === 'enlace' ? [entrada.enlace] : entrada.grupo.enlaces));

describe('MENU_PRINCIPAL', () => {
  test('cada href de MENU aparece exactamente una vez', () => {
    const hrefs = enlaces().map((e) => e.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect([...hrefs].sort()).toEqual(MENU.map((i) => i.href).sort());
  });

  test('usa las etiquetas de MENU y la estructura de grupos', () => {
    for (const enlace of enlaces()) {
      expect(enlace.etiqueta).toBe(MENU.find((i) => i.href === enlace.href)?.etiqueta);
    }
    const etiquetas = MENU_PRINCIPAL.map((e) => (e.tipo === 'enlace' ? e.enlace.etiqueta : e.grupo.etiqueta));
    expect(etiquetas).toEqual(['Inicio', 'La carrera', 'Noticias', 'Agenda', 'Comunidad']);
  });

  test('cada enlace de un grupo tiene descripción', () => {
    for (const entrada of MENU_PRINCIPAL) {
      if (entrada.tipo !== 'grupo') continue;
      for (const enlace of entrada.grupo.enlaces) expect(enlace.descripcion?.length).toBeGreaterThan(0);
    }
  });
});

describe('esActual', () => {
  test('la portada solo coincide consigo misma', () => {
    expect(esActual('/', '/')).toBe(true);
    expect(esActual('/', '/noticias/')).toBe(false);
  });

  test('las subrutas coinciden con su sección', () => {
    expect(esActual('/noticias', '/noticias')).toBe(true);
    expect(esActual('/noticias', '/noticias/')).toBe(true);
    expect(esActual('/noticias', '/noticias/mi-nota')).toBe(true);
  });

  test('no coincide con un prefijo que no es un segmento', () => {
    expect(esActual('/noticias', '/noticiasx')).toBe(false);
  });
});

describe('entradaActiva', () => {
  const entrada = (etiqueta: string) => MENU_PRINCIPAL.find((e) =>
    (e.tipo === 'enlace' ? e.enlace.etiqueta : e.grupo.etiqueta) === etiqueta)!;

  test('la portada solo activa Inicio', () => {
    const activas = MENU_PRINCIPAL.filter((e) => entradaActiva(e, '/'));
    expect(activas.map((e) => (e.tipo === 'enlace' ? e.enlace.etiqueta : e.grupo.etiqueta))).toEqual(['Inicio']);
  });

  test('un grupo está activo si lo está alguno de sus enlaces, también en subrutas', () => {
    expect(entradaActiva(entrada('La carrera'), '/repositorio/x')).toBe(true);
    expect(entradaActiva(entrada('La carrera'), '/bioingenieria')).toBe(true);
    expect(entradaActiva(entrada('Comunidad'), '/directorio/egresado')).toBe(true);
    expect(entradaActiva(entrada('Comunidad'), '/noticias')).toBe(false);
  });

  test('un enlace suelto solo se activa en su sección', () => {
    expect(entradaActiva(entrada('Noticias'), '/noticias/x')).toBe(true);
    expect(entradaActiva(entrada('Noticias'), '/agenda')).toBe(false);
  });
});
