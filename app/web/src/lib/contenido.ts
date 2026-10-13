// Acceso al contenido. Las páginas consultan por aquí, no con getCollection directo,
// para que ningún Borrador (publicado: false) llegue al sitio por olvido.
import { getCollection, getEntries, getEntry, type CollectionEntry } from 'astro:content';
import { actividadEsProxima, anuncioVigente, estaVigente, existentes, yaPublicado } from './reglas';
import { noticiasRelacionadas } from './relacionadas';
import { seccionesPublicadas } from './secciones-inicio';
import { paginaDestacada } from './pagina-destacada';
import { cifrasDelDirectorio, tarjetasComunidad, ultimosDocumentos } from './comunidad';
import { areasMasFrecuentes, contarAreas } from './filtro-directorio';
import { seccionActiva, type ConfigMenu, type PaginaLibreMenu } from './navegacion';
import type { ConfigRedes } from './redes';
import { descripcionListado, imagenDeListado, type Listado, type SeoEntrada, type SeoSitio } from './seo';

type ColeccionPublicable = 'noticias' | 'actividades' | 'anuncios' | 'documentos' | 'banners' | 'instagram' | 'paginasLibres';

export function publicados<C extends ColeccionPublicable>(coleccion: C) {
  return getCollection(coleccion, ({ data }) => data.publicado) as Promise<CollectionEntry<C>[]>;
}

/** Páginas libres publicadas, ordenadas por título. */
export async function paginasLibres() {
  return (await publicados('paginasLibres')).sort((a, b) => a.data.titulo.localeCompare(b.data.titulo, 'es'));
}

/** Páginas libres publicadas, en la forma que usan el menú y el pie (src/lib/navegacion.ts). */
export async function paginasParaMenu(): Promise<PaginaLibreMenu[]> {
  return (await paginasLibres()).map((p) => ({
    titulo: p.data.titulo,
    href: `/p/${p.id}`,
    bajada: p.data.bajada,
    mostrar_en: p.data.mostrar_en,
  }));
}

/** Noticias publicadas cuya fecha ya llegó (una Noticia con fecha futura no aparece en ninguna parte). */
export async function noticiasVisibles(ahora = new Date()) {
  return (await publicados('noticias')).filter((n) => yaPublicado(n.data.fecha, ahora));
}

/** Anuncios publicados cuya fecha de publicación ya llegó. */
export async function anunciosVisibles(ahora = new Date()) {
  return (await publicados('anuncios')).filter((a) => yaPublicado(a.data.fecha, ahora));
}

type Ref = { collection: string; id: string };
const ids = (refs: Ref[] | undefined) => (refs ?? []).map((r) => r.id);

function personaUOrganizacion(v: { tipo: 'persona'; persona: Ref } | { tipo: 'organizacion'; organizacion: Ref }) {
  return v.tipo === 'persona' ? { coleccion: 'personas' as const, id: v.persona.id } : { coleccion: 'organizaciones' as const, id: v.organizacion.id };
}

export interface Vinculos {
  noticias: CollectionEntry<'noticias'>[];
  organiza: CollectionEntry<'actividades'>[];
  expone: CollectionEntry<'actividades'>[];
  ofrece: CollectionEntry<'anuncios'>[];
}

const vacio = (): Vinculos => ({ noticias: [], organiza: [], expone: [], ofrece: [] });

let indice: Promise<Record<'personas' | 'organizaciones', Map<string, Vinculos>>> | undefined;

/** Índice inverso Persona/Organización → contenidos publicados donde aparece. Se calcula una vez por build. */
export function vinculos() {
  indice ??= (async () => {
    const mapas = { personas: new Map<string, Vinculos>(), organizaciones: new Map<string, Vinculos>() };
    const de = (coleccion: 'personas' | 'organizaciones', id: string) => {
      let v = mapas[coleccion].get(id);
      if (!v) mapas[coleccion].set(id, (v = vacio()));
      return v;
    };

    for (const n of await noticiasVisibles()) {
      for (const id of ids(n.data.personas_mencionadas)) de('personas', id).noticias.push(n);
      for (const id of ids(n.data.organizaciones_mencionadas)) de('organizaciones', id).noticias.push(n);
    }
    for (const a of await publicados('actividades')) {
      for (const o of a.data.organizadores) {
        const { coleccion, id } = personaUOrganizacion(o);
        de(coleccion, id).organiza.push(a);
      }
      for (const id of ids(a.data.expositores)) de('personas', id).expone.push(a);
    }
    for (const a of await anunciosVisibles()) {
      const { coleccion, id } = personaUOrganizacion(a.data.oferente);
      de(coleccion, id).ofrece.push(a);
    }
    return mapas;
  })();
  return indice;
}

