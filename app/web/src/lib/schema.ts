// Constructores de datos estructurados (JSON-LD, Schema.org) del sitio.
// Módulo puro y sin dependencias: recibe el contenido ya resuelto desde las páginas y
// devuelve objetos listos (sin `undefined`, con URLs absolutas) que `jsonLd()` serializa
// para el <script type="application/ld+json"> de Base.astro.
//
// Convenciones:
// - Los constructores no consultan astro:content: las relaciones (temas, áreas, personas,
//   organizadores…) se pasan ya resueltas por la página (igual que hacen sus plantillas).
// - Nada de `schema-dts`: los tipos se declaran localmente.
// - Las fechas se emiten en ISO 8601 con `toISOString()` (ver AGENTS.md).
import { DIAS_SIN_LIMITE, anuncioVigente } from './reglas';
import { URL_FCB } from './navegacion';

export type JsonLd = Record<string, unknown>;

/** URL del sitio cuando `Astro.site` no está definido (mismo respaldo que astro.config.mjs). */
export const SITIO_POR_DEFECTO = 'https://bioing.example';

const CTX = 'https://schema.org';
const ORGANIZACION_NOMBRE = 'BIOING+';
const UDEC = {
  '@type': 'CollegeOrUniversity',
  name: 'Universidad de Concepción',
  url: 'https://www.udec.cl',
};

export type Sitio = string | URL | undefined;

/** URL base sin barra final (el `site` de Astro). */
function base(site: Sitio): string {
  const valor = site ?? SITIO_POR_DEFECTO;
  return (valor instanceof URL ? valor.href : String(valor)).replace(/\/+$/, '');
}

/** Ruta o URL → URL absoluta del sitio. */
export function absoluta(url: string, site: Sitio): string {
  return new URL(url, `${base(site)}/`).href;
}

const idSitio = (site: Sitio) => `${base(site)}#sitio`;
const idOrganizacion = (site: Sitio) => `${base(site)}#organizacion`;

export interface Contexto {
  site: Sitio;
  /** Ruta o URL de la página actual; se convierte a absoluta. */
  url: string;
}

// ── Sitio (se emite en todas las páginas desde Base.astro) ─────────────

export interface OpcionesSitio {
  /** Perfiles oficiales reales (Instagram, FCB…). Hoy son placeholders, por eso va vacío. */
  sameAs?: string[];
  /** Sitelinks Searchbox: solo si `/buscar?q=` funciona de verdad (ver nota abajo). */
  busqueda?: boolean;
}

/**
 * `WebSite` + `Organization` (NGO) del sitio, como arreglo de dos objetos.
 *
 * `busqueda` NO está habilitado: el buscador de `/buscar` usa Pagefind UI, que no lee el
 * parámetro `?q=` de la URL, así que un `SearchAction` declararía una acción que no existe.
 * Si algún día se sincroniza el buscador con la URL, se activa con `{ busqueda: true }`.
 */
export function sitioWeb(site: Sitio, opciones: OpcionesSitio = {}): JsonLd[] {
  const b = base(site);
  const sitio: JsonLd = {
    '@context': CTX,
    '@type': 'WebSite',
    '@id': idSitio(site),
    name: ORGANIZACION_NOMBRE,
    url: `${b}/`,
    inLanguage: 'es',
    publisher: { '@id': idOrganizacion(site) },
    ...(opciones.busqueda
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${b}/buscar?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
  };
  const organizacion: JsonLd = {
    '@context': CTX,
    '@type': 'NGO',
    '@id': idOrganizacion(site),
    name: ORGANIZACION_NOMBRE,
    url: `${b}/`,
    // La Facultad de Ciencias Biológicas es la organización madre de la comunidad.
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Facultad de Ciencias Biológicas, Universidad de Concepción',
      url: URL_FCB,
    },
    ...(opciones.sameAs?.length ? { sameAs: opciones.sameAs } : {}),
  };
  return [sitio, organizacion];
}

// ── Navegación ─────────────────────────────────────────────────────────

export interface Miga {
  name: string;
  url: string;
}

export function migas(items: Miga[], site: Sitio): JsonLd {
  return {
    '@context': CTX,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.name,
      item: absoluta(m.url, site),
    })),
  };
}

// ── Noticia ────────────────────────────────────────────────────────────

export interface EntradaNoticia {
  data: {
    titulo: string;
    fecha: Date;
    bajada?: string;
    imagen?: { src: string };
    etiquetas?: string[];
  };
}

export interface ContextoNoticia extends Contexto {
  /** Nombres de los Temas (articleSection). */
  temas?: string[];
  /** Nombres de las Áreas (about). */
  areas?: string[];
  personas?: { nombre: string; url?: string }[];
  organizaciones?: { nombre: string; url?: string }[];
}

/**
 * NewsArticle. Las Personas y Organizaciones mencionadas van en `mentions` (el modelo no
 * tiene autoría; el "autor" editorial es la comunidad, representada por el publisher del sitio).
 */
