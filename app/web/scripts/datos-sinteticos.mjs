// Genera contenido sintético para probar el sitio con volumen realista.
//   node scripts/datos-sinteticos.mjs            → genera (reemplaza lo sintético anterior)
//   node scripts/datos-sinteticos.mjs --limpiar  → solo borra lo sintético
// Todos los archivos llevan el prefijo "sint-" y no tocan el contenido de ejemplo ni el real.
// Semilla fija: nombres y textos se repiten; las fechas se calculan desde hoy (pasadas y futuras).
import { fakerES as es, faker as en } from '@faker-js/faker';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENIDO = new URL('../src/content/', import.meta.url).pathname;
const PREFIJO = 'sint-';
const AVISO = 'Contenido sintético generado por scripts/datos-sinteticos.mjs.';
const IMAGENES = ['demo-01.jpg', 'demo-02.jpg', 'demo-03.jpg', 'demo-04.jpg', 'demo-05.jpg', 'demo-06.jpg', 'demo-07.jpg', 'ejemplo-azul.png', 'ejemplo-verde.png', 'ejemplo-gris.png'];
// Fotos demo siempre presentes en publicaciones (noticias, actividades, banners) para que
// ninguna publicación quede sin imagen.
const DEMOS = ['demo-01.jpg', 'demo-02.jpg', 'demo-03.jpg', 'demo-04.jpg', 'demo-05.jpg', 'demo-06.jpg', 'demo-07.jpg'];
const COLECCIONES = ['areas', 'temas', 'organizaciones', 'personas', 'actividades', 'noticias', 'anuncios', 'documentos', 'banners'];

const CANTIDAD = { organizaciones: 15, personas: 70, actividades: 24, noticias: 40, anuncios: 18, documentos: 30, banners: 7 };

// ── utilidades ───────────────────────────────────────────────────────
function limpiar() {
  let n = 0;
  for (const c of COLECCIONES) {
    const dir = join(CONTENIDO, c);
    for (const f of safeReaddir(dir)) if (f.startsWith(PREFIJO)) { rmSync(join(dir, f)); n++; }
  }
  return n;
}
function safeReaddir(dir) { try { return readdirSync(dir); } catch { return []; } }

const slug = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const usados = new Set();
function idUnico(coleccion, texto) {
  let base = PREFIJO + slug(texto).slice(0, 60).replace(/-$/, ''), id = base, i = 2;
  while (usados.has(`${coleccion}/${id}`)) id = `${base}-${i++}`;
  usados.add(`${coleccion}/${id}`);
  return id;
}

// YAML mínimo: escalares entre comillas dobles (JSON es YAML válido), listas y objetos anidados.
function yaml(obj, sangria = '') {
  return Object.entries(obj).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)).map(([k, v]) => {
    if (Array.isArray(v)) {
      return `${sangria}${k}:\n` + v.map((x) => typeof x === 'object'
        ? `${sangria}  - ` + yaml(x, sangria + '    ').trimStart()
        : `${sangria}  - ${escalar(x)}\n`).join('');
    }
    if (typeof v === 'object' && !(v instanceof Date)) return `${sangria}${k}:\n` + yaml(v, sangria + '  ');
    return `${sangria}${k}: ${escalar(v)}\n`;
  }).join('');
}
function escalar(v) {
  if (typeof v === 'string' && v.startsWith('../../assets/')) return v; // rutas de imagen sin comillas, como Sveltia
  return typeof v === 'string' ? JSON.stringify(v) : String(v);
}
function escribir(coleccion, id, datos, cuerpo) {
  const archivo = join(CONTENIDO, coleccion, `${id}.${cuerpo === undefined ? 'yml' : 'md'}`);
  writeFileSync(archivo, cuerpo === undefined ? yaml(datos) : `---\n${yaml(datos)}---\n${cuerpo}\n`);
}

