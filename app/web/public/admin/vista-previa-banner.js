// Vista previa de Banners en el panel: dibuja un slide parecido al del carrusel del Inicio (HeroCarrusel.astro),
// en escritorio y en un celular de 375 px, y debajo el estado de vigencia y los avisos. Es una aproximación con
// estilos propios (no es el componente real). Las reglas están en vista-previa-banner-reglas.js. Sveltia expone
// CMS, h y createClass como globales (sin JSX ni build), igual que vista-previa-seo.js.
import { avisos, estadoVigencia, tipoEnlace } from './vista-previa-banner-reglas.js';

const { h, createClass } = window;

// Colores del tema del sitio (src/styles/starwind.css, modo claro): fondo del slide = foreground, botón = primary.
const COLOR = { fondo: '#1d1d1f', texto: '#ffffff', primario: '#0066cc' };

const estilo = {
  contenedor: { fontFamily: 'system-ui, sans-serif', color: 'var(--vp-texto)', background: 'var(--vp-fondo)', padding: '16px', lineHeight: 1.4 },
  etiqueta: { fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--vp-texto-suave)', margin: '0 0 8px' },
  seccion: { marginBottom: '20px' },
  aviso: {
    background: 'var(--vp-aviso-fondo)', borderLeft: '3px solid var(--vp-aviso-borde)', color: 'var(--vp-aviso-texto)',
    padding: '8px 12px', margin: '0 0 6px', fontSize: '14px', borderRadius: '4px',
  },
  estado: { fontSize: '14px', margin: 0, color: 'var(--vp-aviso-texto)' },
  enlace: { fontSize: '13px', color: 'var(--vp-texto-suave)', margin: '6px 0 0', overflowWrap: 'anywhere' },
  // Slide: mismo fondo, velo, altura mínima y alineación que HeroCarrusel (escritorio y celular).
  slide: { position: 'relative', overflow: 'hidden', background: COLOR.fondo, color: COLOR.texto, isolation: 'isolate', maxWidth: '100%' },
  slideEscritorio: { minHeight: '360px' },
  slideCelular: { width: '375px', minHeight: '512px' },
  imagen: {
    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7,
    filter: 'sepia(0.22) saturate(1.06) brightness(0.95)',
  },
  sinImagen: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px', padding: '12px', textAlign: 'center' },
  velo: { position: 'absolute', inset: 0, background: 'rgba(29, 29, 31, 0.3)' },
  contenido: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 'inherit', boxSizing: 'border-box' },
  contenidoEscritorio: { padding: '48px 24px' },
  contenidoCelular: { padding: '96px 16px' },
  titulo: { fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0, maxWidth: '100%', overflowWrap: 'break-word' },
  tituloEscritorio: { fontSize: '44px' },
  tituloCelular: { fontSize: '36px' },
  texto: { margin: '16px auto 0', maxWidth: '90%', opacity: 0.9, overflowWrap: 'break-word' },
  textoEscritorio: { fontSize: '17px' },
  textoCelular: { fontSize: '18px' },
  boton: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '28px', borderRadius: '9999px', padding: '10px 20px',
    background: COLOR.primario, color: COLOR.texto, fontSize: '15px', fontWeight: 500, whiteSpace: 'nowrap',
  },
  pie: { fontSize: '12px', color: 'var(--vp-texto-suave)', margin: '6px 0 0' },
};

// Lee una entrada de Sveltia (Immutable) como objeto plano.
const leerDatos = (entry) => {
  const datos = entry.get('data');
  return datos && typeof datos.toJS === 'function' ? datos.toJS() : (datos ?? {});
};

// URL de un recurso para mostrarlo; undefined si Sveltia no lo conoce (igual que urlDe de vista-previa-seo.js).
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

// Un slide. `celular` cambia el ancho, el tamaño de letra y el margen; el resto es igual al del sitio.
function Slide({ datos, imagenUrl, celular }) {
  const titulo = (typeof datos.titulo === 'string' && datos.titulo.trim()) || '(sin título)';
  return h(
    'div',
    { style: { ...estilo.slide, ...(celular ? estilo.slideCelular : estilo.slideEscritorio) } },
    imagenUrl
      ? h('img', { src: imagenUrl, alt: '', style: estilo.imagen })
      : h('div', { style: estilo.sinImagen }, 'Sin imagen: el slide queda sin fondo'),
    h('div', { style: estilo.velo }),
    h(
      'div',
      { style: { ...estilo.contenido, ...(celular ? estilo.contenidoCelular : estilo.contenidoEscritorio) } },
      h('h2', { style: { ...estilo.titulo, ...(celular ? estilo.tituloCelular : estilo.tituloEscritorio) } }, titulo),
      datos.texto && h('p', { style: { ...estilo.texto, ...(celular ? estilo.textoCelular : estilo.textoEscritorio) } }, datos.texto),
      h('span', { style: estilo.boton }, 'Conoce más →'),
    ),
  );
}

function crearVistaPrevia() {
  return createClass({
    render() {
      const { entry, getAsset } = this.props;
      const datos = leerDatos(entry);
      const imagenUrl = urlDe(getAsset, datos.imagen);
      const tipo = tipoEnlace(datos.enlace);
      const lista = avisos(datos);

      return h(
        'div',
        { style: estilo.contenedor },
        seccion(
          'Cómo se ve en el Inicio',
          h(
            'div',
            {},
            h('p', { style: estilo.pie }, 'Escritorio (aproximado)'),
            Slide({ datos, imagenUrl, celular: false }),
            h('p', { style: { ...estilo.pie, marginTop: '16px' } }, 'Celular (375 px)'),
            h('div', { style: { maxWidth: '100%', overflowX: 'auto' } }, Slide({ datos, imagenUrl, celular: true })),
            tipo && h('p', { style: estilo.enlace }, `Enlace ${tipo === 'interno' ? 'interno' : 'externo'}: ${datos.enlace}`),
          ),
        ),
        seccion('Vigencia', h('p', { style: estilo.estado }, estadoVigencia(datos))),
        lista.length > 0 && seccion('Antes de publicar', lista.map((aviso, i) => h('p', { key: i, style: estilo.aviso }, aviso))),
      );
    },
  });
}

// Sveltia ya cargó (el script va después de sveltia-cms.js en index.html). Sin el panel, no hace nada.
if (window.CMS && h && createClass) {
  CMS.registerPreviewTemplate('banners', crearVistaPrevia());
}
