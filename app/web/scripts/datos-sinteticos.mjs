// Genera contenido sintético para probar el sitio con volumen realista.
//   node scripts/datos-sinteticos.mjs            → genera (reemplaza lo sintético anterior)
//   node scripts/datos-sinteticos.mjs --limpiar  → solo borra lo sintético
// Todos los archivos llevan el prefijo "sint-" y no tocan el contenido de ejemplo ni el real.
// Semilla fija: nombres y textos se repiten; las fechas se calculan desde hoy (pasadas y futuras).
import { fakerES as es, faker as en } from '@faker-js/faker';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENIDO = new URL('../src/content/', import.meta.url).pathname;
const MEDIOS = new URL('../src/assets/media/', import.meta.url).pathname;
const PREFIJO = 'sint-';
const AVISO = 'Contenido sintético generado por scripts/datos-sinteticos.mjs.';
const COLECCIONES = ['areas', 'temas', 'organizaciones', 'personas', 'actividades', 'noticias', 'anuncios', 'documentos', 'banners', 'instagram', 'paginas-libres'];

const CANTIDAD = { organizaciones: 15, personas: 70, actividades: 24, noticias: 40, anuncios: 18, documentos: 30, banners: 8, instagram: 7 };

// Fotos demo (src/assets/media). El texto alternativo describe lo que se ve en cada una.
const DEMOS = ['demo-01.jpg', 'demo-02.jpg', 'demo-03.jpg', 'demo-04.jpg', 'demo-05.jpg', 'demo-06.jpg', 'demo-07.jpg'];
const DEMO_ALT = {
  'demo-01.jpg': 'Cultivo en placa de Petri con colonias de colores intensos',
  'demo-02.jpg': 'Bacterias en forma de bastón teñidas de color magenta',
  'demo-03.jpg': 'Manos con guantes sosteniendo una placa de Petri en un laboratorio',
  'demo-04.jpg': 'Profesional con guantes preparando una jeringa desde un vial',
  'demo-05.jpg': 'Planta joven de albahaca sostenida entre dos manos sobre tierra',
  'demo-06.jpg': 'Pipeta depositando muestras en tubos de microcentrífuga de colores',
  'demo-07.jpg': 'Núcleos celulares teñidos con fluorescencia en microscopía confocal',
};

