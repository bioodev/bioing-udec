// Esquemas de contenido. Deben reflejar las colecciones de public/admin/config.yml
// (Sveltia CMS) y los términos de CONTEXT.md. Un cambio en uno va en ambos.
//
// Convenciones que vienen de config.yml:
// - output.omit_empty_optional_fields: true → los campos con required: false no existen en el archivo → .optional()
// - Las relaciones guardan el slug del archivo, que es el entry.id de Astro → reference()
// - Fechas con hora se guardan con offset de America/Santiago; fechas solas (type: date) como AAAA-MM-DD.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PATRON_INSTAGRAM, enlaceInstagram } from './lib/instagram';

const yml = (coleccion: string) => glob({ base: `./src/content/${coleccion}`, pattern: '**/*.yml' });
const md = (coleccion: string) => glob({ base: `./src/content/${coleccion}`, pattern: '**/*.md' });

// Genérico para que cada campo conserve a qué colección apunta (con una unión de
// nombres, getEntries() devolvería entradas de cualquiera de las colecciones).
const referencias = <C extends 'personas' | 'organizaciones' | 'areas' | 'temas'>(coleccion: C) =>
  z.array(reference(coleccion)).optional();

const publicado = z.boolean().default(false);

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
          enlaces: z.array(z.object({ etiqueta: z.string(), url: z.url() })).optional(),
        })
        .optional(),
    }),
});

const organizaciones = defineCollection({
  loader: yml('organizaciones'),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      tipo: z.enum(['empresa', 'institucion', 'laboratorio', 'agrupacion']),
      sitio_web: z.url().optional(),
      logo: image().optional(),
      ficha_activa: z.boolean().default(true),
    }),
});

// ── Contenidos ────────────────────────────────────────────

const noticias = defineCollection({
  loader: md('noticias'),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      fecha: z.coerce.date(),
      publicado,
      imagen: image().optional(),
      imagen_alt: z.string().optional(), // describe la imagen destacada; sin él, la imagen se trata como decorativa
      video: z.url().optional(), // enlace de YouTube; si no es de un video reconocido, la página no lo muestra
      galeria: z.array(z.object({ imagen: image(), alt: z.string() })).max(12).optional(),
      bajada: z.string().optional(),
      etiquetas: z.array(z.string()).optional(), // tags de texto libre; la categoría editorial sigue siendo `temas`
      temas: referencias('temas'),
      areas: referencias('areas'),
      personas_mencionadas: referencias('personas'),
      organizaciones_mencionadas: referencias('organizaciones'),
      actividad: reference('actividades').optional(), // Cobertura
      instagram: reference('instagram').optional(),
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
      enlace_inscripcion: z.url().optional(),
      imagen: image().optional(),
    }),
});

const anuncios = defineCollection({
  loader: md('anuncios'),
  schema: z.object({
    titulo: z.string(),
    publicado,
    tipo: z.enum(['trabajo', 'practica', 'pasantia', 'proyecto', 'convocatoria', 'colaboracion', 'otra']),
    oferente: personaUOrganizacion,
    areas: referencias('areas'),
    fecha: z.coerce.date(),
    fecha_limite: z.coerce.date().optional(),
    contacto: z.string(),
    enlace: z.url().optional(),
  }),
});

const documentos = defineCollection({
  loader: yml('documentos'),
  schema: z.object({
    titulo: z.string(),
    publicado,
    tipo: z.enum([
      'decreto', 'reglamento', 'ley', 'informe', 'publicacion',
      'institucional', 'historico', 'academico', 'otro',
    ]),
    anio: z.number().int(),
    enlace: z.url(),
    descripcion: z.string().optional(),
    temas: referencias('temas'),
    areas: referencias('areas'),
    palabras_clave: z.array(z.string()).optional(),
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
      enlace: z.string(),
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
      video: z.url().optional(), // se abre en una ventana (VideoModal); si no es de YouTube, no se muestra
      bloques_titulo: z.string().optional(),
      bloques: z.array(z.object({ titulo: z.string(), texto: z.string() })).optional(),
    }),
});

// Secciones destacadas del Inicio (archivo único; el orden de la lista es el orden en la página).
const inicio = defineCollection({
  loader: md('inicio'),
  schema: ({ image }) =>
    z.object({
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
    }),
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
  personas, organizaciones, noticias, actividades, anuncios, documentos, banners, paginasLibres, inicio, instagram, areas, temas,
};
