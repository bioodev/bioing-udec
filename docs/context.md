# Contexto del proyecto — BIOING+

> **Documento canónico del dominio y del alcance.** Si algo de otro documento lo contradice, prevalece
> este (incluido `AGENTS.md`). Se mantiene en sitio: no lleva fecha.

Plataforma digital de la comunidad de Bioingeniería de la Universidad de Concepción (Facultad de Ciencias
Biológicas): reúne noticias, actividades, oportunidades, documentos y el directorio de egresados/as.

## Propósito

Dar a la carrera un sitio propio, vinculado a la FCB pero con identidad y estructura propias, donde el
Encargado de comunicaciones publique de forma autónoma sin depender de un servidor ni de la universidad
(ver `propuesta-desarrollo.md` §2 y el ADR `0001`).

## Audiencia de este documento

- **Desarrolladores y agentes de IA** que tocan el código, el modelo de contenidos o el CMS.
- **Encargado de comunicaciones**: los términos de acá son los que ve al editar.
- **Contraparte de la carrera**: define qué se modela y qué queda fuera de alcance.

## Alcance funcional

### Menú principal

INICIO | ¿QUÉ ES LA BIOINGENIERÍA? | NOTICIAS | AGENDA | INSTAGRAM | DIRECTORIO | ANUNCIOS | REPOSITORIO,
más un acceso permanente a la web de la FCB. En el sitio el menú es sticky.

### Secciones

- **Inicio**: contenido destacado y dinámico (Banners, noticias recientes, próximas actividades, anuncios
  vigentes, publicaciones de Instagram).
- **¿Qué es la Bioingeniería?**: contenido institucional y un video que se abre en un modal.
- **Noticias**: con buscador y filtros por Tema, Persona mencionada y fecha; más archivo.
- **Agenda**: Actividades con ficha propia; próximas (orden cronológico) y realizadas (archivo).
- **Anuncios**: oportunidades (trabajo, práctica, pasantía, proyecto, convocatoria, colaboración).
- **Directorio**: buscador de egresados/as por nombre, generación, Área y Organización, con Ficha
  individual, y exportación como anuario imprimible en PDF.
- **Repositorio**: Documentos filtrables por tipo, Tema, año y palabra clave; según `bitacora.md`, la
  biblioteca vive en Google Drive y el sitio enlaza cada Documento.
- **Instagram**: publicaciones seleccionadas por el Encargado de comunicaciones (embed oficial, cargado
  bajo demanda).
- **Contacto**: fuera del sitio. Las altas, bajas y cambios del Directorio llegan por un enlace a un
  Google Form; los datos personales solo se publican con autorización previa.

### Buscadores

Noticias, Agenda, Anuncios, Directorio y Repositorio (más el buscador general del sitio). El funcionamiento
técnico está en `architecture.md`.

### Relaciones entre contenidos

Una Ficha enlaza con las Noticias en que participa su Persona, las Actividades que organiza o en que
expone, y los Anuncios que ofrece. Por eso las Personas y Organizaciones son entidades referenciables y no
texto libre.

### Flujo de contenidos

Una única persona (la Encargada o Encargado de comunicaciones) recibe, valida y publica todo el contenido;
la comunidad no publica directamente. Cada cambio deja historial en Git y se publica en uno o dos minutos;
lo que depende de la fecha se resuelve con una reconstrucción diaria.

### Fuera de alcance

Inscripciones o formularios propios (se enlazan servicios externos), cuentas de usuario para la comunidad,
contenido multi-idioma y migración masiva desde el sitio actual.

## Glosario (lenguaje del dominio)

> Un cambio de modelo de dominio se hace en **tres lugares**: `app/web/public/admin/config.yml`,
> `app/web/src/content.config.ts` y este documento.

### Comunidad

**Persona**:
Cualquier integrante de la comunidad (estudiante, egresado/a, académico/a o invitado/a externo/a) que puede ser referenciado desde otros contenidos del sitio.
_Avoid_: Usuario, participante, miembro, contacto

**Perfil de egresado**:
Conjunto opcional de datos profesionales de una Persona titulada de Bioingeniería UdeC (generación, año de egreso, Área, Organización, cargo).
_Avoid_: Ficha de bioingeniero, registro de egresado

**Ficha**:
Página pública de una Persona u Organización que reúne sus datos visibles y sus vínculos (Noticias, Actividades, Anuncios). Existe por defecto y puede desactivarse; si está desactivada, el nombre aparece en los contenidos sin enlace.
_Avoid_: Perfil (se reserva para Perfil de egresado), página personal

**Organización**:
Empresa, institución, laboratorio o agrupación que puede ser referenciada como lugar de trabajo de una Persona, organizadora de una Actividad u oferente de un Anuncio, o mencionada en una Noticia. Tiene un tipo (empresa, institución, laboratorio, agrupación) y una Ficha que reúne esos vínculos.
_Avoid_: Institución, empresa, entidad (como término genérico)