// Fechas: con hora → ISO con offset de Chile (se usa -03:00/-04:00 aproximado según el mes);
// solas → AAAA-MM-DD.
const offsetChile = (d) => (d.getUTCMonth() >= 3 && d.getUTCMonth() <= 8 ? '-04:00' : '-03:00');
function fechaHora(d, hora) {
  const f = d.toISOString().slice(0, 10);
  return `${f}T${String(hora).padStart(2, '0')}:00:00${offsetChile(d)}`;
}
const fechaSola = (d) => d.toISOString().slice(0, 10);
const alguno = (xs) => en.helpers.arrayElement(xs);
const algunos = (xs, min, max) => en.helpers.arrayElements(xs, { min, max });
const quizas = (p, v) => (en.datatype.boolean({ probability: p }) ? v : undefined);
const cuerpo = (parrafos) => `${en.lorem.paragraphs(parrafos, '\n\n')}\n\n_${AVISO}_`;

// ── generación ───────────────────────────────────────────────────────
function generar() {
  es.seed(2027); en.seed(2027);
  const hoy = new Date();
  const dias = (n) => new Date(hoy.getTime() + n * 86_400_000);

  // Áreas y Temas: se suman a los existentes (los de ejemplo se reutilizan por id).
  const areas = ['biomateriales', 'acuicultura', 'industria-alimentaria', 'salud', 'medio-ambiente'];
  for (const nombre of ['Bioprocesos', 'Genómica', 'Bioinformática', 'Biotecnología vegetal', 'Ingeniería de tejidos']) {
    const id = idUnico('areas', nombre); areas.push(id); escribir('areas', id, { nombre });
  }
  const temas = ['logros'];
  for (const nombre of ['Institucional', 'Vida estudiantil', 'Investigación', 'Egresados', 'Admisión', 'Vinculación con el medio']) {
    const id = idUnico('temas', nombre); temas.push(id); escribir('temas', id, { nombre });
  }

  // Organizaciones
  const tipos = ['empresa', 'institucion', 'laboratorio', 'agrupacion'];
  const organizaciones = ['laboratorio-de-biomateriales-udec', 'acuicola-del-sur-ejemplo', 'alimentos-bio-ejemplo', 'centro-de-estudiantes-bioingenieria'];
  for (let i = 0; i < CANTIDAD.organizaciones; i++) {
    const tipo = alguno(tipos);
    const nombre = tipo === 'laboratorio' ? `Laboratorio de ${alguno(['Bioprocesos', 'Genómica', 'Microbiología', 'Biología Marina', 'Bioquímica'])} ${es.location.city()}`
      : tipo === 'institucion' ? `${alguno(['Instituto', 'Centro', 'Fundación'])} ${es.person.lastName()} de ${alguno(['Investigación', 'Biotecnología', 'Ciencias'])}`
      : tipo === 'agrupacion' ? `${alguno(['Red', 'Asociación', 'Colectivo'])} de ${alguno(['Bioingenieros', 'Egresados', 'Estudiantes'])} ${es.location.city()}`
      : es.company.name();
    const id = idUnico('organizaciones', nombre);
    organizaciones.push(id);
    escribir('organizaciones', id, { nombre, tipo, sitio_web: quizas(0.6, `https://www.${slug(nombre).slice(0, 20)}.cl`), ficha_activa: true });
  }

  // Personas: la mayoría egresados; algunos sin autorizar, sin generación o con Ficha desactivada.
  const personas = [];
  const cargos = ['Investigador/a', 'Jefe/a de producción', 'Ingeniero/a de procesos', 'Gerente de calidad', 'Consultor/a', 'Académico/a', 'Analista de datos', 'Emprendedor/a', 'Encargado/a ambiental', 'Tesista de doctorado'];
  for (let i = 0; i < CANTIDAD.personas; i++) {
    const apellido = () => es.person.lastName().split(' ')[0];
    const nombre = `${es.person.firstName().split(' ')[0]} ${apellido()} ${apellido()}`;
    const id = idUnico('personas', nombre);
    personas.push(id);
    const egresado = en.datatype.boolean({ probability: 0.8 });
    const generacion = en.number.int({ min: 2005, max: 2019 });
    escribir('personas', id, {
      nombre,
      descripcion: egresado ? 'Bioingeniero/a UdeC' : alguno(['Académico/a FCB', 'Estudiante de Bioingeniería', 'Invitado/a externo/a']),
      ficha_activa: en.datatype.boolean({ probability: 0.92 }),
      perfil_egresado: egresado ? {
        autorizado: en.datatype.boolean({ probability: 0.85 }),
        generacion: quizas(0.85, generacion),
        anio_egreso: generacion + en.number.int({ min: 5, max: 7 }),
        areas: algunos(areas, 1, 2),
        organizacion: quizas(0.9, alguno(organizaciones)),
        cargo: quizas(0.9, alguno(cargos)),
        enlaces: quizas(0.5, [{ etiqueta: 'LinkedIn', url: `https://www.linkedin.com/in/${slug(nombre)}` }]),
      } : undefined,
    });
  }
  const personaUOrg = () => (en.datatype.boolean({ probability: 0.5 })
    ? { tipo: 'persona', persona: alguno(personas) }
    : { tipo: 'organizacion', organizacion: alguno(organizaciones) });

  // Actividades: pasadas y futuras, algunas de varios días.
  const actividades = [];
  const tiposActividad = ['seminario', 'charla', 'congreso', 'taller', 'estudiantes', 'egresados', 'academica', 'encuentro', 'otra'];
  for (let i = 0; i < CANTIDAD.actividades; i++) {
    const tipo = alguno(tiposActividad);
    const titulo = `${tipo[0].toUpperCase()}${tipo.slice(1)}: ${en.lorem.words({ min: 2, max: 5 })}`.replace(/^(\w+):/, (m) => ({ Estudiantes: 'Actividad de estudiantes:', Egresados: 'Actividad de egresados:', Academica: 'Actividad académica:', Otra: 'Actividad:' })[m.slice(0, -1)] ?? m);
    const id = idUnico('actividades', titulo);
    const inicio = dias(en.number.int({ min: -240, max: 180 }));
    const variosDias = tipo === 'congreso';
    actividades.push({ id, inicio });
    escribir('actividades', id, {
      titulo, publicado: en.datatype.boolean({ probability: 0.95 }), tipo,
      inicio: fechaHora(inicio, en.number.int({ min: 9, max: 19 })),
      fin: variosDias ? fechaHora(new Date(inicio.getTime() + 2 * 86_400_000), 18) : undefined,
      modalidad: alguno(['presencial', 'en-linea', 'hibrida']),
      lugar: quizas(0.8, alguno(['Auditorio FCB', 'Sala 201, FCB', 'Aula Magna UdeC', 'Casa del Deporte UdeC', 'Zoom'])),
      organizadores: Array.from({ length: en.number.int({ min: 1, max: 2 }) }, personaUOrg),
      expositores: algunos(personas, 0, 3),
      areas: algunos(areas, 1, 2),
      enlace_inscripcion: quizas(0.5, 'https://forms.gle/ejemplo'),
      imagen: `../../assets/media/${alguno(DEMOS)}`,
    }, cuerpo(2));
  }

  // Noticias: casi todas pasadas; un par futuras (no deben verse) y algunas como Cobertura.
  const pasadas = actividades.filter((a) => a.inicio < hoy);
  for (let i = 0; i < CANTIDAD.noticias; i++) {
    const titulo = en.lorem.sentence({ min: 5, max: 10 }).replace(/\.$/, '');
    const id = idUnico('noticias', titulo);
    const fecha = dias(i < 2 ? en.number.int({ min: 5, max: 60 }) : -en.number.int({ min: 1, max: 365 }));
    const cobertura = quizas(0.25, pasadas.length ? alguno(pasadas).id : undefined);
    escribir('noticias', id, {
      titulo, fecha: fechaSola(fecha), publicado: en.datatype.boolean({ probability: 0.95 }),
      imagen: `../../assets/media/${alguno(DEMOS)}`,
      bajada: quizas(0.8, en.lorem.sentence({ min: 10, max: 20 })),
      temas: algunos(temas, 1, 2), areas: algunos(areas, 0, 2),
      personas_mencionadas: algunos(personas, 0, 4),
      organizaciones_mencionadas: algunos(organizaciones, 0, 2),
      actividad: cobertura,
    }, cuerpo(en.number.int({ min: 3, max: 6 })));
  }

  // Anuncios: vigentes, vencidos y sin fecha límite.
  const tiposAnuncio = ['trabajo', 'practica', 'pasantia', 'proyecto', 'convocatoria', 'colaboracion', 'otra'];
  for (let i = 0; i < CANTIDAD.anuncios; i++) {
    const titulo = `${alguno(['Se busca', 'Convocatoria:', 'Oportunidad:', 'Práctica en', 'Proyecto'])} ${en.lorem.words({ min: 2, max: 5 })}`;
    const id = idUnico('anuncios', titulo);
    const fecha = dias(-en.number.int({ min: 0, max: 120 }));
    escribir('anuncios', id, {
      titulo, publicado: true, tipo: alguno(tiposAnuncio), oferente: personaUOrg(),
      areas: algunos(areas, 1, 2), fecha: fechaSola(fecha),
      fecha_limite: quizas(0.75, fechaSola(dias(en.number.int({ min: -30, max: 90 })))),
      contacto: es.internet.email({ provider: 'ejemplo.cl' }).toLowerCase(),
      enlace: quizas(0.4, 'https://www.ejemplo.cl/postular'),
    }, cuerpo(2));
  }

  // Documentos del Repositorio (aún sin página, pero listos para cuando exista).
  const tiposDoc = ['decreto', 'reglamento', 'ley', 'informe', 'publicacion', 'institucional', 'historico', 'academico', 'otro'];
  for (let i = 0; i < CANTIDAD.documentos; i++) {
    const tipo = alguno(tiposDoc);
    const titulo = `${tipo[0].toUpperCase()}${tipo.slice(1)} ${en.lorem.words({ min: 2, max: 4 })} ${en.number.int({ min: 1, max: 999 })}`;
    escribir('documentos', idUnico('documentos', titulo), {
      titulo, publicado: true, tipo, anio: en.number.int({ min: 1995, max: hoy.getFullYear() }),
      enlace: 'https://drive.google.com/', descripcion: quizas(0.7, en.lorem.sentence()),
      temas: algunos(temas, 0, 1), areas: algunos(areas, 0, 2), palabras_clave: en.lorem.words(3).split(' '),
    });
  }

  // Banners (slides del carrusel del Inicio): 5 vigentes para probar autoplay,
  // flechas y puntos; los últimos 2 prueban la visibilidad (uno futuro y uno vencido,
  // que no deben mostrarse). `estaVigente()` los filtra en el build.
  const banners = [];
  const plantillasBanner = [
    ['Admisión 2027', 'Postula a Bioingeniería UdeC', 'https://admision.udec.cl'],
    ['Semana de la Bioingeniería', 'Charlas, talleres y encuentros con egresados', '/agenda'],
    ['Novedades de la comunidad', 'Lo último en noticias', '/noticias'],
    ['Directorio de egresados', 'Busca y conéctate con la comunidad', '/directorio'],
    ['Repositorio de documentos', 'Reglamentos, informes y publicaciones', '/repositorio'],
    ['Convocatoria de anuncios', 'Trabajo, prácticas y proyectos', '/anuncios'],
    ['Conoce la carrera', '¿Qué es la Bioingeniería en la UdeC?', '/bioingenieria'],
  ];
  const imagenesBanner = DEMOS;
  plantillasBanner.forEach(([titulo, texto, enlace], i) => {
    const id = idUnico('banners', titulo);
    banners.push(id);
    const vigente = i < 5;
    const diasVigencia = vigente ? -en.number.int({ min: 2, max: 15 }) : i % 2 === 0 ? 20 : -90;
    const diasFin = vigente ? en.number.int({ min: 30, max: 150 }) : i % 2 === 0 ? 40 : -10;
    escribir('banners', id, {
      titulo, publicado: true, texto,
      imagen: `../../assets/media/${alguno(imagenesBanner)}`,
      enlace,
      inicio: fechaHora(dias(diasVigencia), 0),
      fin: fechaHora(dias(diasFin), 23),
    });
  });

  return {
    areas: areas.length, organizaciones: organizaciones.length, personas: CANTIDAD.personas,
    banners: banners.length,
    ...Object.fromEntries(['actividades', 'noticias', 'anuncios', 'documentos'].map((k) => [k, CANTIDAD[k]])),
  };
}

for (const c of COLECCIONES) mkdirSync(join(CONTENIDO, c), { recursive: true });
const borrados = limpiar();
if (process.argv.includes('--limpiar')) {
  console.log(`Borrados ${borrados} archivos sintéticos.`);
} else {
  console.log('Generado:', generar(), `(reemplazó ${borrados} archivos sintéticos anteriores)`);
}
