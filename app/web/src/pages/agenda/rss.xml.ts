import rss from '@astrojs/rss';
import { getEntry, getEntries } from 'astro:content';
import type { APIRoute } from 'astro';
import { publicados } from '@/lib/contenido';
import { TIPOS_ACTIVIDAD } from '@/lib/agenda';
import { itemActividad } from '@/lib/feeds';
import { existentes } from '@/lib/reglas';

// Feed RSS de la Agenda: todas las Actividades publicadas (próximas y realizadas),
// ordenadas por inicio descendente. Los Organizadores se resuelven para firmarlas.
export const GET: APIRoute = async ({ site }) => {
  const actividades = (await publicados('actividades')).sort((a, b) => b.data.inicio.valueOf() - a.data.inicio.valueOf());

  const items = await Promise.all(
    actividades.map(async (actividad) => {
      const areas = existentes(await getEntries(actividad.data.areas ?? []));
      const organizadores = existentes(
        await Promise.all(
          actividad.data.organizadores.map((o) => (o.tipo === 'persona' ? getEntry(o.persona) : getEntry(o.organizacion))),
        ),
      );
      return itemActividad(
        {
          id: actividad.id,
          titulo: actividad.data.titulo,
          inicio: actividad.data.inicio,
          tipo: TIPOS_ACTIVIDAD[actividad.data.tipo],
          lugar: actividad.data.lugar,
          areas: areas.map((a) => a.data.nombre),
          organizadores: organizadores.map((o) => o.data.nombre),
        },
        site!,
      );
    }),
  );

  return rss({
    title: 'Agenda · BIOING+',
    description: 'Actividades de la comunidad de Bioingeniería de la Universidad de Concepción.',
    site: site!,
    items,
    customData: '<language>es-cl</language>',
  });
};