// Pools curados en español (bioingeniería: acuicultura, biomateriales, alimentos, salud, medio ambiente, bioprocesos).
const VIDEOS = ['https://www.youtube.com/watch?v=yLxPo7uBv-Q', 'https://www.youtube.com/watch?v=SyYaQjP3MoU', 'https://youtu.be/mO-W-WL7Alk'];
const EMOJIS = ['🧬', '🔬', '🌊', '🧪'];
// Contenido incrustado: un enlace por servicio (Spotify episodio, SoundCloud, Maps, Facebook y TikTok, que sale como tarjeta).
const INCRUSTADOS = {
  spotify: { url: 'https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk?si=ejemplo', titulo: 'Episodio: biomateriales en la práctica' },
  soundcloud: { url: 'https://soundcloud.com/bioingenieria-udec/grabacion-charla', titulo: 'Grabación de la charla' },
  maps: { url: 'https://www.google.com/maps?q=Universidad+de+Concepci%C3%B3n', titulo: 'Universidad de Concepción' },
  facebook: { url: 'https://www.facebook.com/bioingenieria.udec/posts/pfbid0ejemplo' },
  tiktok: { url: 'https://www.tiktok.com/@bioingenieria.udec/video/7300000000000000000', titulo: 'Video en TikTok' },
};
const ETIQUETAS = ['biomateriales', 'acuicultura', 'bioprocesos', 'salud pública', 'medio ambiente', 'industria alimentaria', 'innovación', 'egresados', 'investigación', 'vinculación'];
// En singular: los verbos de VERBOS_NOTICIA van en tercera persona singular.
const SUJETOS_NOTICIA = ['Un grupo de estudiantes de Bioingeniería', 'El laboratorio de biomateriales', 'Una egresada de la carrera', 'Un equipo de la FCB', 'Un equipo de investigación de la UdeC', 'La carrera de Bioingeniería'];
const VERBOS_NOTICIA = ['presentó', 'consolidó', 'publicó', 'obtuvo', 'celebró', 'lanzó'];
const OBJETOS_NOTICIA = ['avances en hidrogeles para heridas', 'un estudio sobre cultivos de salmónidos', 'un proyecto de envases biodegradables', 'resultados sobre fermentación industrial', 'una nueva línea de biosensores', 'un programa de tutorías para primer año', 'una jornada de vinculación con la industria alimentaria', 'su primera patente en bioprocesos'];
const CIERRES_NOTICIA = ['', ' en la Región del Biobío', ' con fondos concursables', ' durante 2026'];
const BAJADAS = [
  'Los resultados abren nuevas líneas de trabajo para la comunidad de la carrera.',
  'La iniciativa reúne a estudiantes, académicos y egresados en torno a un mismo desafío.',
  'Un avance que combina laboratorio, terreno y colaboración con la industria.',
  'La carrera sigue ampliando su vínculo con el sector productivo de la región.',
  'Una experiencia que deja aprendizajes para próximas generaciones de bioingenieros.',
  'Conoce el detalle de la actividad y cómo participar de las próximas instancias.',
  'El trabajo se desarrolla con financiamiento de programas concursables y apoyo institucional.',
  'Una mirada a los resultados preliminares y a los desafíos que vienen.',
];
const SUBTITULOS = ['Contexto', 'Qué se hizo', 'Resultados', 'Próximos pasos', 'Participantes', 'Aprendizajes', 'Metodología', 'Impacto para la comunidad'];
const PARRAFOS = [
  'El trabajo parte de una pregunta concreta sobre el comportamiento de los materiales en contacto con tejidos vivos. Durante varios meses, el equipo comparó distintas formulaciones en condiciones controladas.',
  'Las jornadas combinaron sesiones de laboratorio con visitas a plantas de proceso, lo que permitió contrastar los resultados con las condiciones reales de producción.',
  'Quienes participaron destacan que el enfoque práctico fue clave para entender cómo se traducen los parámetros de laboratorio a escala industrial.',
  'El proyecto se apoya en el trabajo de estudiantes de distintos años de la carrera, que aportaron análisis de datos, revisión bibliográfica y diseño experimental.',
  'Los datos recogidos en terreno muestran una variación estacional que obliga a repetir las mediciones antes de sacar conclusiones definitivas.',
  'La formación de nuevos bioingenieros requiere espacios como este, donde la teoría se contrasta con problemas que tienen un impacto concreto en el entorno.',
  'El equipo trabajó con protocolos de bioseguridad y registros de trazabilidad, siguiendo las pautas de los comités de ética y seguridad de la Facultad.',
  'Los resultados preliminares serán presentados en una próxima instancia abierta a la comunidad, con espacio para preguntas y propuestas de colaboración.',
  'La producción de biomasa a pequeña escala permitió evaluar costos, rendimientos y consumo energético antes de proyectar una etapa piloto.',
  'Para los egresados que se incorporan a la industria, experiencias de este tipo facilitan la transición entre la formación universitaria y el trabajo profesional.',
];
const ITEMS = ['Ensayos reproducibles en tres laboratorios', 'Participación de estudiantes de primer a quinto año', 'Datos abiertos para la comunidad académica', 'Acuerdos de colaboración con empresas de la región', 'Protocolos de bioseguridad actualizados', 'Material de difusión en formato accesible', 'Evaluación de costos y rendimientos', 'Seguimiento de egresados en su primer empleo'];
const SITIOS = ['sitio de la Universidad de Concepción', 'portal institucional de la UdeC'];
const CITAS = [
  'La investigación aplicada es la mejor forma de formar bioingenieros capaces de resolver problemas reales.',
  'Cada dato recogido en terreno nos recuerda por qué vale la pena medir con cuidado.',
  'Trabajar junto a la industria cambia la pregunta, y eso enriquece la ciencia.',
  'Una buena comunidad académica se construye con espacios de encuentro como este.',
];
const INDICADORES = ['Muestras analizadas', 'Estudiantes participantes', 'Ensayos completados', 'Empresas vinculadas', 'Horas de laboratorio', 'Publicaciones en preparación'];
const ASUNTOS_DOC = ['sobre bioseguridad en laboratorios', 'del programa de tutorías', 'de cultivos acuícolas sostenibles', 'de gestión de residuos biológicos', 'de prácticas profesionales', 'sobre propiedad intelectual', 'del plan de estudios de Bioingeniería', 'de calidad alimentaria', 'de biotecnología industrial'];
const TIPO_DOC = { decreto: 'Decreto', reglamento: 'Reglamento', ley: 'Ley', informe: 'Informe', publicacion: 'Publicación', institucional: 'Documento institucional', historico: 'Registro histórico', academico: 'Documento académico', otro: 'Documento' };
const DESCRIPCIONES_DOC = ['Versión vigente con sus modificaciones consolidadas.', 'Resumen de resultados y recomendaciones para la comunidad.', 'Texto oficial disponible para consulta pública.', 'Documento de referencia para estudiantes y académicos.', 'Informe anual con indicadores de gestión y ejecución.', 'Registro de acuerdos y decisiones adoptadas en la instancia.'];
const PALABRAS_CLAVE = ['bioingeniería', 'bioseguridad', 'acuicultura', 'biomateriales', 'reglamento', 'egresados', 'investigación', 'industria alimentaria', 'bioprocesos', 'medio ambiente'];
const TEMAS_ACTIVIDAD = ['biomateriales para la regeneración de tejidos', 'cultivo sostenible de salmónidos', 'fermentaciones industriales y escalamiento', 'bioinformática aplicada a la salud', 'tratamiento biológico de efluentes', 'inocuidad en la industria alimentaria', 'biosensores para diagnóstico rápido', 'ética en la investigación biomédica', 'inserción laboral de bioingenieros', 'energías renovables de origen biológico', 'mejoramiento genético de cultivos', 'envases biodegradables a partir de residuos'];
const ETIQUETA_ACTIVIDAD = { seminario: 'Seminario', charla: 'Charla', congreso: 'Congreso', taller: 'Taller', estudiantes: 'Actividad de estudiantes', egresados: 'Encuentro de egresados', academica: 'Actividad académica', encuentro: 'Encuentro', otra: 'Actividad' };
const PREFIJO_ANUNCIO = ['Se busca', 'Convocatoria:', 'Oportunidad:', 'Se necesita', 'Proyecto:'];
const OFERTAS = ['analista de datos biomédicos', 'técnico de laboratorio de microbiología', 'práctica en control de calidad alimentaria', 'ayudante de investigación en biomateriales', 'pasantía en planta de bioprocesos', 'proyecto de monitoreo ambiental en humedales', 'asistente de cultivos en acuicultura', 'colaboración en estudio de biosensores'];
const IG_TITULOS = ['Resumen de la semana en Bioingeniería', 'Cosecha de datos en el laboratorio', 'Un día en la planta piloto', 'Egresados que inspiran', 'Preparando la jornada de vinculación', 'Así se cultivan las microalgas', 'Premiación a estudiantes destacados'];
const PALETA = ['#1f4e79', '#2e6b5e', '#5b4a7a', '#7a4e2d', '#3d5a6c', '#4a6b3a', '#6b3d4e', '#37474f'];

