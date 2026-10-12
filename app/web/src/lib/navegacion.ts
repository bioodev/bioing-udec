// Menú principal (propuesta, sección 3). disponible: false → página "Próximamente".
export const MENU = [
  { etiqueta: 'Inicio', href: '/', disponible: true },
  { etiqueta: '¿Qué es la Bioingeniería?', href: '/bioingenieria', disponible: true },
  { etiqueta: 'Noticias', href: '/noticias', disponible: true },
  { etiqueta: 'Agenda', href: '/agenda', disponible: true },
  { etiqueta: 'Instagram', href: '/instagram', disponible: true },
  { etiqueta: 'Directorio', href: '/directorio', disponible: true },
  { etiqueta: 'Anuncios', href: '/anuncios', disponible: true },
  { etiqueta: 'Repositorio', href: '/repositorio', disponible: true },
];

// Pendiente de confirmar con el equipo BIOING+ la URL exacta de la FCB.
export const URL_FCB = 'https://www.udec.cl';

// Pendiente: cuenta oficial (preguntas-reunion 6.2)
export const URL_INSTAGRAM = 'https://www.instagram.com/';

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
      enlaces: [
        enlace('/bioingenieria', 'Contenido institucional y video de la carrera.'),
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

// Qué valor de `mostrar_en` va a qué desplegable del navbar (y, en móvil, al mismo grupo).
const GRUPO_DE_PAGINAS: Record<string, MostrarEn> = { 'La carrera': 'la-carrera', Comunidad: 'comunidad' };

const porTitulo = (a: { titulo: string }, b: { titulo: string }) => a.titulo.localeCompare(b.titulo, 'es');

/**
 * Agrega cada Página libre a su desplegable, después de los enlaces fijos del grupo y ordenadas por título.
 * No modifica `base`: los grupos que cambian son copias.
 */
export function menuConPaginas(base: EntradaMenu[], paginas: PaginaLibreMenu[]): EntradaMenu[] {
  return base.map((entrada) => {
    if (entrada.tipo !== 'grupo') return entrada;
    const destino = GRUPO_DE_PAGINAS[entrada.grupo.etiqueta];
    const extra: EnlaceMenu[] = paginas
      .filter((p) => destino !== undefined && p.mostrar_en === destino)
      .sort(porTitulo)
      .map((p) => ({ etiqueta: p.titulo, href: p.href, descripcion: p.bajada }));
    if (extra.length === 0) return entrada;
    return { tipo: 'grupo', grupo: { ...entrada.grupo, enlaces: [...entrada.grupo.enlaces, ...extra] } };
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
