// Esquemas de contenido. Deben reflejar las colecciones de public/admin/config.yml
// (Sveltia CMS) y los términos de CONTEXT.md. Un cambio en uno va en ambos.
//
// Convenciones que vienen de config.yml:
// - output.omit_empty_optional_fields: true → los campos con required: false no existen en el archivo → .optional()
// - Las relaciones guardan el slug del archivo, que es el entry.id de Astro → reference()
// - Fechas con hora se guardan con offset de America/Santiago; fechas solas (type: date) como AAAA-MM-DD.
import { defineCollection, reference, type ImageFunction } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PATRON_INSTAGRAM, enlaceInstagram } from './lib/instagram';
import { enlaceDelSitio, urlWeb } from './lib/urls';
import { PATRON_TOKEN_CLOUDFLARE } from './lib/seo';

const yml = (coleccion: string) => glob({ base: `./src/content/${coleccion}`, pattern: '**/*.yml' });
const md = (coleccion: string) => glob({ base: `./src/content/${coleccion}`, pattern: '**/*.md' });

// Genérico para que cada campo conserve a qué colección apunta (con una unión de
// nombres, getEntries() devolvería entradas de cualquiera de las colecciones).
const referencias = <C extends 'personas' | 'organizaciones' | 'areas' | 'temas'>(coleccion: C) =>
  z.array(reference(coleccion)).optional();

const publicado = z.boolean().default(false);

// Bloque «SEO (opcional)» de Noticias, Actividades, Anuncios, Documentos y Páginas libres (ADR 0010). Todo opcional;
// los máximos son la red de seguridad de los del panel (maxlength). La imagen usa image() como los demás campos.
const seoEntrada = (image: ImageFunction) =>
  z.object({
    titulo: z.string().max(60).optional(),
    descripcion: z.string().max(160).optional(),
    imagen: image().optional(),
    noindex: z.boolean().optional(),
  }).optional();

// "Persona u Organización": objeto de tipo variable con typeKey: tipo
const personaUOrganizacion = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('persona'), persona: reference('personas') }),
  z.object({ tipo: z.literal('organizacion'), organizacion: reference('organizaciones') }),
]);

// ── Comunidad ─────────────────────────────────────────────

const personas = defineCollection({
  loader: yml('personas'),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      descripcion: z.string().optional(),
      foto: image().optional(),
      ficha_activa: z.boolean().default(true),
      perfil_egresado: z
        .object({
          autorizado: z.boolean().default(false),
          generacion: z.number().int().optional(),
          anio_egreso: z.number().int(),
          areas: referencias('areas'),
          organizacion: reference('organizaciones').optional(),
          cargo: z.string().optional(),
          enlaces: z.array(z.object({ etiqueta: z.string(), url: urlWeb })).optional(),
        })
        .optional(),
      seo: seoEntrada(image),
    }),
});

const organizaciones = defineCollection({
  loader: yml('organizaciones'),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      tipo: z.enum(['empresa', 'institucion', 'laboratorio', 'agrupacion']),
      sitio_web: urlWeb.optional(),
      logo: image().optional(),
      ficha_activa: z.boolean().default(true),
    }),
});

// ── Contenidos ────────────────────────────────────────────

// Contenido incrustado (Spotify, SoundCloud, mapas…): URLs públicas que convierte src/lib/incrustados.ts.
// Solo https: la tarjeta-enlace va directo al href.
const incrustados = z.array(z.object({ url: z.url().startsWith('https://'), titulo: z.string().optional() })).max(10).optional();

// Enlaces: botones bajo el título (inscripción, transmisión, más información). Etiqueta libre; mismo criterio https.
// La URL es completa (https) o una ruta interna del sitio (/agenda, /p/mi-pagina); nunca `//host` ni `javascript:`.
const urlEnlace = z.union([z.url().startsWith('https://'), z.string().regex(/^\/(?!\/)\S*$/)]);
const enlaces = z.array(z.object({ etiqueta: z.string().min(1).max(40), url: urlEnlace })).max(6).optional();

const noticias = defineCollection({
  loader: md('noticias'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      fecha: z.coerce.date(),
      publicado,
      imagen: image().optional(),
      imagen_alt: z.string().optional(), // describe la imagen destacada; sin él, la imagen se trata como decorativa
      video: urlWeb.optional(), // enlace de YouTube; si no es de un video reconocido, la página no lo muestra
      enlaces,
      galeria: z.array(z.object({ imagen: image(), alt: z.string() })).max(12).optional(),
      incrustados,
      bajada: z.string().optional(),
      etiquetas: z.array(z.string()).optional(), // tags de texto libre; la categoría editorial sigue siendo `temas`
      temas: referencias('temas'),
      areas: referencias('areas'),
      personas_mencionadas: referencias('personas'),
      organizaciones_mencionadas: referencias('organizaciones'),
      actividad: reference('actividades').optional(), // Cobertura
      instagram: reference('instagram').optional(),
      seo: seoEntrada(image),
    }),
});