// ── utilidades ───────────────────────────────────────────────────────
function limpiar() {
  let n = 0;
  for (const c of COLECCIONES) {
    const dir = join(CONTENIDO, c);
    for (const f of safeReaddir(dir)) if (f.startsWith(PREFIJO)) { rmSync(join(dir, f)); n++; }
  }
  for (const f of safeReaddir(MEDIOS)) if (f.startsWith(PREFIJO)) { rmSync(join(MEDIOS, f)); n++; }
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

// Cuerpo Markdown: subtítulos, párrafos, lista, enlace externo, cita y, opcionalmente, imagen, emoji y tabla.
// Las imágenes van con el alias @/assets/media (lo que inserta el editor del panel).
function cuerpo({ secciones = 2, imagen, emoji = en.datatype.boolean({ probability: 0.4 }), tabla = en.datatype.boolean({ probability: 0.25 }) } = {}) {
  const partes = [];
  for (let i = 0; i < secciones; i++) {
    const emojiTitulo = i === 0 && emoji ? ` ${alguno(EMOJIS)}` : '';
    partes.push(`## ${alguno(SUBTITULOS)}${emojiTitulo}`);
    const parrafo = alguno(PARRAFOS);
    partes.push(i === 0 ? `${parrafo} Más información en el [${alguno(SITIOS)}](https://www.udec.cl).` : parrafo);
    if (i === 0) partes.push(algunos(ITEMS, 3, 4).map((x) => `- ${x}`).join('\n'));
    if (i === 1) {
      if (imagen) partes.push(`![${DEMO_ALT[imagen]}](@/assets/media/${imagen})`);
      partes.push(`> ${alguno(CITAS)}`);
    }
  }
  if (tabla) {
    const filas = algunos(INDICADORES, 2, 3).map((x) => `| ${x} | ${en.number.int({ min: 1, max: 500 })} |`);
    partes.push(['| Indicador | Valor |', '| --- | --- |', ...filas].join('\n'));
  }
  partes.push(`_${AVISO}_`);
  return partes.join('\n\n');
}

// Medios SVG: iniciales sobre un color sobrio. Se escapan por si el texto trae caracteres especiales.
const escapar = (t) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const iniciales = (t) => t.split(/\s+/).filter((w) => /^\p{Lu}/u.test(w)).slice(0, 2).map((w) => w[0]).join('') || 'S';
function svg(texto, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<rect width="256" height="256" fill="${color}"/>
<text x="128" y="128" dy="0.35em" text-anchor="middle" font-family="sans-serif" font-size="96" font-weight="bold" fill="#ffffff">${escapar(texto)}</text>
</svg>
`;
}

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

  // Organizaciones (logo SVG en ~70 %)
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
    const conLogo = en.datatype.boolean({ probability: 0.7 });
    if (conLogo) writeFileSync(join(MEDIOS, `${PREFIJO}logo-${id.slice(PREFIJO.length)}.svg`), svg(iniciales(nombre), alguno(PALETA)));
    escribir('organizaciones', id, {
      nombre, tipo, sitio_web: quizas(0.6, `https://www.${slug(nombre).slice(0, 20)}.cl`),
      logo: conLogo ? `@/assets/media/${PREFIJO}logo-${id.slice(PREFIJO.length)}.svg` : undefined,
      ficha_activa: true,
    });
  }

  // Personas: la mayoría egresados; algunos sin autorizar, sin generación o con Ficha desactivada.
  // Foto SVG en ~70 %.
  const personas = [];
  const cargos = ['Investigador/a', 'Jefe/a de producción', 'Ingeniero/a de procesos', 'Gerente de calidad', 'Consultor/a', 'Académico/a', 'Analista de datos', 'Emprendedor/a', 'Encargado/a ambiental', 'Tesista de doctorado'];
  for (let i = 0; i < CANTIDAD.personas; i++) {
    const apellido = () => es.person.lastName().split(' ')[0];
    const nombre = `${es.person.firstName().split(' ')[0]} ${apellido()} ${apellido()}`;
    const id = idUnico('personas', nombre);
    personas.push(id);
    const conFoto = en.datatype.boolean({ probability: 0.7 });
    if (conFoto) writeFileSync(join(MEDIOS, `${PREFIJO}foto-${id.slice(PREFIJO.length)}.svg`), svg(iniciales(nombre), alguno(PALETA)));
    const egresado = en.datatype.boolean({ probability: 0.8 });
    const generacion = en.number.int({ min: 2005, max: 2019 });
    escribir('personas', id, {
      nombre,
      descripcion: egresado ? 'Bioingeniero/a UdeC' : alguno(['Académico/a FCB', 'Estudiante de Bioingeniería', 'Invitado/a externo/a']),
      foto: conFoto ? `@/assets/media/${PREFIJO}foto-${id.slice(PREFIJO.length)}.svg` : undefined,
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

  // Publicaciones de Instagram (6–8 según CANTIDAD): enlaces con la forma de una publicación real.
  const instagramIds = [];
  for (let i = 0; i < CANTIDAD.instagram; i++) {
    const id = `${PREFIJO}publicacion-${i + 1}`;
    instagramIds.push(id);
    const demo = alguno(DEMOS);
    const conImagen = en.datatype.boolean({ probability: 0.5 });
    escribir('instagram', id, {
      titulo: IG_TITULOS[i % IG_TITULOS.length],
      // La primera es una publicación real (para ver el embed funcionando); el resto, códigos inventados.
      enlace: i === 0 ? 'https://www.instagram.com/p/DeWtz6WDfGR/' : `https://www.instagram.com/p/${en.string.alphanumeric({ length: 11 })}/`,
      fecha: fechaSola(dias(-en.number.int({ min: 2, max: 200 }))),
      publicado: true,
      imagen: conImagen ? `@/assets/media/${demo}` : undefined,
    });
  }

  // Actividades: pasadas y futuras, algunas de varios días.
  const actividades = [];
  const tiposActividad = Object.keys(ETIQUETA_ACTIVIDAD);
  for (let i = 0; i < CANTIDAD.actividades; i++) {
    const tipo = alguno(tiposActividad);
    const titulo = `${ETIQUETA_ACTIVIDAD[tipo]}: ${alguno(TEMAS_ACTIVIDAD)}`;
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
      imagen: `@/assets/media/${alguno(DEMOS)}`,
      incrustados: i === 0 ? [INCRUSTADOS.soundcloud, INCRUSTADOS.maps] : undefined,
      enlaces: i === 0 ? [{ etiqueta: 'Ver transmisión', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }]
        : i === 1 ? [{ etiqueta: 'Más información', url: '/agenda' }, { etiqueta: 'Programa completo', url: 'https://www.udec.cl/' }]
        : undefined,
    }, cuerpo({ secciones: 2 }));
  }

  // Noticias: casi todas pasadas; un par futuras (no deben verse) y algunas como Cobertura.
  // Imagen destacada con alt en casi todas; video ~30 %, galería ~30 %, Instagram ~20 %.
  const pasadas = actividades.filter((a) => a.inicio < hoy);
  for (let i = 0; i < CANTIDAD.noticias; i++) {
    const titulo = `${alguno(SUJETOS_NOTICIA)} ${alguno(VERBOS_NOTICIA)} ${alguno(OBJETOS_NOTICIA)}${alguno(CIERRES_NOTICIA)}`;
    const id = idUnico('noticias', titulo);
    const fecha = dias(i < 2 ? en.number.int({ min: 5, max: 60 }) : -en.number.int({ min: 1, max: 365 }));
    const cobertura = quizas(0.25, pasadas.length ? alguno(pasadas).id : undefined);
    const demo = alguno(DEMOS);
    const galeria = en.datatype.boolean({ probability: 0.3 })
      ? algunos(DEMOS, 3, 7).map((d) => ({ imagen: `@/assets/media/${d}`, alt: DEMO_ALT[d] }))
      : undefined;
    escribir('noticias', id, {
      titulo, fecha: fechaSola(fecha), publicado: en.datatype.boolean({ probability: 0.95 }),
      imagen: `@/assets/media/${demo}`,
      imagen_alt: DEMO_ALT[demo],
      video: quizas(0.3, alguno(VIDEOS)),
      galeria,
      bajada: quizas(0.8, alguno(BAJADAS)),
      etiquetas: algunos(ETIQUETAS, 2, 4),
      temas: algunos(temas, 1, 2), areas: algunos(areas, 0, 2),
      personas_mencionadas: algunos(personas, 0, 4),
      organizaciones_mencionadas: algunos(organizaciones, 0, 2),
      actividad: cobertura,
      instagram: quizas(0.2, alguno(instagramIds)),
      incrustados: i === 0 ? [INCRUSTADOS.spotify] : i === 1 ? [INCRUSTADOS.facebook, INCRUSTADOS.tiktok] : undefined,
    }, cuerpo({ secciones: en.number.int({ min: 2, max: 4 }), imagen: en.datatype.boolean({ probability: 0.4 }) ? alguno(DEMOS) : undefined }));
  }

  // Noticia de prueba fija (galería, video, alt, cuerpo con imagen, emoji y enlace).
  escribir('noticias', `${PREFIJO}prueba-galeria-video`, {
    titulo: 'Prueba: galería y video', fecha: fechaSola(dias(-3)), publicado: true,
    imagen: '@/assets/media/demo-05.jpg', imagen_alt: DEMO_ALT['demo-05.jpg'],
    video: VIDEOS[0],
    enlaces: [{ etiqueta: 'Inscripción', url: 'https://forms.gle/ejemplo' }, { etiqueta: 'Más información', url: '/noticias' }],
    galeria: DEMOS.slice(0, 4).map((d) => ({ imagen: `@/assets/media/${d}`, alt: DEMO_ALT[d] })),
    bajada: 'Noticia de prueba para revisar la galería, el video y el cuerpo con imagen, emoji y enlace.',
    etiquetas: ['prueba', 'galería', 'video'],
    temas: ['logros'], areas: ['biomateriales'],
  }, cuerpo({ secciones: 2, imagen: 'demo-06.jpg', emoji: true, tabla: false }));

  // Noticia de prueba fija con contenido incrustado: un reproductor por servicio y la tarjeta de TikTok.
  escribir('noticias', `${PREFIJO}prueba-contenido-incrustado`, {
    titulo: 'Prueba: contenido incrustado', fecha: fechaSola(dias(-2)), publicado: true,
    imagen: '@/assets/media/demo-07.jpg', imagen_alt: DEMO_ALT['demo-07.jpg'],
    bajada: 'Noticia de prueba para revisar Spotify, SoundCloud, Google Maps, Facebook y TikTok.',
    etiquetas: ['prueba', 'incrustados'],
    temas: ['logros'], areas: ['biomateriales'],
    incrustados: [INCRUSTADOS.spotify, INCRUSTADOS.soundcloud, INCRUSTADOS.maps, INCRUSTADOS.facebook, INCRUSTADOS.tiktok],
  }, cuerpo({ secciones: 2, imagen: 'demo-06.jpg', tabla: false }));

  // Anuncios: vigentes, vencidos y sin fecha límite; enlace y contacto del mismo dominio.
  const tiposAnuncio = ['trabajo', 'practica', 'pasantia', 'proyecto', 'convocatoria', 'colaboracion', 'otra'];
  for (let i = 0; i < CANTIDAD.anuncios; i++) {
    const titulo = `${alguno(PREFIJO_ANUNCIO)} ${alguno(OFERTAS)}`;
    const id = idUnico('anuncios', titulo);
    const fecha = dias(-en.number.int({ min: 0, max: 120 }));
    escribir('anuncios', id, {
      titulo, publicado: true, tipo: alguno(tiposAnuncio), oferente: personaUOrg(),
      areas: algunos(areas, 1, 2), fecha: fechaSola(fecha),
      fecha_limite: quizas(0.75, fechaSola(dias(en.number.int({ min: -30, max: 90 })))),
      contacto: es.internet.email({ provider: 'ejemplo.cl' }).toLowerCase(),
      enlace: quizas(0.4, `https://www.ejemplo.cl/postular/${slug(titulo).slice(0, 40)}`),
    }, cuerpo({ secciones: 2 }));
  }

  // Documentos del Repositorio (aún sin página, pero listos para cuando exista).
  // Enlace con forma de archivo de Drive (id de 33 caracteres).
  const tiposDoc = Object.keys(TIPO_DOC);
  for (let i = 0; i < CANTIDAD.documentos; i++) {
    const tipo = alguno(tiposDoc);
    const titulo = `${TIPO_DOC[tipo]} ${alguno(ASUNTOS_DOC)} N.º ${en.number.int({ min: 1, max: 999 })}`;
    escribir('documentos', idUnico('documentos', titulo), {
      titulo, publicado: true, tipo, anio: en.number.int({ min: 1995, max: hoy.getFullYear() }),
      enlace: `https://drive.google.com/file/d/${en.string.alphanumeric({ length: 33 })}/view`,
      descripcion: quizas(0.7, alguno(DESCRIPCIONES_DOC)),
      temas: algunos(temas, 0, 1), areas: algunos(areas, 0, 2), palabras_clave: algunos(PALABRAS_CLAVE, 2, 4),
    });
  }

  // Páginas libres: una por cada valor de `mostrar_en`. La de «ninguno» la enlaza un Banner (ver abajo).
  // La de «la-carrera» trae video y bloques destacados, para probar el diseño de «¿Qué es la Bioingeniería?»;
  // la de «footer», contenido incrustado en la columna de texto.
  const paginasLibres = [
    { titulo: 'Becas y apoyo estudiantil', mostrar_en: 'ninguno', bajada: 'Ayudas económicas y de alimentación para estudiantes de Bioingeniería.' },
    {
      titulo: 'Historia de la carrera', mostrar_en: 'la-carrera', bajada: 'Desde la creación del programa hasta hoy.',
      // Marcada en el Inicio a propósito: junto con «¿Qué es la Bioingeniería?» dispara el aviso de «varias destacadas».
      destacar_inicio: true, resumen_inicio: 'Contenido de prueba. Un recorrido por los hitos de la carrera, desde sus inicios hasta hoy.',
      video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', bloques_titulo: 'Hitos de la carrera',
      bloques: [
        { titulo: 'Creación del programa', texto: 'Contenido de prueba. Primeros años de la carrera y su plan de estudios.' },
        { titulo: 'Primeras generaciones', texto: 'Contenido de prueba. Egresados y egresadas de los primeros cursos.' },
        { titulo: 'Laboratorios', texto: 'Contenido de prueba. Equipamiento y espacios de trabajo a lo largo del tiempo.' },
        { titulo: 'Hoy', texto: 'Contenido de prueba. Actividades, investigación y vinculación con la comunidad.' },
      ],
    },
    {
      titulo: 'Preguntas frecuentes', mostrar_en: 'footer', bajada: 'Respuestas a las consultas más comunes de estudiantes y egresados/as.',
      enlaces: [{ etiqueta: 'Escribir a la secretaría', url: 'https://forms.gle/ejemplo' }],
      incrustados: [INCRUSTADOS.spotify, INCRUSTADOS.maps],
    },
  ];
  const idsPaginas = {};
  for (const { titulo, mostrar_en, bajada, ...extra } of paginasLibres) {
    const demo = alguno(DEMOS);
    const id = idUnico('paginas-libres', titulo);
    idsPaginas[mostrar_en] = id;
    escribir('paginas-libres', id, {
      titulo, publicado: true, bajada, mostrar_en,
      imagen: `@/assets/media/${demo}`, imagen_alt: DEMO_ALT[demo], ...extra,
    }, cuerpo({ secciones: 2, imagen: alguno(DEMOS) }));
  }

  // Banners (slides del carrusel del Inicio): 5 vigentes para probar autoplay,
  // flechas y puntos (una enlaza a una Página libre de «ninguno»); los últimos 3 prueban la visibilidad (futuros y vencidos,
  // que no deben mostrarse). `estaVigente()` los filtra en el build.
  const banners = [];
  const plantillasBanner = [
    ['Admisión 2027', 'Postula a Bioingeniería UdeC', 'https://admision.udec.cl'],
    ['Semana de la Bioingeniería', 'Charlas, talleres y encuentros con egresados', '/agenda'],
    ['Novedades de la comunidad', 'Lo último en noticias', '/noticias'],
    ['Directorio de egresados', 'Busca y conéctate con la comunidad', '/directorio'],
    ['Becas y apoyo', 'Ayudas para estudiantes de la carrera', `/p/${idsPaginas.ninguno}`],
    ['Repositorio de documentos', 'Reglamentos, informes y publicaciones', '/repositorio'],
    ['Convocatoria de anuncios', 'Trabajo, prácticas y proyectos', '/anuncios'],
    ['Conoce la carrera', '¿Qué es la Bioingeniería en la UdeC?', '/p/bioingenieria'],
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
      imagen: `@/assets/media/${alguno(imagenesBanner)}`,
      enlace,
      inicio: fechaHora(dias(diasVigencia), 0),
      fin: fechaHora(dias(diasFin), 23),
    });
  });

  return {
    areas: areas.length, organizaciones: organizaciones.length, personas: CANTIDAD.personas,
    banners: banners.length, instagram: instagramIds.length,
    ...Object.fromEntries(['actividades', 'noticias', 'anuncios', 'documentos'].map((k) => [k, CANTIDAD[k]])),
  };
}

for (const c of COLECCIONES) mkdirSync(join(CONTENIDO, c), { recursive: true });
mkdirSync(MEDIOS, { recursive: true });
const borrados = limpiar();
if (process.argv.includes('--limpiar')) {
  console.log(`Borrados ${borrados} archivos sintéticos.`);
} else {
  console.log('Generado:', generar(), `(reemplazó ${borrados} archivos sintéticos anteriores)`);
}