**Directorio**:
El buscador público de las Personas que tienen Perfil de egresado autorizado para publicarse y Ficha activa; cada resultado lleva a su Ficha.
_Avoid_: Base de datos, buscador de bioingenieros

### Contenidos

**Noticia**:
Publicación de actualidad sobre la comunidad de Bioingeniería, con fecha, Temas, Áreas, Personas mencionadas y Organizaciones mencionadas. Opcionalmente tiene texto alternativo de la imagen destacada, un video de YouTube y una galería de hasta 12 imágenes.
_Avoid_: Artículo, post, nota

**Persona mencionada** / **Organización mencionada**:
Persona u Organización que figura en una Noticia; no implica autoría. La Noticia aparece en su Ficha.
_Avoid_: Participante, autor, etiquetado

**Actividad**:
Evento con fecha y lugar o modalidad (seminario, charla, congreso, taller, encuentro) publicado en la Agenda.
_Avoid_: Evento, evento de agenda

**Agenda**:
El calendario de Actividades, dividido en próximas y realizadas.
_Avoid_: Calendario, eventos

**Organizador**:
Persona u Organización responsable de una Actividad.
_Avoid_: Responsable, anfitrión

**Expositor**:
Persona que presenta, dicta o modera en una Actividad. Los asistentes no se registran.
_Avoid_: Participante, ponente, invitado

**Sección destacada (del Inicio)**:
Bloque con imagen de fondo, título, texto y botón que se muestra al final del Inicio, en el orden de su lista en el panel. Se publica o se oculta sin borrarla. Su enlace es una ruta interna o una URL externa.
_Avoid_: Banner (los Banners son el carrusel superior), tarjeta, bloque fijo

**Cobertura**:
Noticia que relata una Actividad ya realizada; una Noticia cubre como máximo una Actividad.
_Avoid_: Crónica, reseña

**Anuncio**:
Oportunidad o requerimiento para la comunidad (trabajo, práctica, pasantía, proyecto, convocatoria, colaboración), con una o más Áreas y fecha límite opcional.
_Avoid_: Oferta, aviso, publicación

**Oferente**:
Persona u Organización que ofrece la oportunidad de un Anuncio.
_Avoid_: Publicador, autor, empresa

**Contacto**:
Dato de texto libre (correo, teléfono o enlace) para responder a un Anuncio; nunca es una Persona.
_Avoid_: Responsable, persona de contacto

**Documento**:
Archivo de interés para la comunidad (decreto, reglamento, informe, publicación, etc.) publicado en el Repositorio, clasificado por tipo, Área, Tema, año y palabras clave; no se vincula a Personas ni Actividades.
_Avoid_: Archivo, recurso

**Repositorio**:
La colección buscable de Documentos.
_Avoid_: Biblioteca, archivo, drive

**Página libre**:
Página de texto creada desde el panel (título, bajada, imagen opcional y contenido) que vive en `/paginas/<slug>`. Puede mostrarse en el menú «La carrera» o «Comunidad», en el pie, o en ninguno (solo por enlace desde un Banner).
_Avoid_: Página institucional, página, artículo

**Página institucional**:
Página de diseño a medida y archivo único (hoy, ¿Qué es la Bioingeniería?). El Encargado de comunicaciones edita sus textos desde el panel, pero cambiar su estructura requiere código. No es una Página libre.
_Avoid_: Página libre, página fija

**Banner**:
Pieza de portada con vigencia (inicio y fin) que enlaza a un contenido del sitio o a una URL externa; es el único mecanismo para destacar algo en el Inicio.
_Avoid_: Destacado, slider, hero

**Publicación de Instagram**:
Publicación o reel de la cuenta de Instagram de la carrera que el Encargado de comunicaciones selecciona para mostrar en el sitio pegando su enlace; una Noticia puede tener una relacionada.
_Avoid_: Post, feed

### Clasificación

**Área**:
Campo disciplinar o profesional de la Bioingeniería (p. ej. acuicultura, biomateriales); lista compartida por Perfiles de egresado, Noticias, Actividades, Anuncios y Documentos, que permite cruzarlos.
_Avoid_: Área de desempeño, área profesional, disciplina, categoría

**Tema**:
Clasificación editorial de Noticias y Documentos (p. ej. institucional, logros, vida estudiantil); no describe un campo profesional.
_Avoid_: Categoría, etiqueta, tag

### Gestión

**Encargado de comunicaciones**:
Persona responsable de revisar, crear y publicar todo el contenido del sitio a partir de lo que envía la comunidad.
_Avoid_: Administrador, editor, moderador

**Borrador**:
Contenido creado por el Encargado de comunicaciones que aún no es visible en el sitio.

**Publicado**:
Contenido visible públicamente en el sitio.
_Avoid_: Activo, aprobado