const actividades = defineCollection({
  loader: md('actividades'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      publicado,
      tipo: z.enum([
        'seminario', 'charla', 'congreso', 'taller', 'estudiantes',
        'egresados', 'academica', 'encuentro', 'otra',
      ]),
      inicio: z.coerce.date(),
      fin: z.coerce.date().optional(),
      modalidad: z.enum(['presencial', 'en-linea', 'hibrida']),
      lugar: z.string().optional(),
      organizadores: z.array(personaUOrganizacion).nonempty(),
      expositores: referencias('personas'),
      areas: referencias('areas'),
      enlace_inscripcion: urlWeb.optional(), // botón principal
      enlaces,
      imagen: image().optional(),
      incrustados,
      seo: seoEntrada(image),
    }),
});

const anuncios = defineCollection({
  loader: md('anuncios'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      publicado,
      tipo: z.enum(['trabajo', 'practica', 'pasantia', 'proyecto', 'convocatoria', 'colaboracion', 'otra']),
      oferente: personaUOrganizacion,
      areas: referencias('areas'),
      fecha: z.coerce.date(),
      fecha_limite: z.coerce.date().optional(),
      contacto: z.string(),
      enlace: urlWeb.optional(),
      seo: seoEntrada(image),
    }),
});

const documentos = defineCollection({
  loader: yml('documentos'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      publicado,
      tipo: z.enum([
        'decreto', 'reglamento', 'ley', 'informe', 'publicacion',
        'institucional', 'historico', 'academico', 'otro',
      ]),
      anio: z.number().int(),
      enlace: urlWeb,
      descripcion: z.string().optional(),
      temas: referencias('temas'),
      areas: referencias('areas'),
      palabras_clave: z.array(z.string()).optional(),
      seo: seoEntrada(image),
    }),
});

const banners = defineCollection({
  loader: yml('banners'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      publicado,
      texto: z.string().optional(),
      imagen: image(),
      enlace: enlaceDelSitio, // ruta interna o https: nunca javascript: (src/lib/urls.ts)
      inicio: z.coerce.date(),
      fin: z.coerce.date(),
    }),
});

// Páginas libres: se crean desde el panel (una por archivo). Se publican en /p/<slug> y `mostrar_en`
// decide si aparecen en el menú o en el pie (ver src/lib/navegacion.ts).
const paginasLibres = defineCollection({
  loader: md('paginas-libres'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      publicado,
      bajada: z.string(),
      imagen: image().optional(),
      imagen_alt: z.string().optional(),
      mostrar_en: z.enum(['ninguno', 'footer', 'la-carrera', 'comunidad']).default('ninguno'),
      destacar_inicio: z.boolean().default(false), // solo una a la vez (src/lib/pagina-destacada.ts)
      resumen_inicio: z.string().optional(), // resumen del bloque del Inicio; sin él, se usa la bajada
      video: urlWeb.optional(), // se abre en una ventana (VideoModal); si no es de YouTube, no se muestra
      enlaces,
      bloques_titulo: z.string().optional(),
      bloques: z.array(z.object({ titulo: z.string(), texto: z.string() })).optional(),
      incrustados,
      seo: seoEntrada(image),
    }),
});

// Secciones destacadas del Inicio (archivo único; el orden de la lista es el orden en la página).
const inicio = defineCollection({
  loader: md('inicio'),
  schema: ({ image }) => {
    // Tarjeta de la banda «Comunidad y documentos»: los valores por defecto son los del primer arranque.
    const comunidad = {
      titulo: 'Comunidad y documentos',
      directorio: {
        titulo: 'Directorio de bioingenieros/as',
        texto: 'Encuentra egresados/as por generación, área y organización.',
        boton: 'Ir al Directorio',
      },
      repositorio: {
        titulo: 'Repositorio de documentos',
        texto: 'Decretos, reglamentos, informes y publicaciones de la carrera, en un solo lugar.',
        boton: 'Ir al Repositorio',
      },
    };
    const tarjeta = (valores: { titulo: string; texto: string; boton: string }) =>
      z
        .object({
          titulo: z.string().default(valores.titulo),
          texto: z.string().default(valores.texto),
          boton: z.string().default(valores.boton),
          imagen: image().optional(),
          imagen_alt: z.string().optional(),
        })
        .default(valores);

    return z.object({
      secciones: z.array(
        z.object({
          titulo: z.string(),
          texto: z.string(),
          boton: z.string(),
          // Ruta interna (/directorio) o URL externa https://
          enlace: z.string().regex(/^(\/(?!\/)|https:\/\/)/),
          imagen: image(),
          imagen_alt: z.string().optional(),
          publicado: z.boolean().default(true),
        }),
      ).optional(),
      // Banda «Comunidad y documentos» del Inicio: una tarjeta para el Directorio y otra para el Repositorio.
      comunidad: z
        .object({
          titulo: z.string().default(comunidad.titulo),
          directorio: tarjeta(comunidad.directorio),
          repositorio: tarjeta(comunidad.repositorio),
        })
        .default(comunidad),
    });
  },
});

