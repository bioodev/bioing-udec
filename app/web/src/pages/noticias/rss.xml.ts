import rss from '@astrojs/rss';
import { getEntries } from 'astro:content';
import type { APIRoute } from 'astro';
import { noticiasVisibles } from '@/lib/contenido';
import { itemNoticia } from '@/lib/feeds';
import { existentes } from '@/lib/reglas';

// Feed RSS de Noticias: las mismas noticias que muestra el listado (`noticiasVisibles()`),
// más recientes primero, con sus Temas ya resueltos como categorías.
export const GET: APIRoute = async ({ site }) => {
  const noticias = (await noticiasVisibles()).sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());

  const items = await Promise.all(
    noticias.map(async (noticia) => {
      const temas = existentes(await getEntries(noticia.data.temas ?? []));
      return itemNoticia(
        {
          id: noticia.id,
          titulo: noticia.data.titulo,
          fecha: noticia.data.fecha,
          bajada: noticia.data.bajada,
          temas: temas.map((t) => t.data.nombre),
        },
        site!,
      );
    }),
  );

  return rss({
    title: 'Noticias · BIOING+',
    description: 'Noticias de la comunidad de Bioingeniería de la Universidad de Concepción.',
    site: site!,
    items,
    customData: '<language>es-cl</language>',
  });
};
