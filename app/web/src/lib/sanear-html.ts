// Saneador del cuerpo Markdown (Noticias, Agenda, Anuncios, Páginas libres): plugin hast de Sätteri, el procesador
// de Markdown de Astro 7, registrado en astro.config.mjs (`markdown.processor`). Sin él, Astro publica tal cual el
// HTML crudo que se escriba en el cuerpo. La CSP ya bloquea scripts, eventos y `javascript:`, pero no una redirección
// con <meta refresh>, un formulario falso ni un enlace con estilo que tape la página. Por eso:
//   - se quita **todo** el HTML crudo del cuerpo (nodos `raw`): el editor del panel produce Markdown, y los videos y
//     reproductores van por sus campos propios (Video, Incrustados);
//   - los enlaces e imágenes de Markdown con un esquema que no sea http, https, mailto o tel (`javascript:`, `data:`…)
//     pierden la dirección: el enlace queda como texto y la imagen se quita.
import { defineHastPlugin } from 'satteri';

const ESQUEMAS_PERMITIDOS = new Set(['http', 'https', 'mailto', 'tel']);

/** true si la dirección es relativa (ruta, #ancla, ?consulta) o usa un esquema permitido. */
export function urlSegura(valor: unknown): boolean {
  // El navegador ignora espacios y caracteres de control al leer el esquema ("java\tscript:"): se quitan antes.
  const limpia = String(valor ?? '').replace(/[\u0000- \u007f]/g, '').toLowerCase();
  const esquema = limpia.match(/^([a-z][a-z0-9+.-]*):/)?.[1];
  return esquema === undefined || ESQUEMAS_PERMITIDOS.has(esquema);
}

export const sanearHtml = defineHastPlugin({
  name: 'bioing-sanear-html',
  raw(nodo, ctx) {
    ctx.removeNode(nodo);
  },
  element: {
    filter: ['a', 'img'],
    visit(nodo, ctx) {
      if (nodo.tagName === 'a' && !urlSegura(nodo.properties?.href)) ctx.replaceNode(nodo, [...nodo.children]);
      if (nodo.tagName === 'img' && !urlSegura(nodo.properties?.src)) ctx.removeNode(nodo);
    },
  },
});
