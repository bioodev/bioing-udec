// Menú principal (propuesta, sección 3). disponible: false → página "Próximamente".
export const MENU = [
  { etiqueta: 'Inicio', href: '/', disponible: true },
  { etiqueta: 'Noticias', href: '/noticias', disponible: true },
  { etiqueta: 'Agenda', href: '/agenda', disponible: true },
  { etiqueta: 'Instagram', href: '/instagram', disponible: true },
  { etiqueta: 'Directorio', href: '/directorio', disponible: true },
  { etiqueta: 'Anuncios', href: '/anuncios', disponible: true },
  { etiqueta: 'Repositorio', href: '/repositorio', disponible: true },
];

// Pendiente de confirmar con el equipo BIOING+ la URL exacta de la FCB.
export const URL_FCB = 'https://www.udec.cl';

// Estructura del header (desktop y menú móvil). Se construye a partir de MENU por `href`, así que
// las etiquetas no se duplican. MENU sigue siendo la fuente para footer, llms.txt y schema.
export interface EnlaceMenu {
  etiqueta: string;
  href: string;
  /** Solo en los desplegables: una línea que explica la sección. */
  descripcion?: string;
}

export interface GrupoMenu {
  etiqueta: string;
  enlaces: EnlaceMenu[];
}

export type EntradaMenu = { tipo: 'enlace'; enlace: EnlaceMenu } | { tipo: 'grupo'; grupo: GrupoMenu };

const enlace = (href: string, descripcion?: string): EnlaceMenu => {
  const item = MENU.find((i) => i.href === href);
  if (!item) throw new Error(`navegacion: ${href} no está en MENU`);
  return { etiqueta: item.etiqueta, href, descripcion };
};

export const MENU_PRINCIPAL: EntradaMenu[] = [
  { tipo: 'enlace', enlace: enlace('/') },
  {
    tipo: 'grupo',
    grupo: {
      etiqueta: 'La carrera',
      // «¿Qué es la Bioingeniería?» es una Página libre con mostrar_en: la-carrera (se agrega en menuConPaginas).
      enlaces: [
        enlace('/repositorio', 'Decretos, reglamentos e informes de interés.'),
      ],
    },
  },
  { tipo: 'enlace', enlace: enlace('/noticias') },
  { tipo: 'enlace', enlace: enlace('/agenda') },
  {
    tipo: 'grupo',
    grupo: {
      etiqueta: 'Comunidad',
      enlaces: [
        enlace('/directorio', 'Buscador de egresados y egresadas.'),
        enlace('/anuncios', 'Oportunidades de trabajo, práctica y convocatorias.'),
        enlace('/instagram', 'Publicaciones seleccionadas de la cuenta oficial.'),
      ],
    },
  },
];

// ── Secciones ocultables desde el panel (src/content/menu/menu.yml) ──────────

/** Secciones fijas que el panel puede ocultar. «Inicio» no está: siempre se muestra. */
export type SeccionOcultable = 'noticias' | 'agenda' | 'instagram' | 'directorio' | 'anuncios' | 'repositorio';

/** Forma del archivo del panel: una clave por sección. Una clave ausente cuenta como visible. */
export type ConfigMenu = Partial<Record<SeccionOcultable, boolean>>;

/** Rutas de cada sección. El anuario (PDF del Directorio) depende del Directorio: sale con él. */
const SECCION_DE_RUTA: Record<string, SeccionOcultable> = {
  '/noticias': 'noticias',
  '/agenda': 'agenda',
  '/instagram': 'instagram',
  '/directorio': 'directorio',
  '/anuario': 'directorio',
  '/anuncios': 'anuncios',
  '/repositorio': 'repositorio',
};

/**
 * Secciones que el panel puede desactivar del todo: dejan de publicarse (404, sitemap, buscador, Inicio).
 * Noticias y Agenda son el núcleo: apagarlas solo las oculta del menú y del pie.
 */
const DESACTIVABLES = new Set<SeccionOcultable>(['instagram', 'directorio', 'anuncios', 'repositorio']);

const CLAVES_CONFIG: SeccionOcultable[] = ['noticias', 'agenda', 'instagram', 'directorio', 'anuncios', 'repositorio'];

