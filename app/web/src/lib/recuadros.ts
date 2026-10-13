// Recuadros destacados dentro del cuerpo Markdown (Noticias, Agenda, Anuncios, Páginas libres): una cita cuya primera
// línea es una marca de tipo `> [!NOTA]` se publica como <aside class="recuadro recuadro-nota"> con título visible e
// ícono de Phosphor (los mismos trazos de phosphor-astro, MIT; ver docs/design.md). Es la sintaxis de las alertas de
// GitHub, con nombres en español y, por compatibilidad, los de GitHub en inglés. Sätteri no las soporta de serie.
// Una cita sin marca, o con una marca desconocida, queda como cita. Va antes de sanearHtml en astro.config.mjs.
import { defineHastPlugin, type HastContent, type HastNode } from 'satteri';

export type TipoRecuadro = 'nota' | 'importante' | 'consejo' | 'atencion';

const TIPOS: Record<string, TipoRecuadro> = {
  NOTA: 'nota',
  NOTE: 'nota',
  IMPORTANTE: 'importante',
  IMPORTANT: 'importante',
  CONSEJO: 'consejo',
  TIP: 'consejo',
  ATENCION: 'atencion',
  WARNING: 'atencion',
};

const TITULOS: Record<TipoRecuadro, string> = {
  nota: 'Nota',
  importante: 'Importante',
  consejo: 'Consejo',
  atencion: 'Atención',
};

// Trazos de Phosphor (viewBox 0 0 256 256, relleno currentColor).
const ICONOS: Record<TipoRecuadro, string> = {
  nota: 'M229.66,58.34l-32-32a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,88,128v32a8,8,0,0,0,8,8h32a8,8,0,0,0,5.66-2.34l96-96A8,8,0,0,0,229.66,58.34ZM124.69,152H104V131.31l64-64L188.69,88ZM200,76.69,179.31,56,192,43.31,212.69,64ZM224,128v80a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h80a8,8,0,0,1,0,16H48V208H208V128a8,8,0,0,1,16,0Z',
  importante:
    'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z',
  consejo:
    'M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z',
  atencion:
    'M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z',
};

/** Quita tildes y pasa a mayúsculas: «Atención» y «ATENCIÓN» dan la misma clave. */
const clave = (nombre: string) => nombre.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();

/**
 * Lee la marca de tipo al inicio de un texto: `[!NOTA]` seguido de fin de texto, salto de línea o espacio (el texto
 * puede seguir en la misma línea, como se escribe fácil en el editor del panel).
 * Devuelve el tipo y el texto que sigue a la marca, o null si no es un recuadro conocido.
 */
export function leerMarcaRecuadro(texto: string): { tipo: TipoRecuadro; resto: string } | null {
  const coincidencia = texto.match(/^\[!([^\]\n]+)\](?:[ \t]*(?:\r?\n|$)|[ \t]+)/);
  if (!coincidencia) return null;
  const tipo = TIPOS[clave(coincidencia[1])];
  if (!tipo) return null;
  return { tipo, resto: texto.slice(coincidencia[0].length) };
}

const texto = (value: string): HastContent => ({ type: 'text', value });

// Los tipos hast de Sätteri piden propiedades y nodos hijos más estrictos que los que armamos aquí: el nodo que
// construimos es el que espera el renderizador, así que se afirma el tipo en la frontera.
const elemento = (tagName: string, properties: Record<string, unknown>, children: HastContent[]) =>
  ({ type: 'element', tagName, properties, children }) as unknown as HastContent;

const esTextoVacio = (nodo: HastNode) => nodo.type === 'text' && nodo.value.trim() === '';

function iconoSvg(tipo: TipoRecuadro): HastContent {
  return elemento(
    'svg',
    { className: ['recuadro-icono'], viewBox: '0 0 256 256', fill: 'currentColor', ariaHidden: 'true', focusable: 'false' },
    [elemento('path', { d: ICONOS[tipo] }, [])],
  );
}

export const recuadros = defineHastPlugin({
  name: 'bioing-recuadros',
  element: {
    filter: ['blockquote'],
    visit(nodo, ctx) {
      const hijos = [...nodo.children];
      const primero = hijos.find((hijo) => !esTextoVacio(hijo));
      if (primero?.type !== 'element' || primero.tagName !== 'p') return;
      const inicio = primero.children[0];
      if (inicio?.type !== 'text') return;
      const marca = leerMarcaRecuadro(inicio.value);
      if (!marca) return;

      // Se quita la marca del primer párrafo; si no queda nada en él, el párrafo desaparece.
      const restoPrimero = primero.children.slice(1);
      const cuerpo = hijos.flatMap((hijo): HastContent[] => {
        if (hijo !== primero) return [hijo];
        if (marca.resto === '' && restoPrimero.length === 0) return [];
        const inicioNuevo = marca.resto === '' ? [] : [texto(marca.resto)];
        return [elemento('p', {}, [...inicioNuevo, ...restoPrimero])];
      });

      const titulo = elemento('p', { className: ['recuadro-titulo'] }, [iconoSvg(marca.tipo), texto(TITULOS[marca.tipo])]);
      ctx.replaceNode(nodo, elemento('aside', { className: ['recuadro', `recuadro-${marca.tipo}`], role: 'note' }, [titulo, ...cuerpo]));
    },
  },
});
