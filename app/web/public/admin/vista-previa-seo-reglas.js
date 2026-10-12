// Reglas puras de la vista previa SEO del panel (ADR 0010). Sin dependencias ni build: el panel las carga tal cual.
// Son una copia de src/lib/seo.ts (precedencia) y de las constantes de tipos de src/lib/{agenda,anuncios,repositorio}.ts;
// src/lib/vista-previa-seo.test.ts comprueba que den lo mismo que el sitio. Si cambia una, cambia la otra.
// Lo que el panel no puede saber (la imagen por defecto de seo.yml, la descripción general del sitio) queda
// aproximado y se dice en la vista previa.

export const SUFIJO_TITULO = ' · BIOING+';
const NOMBRE_SITIO = 'BIOING+';
export const LIMITE_TITULO = 60;
export const LIMITE_DESCRIPCION = 160;
const ZONA_HORARIA = 'America/Santiago';

/** Imagen por defecto del sitio (src/assets/og-default.png). Ruta que se pide a getAsset. */
export const IMAGEN_SITIO = '@/assets/og-default.png';

/** Etiquetas de los tipos, con las mismas claves que guarda el panel. */
export const TIPOS = {
  actividades: {
    seminario: 'Seminario',
    charla: 'Charla',
    congreso: 'Congreso',
    taller: 'Taller',
    estudiantes: 'Actividad de estudiantes',
    egresados: 'Actividad de egresados/as',
    academica: 'Actividad académica',
    encuentro: 'Encuentro de la comunidad',
    otra: 'Otra',
  },
  anuncios: {
    trabajo: 'Oferta de trabajo',
    practica: 'Práctica profesional',
    pasantia: 'Pasantía',
    proyecto: 'Proyecto de investigación',
    convocatoria: 'Convocatoria',
    colaboracion: 'Solicitud de colaboración',
    otra: 'Otra oportunidad',
  },
  documentos: {
    decreto: 'Decreto',
    reglamento: 'Reglamento',
    ley: 'Ley',
    informe: 'Informe',
    publicacion: 'Publicación',
    institucional: 'Documento institucional',
    historico: 'Documento histórico',
    academico: 'Material académico',
    otro: 'Otro',
  },
};

/** Ruta pública de cada colección del panel: la parte de la URL que muestra Google. */
export const RUTAS = {
  noticias: '/noticias/',
  actividades: '/agenda/',
  anuncios: '/anuncios/',
  documentos: '/repositorio/',
  paginas_libres: '/p/',
};

const texto = (valor) => (typeof valor === 'string' && valor.trim() ? valor.trim() : undefined);

/** Título de la página con « · BIOING+» una sola vez (igual que tituloDocumento de src/lib/seo.ts). */
export function tituloDocumento(titulo) {
  if (titulo === NOMBRE_SITIO) return titulo;
  const base = titulo.endsWith(SUFIJO_TITULO) ? titulo.slice(0, -SUFIJO_TITULO.length) : titulo;
  return `${base}${SUFIJO_TITULO}`;
}

/** Precedencia: bloque SEO de la entrada → valor armado por la página (igual que resolverSeo de src/lib/seo.ts). */
export function resolverSeo(armado, seo) {
  return {
    titulo: texto(seo?.titulo) ?? armado.titulo,
    descripcion: texto(seo?.descripcion) ?? texto(armado.descripcion),
    imagen: texto(seo?.imagen) ?? texto(armado.imagen),
    noindex: seo?.noindex === true,
  };
}

const formatoFechaHora = (fecha) =>
  fecha.toLocaleString('es-CL', { timeZone: ZONA_HORARIA, dateStyle: 'long', timeStyle: 'short' });

/** Cuándo es una actividad, como lo escribe su página: «inicio» o «inicio — término». */
export function cuandoActividad(inicio, fin) {
  const desde = inicio ? new Date(inicio) : undefined;
  if (!desde || Number.isNaN(desde.valueOf())) return '';
  const hasta = fin ? new Date(fin) : undefined;
  if (hasta && !Number.isNaN(hasta.valueOf()) && hasta.valueOf() !== desde.valueOf()) {
    return `${formatoFechaHora(desde)} — ${formatoFechaHora(hasta)}`;
  }
  return formatoFechaHora(desde);
}

// Une las partes que existen con « · » (la página escribe «tipo · dato»).
const unir = (...partes) => partes.filter(Boolean).join(' · ');

/** Valores que arma cada página antes del bloque SEO (src/pages/<colección>/[id].astro). */
export function valoresArmados(coleccion, datos) {
  // Mientras el título está vacío (borrador recién creado) la vista previa no muestra un hueco.
  const titulo = texto(datos.titulo) ?? 'Sin título';
  switch (coleccion) {
    case 'noticias':
    case 'paginas_libres':
      return { titulo, descripcion: datos.bajada, imagen: datos.imagen };
    case 'actividades':
      return { titulo, descripcion: unir(TIPOS.actividades[datos.tipo], cuandoActividad(datos.inicio, datos.fin)) };
    case 'anuncios':
      return { titulo, descripcion: unir(TIPOS.anuncios[datos.tipo], titulo) };
    case 'documentos':
      return { titulo, descripcion: unir(TIPOS.documentos[datos.tipo], titulo) };
    default:
      throw new Error(`Colección sin vista previa SEO: ${coleccion}`);
  }
}

/** Corta un texto como lo hace Google: hasta el límite, con «…» al final si no cabe. */
export function truncar(valor, limite) {
  if (valor.length <= limite) return valor;
  return `${valor.slice(0, limite - 1).trimEnd()}…`;
}

/** Avisos breves para quien edita. Sin tono de error: son sugerencias. */
export function avisos({ titulo, descripcion, noindex }) {
  const lista = [];
  if (!descripcion) lista.push('Sin descripción propia: se usará la descripción general del sitio.');
  if (titulo.length > LIMITE_TITULO) lista.push('Título largo: se cortará en Google.');
  if (noindex) lista.push('Marcada como «No mostrar en buscadores»: Google no la incluirá en su índice.');
  return lista;
}

/** Todo lo que muestra la vista previa de una entrada. `datos` es la entrada en JS plano (sin Immutable). */
export function vistaPrevia(coleccion, datos, { slug = '' } = {}) {
  const seo = resolverSeo(valoresArmados(coleccion, datos), datos.seo);
  const titulo = tituloDocumento(seo.titulo);
  return {
    titulo: truncar(titulo, LIMITE_TITULO),
    descripcion: seo.descripcion && truncar(seo.descripcion, LIMITE_DESCRIPCION),
    imagen: seo.imagen,
    url: `bioing…${RUTAS[coleccion]}${slug || '…'}`,
    noindex: seo.noindex,
    avisos: avisos({ titulo, descripcion: seo.descripcion, noindex: seo.noindex }),
  };
}