/** La sección a la que pertenece una ruta (`/anuncios/x` → `anuncios`), o undefined si no depende de ninguna. */
export function seccionDeRuta(ruta: string): SeccionOcultable | undefined {
  const sinQuery = ruta.split(/[?#]/)[0];
  const prefijo = Object.keys(SECCION_DE_RUTA).find((p) => esActual(p, sinQuery));
  return prefijo === undefined ? undefined : SECCION_DE_RUTA[prefijo];
}

/**
 * Una ruta se muestra en menú, pie y llms.txt salvo que su sección esté apagada en el panel. Las rutas que no son
 * secciones (Inicio, Páginas libres, fichas de personas) siempre se muestran. Ocultar no borra la página.
 */
export function seccionVisible(href: string, config: ConfigMenu): boolean {
  const seccion = seccionDeRuta(href);
  return seccion === undefined || config[seccion] !== false;
}

/**
 * Una ruta se publica (build, sitemap, buscador, Inicio) salvo que pertenezca a una sección desactivable que el
 * panel tiene apagada. Noticias y Agenda siempre se publican.
 */
export function seccionActiva(ruta: string, config: ConfigMenu): boolean {
  const seccion = seccionDeRuta(ruta);
  return seccion === undefined || !DESACTIVABLES.has(seccion) || config[seccion] !== false;
}

/** Un enlace interno (ruta del sitio) solo se ofrece si su sección está activa; los externos siempre. */
export function enlaceDisponible(url: string, config: ConfigMenu): boolean {
  if (!url.startsWith('/') || url.startsWith('//')) return true;
  return seccionActiva(url, config);
}

/**
 * Lee `src/content/menu/menu.yml` sin un parser: el archivo solo tiene pares `clave: true|false` y comentarios.
 * Lo que no es un booleano o una clave conocida se ignora, así que cuenta como visible.
 */
export function leerConfigMenu(texto: string): ConfigMenu {
  const config: ConfigMenu = {};
  for (const linea of texto.split('\n')) {
    const par = linea.match(/^([a-z]+):\s*(true|false)\s*(?:#.*)?$/);
    const clave = par?.[1] as SeccionOcultable | undefined;
    if (par && clave && CLAVES_CONFIG.includes(clave)) config[clave] = par[2] === 'true';
  }
  return config;
}

/** Quita del menú las secciones ocultas; un grupo que se queda sin enlaces visibles desaparece. */
export function filtrarMenu(entradas: EntradaMenu[], config: ConfigMenu): EntradaMenu[] {
  return entradas.flatMap((entrada): EntradaMenu[] => {
    if (entrada.tipo === 'enlace') return seccionVisible(entrada.enlace.href, config) ? [entrada] : [];
    const enlaces = entrada.grupo.enlaces.filter((e) => seccionVisible(e.href, config));
    return enlaces.length === 0 ? [] : [{ tipo: 'grupo', grupo: { ...entrada.grupo, enlaces } }];
  });
}

/** La ruta está en `href` o en una subruta suya (`/noticias` cubre `/noticias/x`, pero no `/noticiasx`). */
export function esActual(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Un enlace está activo si es la página; un grupo, si lo está alguno de sus enlaces. */
export function entradaActiva(entrada: EntradaMenu, pathname: string): boolean {
  if (entrada.tipo === 'enlace') return esActual(entrada.enlace.href, pathname);
  return entrada.grupo.enlaces.some((e) => esActual(e.href, pathname));
}

// ── Páginas libres (colección paginas_libres, creada desde el panel) ──────────

/** Valor del campo `mostrar_en` de una Página libre (ver public/admin/config.yml). */
export type MostrarEn = 'ninguno' | 'footer' | 'la-carrera' | 'comunidad';

/** Lo que el menú necesita de una Página libre; no depende de la colección en sí. */
export interface PaginaLibreMenu {
  titulo: string;
  href: string;
  bajada: string;
  mostrar_en: MostrarEn;
}

// Qué valor de `mostrar_en` va a qué desplegable del navbar (y, en móvil, al mismo grupo) y dónde se ubican las
// páginas: en «La carrera» van primero (ahí está «¿Qué es la Bioingeniería?»); en «Comunidad», al final.
const GRUPO_DE_PAGINAS: Record<string, { valor: MostrarEn; posicion: 'inicio' | 'final' }> = {
  'La carrera': { valor: 'la-carrera', posicion: 'inicio' },
  Comunidad: { valor: 'comunidad', posicion: 'final' },
};

const porTitulo = (a: { titulo: string }, b: { titulo: string }) => a.titulo.localeCompare(b.titulo, 'es');

/**
 * Agrega cada Página libre a su desplegable, ordenadas por título, antes o después de los enlaces fijos del grupo
 * según `GRUPO_DE_PAGINAS`. No modifica `base`: los grupos que cambian son copias.
 */
export function menuConPaginas(base: EntradaMenu[], paginas: PaginaLibreMenu[]): EntradaMenu[] {
  return base.map((entrada) => {
    if (entrada.tipo !== 'grupo') return entrada;
    const destino = GRUPO_DE_PAGINAS[entrada.grupo.etiqueta];
    if (!destino) return entrada;
    const extra: EnlaceMenu[] = paginas
      .filter((p) => p.mostrar_en === destino.valor)
      .sort(porTitulo)
      .map((p) => ({ etiqueta: p.titulo, href: p.href, descripcion: p.bajada }));
    if (extra.length === 0) return entrada;
    const fijos = entrada.grupo.enlaces;
    const enlaces = destino.posicion === 'inicio' ? [...extra, ...fijos] : [...fijos, ...extra];
    return { tipo: 'grupo', grupo: { ...entrada.grupo, enlaces } };
  });
}

/** Enlaces del pie: los fijos de `base` y, después, las Páginas libres que no están en «ninguno». */
export function enlacesFooter<T extends { etiqueta: string; href: string }>(
  base: T[],
  paginas: PaginaLibreMenu[],
): (T | { etiqueta: string; href: string })[] {
  const extra = paginas
    .filter((p) => p.mostrar_en !== 'ninguno')
    .sort(porTitulo)
    .map((p) => ({ etiqueta: p.titulo, href: p.href }));
  return [...base, ...extra];
}