export async function vinculosDe(coleccion: 'personas' | 'organizaciones', id: string) {
  return (await vinculos())[coleccion].get(id) ?? vacio();
}

// Fechas. Las fechas con hora traen offset y se muestran en hora de Chile. Las fechas solas
// (AAAA-MM-DD) se parsean como medianoche UTC: mostrarlas en hora de Chile daría el día anterior.
const ZONA = 'America/Santiago';
export const formatoFechaHora = (d: Date) =>
  d.toLocaleString('es-CL', { timeZone: ZONA, dateStyle: 'long', timeStyle: 'short' });
export const formatoFecha = (d: Date) =>
  d.toLocaleDateString('es-CL', { timeZone: 'UTC', dateStyle: 'long' });

// ── Consultas para las páginas ("ahora" = momento del build) ─────────

export async function bannerVigente(ahora = new Date()) {
  const vigentes = (await publicados('banners')).filter((b) => estaVigente(b.data, ahora));
  return vigentes.sort((a, b) => b.data.inicio.valueOf() - a.data.inicio.valueOf())[0];
}

export async function noticiasRecientes(cantidad = 3) {
  const noticias = await noticiasVisibles();
  return noticias.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf()).slice(0, cantidad);
}

export async function proximasActividades(ahora = new Date()) {
  const actividades = (await publicados('actividades')).filter((a) => actividadEsProxima(a.data, ahora));
  return actividades.sort((a, b) => a.data.inicio.valueOf() - b.data.inicio.valueOf());
}

/** Actividades publicadas que ya terminaron (archivo histórico), más recientes primero. */
export async function actividadesRealizadas(ahora = new Date()) {
  const actividades = (await publicados('actividades')).filter((a) => !actividadEsProxima(a.data, ahora));
  return actividades.sort((a, b) => b.data.inicio.valueOf() - a.data.inicio.valueOf());
}

/** Noticias publicadas que cubren una Actividad (campo `actividad` de la Noticia). */
export async function noticiasDeActividad(id: string) {
  return (await noticiasVisibles()).filter((n) => n.data.actividad?.id === id);
}

/** Noticias visibles parecidas a `actual` (Temas, Etiquetas y Áreas compartidas), para "Te puede interesar". */
export async function relacionadasDe(actual: CollectionEntry<'noticias'>, cantidad = 3) {
  const datos = (n: CollectionEntry<'noticias'>) => ({
    id: n.id,
    fecha: n.data.fecha,
    temas: ids(n.data.temas),
    etiquetas: n.data.etiquetas ?? [],
    areas: ids(n.data.areas),
  });
  const candidatas = (await noticiasVisibles()).map((n) => ({ ...datos(n), entrada: n }));
  return noticiasRelacionadas(datos(actual), candidatas, cantidad).map((c) => c.entrada);
}

export async function anunciosVigentes(ahora = new Date()) {
  const anuncios = (await anunciosVisibles(ahora)).filter((a) => anuncioVigente(a.data, ahora));
  return anuncios.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}

/** Anuncios visibles que ya vencieron (archivo), más recientes primero. */
export async function anunciosVencidos(ahora = new Date()) {
  const anuncios = (await anunciosVisibles(ahora)).filter((a) => !anuncioVigente(a.data, ahora));
  return anuncios.sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
}

/** Documentos publicados del Repositorio: más recientes primero y, dentro del año, por título. */
export async function documentosDelRepositorio() {
  const docs = await publicados('documentos');
  return docs.sort((a, b) => b.data.anio - a.data.anio || a.data.titulo.localeCompare(b.data.titulo, 'es'));
}

/** Publicaciones de Instagram seleccionadas, más recientes primero. */
export async function publicacionesInstagram(cantidad?: number) {
  const pubs = (await publicados('instagram')).sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());
  return cantidad ? pubs.slice(0, cantidad) : pubs;
}

/** Personas con Perfil de egresado autorizado y Ficha activa. */
export async function egresadosDelDirectorio() {
  const personas = await getCollection(
    'personas',
    ({ data }) => data.ficha_activa && data.perfil_egresado?.autorizado === true,
  );
  return personas.sort((a, b) => a.data.nombre.localeCompare(b.data.nombre, 'es'));
}

/**
 * Banda «Comunidad y documentos» del Inicio: textos del panel (colección `inicio`), tarjetas activas, cifras del
 * Directorio y últimos documentos. Null si el panel apagó el Directorio y el Repositorio: no sale la banda.
 */
