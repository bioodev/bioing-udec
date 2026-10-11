// llms.txt como función pura: índice curado del sitio para agentes (src/pages/llms.txt.ts).
// No sustituye al sitemap: es un resumen legible con las secciones principales, no la lista
// completa de URLs (esa vive en /sitemap-index.xml).
import { MENU } from './navegacion';

/** Descripciones breves por sección, solo para llms.txt (no se agregan a navegacion.ts). */
export const DESCRIPCIONES_SECCIONES: Record<string, string> = {
  '/': 'Portada: noticias y anuncios destacados de la comunidad.',
  '/bioingenieria': 'Qué es la Bioingeniería y su campo de acción.',
  '/noticias': 'Noticias de la comunidad de Bioingeniería.',
  '/agenda': 'Actividades: seminarios, charlas, congresos y talleres.',
  '/instagram': 'Publicaciones de Instagram de la carrera.',
  '/directorio': 'Directorio buscable de egresados y egresadas.',
  '/anuncios': 'Oportunidades: trabajo, prácticas, pasantías y convocatorias.',
  '/repositorio': 'Documentos: decretos, reglamentos e informes.',
};

export interface Seccion {
  titulo: string;
  /** Ruta de la sección; `generarLlms` la vuelve absoluta. */
  href: string;
  descripcion: string;
}

/** Secciones del sitio para llms.txt: el menú principal disponible con su descripción. */
export function seccionesLlms(): Seccion[] {
  return MENU.filter((seccion) => seccion.disponible).map((seccion) => ({
    titulo: seccion.etiqueta,
    href: seccion.href,
    descripcion: DESCRIPCIONES_SECCIONES[seccion.href] ?? '',
  }));
}

const RESUMEN = 'Plataforma digital de la comunidad de Bioingeniería de la Universidad de Concepción: '
  + 'noticias, actividades, oportunidades, documentos y el directorio de egresados y egresadas.';

/** Contenido completo de /llms.txt para el sitio y las secciones dadas. */
export function generarLlms(site: URL | string, secciones: Seccion[]): string {
  return [
    '# BIOING+',
    '',
    `> ${RESUMEN}`,
    '',
    '## Secciones',
    '',
    ...secciones.map((seccion) => `- [${seccion.titulo}](${new URL(seccion.href, site).href}): ${seccion.descripcion}`),
  ].join('\n') + '\n';
}
