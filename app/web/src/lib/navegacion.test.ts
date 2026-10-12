import { describe, expect, test } from 'vitest';
import {
  MENU,
  MENU_PRINCIPAL,
  entradaActiva,
  enlacesFooter,
  esActual,
  menuConPaginas,
  type EnlaceMenu,
  type EntradaMenu,
  type PaginaLibreMenu,
} from './navegacion';

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
    expect(entradaActiva(entrada('Comunidad'), '/directorio/egresado')).toBe(true);
    expect(entradaActiva(entrada('Comunidad'), '/noticias')).toBe(false);
  });

  test('una Página libre del grupo también lo activa', () => {
    const menu = menuConPaginas(MENU_PRINCIPAL, [
      { titulo: '¿Qué es la Bioingeniería?', href: '/paginas/bioingenieria', bajada: 'x', mostrar_en: 'la-carrera' },
    ]);
    const carrera = menu.find((e) => e.tipo === 'grupo' && e.grupo.etiqueta === 'La carrera')!;
    expect(entradaActiva(carrera, '/paginas/bioingenieria')).toBe(true);
  });

  test('un enlace suelto solo se activa en su sección', () => {
    expect(entradaActiva(entrada('Noticias'), '/noticias/x')).toBe(true);
    expect(entradaActiva(entrada('Noticias'), '/agenda')).toBe(false);
  });
});

describe('menuConPaginas', () => {
  const pagina = (titulo: string, mostrar_en: PaginaLibreMenu['mostrar_en'], bajada = `Bajada de ${titulo}`): PaginaLibreMenu => ({
    titulo,
    href: `/paginas/${titulo.toLowerCase().replace(/\s+/g, '-')}`,
    bajada,
    mostrar_en,
  });
  const grupo = (etiqueta: string, entradas: EntradaMenu[]) =>
    entradas.find((e) => e.tipo === 'grupo' && e.grupo.etiqueta === etiqueta) as Extract<EntradaMenu, { tipo: 'grupo' }>;

  test('agrega a su grupo, después de los enlaces fijos y ordenadas por título', () => {
    const menu = menuConPaginas(MENU_PRINCIPAL, [
      pagina('Zeta', 'la-carrera'),
      pagina('Árbol', 'la-carrera'),
      pagina('Beca', 'la-carrera'),
    ]);
    const etiquetas = grupo('La carrera', menu).grupo.enlaces.map((e) => e.etiqueta);
    expect(etiquetas).toEqual(['Repositorio', 'Árbol', 'Beca', 'Zeta']);
  });

  test('usa la bajada como descripción del enlace', () => {
    const menu = menuConPaginas(MENU_PRINCIPAL, [pagina('Beca', 'comunidad', 'Fondos para estudiantes.')]);
    const enlace = grupo('Comunidad', menu).grupo.enlaces.find((e) => e.etiqueta === 'Beca');
    expect(enlace).toEqual({ etiqueta: 'Beca', href: '/paginas/beca', descripcion: 'Fondos para estudiantes.' });
  });

  test('un valor distinto de un grupo no la agrega a ese grupo', () => {
    const menu = menuConPaginas(MENU_PRINCIPAL, [pagina('Beca', 'la-carrera'), pagina('Foro', 'comunidad')]);
    const carrera = grupo('La carrera', menu).grupo.enlaces.map((e) => e.etiqueta);
    const comunidad = grupo('Comunidad', menu).grupo.enlaces.map((e) => e.etiqueta);
    expect(carrera).toContain('Beca');
    expect(carrera).not.toContain('Foro');
    expect(comunidad).toContain('Foro');
    expect(comunidad).not.toContain('Beca');
  });

  test('«ninguno» y «footer» no aparecen en ningún desplegable', () => {
    const menu = menuConPaginas(MENU_PRINCIPAL, [pagina('Oculta', 'ninguno'), pagina('Pie', 'footer')]);
    const todas = menu.flatMap((e) => (e.tipo === 'grupo' ? e.grupo.enlaces.map((x) => x.etiqueta) : []));
    expect(todas).not.toContain('Oculta');
    expect(todas).not.toContain('Pie');
  });

  test('no muta MENU_PRINCIPAL', () => {
    const antes = structuredClone(MENU_PRINCIPAL);
    menuConPaginas(MENU_PRINCIPAL, [pagina('Beca', 'la-carrera')]);
    expect(MENU_PRINCIPAL).toEqual(antes);
  });

  test('sin páginas devuelve el mismo menú', () => {
    expect(menuConPaginas(MENU_PRINCIPAL, [])).toEqual(MENU_PRINCIPAL);
  });
});

describe('enlacesFooter', () => {
  const base = MENU.filter((i) => i.href !== '/').map(({ etiqueta, href }) => ({ etiqueta, href }));
  const pagina = (titulo: string, mostrar_en: PaginaLibreMenu['mostrar_en']): PaginaLibreMenu => ({
    titulo,
    href: `/paginas/${titulo.toLowerCase()}`,
    bajada: 'x',
    mostrar_en,
  });

  test('agrega después de los fijos las páginas que no son «ninguno», ordenadas por título', () => {
    const enlaces = enlacesFooter(base, [pagina('Zeta', 'footer'), pagina('Oculta', 'ninguno'), pagina('Beca', 'la-carrera')]);
    expect(enlaces.slice(0, base.length)).toEqual(base);
    expect(enlaces.slice(base.length).map((e) => e.etiqueta)).toEqual(['Beca', 'Zeta']);
  });

  test('no agrega «ninguno» y no cambia la lista base', () => {
    const antes = structuredClone(base);
    const enlaces = enlacesFooter(base, [pagina('Oculta', 'ninguno')]);
    expect(enlaces).toEqual(base);
    expect(base).toEqual(antes);
  });
});