export async function bandaComunidad(config: ConfigMenu) {
  const tarjetas = tarjetasComunidad(seccionActiva('/directorio', config), seccionActiva('/repositorio', config));
  if (tarjetas.length === 0) return null;
  const [entrada, egresados, documentos, menu] = await Promise.all([
    getEntry('inicio', 'inicio'),
    egresadosDelDirectorio(),
    documentosDelRepositorio(),
    getEntry('menu', 'menu'),
  ]);
  const comunidad = entrada?.data.comunidad;
  if (!comunidad) return null;
  const cifras = cifrasDelDirectorio(
    egresados.map((p) => ({ generacion: p.data.perfil_egresado?.generacion, organizacion: p.data.perfil_egresado?.organizacion?.id })),
  );
  const porEgresado = await Promise.all(
    egresados.map(async (p) => (p.data.perfil_egresado?.areas ? existentes(await getEntries(p.data.perfil_egresado.areas)) : [])),
  );
  const areas = areasMasFrecuentes(
    contarAreas(porEgresado.map((as) => as.map((a) => ({ id: a.id, nombre: a.data.nombre })))),
    AREAS_EN_INICIO,
  );
  return {
    ...comunidad,
    tarjetas,
    cifras,
    areas,
    formulario: formularioDirectorio(menu?.data),
    documentos: ultimosDocumentos(documentos),
  };
}

/** Cuántas áreas (chips) se muestran en la tarjeta del Directorio del Inicio. */
const AREAS_EN_INICIO = 5;

/** Google Form para sumarse al Directorio (src/content/menu/menu.yml). Vacío o ausente = sin formulario. */
export function formularioDirectorio(menu: { formulario_directorio?: string } | undefined): string | undefined {
  return menu?.formulario_directorio || undefined;
}

/** Secciones destacadas del Inicio publicadas, en el orden de la lista del CMS (colección `inicio`). */
export async function seccionesInicio() {
  const entrada = await getEntry('inicio', 'inicio');
  return seccionesPublicadas(entrada?.data.secciones ?? []);
}

/** Secciones del menú que el panel oculta (src/content/menu/menu.yml). Sin archivo, todo se muestra. */
export async function configuracionMenu(): Promise<ConfigMenu> {
  return (await getEntry('menu', 'menu'))?.data ?? {};
}

/** URLs de las redes sociales (src/content/redes/redes.yml). Vacío si el archivo no existe. */
export async function configuracionRedes(): Promise<ConfigRedes> {
  return (await getEntry('redes', 'redes'))?.data ?? {};
}

/** SEO del sitio (src/content/seo/seo.yml). Sin archivo, todo queda en blanco y el sitio usa sus valores por defecto. */
export async function configuracionSeo(): Promise<SeoSitio> {
  const datos = (await getEntry('seo', 'seo'))?.data;
  const listados = datos?.listados && Object.fromEntries(
    Object.entries(datos.listados).map(([listado, valores]) => [listado, { ...valores, imagen: valores?.imagen?.src }]),
  );
  return { ...datos, imagen: datos?.imagen?.src, listados };
}

/** Descripción de un listado (campo «Descripción de cada listado» del panel, o el texto por defecto). */
export async function descripcionDeListado(listado: Listado) {
  return descripcionListado(listado, await configuracionSeo());
}

/** Imagen para redes de un listado: la del listado, o la del sitio. undefined = og-default.png (lo resuelve Base). */
export async function imagenDeListadoSeo(listado: Listado) {
  return imagenDeListado(listado, await configuracionSeo());
}

/** Encabezado de un listado (src/content/encabezados/encabezados.yml): imagen, ícono e introducción, todo opcional. */
export async function encabezadoDeListado(listado: Exclude<Listado, 'inicio'>) {
  const valores = (await getEntry('encabezados', 'encabezados'))?.data[listado];
  return { imagen: valores?.imagen, imagenAlt: valores?.imagen_alt, icono: valores?.icono, intro: valores?.intro };
}

/** Bloque SEO de una entrada, con la imagen ya resuelta a su ruta (para resolverSeo). */
export function seoDeEntrada(seo: { titulo?: string; descripcion?: string; imagen?: { src: string }; noindex?: boolean } | undefined): SeoEntrada | undefined {
  return seo && { ...seo, imagen: seo.imagen?.src };
}

/** Página libre destacada en el Inicio (solo una). Si hay varias marcadas, avisa en el build y muestra la primera. */
export async function paginaDestacadaInicio() {
  const paginas = await publicados('paginasLibres');
  const { destacada, fuera } = paginaDestacada(
    paginas.map((p) => ({ titulo: p.data.titulo, destacar_inicio: p.data.destacar_inicio, publicado: p.data.publicado, entrada: p })),
  );
  if (fuera.length > 0) {
    const nombres = fuera.map((p) => `«${p.entrada.data.titulo}»`).join(', ');
    console.warn(`[paginas-libres] Solo una página puede estar destacada en el Inicio. Se muestra «${destacada?.entrada.data.titulo}»; quedan fuera ${nombres}.`);
  }
  return destacada?.entrada ?? null;
}