export function noticia(entrada: EntradaNoticia, ctx: ContextoNoticia): JsonLd {
  const { data } = entrada;
  const menciones = [
    ...(ctx.personas ?? []).map((p) => ({
      '@type': 'Person',
      name: p.nombre,
      ...(p.url ? { url: absoluta(p.url, ctx.site) } : {}),
    })),
    ...(ctx.organizaciones ?? []).map((o) => ({
      '@type': 'Organization',
      name: o.nombre,
      ...(o.url ? { url: absoluta(o.url, ctx.site) } : {}),
    })),
  ];
  return {
    '@context': CTX,
    '@type': 'NewsArticle',
    headline: data.titulo,
    datePublished: data.fecha.toISOString(),
    mainEntityOfPage: absoluta(ctx.url, ctx.site),
    inLanguage: 'es',
    publisher: { '@id': idOrganizacion(ctx.site) },
    ...(data.bajada ? { description: data.bajada } : {}),
    ...(data.imagen ? { image: absoluta(data.imagen.src, ctx.site) } : {}),
    ...(ctx.temas?.length ? { articleSection: ctx.temas.join(', ') } : {}),
    ...(ctx.areas?.length ? { about: ctx.areas.map((a) => ({ '@type': 'Thing', name: a })) } : {}),
    ...(data.etiquetas?.length ? { keywords: data.etiquetas.join(', ') } : {}),
    ...(menciones.length ? { mentions: menciones } : {}),
  };
}

// ── Actividad ──────────────────────────────────────────────────────────

export interface EntradaActividad {
  data: {
    titulo: string;
    inicio: Date;
    fin?: Date;
    modalidad: 'presencial' | 'en-linea' | 'hibrida';
    lugar?: string;
    enlace_inscripcion?: string;
    imagen?: { src: string };
  };
}

export interface ContextoActividad extends Contexto {
  organizadores?: { tipo: 'persona' | 'organizacion'; nombre: string; url?: string }[];
  expositores?: { nombre: string; url?: string }[];
}

const MODO_ASISTENCIA = {
  presencial: 'https://schema.org/OfflineEventAttendanceMode',
  'en-linea': 'https://schema.org/OnlineEventAttendanceMode',
  hibrida: 'https://schema.org/MixedEventAttendanceMode',
} as const;

export function actividad(entrada: EntradaActividad, ctx: ContextoActividad): JsonLd {
  const { data } = entrada;
  const ubicaciones: JsonLd[] = [];
  if ((data.modalidad === 'presencial' || data.modalidad === 'hibrida') && data.lugar) {
    ubicaciones.push({ '@type': 'Place', name: data.lugar });
  }
  if (data.modalidad === 'en-linea' || data.modalidad === 'hibrida') {
    // El modelo no guarda la sala virtual; se enlaza la propia ficha como ubicación en línea.
    ubicaciones.push({ '@type': 'VirtualLocation', url: absoluta(ctx.url, ctx.site) });
  }
  const organizadores = (ctx.organizadores ?? []).map((o) => ({
    '@type': o.tipo === 'persona' ? 'Person' : 'Organization',
    name: o.nombre,
    ...(o.url ? { url: absoluta(o.url, ctx.site) } : {}),
  }));
  const expositores = (ctx.expositores ?? []).map((p) => ({
    '@type': 'Person',
    name: p.nombre,
    ...(p.url ? { url: absoluta(p.url, ctx.site) } : {}),
  }));
  return {
    '@context': CTX,
    '@type': 'Event',
    name: data.titulo,
    startDate: data.inicio.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: MODO_ASISTENCIA[data.modalidad],
    url: absoluta(ctx.url, ctx.site),
    inLanguage: 'es',
    ...(data.fin ? { endDate: data.fin.toISOString() } : {}),
    ...(ubicaciones.length === 1
      ? { location: ubicaciones[0] }
      : ubicaciones.length > 1
        ? { location: ubicaciones }
        : {}),
    ...(organizadores.length === 1
      ? { organizer: organizadores[0] }
      : organizadores.length > 1
        ? { organizer: organizadores }
        : {}),
    ...(expositores.length === 1
      ? { performer: expositores[0] }
      : expositores.length > 1
        ? { performer: expositores }
        : {}),
    ...(data.imagen ? { image: absoluta(data.imagen.src, ctx.site) } : {}),
    ...(data.enlace_inscripcion
      ? { offers: { '@type': 'Offer', url: data.enlace_inscripcion, availability: 'https://schema.org/InStock' } }
      : {}),
  };
}

// ── Anuncio (JobPosting) ───────────────────────────────────────────────

export interface EntradaAnuncio {
  data: {
    titulo: string;
    tipo: 'trabajo' | 'practica' | 'pasantia' | 'proyecto' | 'convocatoria' | 'colaboracion' | 'otra';
    fecha: Date;
    fecha_limite?: Date;
  };
}

export interface ContextoAnuncio extends Contexto {
  oferente?: { tipo: 'persona' | 'organizacion'; nombre: string };
  areas?: string[];
  ahora?: Date;
}

const TIPOS_TRABAJO = new Set(['trabajo', 'practica', 'pasantia']);