// Secciones fijas: un interruptor por sección. Noticias y Agenda solo salen del menú; las demás, si se desactivan,
// dejan de publicarse (ADR 0008). Una clave ausente cuenta como visible.
const menu = defineCollection({
  loader: yml('menu'),
  schema: ({ image }) => z.object({
    noticias: z.boolean().default(true),
    agenda: z.boolean().default(true),
    instagram: z.boolean().default(true),
    directorio: z.boolean().default(true),
    anuncios: z.boolean().default(true),
    repositorio: z.boolean().default(true),
    // Google Form para sumarse al Directorio. Vacío o ausente = sin botón.
    formulario_directorio: z
      .string()
      .refine((url) => url === '' || /^https:\/\/\S+$/.test(url), 'Debe ser una dirección completa que empiece con https://')
      .optional(),
    // Bloque «¿Eres egresado/a?» de /directorio: ícono (lista en src/lib/iconos.ts; uno desconocido no se muestra) e
    // imagen de cabecera con su texto alternativo. Todo opcional.
    sumarse_icono: z.string().optional(),
    sumarse_imagen: image().optional(),
    sumarse_imagen_alt: z.string().optional(),
  }),
});

// Encabezados de los listados (ADR 0011): imagen de cabecera (con texto alternativo) e ícono, opcionales por listado.
// Sin valores, cada página se ve como antes. El Inicio no tiene encabezado: ya tiene el carrusel.
const encabezados = defineCollection({
  loader: yml('encabezados'),
  schema: ({ image }) => {
    const encabezado = z.object({
      imagen: image().optional(),
      imagen_alt: z.string().optional(),
      icono: z.string().optional(), // nombre de la lista src/lib/iconos.ts; uno desconocido no muestra ícono
    }).optional();
    return z.object({
      noticias: encabezado,
      agenda: encabezado,
      anuncios: encabezado,
      repositorio: encabezado,
      directorio: encabezado,
      instagram: encabezado,
    });
  },
});

// Redes sociales: una URL opcional por red (pie, botón de /instagram y sameAs). Una clave ausente = sin red.
const urlRed = z.string().regex(/^https:\/\/\S+$/, 'Debe ser una dirección completa que empiece con https://');
const redes = defineCollection({
  loader: yml('redes'),
  schema: z.object({
    instagram: urlRed.optional(),
    facebook: urlRed.optional(),
    x: urlRed.optional(),
    linkedin: urlRed.optional(),
    youtube: urlRed.optional(),
    tiktok: urlRed.optional(),
    threads: urlRed.optional(),
    bluesky: urlRed.optional(),
    mastodon: urlRed.optional(),
  }),
});

// SEO del sitio: descripción general, imagen por defecto para redes, descripción de cada listado y códigos de
// verificación de buscadores y analítica. Todo opcional: sin archivo o sin clave, el sitio usa su valor por defecto (src/lib/seo.ts).
const seoSitio = defineCollection({
  loader: yml('seo'),
  schema: ({ image }) => {
    const listado = z.object({ descripcion: z.string().max(160).optional(), imagen: image().optional() }).optional();
    return z.object({
      descripcion: z.string().max(160).optional(),
      imagen: image().optional(),
      // Un objeto por listado: su descripción y su imagen para redes (og:image). Ambos opcionales.
      listados: z.object({
        inicio: listado,
        noticias: listado,
        agenda: listado,
        anuncios: listado,
        repositorio: listado,
        directorio: listado,
        instagram: listado,
      }).optional(),
      verificacion: z.object({
        google: z.string().regex(/^[A-Za-z0-9_-]+$/, 'Solo el código, sin etiqueta <meta> ni comillas.').optional(),
        bing: z.string().regex(/^[A-Za-z0-9_-]+$/, 'Solo el código, sin etiqueta <meta> ni comillas.').optional(),
      }).optional(),
      // Analítica sin cookies (ADR 0012). Vacío = sin analítica; el panel puede dejar la clave en "".
      analitica: z.object({
        cloudflare_token: z.union([z.literal(''), z.string().regex(PATRON_TOKEN_CLOUDFLARE, 'Solo el token, sin comillas ni código.')]).optional(),
      }).optional(),
    });
  },
});

const instagram = defineCollection({
  loader: yml('instagram'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      enlace: z.string().regex(new RegExp(PATRON_INSTAGRAM)).transform((u) => enlaceInstagram(u)!),
      fecha: z.coerce.date(),
      publicado,
      imagen: image().optional(),
    }),
});

// ── Clasificación ─────────────────────────────────────────

const areas = defineCollection({ loader: yml('areas'), schema: z.object({ nombre: z.string() }) });
const temas = defineCollection({ loader: yml('temas'), schema: z.object({ nombre: z.string() }) });

export const collections = {
  personas, organizaciones, noticias, actividades, anuncios, documentos, banners, paginasLibres, inicio, menu, redes, seo: seoSitio, encabezados, instagram, areas, temas,
};
