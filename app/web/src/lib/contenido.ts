// Acceso al contenido. Las páginas consultan por aquí, no con getCollection directo,
// para que ningún Borrador (publicado: false) llegue al sitio por olvido.
import { getCollection, type CollectionEntry } from 'astro:content';
import { actividadEsProxima, anuncioVigente, estaVigente, yaPublicado } from './reglas';

type ColeccionPublicable = 'noticias' | 'actividades' | 'anuncios' | 'documentos' | 'banners';

export function publicados<C extends ColeccionPublicable>(coleccion: C) {
  return getCollection(coleccion, ({ data }) => data.publicado) as Promise<CollectionEntry<C>[]>;
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

/** Personas con Perfil de egresado autorizado y Ficha activa. */
export async function egresadosDelDirectorio() {
  const personas = await getCollection(
    'personas',
    ({ data }) => data.ficha_activa && data.perfil_egresado?.autorizado === true,
  );
  return personas.sort((a, b) => a.data.nombre.localeCompare(b.data.nombre, 'es'));
}