/**
 * JobPosting, SOLO para ofertas laborales (trabajo/práctica/pasantía) y SOLO si están
 * vigentes; en cualquier otro caso devuelve `null` (la página omite el bloque).
 *
 * Limitación anotada: el modelo de Anuncios no tiene bajada, así que `description` se arma
 * con el título y las Áreas (texto plano). Mejora futura: agregar un campo de descripción.
 */
export function ofertaLaboral(entrada: EntradaAnuncio, ctx: ContextoAnuncio): JsonLd | null {
  const { data } = entrada;
  if (!TIPOS_TRABAJO.has(data.tipo)) return null;
  if (!anuncioVigente(data, ctx.ahora ?? new Date())) return null;
  // Misma regla de vencimiento del sitio (reglas.ts / preguntas-reunion 4.1).
  const limite = data.fecha_limite ?? new Date(data.fecha.valueOf() + DIAS_SIN_LIMITE * 86_400_000);
  const description = [data.titulo, ...(ctx.areas?.length ? [`Áreas: ${ctx.areas.join(', ')}`] : [])].join(' · ');
  return {
    '@context': CTX,
    '@type': 'JobPosting',
    title: data.titulo,
    datePosted: data.fecha.toISOString(),
    validThrough: limite.toISOString(),
    description,
    url: absoluta(ctx.url, ctx.site),
    // Si el Oferente es una Persona, Schema.org exige una Organization: se usa su nombre.
    hiringOrganization: { '@type': 'Organization', name: ctx.oferente?.nombre ?? ORGANIZACION_NOMBRE },
  };
}

// ── Persona ────────────────────────────────────────────────────────────

export interface EntradaPersona {
  data: {
    nombre: string;
    descripcion?: string;
    foto?: { src: string };
    perfil_egresado?: {
      autorizado: boolean;
      anio_egreso: number;
      cargo?: string;
      enlaces?: { etiqueta: string; url: string }[];
    };
  };
}

export interface ContextoPersona extends Contexto {
  organizacion?: { nombre: string; sitioWeb?: string };
}

/** Person (Ficha). Solo se declara el Perfil de egresado cuando está autorizado. */
export function persona(entrada: EntradaPersona, ctx: ContextoPersona): JsonLd {
  const { data } = entrada;
  const perfil = data.perfil_egresado?.autorizado ? data.perfil_egresado : undefined;
  const enlaces = perfil?.enlaces?.map((e) => e.url) ?? [];
  return {
    '@context': CTX,
    '@type': 'Person',
    name: data.nombre,
    url: absoluta(ctx.url, ctx.site),
    ...(data.descripcion ? { description: data.descripcion } : {}),
    ...(data.foto ? { image: absoluta(data.foto.src, ctx.site) } : {}),
    ...(perfil?.cargo ? { jobTitle: perfil.cargo } : {}),
    ...(perfil && ctx.organizacion
      ? {
          affiliation: {
            '@type': 'Organization',
            name: ctx.organizacion.nombre,
            ...(ctx.organizacion.sitioWeb ? { url: ctx.organizacion.sitioWeb } : {}),
          },
        }
      : {}),
    ...(enlaces.length ? { sameAs: enlaces } : {}),
    ...(perfil ? { alumniOf: UDEC } : {}),
  };
}

// ── Documento ──────────────────────────────────────────────────────────

export interface EntradaDocumento {
  data: {
    titulo: string;
    anio: number;
    enlace: string;
    descripcion?: string;
    palabras_clave?: string[];
  };
}

export interface ContextoDocumento extends Contexto {
  temas?: string[];
}

/** DigitalDocument del Repositorio. El enlace de Drive es la URL del documento. */
export function documento(entrada: EntradaDocumento, ctx: ContextoDocumento): JsonLd {
  const { data } = entrada;
  return {
    '@context': CTX,
    '@type': 'DigitalDocument',
    name: data.titulo,
    datePublished: `${data.anio}-01-01`,
    url: data.enlace,
    inLanguage: 'es',
    mainEntityOfPage: absoluta(ctx.url, ctx.site),
    ...(data.descripcion ? { description: data.descripcion } : {}),
    ...(ctx.temas?.length ? { about: ctx.temas.map((t) => ({ '@type': 'Thing', name: t })) } : {}),
    ...(data.palabras_clave?.length ? { keywords: data.palabras_clave.join(', ') } : {}),
  };
}

// ── Listado ────────────────────────────────────────────────────────────

export interface ElementoLista {
  name: string;
  url: string;
}

/** CollectionPage con un ItemList (p. ej. el Directorio). */
export function listaElementos(titulo: string, elementos: ElementoLista[], site: Sitio): JsonLd {
  return {
    '@context': CTX,
    '@type': 'CollectionPage',
    name: titulo,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: elementos.length,
      itemListElement: elementos.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: e.name,
        url: absoluta(e.url, site),
      })),
    },
  };
}

// ── Serialización ──────────────────────────────────────────────────────

/**
 * Objeto (o arreglo) JSON-LD → cadena para `<script ... set:html>`.
 * Escapa `</script` para que un texto del contenido no pueda cerrar el script.
 */
export function jsonLd(objeto: JsonLd | JsonLd[]): string {
  return JSON.stringify(objeto).replace(/<\/script/gi, '<\\/script');
}
