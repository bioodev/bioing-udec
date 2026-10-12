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

INICIO | LA CARRERA ▾ (REPOSITORIO y las Páginas libres de «La carrera», como ¿QUÉ ES LA BIOINGENIERÍA?) | NOTICIAS | AGENDA | COMUNIDAD ▾ (DIRECTORIO, ANUNCIOS, INSTAGRAM y las Páginas libres de «Comunidad»),
más un acceso permanente a la web de la FCB. En el sitio el menú es sticky.
El panel puede ocultar cualquiera de estas secciones fijas (NOTICIAS, AGENDA, INSTAGRAM, DIRECTORIO, ANUNCIOS,
REPOSITORIO). NOTICIAS y AGENDA solo se quitan del menú, del pie y de `llms.txt`. INSTAGRAM, DIRECTORIO, ANUNCIOS y
REPOSITORIO se pueden **desactivar del todo**: dejan de publicarse (404), salen del sitemap, del buscador, del JSON-LD
y del Inicio, y sus enlaces se omiten. El contenido no se borra. DIRECTORIO incluye el anuario. INICIO no se oculta.
Decisión en `adr/0008-secciones-desactivables.md`.

### Secciones

- **Inicio**: contenido destacado y dinámico (Banners, noticias recientes, próximas actividades, anuncios
  vigentes, publicaciones de Instagram, y la banda «Comunidad y documentos» con cifras del Directorio y los
  últimos documentos del Repositorio).
- **¿Qué es la Bioingeniería?**: Página libre (`/p/bioingenieria`, en «La carrera») con contenido institucional, un video que se abre en un modal y bloques destacados.
- **Noticias**: con buscador y filtros por Tema, Persona mencionada y fecha; más archivo.
- **Agenda**: Actividades con ficha propia; próximas (orden cronológico) y realizadas (archivo).
- **Anuncios**: oportunidades (trabajo, práctica, pasantía, proyecto, convocatoria, colaboración).
- **Directorio**: buscador de egresados/as por nombre, generación, Área y Organización, con chips de áreas, vista
  «Por generación», Ficha individual, y exportación como anuario imprimible en PDF. Un bloque invita a sumarse y
  explica cómo pedir aparecer o actualizar los datos (con el formulario configurado en el panel, si lo hay).
- **Repositorio**: Documentos filtrables por tipo, Tema, año y palabra clave; según `bitacora.md`, la
  biblioteca vive en Google Drive y el sitio enlaza cada Documento.
- **Instagram**: publicaciones seleccionadas por el Encargado de comunicaciones (embed oficial, cargado
  bajo demanda).
- **Redes sociales** (pie): enlaces a los perfiles de la comunidad (Instagram, Facebook, X, LinkedIn, YouTube,
  TikTok, Threads, Bluesky, Mastodon / Fediverso), uno por red en el panel; solo se muestran las que tienen URL.
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
Cualquier integrante de la comunidad (estudiante, egresado/a, académico/a o invitado/a externo/a) que puede ser referenciado desde otros contenidos del sitio. Su Ficha puede llevar un bloque **SEO (opcional)**.
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
Publicación de actualidad sobre la comunidad de Bioingeniería, con fecha, Temas, Áreas, Personas mencionadas y Organizaciones mencionadas. Opcionalmente tiene texto alternativo de la imagen destacada, un video de YouTube, hasta 6 Enlaces, una galería de hasta 12 imágenes y Contenido incrustado.
_Avoid_: Artículo, post, nota

**Persona mencionada** / **Organización mencionada**:
Persona u Organización que figura en una Noticia; no implica autoría. La Noticia aparece en su Ficha.
_Avoid_: Participante, autor, etiquetado

**Actividad**:
Evento con fecha y lugar o modalidad (seminario, charla, congreso, taller, encuentro) publicado en la Agenda. Opcionalmente tiene una inscripción (botón principal) y hasta 6 Enlaces, además de Contenido incrustado.
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
Bloque con imagen de fondo, título, texto y botón que se muestra al final del Inicio, en el orden de su lista en el panel. Se publica o se oculta sin borrarla. Su enlace es una ruta interna o una URL externa. Ya no incluye el Directorio ni el Repositorio, que tienen su propia banda.
_Avoid_: Banner (los Banners son el carrusel superior), tarjeta, bloque fijo

**Banda «Comunidad y documentos»**:
Bloque del Inicio, antes de las Secciones destacadas, con dos tarjetas lado a lado (apiladas en móvil): el **Directorio** (cifras de egresados/as, generaciones y organizaciones, y un buscador por nombre que lleva a `/directorio?texto=…`) y el **Repositorio** (los 4 Documentos más recientes). Cada tarjeta tiene título, texto, botón y foto opcional, editables en el panel. Si el panel apaga el Directorio o el Repositorio, su tarjeta no sale; si apaga los dos, no sale la banda.
_Avoid_: Sección destacada (la banda no es una lista editable de bloques), tarjeta de portada

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
Página de texto creada desde el panel (título, bajada, imagen opcional, contenido, video de YouTube opcional, hasta 6 Enlaces y bloques destacados opcionales) que vive en `/p/<slug>`. Puede mostrarse en el menú «La carrera» o «Comunidad», en el pie, o en ninguno (solo por enlace desde un Banner). Con video o bloques, la página usa el diseño de «¿Qué es la Bioingeniería?» (cabecera ancha, cuerpo sobre fondo gris y franja oscura con los bloques).
_Avoid_: Página institucional, página, artículo

