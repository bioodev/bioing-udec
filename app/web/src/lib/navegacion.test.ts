import { describe, expect, test } from 'vitest';
import {
  MENU,
  MENU_PRINCIPAL,
  enlaceDisponible,
  entradaActiva,
  enlacesFooter,
  esActual,
  filtrarMenu,
  leerConfigMenu,
  menuConPaginas,
  seccionActiva,
  seccionDeRuta,
  seccionVisible,
  type ConfigMenu,
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
      { titulo: '¿Qué es la Bioingeniería?', href: '/p/bioingenieria', bajada: 'x', mostrar_en: 'la-carrera' },
    ]);
    const carrera = menu.find((e) => e.tipo === 'grupo' && e.grupo.etiqueta === 'La carrera')!;
    expect(entradaActiva(carrera, '/p/bioingenieria')).toBe(true);
  });

  test('un enlace suelto solo se activa en su sección', () => {
    expect(entradaActiva(entrada('Noticias'), '/noticias/x')).toBe(true);
    expect(entradaActiva(entrada('Noticias'), '/agenda')).toBe(false);
  });
});

describe('menuConPaginas', () => {
  const pagina = (titulo: string, mostrar_en: PaginaLibreMenu['mostrar_en'], bajada = `Bajada de ${titulo}`): PaginaLibreMenu => ({
    titulo,
    href: `/p/${titulo.toLowerCase().replace(/\s+/g, '-')}`,
    bajada,
    mostrar_en,
  });
  const grupo = (etiqueta: string, entradas: EntradaMenu[]) =>
    entradas.find((e) => e.tipo === 'grupo' && e.grupo.etiqueta === etiqueta) as Extract<EntradaMenu, { tipo: 'grupo' }>;

  test('en «La carrera» van antes de los enlaces fijos, ordenadas por título', () => {
    const menu = menuConPaginas(MENU_PRINCIPAL, [
      pagina('Zeta', 'la-carrera'),
      pagina('Árbol', 'la-carrera'),
      pagina('Beca', 'la-carrera'),
    ]);
    const etiquetas = grupo('La carrera', menu).grupo.enlaces.map((e) => e.etiqueta);
    expect(etiquetas).toEqual(['Árbol', 'Beca', 'Zeta', 'Repositorio']);
  });

  test('en «Comunidad» van después de los enlaces fijos, ordenadas por título', () => {
    const menu = menuConPaginas(MENU_PRINCIPAL, [pagina('Zeta', 'comunidad'), pagina('Beca', 'comunidad')]);
    const etiquetas = grupo('Comunidad', menu).grupo.enlaces.map((e) => e.etiqueta);
    expect(etiquetas).toEqual(['Directorio', 'Anuncios', 'Instagram', 'Beca', 'Zeta']);
  });

  test('usa la bajada como descripción del enlace', () => {
    const menu = menuConPaginas(MENU_PRINCIPAL, [pagina('Beca', 'comunidad', 'Fondos para estudiantes.')]);
    const enlace = grupo('Comunidad', menu).grupo.enlaces.find((e) => e.etiqueta === 'Beca');
    expect(enlace).toEqual({ etiqueta: 'Beca', href: '/p/beca', descripcion: 'Fondos para estudiantes.' });
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
    href: `/p/${titulo.toLowerCase()}`,
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

describe('seccionVisible', () => {
  test('sin configuración, todas las secciones se muestran', () => {
    for (const { href } of MENU) expect(seccionVisible(href, {}), href).toBe(true);
  });

  test('una sección desactivada no se muestra; las demás sí', () => {
    const config: ConfigMenu = { anuncios: false };
    expect(seccionVisible('/anuncios', config)).toBe(false);
    expect(seccionVisible('/directorio', config)).toBe(true);
  });

  test('Inicio y las rutas que no son secciones ocultables siempre se muestran', () => {
    const todas: ConfigMenu = {
      noticias: false, agenda: false, instagram: false, directorio: false, anuncios: false, repositorio: false,
    };
    expect(seccionVisible('/', todas)).toBe(true);
    expect(seccionVisible('/p/bioingenieria', todas)).toBe(true);
  });
});

const TODAS_APAGADAS: ConfigMenu = {
  noticias: false, agenda: false, instagram: false, directorio: false, anuncios: false, repositorio: false,
};

describe('seccionDeRuta', () => {
  test('una ruta pertenece a la sección de su prefijo, con subrutas', () => {
    expect(seccionDeRuta('/anuncios')).toBe('anuncios');
    expect(seccionDeRuta('/anuncios/')).toBe('anuncios');
    expect(seccionDeRuta('/anuncios/oferta-1')).toBe('anuncios');
    expect(seccionDeRuta('/repositorio/decreto-2024')).toBe('repositorio');
  });

  test('el anuario del Directorio pertenece al Directorio', () => {
    expect(seccionDeRuta('/anuario')).toBe('directorio');
  });

  test('no confunde un prefijo parcial, ni ignora la query o el ancla', () => {
    expect(seccionDeRuta('/anunciosx')).toBeUndefined();
    expect(seccionDeRuta('/personas/ana')).toBeUndefined();
    expect(seccionDeRuta('/')).toBeUndefined();
    expect(seccionDeRuta('/instagram?x=1#ini')).toBe('instagram');
  });
});

describe('seccionActiva', () => {
  test('sin configuración, todo se publica', () => {
    for (const { href } of MENU) expect(seccionActiva(href, {}), href).toBe(true);
  });

  test('una sección desactivable apagada no se publica, ni sus subrutas ni el anuario', () => {
    expect(seccionActiva('/anuncios', { anuncios: false })).toBe(false);
    expect(seccionActiva('/anuncios/oferta-1', { anuncios: false })).toBe(false);
    expect(seccionActiva('/instagram', { instagram: false })).toBe(false);
    expect(seccionActiva('/repositorio/x', { repositorio: false })).toBe(false);
    expect(seccionActiva('/anuario', { directorio: false })).toBe(false);
  });

  test('el Directorio apagado no quita las fichas de personas', () => {
    expect(seccionActiva('/personas/ana', { directorio: false })).toBe(true);
  });

  test('Noticias y Agenda son el núcleo: apagarlas las oculta del menú, no las deja de publicar', () => {
    expect(seccionActiva('/noticias', { noticias: false })).toBe(true);
    expect(seccionActiva('/agenda/charla-1', { agenda: false })).toBe(true);
    expect(seccionVisible('/noticias', { noticias: false })).toBe(false);
  });

  test('Inicio y las rutas que no son secciones siempre se publican', () => {
    expect(seccionActiva('/', TODAS_APAGADAS)).toBe(true);
    expect(seccionActiva('/p/bioingenieria', TODAS_APAGADAS)).toBe(true);
  });
});

describe('seccionVisible con subrutas', () => {
  test('oculta también las subrutas de una sección apagada', () => {
    expect(seccionVisible('/anuncios/oferta-1', { anuncios: false })).toBe(false);
  });
});

describe('enlaceDisponible', () => {
  test('un enlace interno a una sección apagada no está disponible', () => {
    expect(enlaceDisponible('/directorio', { directorio: false })).toBe(false);
    expect(enlaceDisponible('/anuncios/oferta-1?x=1', { anuncios: false })).toBe(false);
  });

  test('los demás enlaces internos y los externos siempre están disponibles', () => {
    expect(enlaceDisponible('/directorio', {})).toBe(true);
    expect(enlaceDisponible('/noticias', { noticias: false })).toBe(true);
    expect(enlaceDisponible('/p/bioingenieria', TODAS_APAGADAS)).toBe(true);
    expect(enlaceDisponible('https://www.instagram.com/x', TODAS_APAGADAS)).toBe(true);
  });
});

describe('leerConfigMenu', () => {
  test('lee un booleano por sección del archivo del panel, con sus comentarios', () => {
    const texto = [
      '# Menú del sitio.',
      'noticias: true',
      'agenda: true',
      'instagram: false  # comentario',
      'directorio: true',
      'anuncios: false',
      'repositorio: true',
    ].join('\n');
    expect(leerConfigMenu(texto)).toEqual({
      noticias: true, agenda: true, instagram: false, directorio: true, anuncios: false, repositorio: true,
    });
  });

  test('una clave ausente, desconocida o con un valor que no es booleano no cuenta', () => {
    expect(leerConfigMenu('anuncios: quizá\nclave_rara: false\n')).toEqual({});
    expect(leerConfigMenu('')).toEqual({});
  });
});

describe('filtrarMenu', () => {
  const todas = (): ConfigMenu => ({});
  const etiquetasDe = (menu: EntradaMenu[]) =>
    menu.map((e) => (e.tipo === 'enlace' ? e.enlace.etiqueta : e.grupo.etiqueta));

  test('sin configuración devuelve el mismo menú', () => {
    expect(filtrarMenu(MENU_PRINCIPAL, todas())).toEqual(MENU_PRINCIPAL);
  });

  test('quita un enlace suelto oculto y deja el resto en orden', () => {
    const menu = filtrarMenu(MENU_PRINCIPAL, { noticias: false });
    expect(etiquetasDe(menu)).toEqual(['Inicio', 'La carrera', 'Agenda', 'Comunidad']);
  });

  test('quita un enlace de un grupo y conserva el grupo', () => {
    const menu = filtrarMenu(MENU_PRINCIPAL, { anuncios: false });
    const comunidad = menu.find((e) => e.tipo === 'grupo' && e.grupo.etiqueta === 'Comunidad') as Extract<EntradaMenu, { tipo: 'grupo' }>;
    expect(comunidad.grupo.enlaces.map((e) => e.etiqueta)).toEqual(['Directorio', 'Instagram']);
  });

  test('un grupo sin enlaces visibles desaparece', () => {
    const menu = filtrarMenu(MENU_PRINCIPAL, { directorio: false, anuncios: false, instagram: false });
    expect(etiquetasDe(menu)).toEqual(['Inicio', 'La carrera', 'Noticias', 'Agenda']);
  });

  test('una Página libre del grupo mantiene visible «La carrera» aunque se oculte el Repositorio', () => {
    const conPagina = menuConPaginas(MENU_PRINCIPAL, [
      { titulo: '¿Qué es la Bioingeniería?', href: '/p/bioingenieria', bajada: 'x', mostrar_en: 'la-carrera' },
    ]);
    const menu = filtrarMenu(conPagina, { repositorio: false });
    expect(etiquetasDe(menu)).toContain('La carrera');
    const carrera = menu.find((e) => e.tipo === 'grupo' && e.grupo.etiqueta === 'La carrera') as Extract<EntradaMenu, { tipo: 'grupo' }>;
    expect(carrera.grupo.enlaces.map((e) => e.etiqueta)).toEqual(['¿Qué es la Bioingeniería?']);
  });

  test('no muta MENU_PRINCIPAL', () => {
    const antes = structuredClone(MENU_PRINCIPAL);
    filtrarMenu(MENU_PRINCIPAL, { noticias: false, anuncios: false });
    expect(MENU_PRINCIPAL).toEqual(antes);
  });
});
