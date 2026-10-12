// Vista previa SEO del panel (ADR 0010, guía de usuario 4.15). Para Noticias, Actividades, Anuncios, Documentos,
// Páginas libres y Personas muestra primero una vista simple del contenido (una plantilla propia reemplaza la de Sveltia)
// y debajo el resultado de Google, la tarjeta al compartir en redes y los avisos breves. Los colores están en
// vista-previa.css (vista-previa-tema.js lo registra y copia el tema del panel). Las reglas están en
// vista-previa-seo-reglas.js. Sveltia expone CMS, h y createClass como globales (sin JSX ni build).
// Límites: la descripción general del sitio y la imagen por defecto vienen de src/content/seo/seo.yml y de
// una copia de src/assets/og-default.png (public/admin/og-default.png, con prueba de igualdad). La descripción
// general del sitio no la lee el panel: se aproxima.
import { IMAGEN_SITIO, RUTAS, vistaPrevia } from './vista-previa-seo-reglas.js';

const { h, createClass } = window;

// Colecciones con un campo «body» (cuerpo). Documentos no tiene: se muestra su descripción.
const CON_CUERPO = ['noticias', 'actividades', 'anuncios', 'paginas_libres'];

const estilo = {
  contenedor: { fontFamily: 'system-ui, sans-serif', color: 'var(--vp-texto)', background: 'var(--vp-fondo)', padding: '16px', lineHeight: 1.4 },
  etiqueta: { fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--vp-texto-suave)', margin: '0 0 8px' },
  seccion: { marginBottom: '20px' },
  google: { maxWidth: '600px', border: '1px solid var(--vp-borde)', borderRadius: '8px', padding: '12px 16px', background: 'var(--vp-google-fondo)' },
  url: { fontSize: '14px', color: 'var(--vp-google-url)', overflowWrap: 'anywhere' },
  tituloGoogle: { fontSize: '20px', color: 'var(--vp-google-titulo)', margin: '2px 0', fontWeight: 400 },
  descripcionGoogle: { fontSize: '14px', color: 'var(--vp-google-texto)' },
  tarjeta: { maxWidth: '520px', border: '1px solid var(--vp-borde)', borderRadius: '8px', overflow: 'hidden', background: 'var(--vp-fondo)' },
  imagen: { width: '100%', aspectRatio: '1200 / 630', objectFit: 'cover', display: 'block', background: 'var(--vp-superficie)' },
  sinImagen: {
    width: '100%', aspectRatio: '1200 / 630', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--vp-superficie)', color: 'var(--vp-texto-suave)', fontSize: '14px', textAlign: 'center', padding: '12px', boxSizing: 'border-box',
  },
  cuerpoTarjeta: { padding: '12px 14px' },
  dominio: { fontSize: '12px', color: 'var(--vp-texto-suave)', textTransform: 'uppercase' },
  tituloTarjeta: { fontSize: '16px', fontWeight: 600, margin: '2px 0 4px' },
  descripcionTarjeta: { fontSize: '14px', color: 'var(--vp-texto-suave)', margin: 0 },
  aviso: {
    background: 'var(--vp-aviso-fondo)', borderLeft: '3px solid var(--vp-aviso-borde)', color: 'var(--vp-aviso-texto)',
    padding: '8px 12px', margin: '0 0 6px', fontSize: '14px', borderRadius: '4px',
  },
  separador: { border: 0, borderTop: '1px solid var(--vp-borde)', margin: '20px 0' },
  titulo: { fontSize: '28px', lineHeight: 1.2, margin: '0 0 8px' },
  bajada: { fontSize: '17px', color: 'var(--vp-texto-suave)', margin: '0 0 12px' },
  imagenContenido: { width: '100%', maxWidth: '640px', height: 'auto', borderRadius: '6px', margin: '0 0 12px' },
};

// Lee una entrada de Sveltia (Immutable) como objeto plano.
const leerDatos = (entry) => {
  const datos = entry.get('data');
  return datos && typeof datos.toJS === 'function' ? datos.toJS() : (datos ?? {});
};

// URL de un recurso para mostrarlo; undefined si Sveltia no lo conoce (p. ej. una ruta que no está en la biblioteca).
const urlDe = (getAsset, ruta) => {
  if (!ruta) return undefined;
  try {
    return getAsset(ruta)?.url;
  } catch {
    return undefined;
  }
};

const seccion = (titulo, contenido) =>
  h('section', { style: estilo.seccion }, h('p', { style: estilo.etiqueta }, titulo), contenido);

function crearVistaPrevia(coleccion) {
  return createClass({
    render() {
      const { entry, widgetFor, getAsset } = this.props;
      const datos = leerDatos(entry);
      const v = vistaPrevia(coleccion, datos, { slug: entry.get('slug') });

      // Imagen para redes: la del bloque SEO o la destacada; si no hay, la del sitio.
      const urlTarjeta = v.imagen ? urlDe(getAsset, v.imagen) : IMAGEN_SITIO;
      const imagenTarjeta = urlTarjeta
        ? h('img', { src: urlTarjeta, alt: '', style: estilo.imagen })
        : h('div', { style: estilo.sinImagen }, 'La imagen elegida no está disponible en la vista previa');

      const urlContenido = urlDe(getAsset, datos.imagen ?? datos.foto);
      const cuerpo = CON_CUERPO.includes(coleccion) ? widgetFor('body') : null;
      const bajada = datos.bajada ?? datos.descripcion;
      // Una persona no tiene título ni cuerpo: se muestra su nombre y su foto.
      const nombre = coleccion === 'personas' ? datos.nombre : datos.titulo;

      return h(
        'div',
        { style: estilo.contenedor },
        // El contenido primero: es lo que la persona está escribiendo.
        seccion(
          'Así se ve el contenido',
          h(
            'article',
            {},
            h('h1', { style: estilo.titulo }, nombre ?? ''),
            bajada && h('p', { style: estilo.bajada }, bajada),
            urlContenido && h('img', { src: urlContenido, alt: '', style: estilo.imagenContenido }),
            cuerpo,
          ),
        ),
        h('hr', { style: estilo.separador }),
        seccion(
          'Resultado de Google',
          h(
            'div',
            { style: estilo.google },
            h('div', { style: estilo.url }, v.url),
            h('div', { style: estilo.tituloGoogle }, v.titulo),
            v.descripcion && h('div', { style: estilo.descripcionGoogle }, v.descripcion),
          ),
        ),
        seccion(
          'Al compartir en redes',
          h(
            'div',
            { style: estilo.tarjeta },
            imagenTarjeta,
            h(
              'div',
              { style: estilo.cuerpoTarjeta },
              h('div', { style: estilo.dominio }, 'BIOING+'),
              h('div', { style: estilo.tituloTarjeta }, v.titulo),
              v.descripcion && h('p', { style: estilo.descripcionTarjeta }, v.descripcion),
            ),
          ),
        ),
        v.avisos.length > 0 && seccion('Antes de publicar', v.avisos.map((aviso, i) => h('p', { key: i, style: estilo.aviso }, aviso))),
      );
    },
  });
}

// Sveltia ya cargó (el script va después de sveltia-cms.js en index.html). Sin el panel, no hace nada.
if (window.CMS && h && createClass) {
  for (const coleccion of Object.keys(RUTAS)) {
    CMS.registerPreviewTemplate(coleccion, crearVistaPrevia(coleccion));
  }
}