**Página destacada**:
Página libre marcada con «Destacar en el Inicio», que se muestra como bloque entre el carrusel de Banners y las Noticias recientes. Solo una a la vez: si hay varias marcadas, el sitio muestra una (la primera por título) y avisa en el build.
_Avoid_: Sección destacada (esa es un bloque al final del Inicio), Banner, portada

**Página institucional**:
Página de diseño a medida y archivo único. Hoy no hay ninguna: ¿Qué es la Bioingeniería? es una Página libre. Cambiar la estructura de una página de este tipo requiere código. No es una Página libre.
_Avoid_: Página libre, página fija

**Banner**:
Pieza de portada con vigencia (inicio y fin) que enlaza a un contenido del sitio o a una URL externa; se muestra en el carrusel del Inicio. Es la forma de destacar algo temporal; los accesos permanentes al final del Inicio son Secciones destacadas.
_Avoid_: Destacado, slider, hero

**Redes sociales**:
Perfil de la comunidad en una red social (Instagram, Facebook, X, LinkedIn, YouTube, TikTok, Threads, Bluesky o
Mastodon / Fediverso). Se edita en el panel como un campo por red, en «Redes sociales». Aparece en el pie del sitio con
su ícono, en el `sameAs` del JSON-LD y en el botón «Seguir en Instagram» de `/instagram`. No son botones de compartir.

**Publicación de Instagram**:
Publicación o reel de la cuenta de Instagram de la carrera que el Encargado de comunicaciones selecciona para mostrar en el sitio pegando su enlace; una Noticia puede tener una relacionada.
_Avoid_: Post, feed

**Contenido incrustado**:
Enlaces públicos de servicios externos (Spotify, SoundCloud, Apple Podcasts, YouTube, Vimeo, Instagram, Facebook, Google Maps, Google Drive/Docs) que el sitio muestra como reproductor después del cuerpo de una Noticia, una Actividad o una Página libre, bajo el título «Multimedia». Los demás servicios, o los enlaces no reconocidos, se muestran como tarjeta con el enlace.
_Avoid_: Embed, widget, iframe

**Enlace**:
Botón con etiqueta libre (p. ej. «Inscripción», «Ver transmisión», «Más información») bajo el título de una Noticia, una Actividad o una Página libre; hasta 6 por ficha. Lleva a una dirección externa o interna. No reproduce nada: para videos, audios o publicaciones, usar Contenido incrustado.
_Avoid_: Link, botón, vínculo, enlace suelto

### Clasificación

**Área**:
Campo disciplinar o profesional de la Bioingeniería (p. ej. acuicultura, biomateriales); lista compartida por Perfiles de egresado, Noticias, Actividades, Anuncios y Documentos, que permite cruzarlos.
_Avoid_: Área de desempeño, área profesional, disciplina, categoría

**Tema**:
Clasificación editorial de Noticias y Documentos (p. ej. institucional, logros, vida estudiantil); no describe un campo profesional.
_Avoid_: Categoría, etiqueta, tag

### Gestión

**SEO del sitio**:
Configuración general de cómo aparece la carrera en buscadores y al compartir el sitio: descripción general, imagen por defecto para redes, descripción e imagen para redes de cada listado y códigos de verificación de Google y Bing. Se edita en el panel como «SEO del sitio».
_Avoid_: Metadatos, meta tags, configuración técnica

**SEO (opcional)**:
Bloque de una Noticia, Actividad, Anuncio, Documento, Página libre o Persona con título, descripción e imagen propios para buscadores y redes, y la opción «No mostrar en buscadores». Si está vacío, se usan el título, la bajada y la imagen de la propia ficha (en una Persona: su nombre, su descripción breve y su foto).
_Avoid_: Metadatos, posicionamiento, SEO avanzado

**Analítica (opcional)**:
Medición de visitas del sitio con Cloudflare Web Analytics, sin cookies ni banner. Se configura en el panel como el grupo «Analítica (opcional)» de «SEO del sitio», con el token que entrega Cloudflare. Sin token, el sitio no mide nada (ADR 0012).
_Avoid_: Google Analytics, seguimiento, tracking, cookies

**Encabezado de listado**:
Franja superior de Noticias, Agenda, Anuncios, Repositorio, Directorio e Instagram: una imagen de cabecera opcional (con texto alternativo) y un ícono opcional junto al título. Se edita en el panel como «Encabezados de los listados». Sin imagen ni ícono, la página se ve como siempre.
_Avoid_: Banner de sección, portada de listado, hero

**Ícono**:
Dibujo de la lista curada de Phosphor que el panel ofrece para los encabezados y para el bloque «¿Eres egresado/a?». Se elige en un desplegable; no se sube un archivo.
_Avoid_: Icono personalizado, logo de sección, SVG

**No mostrar en buscadores**:
Opción de una ficha que deja la página publicada y enlazada, pero la saca del mapa del sitio y del buscador del sitio. No es un Borrador: sigue visible.
_Avoid_: Ocultar, privado, borrador

**Encargado de comunicaciones**:
Persona responsable de revisar, crear y publicar todo el contenido del sitio a partir de lo que envía la comunidad.
_Avoid_: Administrador, editor, moderador

**Borrador**:
Contenido creado por el Encargado de comunicaciones que aún no es visible en el sitio.

**Publicado**:
Contenido visible públicamente en el sitio.
_Avoid_: Activo, aprobado
