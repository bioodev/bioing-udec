// Acceso al contenido. Las páginas consultan por aquí, no con getCollection directo,
// para que ningún Borrador (publicado: false) llegue al sitio por olvido.
import { getCollection, type CollectionEntry } from 'astro:content';

type ColeccionPublicable = 'noticias' | 'actividades' | 'anuncios' | 'documentos' | 'banners';

export function publicados<C extends ColeccionPublicable>(coleccion: C) {
  return getCollection(coleccion, ({ data }) => data.publicado) as Promise<CollectionEntry<C>[]>;
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

    for (const n of await publicados('noticias')) {
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
    for (const a of await publicados('anuncios')) {
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
