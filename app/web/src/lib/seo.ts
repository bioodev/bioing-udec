// SEO configurable desde el panel: reglas puras de título, descripción, imagen para redes, «no mostrar en
// buscadores» y verificación de Google/Bing. Lo usan Base.astro y las páginas (por medio de contenido.ts).
// Precedencia: campo SEO de la entrada → valor armado por la página → valor del sitio (src/content/seo/seo.yml)
// → valor por defecto del código (tabla VALORES_POR_DEFECTO). Decisión: docs/adr/0010-seo-desde-el-panel.md.

export const SUFIJO_TITULO = ' · BIOING+';
export const NOMBRE_SITIO = 'BIOING+';

/** Descripción general del sitio cuando el panel no define otra. */
export const DESCRIPCION_SITIO = 'Plataforma de la comunidad de Bioingeniería de la Universidad de Concepción.';

/** Páginas de listado con descripción propia (campo `listados` del panel). */
export type Listado = 'inicio' | 'noticias' | 'agenda' | 'anuncios' | 'repositorio' | 'directorio' | 'instagram';

/** Textos por defecto de los listados: el valor que tenían antes de que el panel los pudiera cambiar. */
export const VALORES_POR_DEFECTO: Record<Listado, string> = {
  inicio: DESCRIPCION_SITIO,
  noticias: 'Noticias de la comunidad de Bioingeniería UdeC.',
  agenda: 'Actividades de la comunidad de Bioingeniería UdeC: seminarios, charlas, congresos y más.',
  anuncios: 'Oportunidades para la comunidad de Bioingeniería UdeC: trabajo, prácticas, pasantías y convocatorias.',
  repositorio: 'Documentos de interés para la comunidad de Bioingeniería UdeC: decretos, reglamentos, informes y más.',
  directorio: 'Directorio de bioingenieros/as egresados/as de la Universidad de Concepción.',
  instagram: 'Publicaciones seleccionadas de la cuenta de Bioingeniería UdeC en Instagram.',
};

/** Campo SEO de una entrada (Noticia, Actividad, Anuncio, Documento, Página libre). Todo opcional. */
export interface SeoEntrada {
  titulo?: string;
  descripcion?: string;
  /** Ruta de la imagen para redes (ya resuelta a su URL del build). */
  imagen?: string;
  noindex?: boolean;
}

/** Texto e imagen para redes de un listado (src/content/seo/seo.yml, campo `listados`). */
export interface SeoListado {
  descripcion?: string;
  /** Ruta de la imagen para redes (ya resuelta a su URL del build). */
  imagen?: string;
}

/** Configuración del sitio (src/content/seo/seo.yml). */
export interface SeoSitio {
  descripcion?: string;
  imagen?: string;
  listados?: Partial<Record<Listado, SeoListado>>;
  verificacion?: { google?: string; bing?: string };
}

// Un texto del panel cuenta solo si tiene algo más que espacios.
const texto = (valor: string | undefined) => valor?.trim() || undefined;

/** Título de la página con el sufijo «· BIOING+» (una sola vez; el nombre del sitio va sin sufijo). */
export function tituloDocumento(titulo: string): string {
  if (titulo === NOMBRE_SITIO) return titulo;
  const base = titulo.endsWith(SUFIJO_TITULO) ? titulo.slice(0, -SUFIJO_TITULO.length) : titulo;
  return `${base}${SUFIJO_TITULO}`;
}

/** Valores que muestra una página de contenido: el campo SEO gana sobre lo que armó la página. */
export function resolverSeo(
  armado: { titulo: string; descripcion?: string; imagen?: string },
  seo: SeoEntrada | undefined,
): { titulo: string; descripcion?: string; imagen?: string; noindex: boolean } {
  return {
    titulo: texto(seo?.titulo) ?? armado.titulo,
    descripcion: texto(seo?.descripcion) ?? texto(armado.descripcion),
    imagen: texto(seo?.imagen) ?? texto(armado.imagen),
    noindex: seo?.noindex === true,
  };
}

/** Descripción del sitio: la del panel o la del código. Base.astro la usa cuando la página no trae una. */
export const descripcionSitio = (sitio: SeoSitio | undefined): string => texto(sitio?.descripcion) ?? DESCRIPCION_SITIO;

/** Imagen para redes por defecto (undefined = og-default.png del código). */
export const imagenSitio = (sitio: SeoSitio | undefined): string | undefined => texto(sitio?.imagen);

/** Descripción de un listado: la del panel o la del código. El Inicio, sin texto propio, usa la del sitio. */
export function descripcionListado(listado: Listado, sitio: SeoSitio | undefined): string {
  const propia = texto(sitio?.listados?.[listado]?.descripcion);
  if (propia) return propia;
  return listado === 'inicio' ? descripcionSitio(sitio) : VALORES_POR_DEFECTO[listado];
}

/** Imagen para redes de un listado: la del listado, si no la del sitio (y, si tampoco, og-default.png del código). */
export const imagenDeListado = (listado: Listado, sitio: SeoSitio | undefined): string | undefined =>
  texto(sitio?.listados?.[listado]?.imagen) ?? imagenSitio(sitio);

/** Metas de verificación de los buscadores. Solo se emiten los códigos con valor. */
export function verificacionMetas(verificacion: SeoSitio['verificacion']): { name: string; content: string }[] {
  const metas: { name: string; content: string }[] = [];
  const google = texto(verificacion?.google);
  const bing = texto(verificacion?.bing);
  if (google) metas.push({ name: 'google-site-verification', content: google });
  if (bing) metas.push({ name: 'msvalidate.01', content: bing });
  return metas;
}

/** ¿El HTML generado pide no aparecer en buscadores? Lo usan el sitemap y el índice de Pagefind del build. */
export const esNoindex = (html: string): boolean => /<meta name="robots" content="noindex"/.test(html);
