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
      bajada: z.string().optional(),
      temas: referencias('temas'),
      areas: referencias('areas'),
      personas_mencionadas: referencias('personas'),
      organizaciones_mencionadas: referencias('organizaciones'),
      actividad: reference('actividades').optional(), // Cobertura
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

// ── Páginas institucionales (colección de archivos únicos en config.yml) ──

const paginas = defineCollection({
  loader: md('paginas'),
  schema: z.object({
    titulo: z.string(),
    bajada: z.string(),
    video: z.url().optional(),
    caracteristicas: z.array(z.object({ titulo: z.string(), texto: z.string() })).optional(),
  }),
});

// ── Clasificación ─────────────────────────────────────────

const areas = defineCollection({ loader: yml('areas'), schema: z.object({ nombre: z.string() }) });
const temas = defineCollection({ loader: yml('temas'), schema: z.object({ nombre: z.string() }) });

export const collections = {
  personas, organizaciones, noticias, actividades, anuncios, documentos, banners, paginas, areas, temas,
};
