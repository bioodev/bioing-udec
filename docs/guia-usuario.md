# Guía de usuario del panel — BIOING+

> **Para quién es:** la persona Encargada de comunicaciones de la carrera (y su respaldo). No hace falta
> saber programar ni usar Git.
> **Estado:** primera versión (2026-10-11); pantallazos pendientes
> **Relacionados:** [`context.md`](context.md) (términos del dominio) ·
> [`architecture.md`](architecture.md) (cómo funciona por dentro) · [`pendientes-infra.md`](pendientes-infra.md).

**Convención de esta guía:** cada tarea se escribe como *objetivo → pasos → cómo comprobar que quedó bien →
errores típicos*. Los nombres de campos son los que se ven en el panel y los que usa el código (no se
inventan pantallas).

---

## 1. Qué puedes hacer (y qué no) con el panel

- Resumen de una pantalla: crear, editar, previsualizar y publicar todo el contenido del sitio.
- Lo que **sí** se administra desde el panel: Noticias, Actividades, Anuncios, Documentos, Personas
  (Fichas y Directorio), Organizaciones, Banners del Inicio, Páginas (incluida ¿Qué es la Bioingeniería?), Publicaciones de
  Instagram, y las listas de Áreas y Temas.
- La sección **Archivos** (Inicio, Secciones del sitio, Redes sociales, SEO del sitio y Encabezados de los
  listados) no es contenido: son cinco archivos únicos que se editan siempre en el mismo lugar, al final de la lista del
  panel. **Páginas** no es la configuración: son páginas propias del sitio que se crean y se publican por separado.
- Lo que **no** se hace desde el panel: cambiar el diseño, agregar secciones nuevas, pegar código, gestionar
  cuentas o usuarios, y (por ahora) aprobar contenido de otras personas.

## 2. Antes de empezar

### 2.1 Tu cuenta y cómo se entra

- Necesitas una cuenta de GitHub (en producción) con **doble factor** activado. La cuenta la crea la carrera
  y decide quién tiene acceso al repositorio del sitio.
- Dirección del panel: `https://<dominio>/admin/`. Hoy, en la vista previa, es `https://bioing.bioodev.work/admin/`.
  Si no carga, revisa que la dirección termine en `/admin/` y recarga la página; si sigue sin cargar, avisa a
  soporte (§11).
- Diferencia entre entrar al **panel** (editar, con tu cuenta) y ver el **sitio público** (cualquiera puede
  verlo, sin entrar).

**Hoy: entrar con un token de acceso.** Mientras no esté conectado el inicio de sesión con GitHub, en
**«Iniciar sesión con un token de acceso»** pegas un token. Para crearlo:

1. En GitHub, haz clic en tu foto (arriba a la derecha) → **Settings** → **Developer settings** →
   **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Ponle un nombre que reconozcas (por ejemplo, «Panel BIOING+») y elige un **vencimiento**. Conviene una fecha
   corta, con un recordatorio para renovarlo.
3. En **Repository access**, elige **Only select repositories** y selecciona **solo el repositorio del sitio**.
4. En **Repository permissions**, busca **Contents** y ponlo en **Read and write**. No necesita otros permisos.
5. Haz clic en **Generate token** y copia el token. GitHub solo lo muestra una vez: guárdalo en tu gestor de
   contraseñas.
6. En el panel, elige **«Iniciar sesión con un token de acceso»** y pega el token.

> **Nunca compartas el token.** Quien lo tenga puede editar el repositorio en tu nombre. Si lo pierdes o
> sospechas que alguien lo vio, revócalo en la misma página de GitHub y crea uno nuevo.

**En producción** habrá un botón **«Iniciar sesión con GitHub»** (OAuth), sin crear tokens. **Hoy ese botón no
funciona**: no lo uses.

> _Pantallazo pendiente: pantalla de inicio de sesión del panel (`/admin/`) y la opción de token._

**Cómo comprobar que quedó bien:** al entrar ves la lista de colecciones del panel (Personas, Noticias, Agenda…)
y puedes abrir una entrada sin error.

**Errores típicos:**
- El token no tiene permiso *Contents: Read and write*: el panel no deja guardar.
- El token venció: pide uno nuevo y reemplázalo.
- El token es de otro repositorio o quedó sin seleccionar el repositorio del sitio: no aparece el contenido.

### 2.2 Cómo se publica (reglas que conviene saber de memoria)

- **Borrador vs Publicado**: el interruptor `Publicado` es lo que hace visible un contenido. Si está
  desactivado, el contenido queda como borrador y no aparece en el sitio. Esto vale también para las Páginas
  libres, incluida ¿Qué es la Bioingeniería?.
- **Cada guardado es un cambio en el repositorio.** Cada vez que guardas, el panel registra un cambio en la
  rama `main` del repositorio del sitio.
- **El sitio se actualiza solo cuando el despliegue automático esté conectado.** Hoy, en la vista previa, **no
  lo está**: después de publicar, la persona técnica construye y despliega el sitio a mano. Mientras tanto, un
  cambio hecho en el panel puede no verse en el sitio (ver §8). Cuando el despliegue automático esté conectado,
  la meta es que un cambio se vea en 1 a 3 minutos.
- **Lo que depende de la fecha** (Actividades próximas o realizadas, Anuncios vencidos, Banners vigentes) se
  calcula en una **reconstrucción diaria**, poco después de medianoche (hora de Chile). **Esa reconstrucción
  todavía no está activa**: hasta entonces, un Anuncio vencido puede seguir visible y una Actividad ya
  realizada puede seguir en «Próximas».
- **Historial:** cada cambio queda registrado y se puede revertir, pero la reversión la hace soporte (ver §11).

### 2.3 La pantalla del panel

- Cómo está organizado: el menú lateral agrupa las colecciones en tres bloques separados por una línea:
  **Contenido** (Noticias, Agenda, Anuncios, Repositorio, Banners, Páginas, Instagram), **Comunidad** (Personas,
  Organizaciones) y **Listas** (Áreas, Temas). Al final va la sección **Archivos** (Inicio, Secciones del sitio,
  Redes sociales, SEO del sitio y Encabezados de los listados). Cada colección tiene un buscador interno y el botón de
  guardar _(por verificar en el panel: disposición exacta)_.
- Cómo se guarda un borrador: deja **Publicado** desactivado y guarda. Para revisar cómo se ve, usa la vista
  previa del panel, pero **recuerda que no es idéntica al sitio**: revisa el resultado en el sitio, en celular
  y en computador.
- Qué significa que el panel escriba en el repositorio: cada guardado queda registrado con la cuenta con la que
  entraste (tu token). Por eso el token es personal.

> _Pantallazo pendiente: vista general del panel (lista de colecciones, editor y botón de guardar)._

## 3. Los conceptos del modelo, en lenguaje llano

> El detalle canónico está en [`context.md`](context.md); acá va la versión corta y con ejemplos.

- **Persona** vs **Organización**: una **Persona** es alguien de la comunidad (estudiante, egresado/a,
  académico/a o invitado/a externo/a). Una **Organización** es una empresa, institución, laboratorio o
  agrupación. Si tiene nombre y apellido, es una Persona.
- **Ficha**: página pública de una Persona u Organización que reúne sus vínculos (Noticias, Actividades,
  Anuncios). Existe por defecto. Si la desactivas, su nombre aparece en los contenidos **sin enlace**.
- **Área** (campo profesional: acuicultura, biomateriales…) vs **Tema** (editorial: institucional, logros,
  vida estudiantil…). Pregúntate: ¿describe la profesión o el tipo de contenido? La profesión es un Área; el
  tipo de contenido, un Tema. Las Áreas cruzan Perfiles, Noticias, Actividades, Anuncios y Documentos; los
  Temas clasifican Noticias y Documentos.
- **Etiquetas (tags)** de una Noticia: texto libre para etiquetarla (p. ej. «simulación»). **No reemplazan a los
  Temas** y no crean nada en otra parte.
- **Oferente** (quien ofrece un Anuncio) y **Organizador** (quien hace una Actividad). Ambos son una Persona u
  una Organización.
- **Expositor**: quien presenta, dicta o modera en una Actividad. Los asistentes no se registran.
- **Cobertura**: una Noticia que relata una Actividad ya realizada. Una Noticia cubre como máximo una Actividad.
- **Contacto** de un Anuncio: es texto libre (correo, teléfono o enlace), nunca una Persona.
- **Perfil de egresado** y **autorización**: nadie aparece en el Directorio sin autorización previa.
- **Publicación de Instagram**: se pega el enlace de la publicación y el sitio la muestra con su tarjeta y su
  embed.

## 4. Tareas paso a paso

> Cada una con: objetivo, campos, pasos, cómo comprobar y errores típicos. Los campos marcados como
> obligatorios no dejan guardar la entrada si están vacíos.

### 4.1 Publicar una Noticia

**Objetivo:** dejar publicada una noticia con su imagen, sus clasificaciones y sus vínculos a personas y
organizaciones.

**Campos.**
- Obligatorios: Título, Fecha de publicación, Publicado, Cuerpo.
- Opcionales: Imagen destacada y su Texto alternativo de la imagen, Bajada, Etiquetas (tags), Temas, Áreas,
  Personas mencionadas, Organizaciones mencionadas, Actividad que cubre, Publicación de Instagram relacionada,
  Video (YouTube), Enlaces (hasta 6), Galería de imágenes (hasta 12) y Contenido incrustado (hasta 10 enlaces).

**Pasos.**
1. Ve a la colección **Noticias** y crea una entrada nueva.
2. Escribe el **Título** y la **Fecha de publicación**.
3. Escribe la **Bajada**: una o dos frases que acompañan el título.
4. Escribe el **Cuerpo** (ver §5 para imágenes, enlaces y listas). Va justo después de la Bajada, así que no hace
   falta bajar hasta el final del formulario.
5. Sube la **Imagen destacada** y escribe su **Texto alternativo de la imagen**: describe lo que se ve, sin
   repetir el título.
6. Asigna **Temas** (editoriales) y **Áreas** (profesionales).
7. Vincula **Personas mencionadas** y **Organizaciones mencionadas**. Solo se pueden elegir entradas que ya
   existen: si falta alguna, créala antes (ver §4.8 y §4.9).
   _(por verificar en el panel: crear una Persona nueva desde la misma Noticia, sin salir de ella)._
8. Si la Noticia es la cobertura de una Actividad ya realizada, elígela en **Actividad que cubre**. Si
   corresponde a una publicación de Instagram, elígela en **Publicación de Instagram relacionada**.
9. Opcional: en **Video (YouTube)** pega el enlace del video (solo YouTube; se muestra debajo del cuerpo, en una
   ventana que se abre al hacer clic). En **Galería de imágenes** agrega hasta 12 imágenes; cada una lleva su
   **Texto alternativo**. Opcional: en **Enlaces** agrega botones (ver el recuadro de abajo). Y en **Contenido
   incrustado** pega enlaces públicos (ver el recuadro de abajo).
10. Activa **Publicado** y guarda.

> _Pantallazo pendiente: formulario de la Noticia (imagen destacada, Galería y Cuerpo)._

**Enlaces** (Noticias, Actividades y Páginas). Son botones con un texto corto que aparecen bajo el título y
llevan a otra página: inscripción, transmisión, más información, bases. Cada uno tiene una **Etiqueta** (el texto
del botón, p. ej. «Ver transmisión») y una **Dirección** (con `https://`, o una ruta del sitio como `/agenda`). Hasta
6 por ficha. Los que llevan a otro sitio se abren en una pestaña nueva. Para **reproducir** un video, un audio o una
publicación, no uses Enlaces: usa **Contenido incrustado**.

**Contenido incrustado** (Noticias, Actividades y Páginas). Pega la dirección pública del contenido, la que aparece en la
barra del navegador. El sitio arma el reproductor solo; no hace falta copiar código.
- **Se ven como reproductor:** Spotify (episodios, programas, listas, álbumes y artistas), SoundCloud, Apple
  Podcasts, Deezer, Audiomack, Acast y Audioboom; YouTube (videos, Shorts y listas), Vimeo (también los privados con
  enlace), Dailymotion, Loom, TED, Twitch (canales, videos y clips), TikTok (videos), Instagram (publicaciones y
  reels), Facebook (publicaciones y videos), LinkedIn (publicaciones), Pinterest (pines), Reddit (publicaciones) y
  GIPHY; Google Maps (enlaces largos de `google.com/maps`, como los de escritorio), Google Drive o Docs, Canva, Figma,
  Behance, Issuu, Sketchfab, CodePen y CodeSandbox.
- **Se ven como tarjeta con el enlace:** X, Threads, Bluesky, Flickr, DeviantArt, Medium, GitHub Gist, SlideShare,
  Imgur, los enlaces cortos (como `maps.app.goo.gl`, `pin.it` o `redd.it`), los perfiles y canales, y cualquier otra
  dirección `https://`. Los servicios que no se incrustan siguen siendo visibles y llevan al lector al sitio original.
- **WhatsApp:** se comparte, no se incrusta. Un enlace de `wa.me`, de un grupo o de un canal de WhatsApp se muestra
  como tarjeta «WhatsApp» que lleva al enlace en WhatsApp.
- **Título:** opcional, pero recomendado. Lo leen los lectores de pantalla y aparece en la tarjeta.

**Cómo comprobar que quedó bien.** Espera unos minutos y revisa la noticia en el sitio: aparece en `/noticias`,
en Inicio si es reciente, y en la Ficha de cada Persona u Organización vinculada. Si la fecha es futura, no
aparece hasta ese día. Ábrela también en el celular.

**Errores típicos:**
- Dejar **Publicado** desactivado y esperar que aparezca.
- Una foto de la galería sin texto alternativo: ese campo es obligatorio.
- Más de 12 imágenes en la galería: el límite es 12.
- Un video que no es de YouTube: no se muestra.
- Pegar el código HTML del embed en vez del enlace: el sitio solo lee enlaces (`https://`).
- Un servicio no listado en el recuadro: se ve como tarjeta con el enlace, no como reproductor.
- Crear una Persona o Organización duplicada en vez de elegir la que ya existe (ver §6).
- Una fecha futura: la Noticia no aparece hasta ese día.

### 4.2 Publicar una Actividad en la Agenda

**Objetivo:** anunciar una actividad (seminario, charla, congreso, taller…) en la Agenda, con su fecha, su lugar
o modalidad y sus organizadores.

**Campos.**
- Obligatorios: Nombre de la actividad, Publicado, Tipo, Inicio, Modalidad, Organizadores (al menos uno),
  Descripción.
- Opcionales: Término, Lugar, Expositores, Áreas, Enlace de inscripción o información, Enlaces, Imagen y Contenido
  incrustado.

**Pasos.**
1. Ve a la colección **Agenda** y crea una entrada nueva.
2. Escribe el **Nombre de la actividad**.
3. Elige el **Tipo**: Seminario, Charla, Congreso, Taller, Actividad de estudiantes, Actividad de egresados/as,
   Actividad académica, Encuentro de la comunidad u Otra.
4. Escribe el **Inicio** (fecha y hora). Las horas se entienden en hora de Chile.
5. Si la actividad dura varios días, escribe el **Término**. Si no, déjalo vacío.
6. Elige la **Modalidad**: Presencial, En línea o Híbrida. Si es presencial o híbrida, escribe el **Lugar**.
7. En **Organizadores**, agrega una entrada por cada organizador y elige si es una Persona o una Organización.
8. En **Expositores**, elige a las personas que presentan, dictan o modera la actividad.
9. Asigna **Áreas**. Si hay inscripción, pega el **Enlace de inscripción o información** (con `https://`): es el
   botón principal, que aparece relleno mientras la actividad no ha pasado. Opcional: en **Enlaces** agrega otros
   botones (p. ej. «Ver transmisión» o «Más información») que se muestran a su lado. Opcional: sube una **Imagen**.
10. Escribe la **Descripción**. Opcional: en **Contenido incrustado** pega enlaces públicos (ver §4.1).
11. Activa **Publicado** y guarda.

> _Pantallazo pendiente: formulario de una Actividad (fechas, Modalidad y Organizadores)._

**Cómo comprobar que quedó bien.** La actividad aparece en **Agenda**, dentro de **Próximas**, en orden
cronológico. Cuando termina, pasa a **Realizadas**; ese paso se hace en la reconstrucción diaria, que todavía
no está activa (ver §2.2).

**Errores típicos:**
- Olvidar un organizador: el campo es obligatorio.
- Pegar un enlace de Facebook o de otro servicio sin `https://`: no se reconoce.
- Escribir el enlace de inscripción sin `https://`.
- Dejar el **Término** con la fecha de otro día: revisa que las fechas sean las correctas antes de publicar.
- Esperar que una actividad terminada pase a Realizadas de inmediato (ver §2.2).

### 4.3 Publicar un Anuncio

**Objetivo:** publicar una oportunidad para la comunidad (trabajo, práctica, pasantía, proyecto, convocatoria o
colaboración) con su fecha límite y su forma de contacto.

**Campos.**
- Obligatorios: Título, Publicado, Tipo de oportunidad, Oferente, Fecha de publicación, Contacto, Descripción.
- Opcionales: Áreas, Fecha límite, Enlace externo.

**Pasos.**
1. Ve a la colección **Anuncios** y crea una entrada nueva.
2. Escribe el **Título**.
3. Elige el **Tipo de oportunidad**: Oferta de trabajo, Práctica profesional, Pasantía, Proyecto de investigación,
   Convocatoria, Solicitud de colaboración u Otra.
4. En **Oferente**, elige si es una Persona o una Organización y luego cuál. Si no existe, créala antes.
5. Asigna **Áreas**.
6. Escribe la **Fecha de publicación**.
7. Escribe la **Fecha límite** si la hay. Si no la pones, el Anuncio vence **60 días después de la Fecha de
   publicación**.
8. Escribe el **Contacto**: un correo, un teléfono o un enlace. Es texto libre; no lo llenes con una Persona.
9. Si hay un sitio o formulario externo, pégalo en **Enlace externo**.
10. Escribe la **Descripción** y activa **Publicado**.

> _Pantallazo pendiente: formulario de un Anuncio (Oferente y fechas)._

**Cómo comprobar que quedó bien.** El Anuncio aparece en la lista de **Anuncios** mientras esté vigente. Vigente
significa que hoy (hora de Chile) no pasó la fecha límite; el día límite todavía cuenta. Al vencer, pasa al
archivo, y ese cambio se hace en la reconstrucción diaria (ver §2.2).

**Errores típicos:**
- Dejar el **Contacto** vacío: el campo es obligatorio.
- No poner **Fecha límite** y no saber por qué vence antes o después: sin fecha límite, vence a los 60 días.
- Poner el nombre de una persona en **Contacto**: ese campo es texto libre. La persona va en **Oferente**.

### 4.4 Agregar un Documento al Repositorio

**Objetivo:** dejar disponible un documento (decreto, reglamento, informe, publicación…) en el **Repositorio**,
que enlaza al archivo que está en Google Drive.

**Campos.**
- Obligatorios: Título, Publicado, Tipo de documento, Año, Enlace al archivo (Drive).
- Opcionales: Descripción, Temas, Áreas, Palabras clave.

**Regla de Drive:** los archivos quedan en la cuenta central de Google Drive del proyecto, en una carpeta pública
dedicada, con el permiso **«Cualquiera con el enlace»**.

**Pasos.**
1. En Google Drive, sube el archivo a la carpeta pública del proyecto.
2. Abre **Compartir** sobre el archivo y en acceso general elige **Cualquiera con el enlace** _(por verificar en Drive: nombres exactos de los menús)_.
3. Copia el enlace del archivo (debe ser el enlace del archivo, no de una carpeta).
4. En el panel, ve a la colección **Repositorio** y crea una entrada nueva.
5. Escribe el **Título**, elige el **Tipo de documento** y escribe el **Año**.
6. Pega el enlace en **Enlace al archivo (Drive)**.
7. Opcional: escribe la **Descripción**, asigna **Temas** y **Áreas**, y agrega **Palabras clave** (una por
   entrada).
8. Activa **Publicado** y guarda.

**Cómo comprobar que quedó bien.** El documento aparece en **Repositorio** y se encuentra con el buscador y los
filtros. Abre el enlace en una ventana de incógnito (sin tu cuenta): si pide iniciar sesión, el permiso no está
bien.

**Errores típicos:**
- Pegar el enlace de una carpeta: no se puede previsualizar.
- Permiso restringido: el archivo no se abre para la comunidad.
- Enlace que no empieza con `https://`: el campo no lo acepta.
- Vista previa que no carga: ver §8.

### 4.5 Editar ¿Qué es la Bioingeniería?

**Objetivo:** mantener al día la página institucional de la carrera. Es una **Página** (§4.12), así que se
edita igual que cualquier otra y tiene su interruptor **Publicado**.

**Dirección:** `/p/bioingenieria`. La página ya no existe en `/bioingenieria`, y no hay redirección.

**Campos.**
- Obligatorios: Título, Bajada, Contenido.
- Opcionales: Video (YouTube), Título de los bloques destacados, Bloques destacados (Título y Texto).
- Mostrar en: «Menú «La carrera»», que es como aparece en el menú.

**Pasos.**
1. Ve a **Páginas** → **¿Qué es la Bioingeniería?**.
2. Revisa el **Título** y escribe la **Bajada**.
3. En **Video (YouTube)**, pega el enlace del video. Solo se reconocen enlaces de YouTube.
4. En **Bloques destacados**, agrega un bloque por cada característica: **Título** y **Texto**. Si quieres un
   título sobre ellos, escríbelo en **Título de los bloques destacados** (p. ej. «Características de la carrera»).
5. Escribe el **Contenido** (el texto principal). Los enlaces del final (p. ej. «Conoce a los egresados/as» o
   «Facultad de Ciencias Biológicas») son enlaces dentro del texto: para cambiarlos, edita ese párrafo.
6. Marca **Publicado** y guarda.

**Cómo comprobar que quedó bien.** Abre `/p/bioingenieria` en el sitio, en el celular y en el
computador. Si hay video, se abre en una ventana al hacer clic.

**Errores típicos:**
- Pegar un enlace de otra plataforma de video: solo se reconoce YouTube, así que el video no se muestra.
- Dejar la **Bajada** vacía: es obligatoria.
- Un bloque destacado con el Texto vacío: ambos campos son obligatorios.
- Enlazar `/bioingenieria` desde otro lado: esa dirección ya no existe; usa `/p/bioingenieria`.

### 4.6 Seleccionar una publicación de Instagram

**Objetivo:** mostrar en el sitio una publicación o reel de la cuenta de la carrera.

**Campos.**
- Obligatorios: Descripción breve, Enlace de la publicación, Fecha, Publicado.
- Opcional: Miniatura (opcional).

**Pasos.**
1. En Instagram, abre la publicación o el reel y toca **Compartir** → **Copiar enlace**.
2. En el panel, ve a la colección **Instagram** y crea una entrada nueva.
3. Pega el enlace en **Enlace de la publicación**. Debe ser de una publicación (`/p/…`) o de un reel (`/reel/…`).
   Las historias y los perfiles no se aceptan.
4. Escribe la **Descripción breve**: es el texto de la tarjeta y lo leen los lectores de pantalla.
5. Escribe la **Fecha**.
6. Opcional: sube una **Miniatura** (una captura de la publicación) para la tarjeta liviana.
7. Activa **Publicado** y guarda.

> _Pantallazo pendiente: tarjeta de una publicación de Instagram en el sitio._

**Cómo comprobar que quedó bien.** La publicación aparece en la sección **Instagram** del sitio. Al abrirla, se
carga el embed oficial _(por verificar en el sitio: cuándo se carga el embed)_. Si el embed no carga, la tarjeta
sigue enlazando a la publicación en Instagram.

**Errores típicos:**
- Pegar el enlace de una historia o de un perfil: el campo lo rechaza.
- Olvidar la **Descripción breve**: es obligatoria.

### 4.7 Banners del Inicio

**Objetivo:** destacar algo en la portada (un evento, una convocatoria, una noticia).

**Campos.**
- Obligatorios: Título, Publicado, Imagen, Enlace, Inicio de vigencia, Fin de vigencia.
- Opcional: Texto.

**Cómo se elige qué se destaca.** Cada Banner que esté **publicado** y dentro de su **vigencia** se muestra como
una diapositiva del carrusel del Inicio. El código no tiene un límite de banners: si hay muchos vigentes, se
muestran todos. Para destacar pocas cosas, mantén pocos Banners vigentes _(por verificar en el sitio: cómo se
ve el carrusel con varios banners en el celular)_.

**Pasos.**
1. Ve a la colección **Banners** y crea una entrada nueva.
2. Escribe el **Título** y activa **Publicado** cuando esté listo.
3. Sube la **Imagen**.
4. Escribe el **Texto** (opcional).
5. En **Enlace**, escribe una ruta interna (p. ej. `/noticias/mi-noticia` o `/p/mi-pagina`) o una dirección
   completa externa (p. ej. `https://…`).
6. Escribe el **Inicio de vigencia** y el **Fin de vigencia** (fecha y hora, hora de Chile).
7. Guarda.

**Cómo comprobar que quedó bien.** El banner aparece en el Inicio durante su vigencia, y el enlace lleva a donde
corresponde. Antes del inicio y después del fin, no aparece.

**Vista previa en el panel.** Al editar un Banner, a la derecha del formulario aparece cómo se ve su diapositiva en el
Inicio, en escritorio y en un celular de 375 px. Es una aproximación: usa estilos propios y no el componente real, así
que el tamaño de la letra y el corte del texto pueden variar un poco. Debajo indica la **vigencia** («Borrador (no
publicado)», «Programado», «Visible ahora» o «Vencido») y muestra avisos breves: sin imagen, título de más de 56
caracteres (en el celular ocupa más de cuatro líneas y el slide crece), fin anterior al inicio, fechas que faltan, enlace vacío o que no
empieza con `/` ni con `https://`.

**Errores típicos:**
- Un **Fin de vigencia** anterior al **Inicio de vigencia**: el banner nunca se muestra.
- Un enlace externo sin `https://`: el enlace no lleva a ningún lado.
- Un banner vencido que sigue visible: la actualización de fechas es diaria y todavía no está activa (ver §2.2).

### 4.8 Directorio: altas y cambios de egresados/as

**Objetivo:** dar de alta o actualizar a un egresado o egresada en el Directorio, solo con su autorización.

**Enlace al formulario.** El botón «Suma tu perfil» (en la tarjeta del Inicio) y el botón «Sumar mi perfil» (en
`/directorio`) apuntan al Google Form que se configura en el panel: **Secciones del sitio** → «Formulario del Directorio
(Google Form)». Pega la dirección completa (que empiece con `https://`). Si lo dejas vacío, ninguno de los dos botones sale.

**Campos de la Persona.**
- Obligatorios: Nombre y apellido, Ficha pública activa (por defecto: sí).
- Opcionales: Descripción breve, Foto, SEO (opcional) (ver 4.15).
- Perfil de egresado (bloque opcional): Autoriza publicar su perfil (por defecto: no), Año de egreso
  (obligatorio dentro del perfil), Generación, Áreas, Organización, Cargo / profesión y Enlaces profesionales
  (cada uno con Etiqueta y URL).

**Autorización de datos.** La autorización se registra en el campo **Autoriza publicar su perfil**, dentro del
Perfil de egresado. El respaldo de esa autorización (correo, formulario) lo define la carrera _(por verificar)_.
La Ficha pública solo muestra el nombre, una descripción breve y los contenidos del sitio donde aparece. Los
datos de egresado aparecen **solo con autorización**.

**Pasos.**
1. Confirma que tienes la autorización de la persona. Sin ella, no marques **Autoriza publicar su perfil**.
2. Ve a **Personas**. Busca primero: si la persona ya existe, edita su entrada; no crees una nueva.
3. Escribe el **Nombre y apellido**. Opcional: escribe la **Descripción breve** y sube la **Foto**.
4. Abre **Perfil de egresado**. Marca **Autoriza publicar su perfil**.
5. Escribe el **Año de egreso**. La **Generación** es opcional; su significado todavía se confirma con la carrera.
6. Asigna **Áreas**, elige la **Organización** y escribe el **Cargo / profesión**.
7. En **Enlaces profesionales**, agrega cada enlace con su **Etiqueta** y su **URL** (con `https://`).
8. Guarda y revisa que la persona aparece en el **Directorio**.

> _Pantallazo pendiente: formulario de Persona con el Perfil de egresado desplegado._

**Cómo llegan los cambios de la comunidad.** Las altas, bajas y cambios llegan por un Google Form, al que se
llega desde la página de contacto. Antes de publicar un cambio, revisa la identidad de quien lo envía y que
tenga la autorización (checklist de §7).

**Pedidos de baja o fallecimiento.** Si alguien pide salir del Directorio, desactiva **Ficha pública activa**: la
persona sale del Directorio y su nombre queda sin enlace en los contenidos donde aparece. Las menciones en
Noticias o Actividades no se borran solas: revísalas caso a caso. En caso de fallecimiento, la decisión se toma
caso a caso; consulta antes de cambiar nada _(por verificar: política de la carrera)_.

**Cómo comprobar que quedó bien.** La persona aparece en el Directorio con su Ficha, y el buscador la encuentra
por nombre, generación, Área u Organización. Si la Ficha está desactivada, su nombre aparece sin enlace y no
aparece en el Directorio.

**Errores típicos:**
- Marcar **Autoriza publicar su perfil** sin tener la autorización.
- Crear dos veces la misma persona.
- Dejar el **Año de egreso** vacío dentro del perfil: ese campo es obligatorio cuando el perfil está lleno.
- Desactivar la Ficha y esperar que el nombre siga apareciendo con enlace.

### 4.9 Organizaciones

**Objetivo:** registrar una empresa, institución, laboratorio o agrupación para vincularla a otros contenidos.

**Cuándo crear una Organización.** Cuando aparece como lugar de trabajo de una Persona, como organizadora de una
Actividad, como oferente de un Anuncio o como mencionada en una Noticia. En los campos de vínculo solo se pueden
elegir Organizaciones que ya existen, así que no hay manera de escribir su nombre a mano.

**Campos.**
- Obligatorios: Nombre, Tipo (Empresa, Institución, Laboratorio o Agrupación), Ficha pública activa (por defecto:
  sí).
- Opcionales: Sitio web (con `https://`), Logo.

**Pasos.**
1. Ve a la colección **Organizaciones** y busca primero si ya existe.
2. Si no existe, crea una entrada nueva y escribe el **Nombre**.
3. Elige el **Tipo**.
4. Opcional: pega el **Sitio web** y sube el **Logo**.
5. Guarda.

**Cómo comprobar que quedó bien.** La organización aparece al elegirla en un Anuncio, una Actividad, una Noticia o
un Perfil de egresado, y su Ficha reúne esos vínculos.

**Errores típicos:**
- Crear una segunda entrada para la misma organización con otro nombre (p. ej. con y sin sigla).
- Olvidar el **Tipo**: es obligatorio.

### 4.10 Listas de Áreas y Temas

**Objetivo:** mantener las listas que clasifican el contenido: **Áreas** (campos profesionales) y **Temas**
(clasificación editorial).

**Quién las edita.** La propuesta es que la persona Encargada de comunicaciones las edite _(por confirmar con la
carrera)_.

**Pasos para agregar una entrada.**
1. Ve a la colección **Áreas** o **Temas** y crea una entrada nueva.
2. Escribe el **Nombre**.
3. Guarda. Aparece al elegirla en los campos correspondientes.

**Por qué conviene mantenerlas cortas.** Cada entrada es una opción más para elegir y para cruzar contenidos. Con
pocas entradas bien elegidas, el buscador y los filtros funcionan mejor. Si dos entradas significan lo mismo,
conserva una y reasigna el contenido.

**Cómo comprobar que quedó bien.** La nueva entrada aparece en el campo correspondiente de otra colección.

**Errores típicos:**
- Crear una entrada que ya existe con otra escritura (p. ej. «Acuicultura» y «acuicultura»).
- Confundir una Área con un Tema: revisa §3.
- Borrar una entrada que está en uso: los contenidos que la usaban quedan con una referencia rota, y el build
  muestra un aviso (ver §8).

### 4.11 Editar las secciones destacadas del Inicio

**Objetivo:** cambiar los bloques con foto que aparecen al final de la portada, agregar otros o ocultarlos. El
Directorio y el Repositorio ya no van aquí: tienen su propia banda (ver más abajo).

**Campos** (en **Inicio**, dentro de **Archivos**; lista **Secciones destacadas**):
- **Título**, **Texto** y **Texto del botón**.
- **Enlace del botón**: una ruta interna que empieza con `/` (p. ej. `/directorio`) o una dirección completa que
  empieza con `https://`.
- **Imagen de fondo**: foto horizontal. Se oscurece para que el texto se lea.
- **Texto alternativo de la imagen** (opcional): déjalo vacío si la imagen es solo decorativa.
- **Publicado**: desmárcalo para ocultar la sección sin borrarla.

**Pasos.**
1. Abre **Inicio** en **Archivos**.
2. Para cambiar una sección, despliégala y edita sus campos. Para agregar otra, usa el botón de agregar de la lista.
3. El orden de la lista es el orden en la portada: reordénalas en la lista según corresponda.
4. Guarda.

**Cómo comprobar que quedó bien.** En la portada, al final, aparecen las secciones publicadas en el orden de la
lista. El botón lleva a donde corresponde.

**Errores típicos:**
- Un enlace que no empieza con `/` ni con `https://`: el panel no deja guardarlo.
- Una sección sin imagen de fondo: el sitio no se construye. Sube siempre una imagen.

#### La banda «Comunidad y documentos»

**Objetivo:** cambiar los textos de las tarjetas del Directorio y del Repositorio en la portada, o agregarles una foto.
Las cifras y los documentos no se escriben a mano: se calculan solos.

**Campos** (en **Inicio**, dentro de **Archivos**; sección **Comunidad y documentos**):
- **Título de la banda**: el encabezado que va sobre las tarjetas.
- **Tarjeta del Directorio** y **Tarjeta del Repositorio**, cada una con: **Título**, **Texto**, **Texto del botón**,
  **Foto** (opcional, pequeña y horizontal) y **Texto alternativo de la foto** (déjalo vacío si la foto es solo
  decorativa).

**Qué sale solo:**
- En el Directorio: cantidad de egresados/as con perfil autorizado, generaciones distintas y organizaciones distintas.
  Una cifra en cero no se muestra.
- En el Repositorio: los 4 documentos publicados más recientes (por año y, dentro del año, por título).
- Un buscador por nombre en el Directorio: lo que se escribe lleva al Directorio con la lista ya filtrada.

**Pasos.**
1. Abre **Inicio** en **Archivos** y ve a **Comunidad y documentos**.
2. Edita los textos de cada tarjeta o sube una foto.
3. Guarda.

**Cómo comprobar que quedó bien.** En la portada, la banda aparece después de las Páginas destacadas. Escribe un
nombre en el buscador del Directorio y pulsa «Buscar»: debe abrir el Directorio con esa búsqueda.

**Errores típicos:**
- Apagaste el Directorio o el Repositorio en **Secciones del sitio**: su tarjeta no sale. Si apagas los dos, no sale
  la banda. El contenido no se borra.
- La tarjeta del Repositorio no muestra documentos: no hay documentos publicados. Publica uno desde el Repositorio (4.4).

### 4.12 Crear una página

**Objetivo:** publicar un texto propio (becas, normas, preguntas frecuentes, historia de la carrera) con su
dirección en el sitio, y decidir si aparece en un menú, en el pie o solo se llega desde un Banner.

**Campos** (colección **Páginas**):
- **Título** y **Bajada** (obligatoria): la bajada va bajo el título, en buscadores y en el menú.
- **Publicado**: mientras esté desmarcado, la página no tiene dirección (da 404).
- **Imagen destacada** y **Texto alternativo** (opcional): describe lo que se ve, sin repetir el título.
- **Mostrar en**: cuál de estas opciones usar:
  - *Ninguno*: la página existe, pero solo se llega por un enlace (p. ej. desde un Banner).
  - *Pie de página*: aparece en la lista de enlaces del pie.
  - *Menú «La carrera»*: aparece en ese desplegable del menú (y en el menú del celular), y también en el pie.
  - *Menú «Comunidad»*: igual, en ese desplegable.
- **Contenido**: el texto de la página.
- **Video (YouTube)** (opcional): se muestra debajo de la bajada, en una ventana al hacer clic. Solo se reconocen
  enlaces de YouTube.
- **Enlaces** (opcional, hasta 6): botones bajo la bajada, cada uno con su Etiqueta y su Dirección (ver §4.1).
- **Título de los bloques destacados** y **Bloques destacados** (opcionales): una franja oscura después del
  contenido, con un bloque por cada punto (Título y Texto). Si no escribes el título de los bloques, la franja no
  lleva título.
- **Contenido incrustado** (opcional): enlaces de Spotify, SoundCloud, mapas y otros servicios, que se muestran después del contenido (ver §4.1).
- **Destacar en el Inicio** (opcional): muestra la página como un bloque entre el carrusel de Banners y las Noticias.
  Solo una página puede estar destacada a la vez: si marcas dos, el sitio muestra la primera por título y el build
  deja un aviso. Es distinto de los **Banners** (el carrusel de arriba, con fecha de inicio y fin) y de las
  **Secciones destacadas** (los bloques con imagen al final del Inicio).
- **Resumen para el Inicio** (opcional): 3 o 4 líneas para el bloque del Inicio. Si lo dejas vacío, se usa la bajada.

Con video o bloques, la página se ve como **¿Qué es la Bioingeniería?**; sin ninguno, como una columna de texto.

**Pasos.**
1. Abre **Páginas** en el panel y crea una entrada nueva.
2. Escribe el **Título**. El panel genera la dirección a partir de él: `/p/` seguido del título en minúsculas
   y con guiones. Revísala antes de enlazar la página.
3. Escribe la **Bajada** (una o dos líneas).
4. Sube una **Imagen destacada** si la necesitas, y completa su texto alternativo.
5. Elige **Mostrar en**.
6. Escribe el **Contenido**.
7. Marca **Publicado** cuando esté lista y guarda.
8. Si la página es de *Ninguno*, enlázala desde un Banner: en **Enlace**, escribe `/p/<la-dirección>`.

**Cómo comprobar que quedó bien.** Abre `/p/<la-dirección>` y revisa el título, la bajada, la imagen y el
texto. Si elegiste un menú, la página aparece en el desplegable, con su bajada como descripción. Si elegiste el pie,
aparece en la lista del pie. Si elegiste *Ninguno*, no aparece en ningún menú, pero el Banner lleva a ella.

**Errores típicos:**
- Dejar **Publicado** desmarcado: la página da 404 aunque esté guardada.
- Cambiar la dirección de una página que ya está enlazada (desde un Banner o desde otra página): el enlace queda roto
  y el sitio no avisa. Revisa los Banners antes de cambiar una dirección o despublicar una página.
- Esperar que el cambio aparezca al instante: los cambios se publican en uno o dos minutos después de guardar.

### 4.13 Activar o desactivar secciones

Sirve para quitar temporalmente una sección (por ejemplo, Anuncios fuera de temporada) sin borrar nada.

**Pasos.**
1. Abre **Secciones del sitio** en el panel (está en **Archivos**, al final de la lista).
2. Desmarca la casilla de cada sección que quieras quitar. Las que dejes marcadas siguen visibles. Para Noticias y Agenda la casilla dice «Mostrar… en el menú»; para las demás, «Sección… activa».
3. Guarda.

**Qué cambia.** Para **Noticias** y **Agenda**, la sección sale del menú (escritorio y móvil) y del pie; su página sigue existiendo. Para **Instagram**, **Directorio**, **Anuncios** y **Repositorio** («Sección … activa»), al desactivarla deja de publicarse: sale del menú, del pie, del Inicio y del buscador, y su dirección da error 404. En el Directorio, el anuario en PDF también deja de publicarse. Los enlaces que apunten a esa sección (desde un Banner, una página o una noticia) se muestran como texto sin enlace. Nada se borra: al volver a activarla, todo reaparece. Si ocultas todas las secciones de un desplegable, el desplegable desaparece. **Inicio** no se puede ocultar.

**Cómo comprobar que quedó bien.** Recarga el sitio: la sección ya no aparece en el menú ni en el pie. Si la desactivaste del todo, su dirección (por ejemplo `/anuncios/`) ya da error 404. Los cambios se publican en uno o dos minutos después de guardar.

### 4.14 Redes sociales del pie

Sirve para mostrar en el pie del sitio los perfiles de la comunidad: cada red que tenga una dirección aparece con su
logo. Las que dejes vacías no aparecen.

**Pasos.**
1. Abre **Redes sociales** en el panel (está en **Archivos**, al final de la lista).
2. En el campo de cada red, pega la dirección completa del perfil, que empiece con `https://`. Por ejemplo:
   `https://www.instagram.com/tu_cuenta`, o para Mastodon `https://mastodon.social/@bioing`.
3. Para quitar una red, borra su dirección y deja el campo vacío.
4. Guarda.

**Qué cambia.** El pie muestra un ícono por cada red con dirección, en el orden fijo: Instagram, Facebook, X, LinkedIn,
YouTube, TikTok, Threads, Bluesky y Mastodon / Fediverso. La página **Instagram** usa la dirección de Instagram para su
botón «Seguir en Instagram»; si la dejas vacía, el botón no aparece. Las redes también quedan en los datos del sitio
que leen los buscadores.

**Cómo comprobar que quedó bien.** Recarga el sitio y mira el pie: cada ícono debe llevar al perfil correcto (se abre en
una ventana nueva). Los cambios se publican en uno o dos minutos después de guardar.

> Si la red que quieres no está en la lista, avisa al equipo de desarrollo: agregar una red nueva exige un cambio en el
> código, no solo en el panel.

### 4.15 Cómo aparece el sitio en Google y al compartirlo (SEO)

Sirve para controlar el texto que ve quien busca la carrera en Google y el que aparece al compartir un enlace en
WhatsApp, Facebook o LinkedIn. Casi nunca hace falta tocar nada: si los campos quedan vacíos, el sitio usa el título,
la bajada y la imagen de cada página.

**Dos lugares:**
- **SEO del sitio** (en **Archivos**): valores generales de todo el sitio.
- **SEO (opcional)**: un bloque plegado dentro de Noticias, Actividades, Anuncios, Documentos, Páginas y
  Personas. Solo afecta a esa ficha.

**SEO del sitio: qué es cada campo.**
- **Descripción del sitio**: una o dos frases sobre la carrera. Aparece en Google y al compartir el sitio. Máximo 160
  caracteres.
- **Imagen para compartir por defecto**: la imagen que sale al compartir una página que no trae la suya. Horizontal,
  1200 × 630 px.
- **Descripción de cada listado**: el texto que Google muestra para Noticias, Agenda, Anuncios, Repositorio,
  Directorio, Instagram y el Inicio. Déjalo vacío para usar el texto por defecto.
- **Imagen para compartir** (dentro de cada listado): la imagen que sale al compartir esa página en redes. Si la dejas
  vacía, se usa la imagen por defecto del sitio.
- **Verificación de buscadores**: si Google Search Console o Bing Webmaster te pide confirmar el sitio, pega aquí solo el
  código (el valor de `content="…"`), no la etiqueta completa.

**SEO (opcional) de cada contenido: qué es cada campo.**
- **Título para buscadores y redes**: reemplaza el título en Google y en las redes (máximo 60 caracteres). No escribas
  «· BIOING+»: se agrega solo.
- **Descripción para buscadores y redes**: el texto que aparece bajo el título en Google (máximo 160 caracteres).
- **Imagen para compartir**: la imagen que sale al compartir esa página. Si la dejas vacía, se usa la imagen de la
  página o, si no tiene, la del sitio.
- **No mostrar en buscadores**: marca esta casilla solo si no quieres que Google indexe esa página. La página sigue
  publicada y enlazada en el sitio, pero sale del mapa del sitio y del buscador del sitio.

**Pasos.**
1. Abre **SEO del sitio** (en **Archivos**), o abre el contenido que quieres ajustar.
2. Despliega **SEO (opcional)** y completa solo los campos que necesites.
3. Guarda.

**Cómo comprobar que quedó bien.** Los cambios se publican en uno o dos minutos. Para ver el texto que muestra el
sitio, abre la página y mira la pestaña del navegador (el título). Google puede tardar días o semanas en reflejar un
cambio de descripción.

> Un título o una descripción demasiado largos se cortan en Google. Por eso los campos tienen límite de caracteres.

**Vista previa en el panel.** Al editar Noticias, Actividades, Anuncios, Documentos, Páginas o Personas, a la
derecha del formulario aparece la vista previa. Va en este orden:
- **Así se ve el contenido**: primero, una vista simple del título, la bajada, la imagen y el cuerpo de la entrada. En
  una Persona muestra su nombre, su descripción breve y su foto (no tiene cuerpo).
- **Resultado de Google**: el título (con «· BIOING+», cortado a unos 60 caracteres), la dirección de la página y la
  descripción (cortada a unos 160). Es una aproximación de cómo se ve en Google, no la de Google exacta.
- **Al compartir en redes**: la imagen, el título y la descripción de la tarjeta. Si la entrada no tiene imagen, se
  muestra la imagen por defecto del sitio.
- **Antes de publicar**: avisos breves. «Sin descripción propia» indica que se usa la descripción general del sitio.
  «Título largo» indica que Google lo cortará. «Marcada como “No mostrar en buscadores”» confirma la casilla.

La vista previa sigue el tema que tengas en el panel (claro u oscuro, o el del sistema si el panel sigue al sistema).
Si cambias el tema en Ajustes, la vista previa cambia sin recargar.

**Límites de la vista previa.** No muestra el texto exacto de cada buscador ni cómo se ve en el móvil. La descripción
general del sitio no se lee desde el panel, así que el aviso «Sin descripción propia» no sabe cuál es. En Actividades,
la descripción se arma con el tipo y la fecha, igual que en el sitio; si falta el tipo o la fecha, el aviso aparece
hasta completarlos.

**Analítica de visitas (opcional).** En **SEO del sitio**, el grupo **Analítica (opcional)** recibe el token de
Cloudflare Web Analytics: pega solo el token que aparece en el código «manual snippet» que entrega Cloudflare. Cloudflare
mide las visitas sin cookies ni banner. Para verlas, entra al panel de Cloudflare de la carrera, en *Analytics & Logs →
Web Analytics*. Si la carrera activa la analítica desde el panel de Cloudflare (sitio proxied), deja este campo vacío para
no contar dos veces. Sin token, el sitio no mide nada.

### 4.16 Imagen e ícono de los listados y del bloque del Directorio

Sirve para dar identidad visual a Noticias, Agenda, Anuncios, Repositorio, Directorio e Instagram, y al bloque «¿Eres
egresado/a y no apareces?» de `/directorio`. Todo es opcional: si los campos quedan vacíos, la página se ve como siempre.

**Dónde.**
- **Encabezados de los listados** (en **Archivos**): un bloque por listado, con **Imagen de cabecera**, **Texto
  alternativo de la imagen** y **Ícono junto al título**.
- **Secciones del sitio** (en **Archivos**): **Imagen del bloque «¿Eres egresado/a?»**, su texto alternativo y el
  **Ícono del bloque**.

**Cómo queda.**
- La imagen va arriba de la página, ancha y baja, con el título debajo. Conviene una foto horizontal de unos 1600 × 700 px.
- El ícono va a la izquierda del título. Se elige de una lista de dibujos (p. ej. Periódico, Calendario, Libros, Matraz).
  Si eliges un ícono que no está en la lista, no sale ninguno.
- El texto alternativo describe lo que se ve en la foto (para quien usa lector de pantalla). Si la imagen es solo
  decorativa, déjalo vacío.

**Pasos.**
1. Abre **Encabezados de los listados** (en **Archivos**) o, para el bloque del Directorio, **Secciones del sitio**.
2. Despliega el listado que quieres cambiar, sube la imagen, escribe el texto alternativo y elige el ícono.
3. Guarda. El cambio se publica en uno o dos minutos.

**Cómo comprobar que quedó bien.** Abre la página del listado y revisa el encabezado en el computador y en el celular.
La imagen para compartir en redes se ajusta en **SEO del sitio** (sección 4.15).

## 5. Imágenes y archivos

- **Qué se puede subir.** Imágenes de mapa de bits (JPG, PNG y similares). Las fotos de iPhone en HEIC se
  convierten solas. Se evitan las capturas de pantalla ilegibles y las fotos de personas sin su permiso.
- **Qué hace el panel al subir una imagen.** Reduce el ancho a 2048 px como máximo, la convierte a WebP con calidad
  85 y la optimiza para el sitio. El borrado de los metadatos (incluida la ubicación GPS) _(por verificar en el
  panel)_.
- **Tamaño y orientación recomendados.** _(por verificar en el panel y en el sitio: cómo se ve cada imagen en las
  tarjetas)_.
- **Texto alternativo.** En la Imagen destacada de una Noticia, el texto alternativo describe la imagen para
  quien usa lector de pantalla. Si la Noticia no tiene texto alternativo, la imagen se trata como decorativa: el
  lector la omite. En la Galería, el texto alternativo es obligatorio para cada imagen.
- **Imágenes dentro del texto.** Con el botón de imagen del editor del **Cuerpo** puedes insertar una imagen. Se
  optimiza igual que las demás. _(por verificar en el panel: el campo de texto alternativo que pide el editor)_.
- **Emojis.** Se escriben o se pegan directamente en el texto (🧬 🔬 🌊 se ven bien).
- **Enlaces.** Usa un texto descriptivo: «Ver las bases», no «clic aquí».
- **Listas, citas y tablas.** Se pueden usar en el **Cuerpo**. Las tablas, simples.
- **Qué no se puede** dentro del texto: pegar HTML, iframes o PDFs. Por seguridad, el sitio **borra al publicar**
  cualquier HTML que se pegue en el Cuerpo (no da error: simplemente no aparece). Para mapas, audio o videos de
  otros servicios usa **Contenido incrustado**, que va al final del texto de la Noticia o la Actividad, no dentro de él.
- **Direcciones de enlaces.** Los campos de enlace aceptan direcciones que empiezan con `https://` (o `http://`) y, donde
  se indica, rutas del sitio que empiezan con `/` (p. ej. `/agenda`). El panel avisa si el formato no sirve; si aun así
  se guarda uno inválido, la publicación se detiene y el sitio sigue mostrando la versión anterior hasta corregirlo.
- **Documentos.** Hoy los Documentos se enlazan desde Google Drive (campo **Enlace al archivo (Drive)**). La
  subida de archivos al servidor (R2) no está en el panel; ver [`pendientes-infra.md`](pendientes-infra.md).

## 6. Buenas prácticas de redacción

- **Título y bajada**: de ahí salen el título de la pestaña del navegador, la tarjeta que se muestra al
  compartir el enlace (Open Graph) y los datos estructurados que usan buscadores y asistentes de IA. Escríbelos
  para que se entiendan solos.
- **Imagen destacada**: es la primera impresión de la tarjeta de la noticia.
- **Temas y Áreas**: clasifican y permiten encontrar el contenido. No son etiquetas decorativas.
- **Fechas**: las que se escriben solo con día se muestran tal cual. Las que llevan hora se muestran en hora de
  Chile.
- **Enlaces**: texto descriptivo («Ver las bases»), no «clic aquí».
- **Nombres propios**: busca primero si la Persona u Organización ya existe, para no duplicarla.

## 7. Checklist antes de publicar

- [ ] Título, bajada e imagen revisados.
- [ ] Temas y Áreas asignados.
- [ ] Personas y Organizaciones vinculadas (o creadas).
- [ ] Fecha correcta (y fecha límite, si es un Anuncio).
- [ ] Enlaces probados y abiertos en una pestaña nueva.
- [ ] Datos personales: autorización verificada (si va al Directorio).
- [ ] Interruptor **Publicado** activado.
- [ ] Revisado en el celular, no solo en el computador.

## 8. Problemas comunes y qué hacer

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Publiqué y no lo veo en el sitio | Quedó en borrador, o el despliegue todavía no se hizo (ver la fila siguiente) | Revisar `Publicado`; si está activado, seguir con «Guardé y el sitio no cambió» |
| Guardé y el sitio no cambió | En la vista previa, el despliegue lo hace la persona técnica a mano; el despliegue automático todavía no está conectado. También puede ser que el build falló | Esperar unos minutos y recargar. Si sigue igual, avisar a soporte con el nombre del contenido |
| Error de imagen al publicar | La imagen se escribió con una ruta a mano, en vez de subirse desde el panel | Subir la imagen desde el panel; no escribir rutas a mano. Si ya escribiste una, avisar a soporte |
| Una Noticia con fecha futura no aparece | Es el comportamiento previsto | Nada: aparece ese día |
| Un Anuncio vencido sigue visible | La actualización de fechas es diaria y todavía no está activa | Avisar a soporte si persiste; hasta entonces, es esperable |
| El nombre de una Persona «no enlaza» | Su Ficha está desactivada | Revisar `Ficha pública activa` en la Persona |
| Falta un contenido o aparece un aviso de error en el build | Alguna referencia quedó apuntando a algo que se borró | Avisar a soporte con el detalle (el sitio no se cae) |
| La vista previa de un PDF/Documento no carga | Permisos de Drive | Compartir como «Cualquiera con el enlace» |
| El embed de Instagram no aparece | Bloqueador del navegador o cambio de Meta | La tarjeta sigue enlazando a la publicación |

## 9. Qué no se puede hacer (y por qué)

- Pegar HTML, iframes o scripts: solo enlaces de proveedores de la lista cerrada (YouTube, Google Drive e
  Instagram, según el campo).
- Cambiar el diseño, agregar secciones o campos nuevos: es un cambio de alcance (se cotiza).
- Publicar datos personales sin autorización.
- Gestionar cuentas, accesos o facturación del servicio.

## 10. Glosario mínimo

| Término | Qué es |
|---|---|
| Noticia | Publicación de actualidad de la comunidad, con fecha y clasificaciones |
| Actividad | Evento con fecha, modalidad y organizadores; aparece en la Agenda |
| Anuncio | Oportunidad para la comunidad (trabajo, práctica, pasantía…), con fecha límite opcional |
| Documento | Archivo de interés (decreto, reglamento, informe…) que aparece en el Repositorio |
| Persona | Integrante de la comunidad que puede aparecer en otros contenidos |
| Organización | Empresa, institución, laboratorio o agrupación |
| Ficha | Página pública de una Persona u Organización con sus vínculos |
| Directorio | Buscador público de egresados/as con autorización y Ficha activa |
| Área | Campo profesional de la Bioingeniería |
| Tema | Clasificación editorial de Noticias y Documentos |
| Banner | Pieza de portada con vigencia que enlaza a un contenido o a una URL externa |
| Publicación de Instagram | Publicación o reel de la cuenta de la carrera que se muestra en el sitio |
| Borrador | Contenido que todavía no es visible en el sitio |
| Publicado | Contenido visible en el sitio |

Los términos completos están en [`context.md`](context.md).

## 11. ¿A quién pedir ayuda?

- **Canal de soporte:** _(por definir con la carrera)_. La garantía y el soporte cubren seis meses desde la entrega
  (propuesta de desarrollo, §15).
- **Qué se considera una falla:** lo que impide publicar, editar o ver el contenido, o que rompe el sitio público.
  Un cambio de diseño o una función nueva no es una falla. _(por confirmar en el contrato)_.
- **Tiempos de respuesta:** _(por definir con la carrera)_.
- **Qué información adjuntar al reportar:** la dirección de la página, el nombre del contenido, qué esperabas ver
  y qué viste, y una captura de pantalla.
- **Cómo pedir la reversión de un cambio publicado por error:** indica el nombre del contenido, la hora aproximada
  en que lo guardaste y qué quieres recuperar. La reversión la hace soporte.

---

## Apéndice A · Campos de cada tipo de contenido

> Generada a mano desde `config.yml` el 2026-10-11; revisar si cambia el modelo.
>
> **Obligatorio:** «Sí» si el campo no tiene `required: false` en `config.yml`. Los campos con «por defecto»
> traen un valor inicial. Los campos marcados «↳» están dentro de un bloque o de una lista.

### Personas

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Nombre y apellido | Sí | Nombre que aparece en la Ficha y en los contenidos donde se menciona |
| Descripción breve | No | Línea corta bajo el nombre (p. ej. «Académica FCB») |
| Foto | No | Imagen de la Ficha |
| Ficha pública activa | Sí (por defecto: sí) | Si se desactiva, el nombre queda sin enlace y la persona sale del Directorio |
| Perfil de egresado | No | Bloque de datos profesionales; solo se publica con autorización |
| ↳ Autoriza publicar su perfil | Sí dentro del perfil (por defecto: no) | Condición para aparecer en el Directorio |
| ↳ Generación | No | Generación (significado por confirmar con la carrera) |
| ↳ Año de egreso | Sí dentro del perfil | Año de egreso |
| ↳ Áreas | No | Campos profesionales de la persona |
| ↳ Organización | No | Organización donde trabaja |
| ↳ Cargo / profesión | No | Cargo o profesión |
| ↳ Enlaces profesionales | No | Lista de enlaces; cada uno con Etiqueta y URL |
| SEO (opcional) | No | Título, descripción e imagen para buscadores y redes, y «No mostrar en buscadores» (ver 4.15). Si está vacío, se usan el nombre, la descripción breve y la foto |

### Organizaciones

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Nombre | Sí | Nombre que aparece en la Ficha y en los vínculos |
| Tipo | Sí | Empresa, Institución, Laboratorio o Agrupación |
| Sitio web | No | Enlace a la web de la organización |
| Logo | No | Imagen de la Ficha |
| Ficha pública activa | Sí (por defecto: sí) | Si se desactiva, el nombre queda sin enlace |

### Noticias

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Título | Sí | Título de la noticia y de la pestaña del navegador |
| Fecha de publicación | Sí | Fecha desde la que la noticia es visible |
| Publicado | Sí (por defecto: no) | Hace visible la noticia |
| Imagen destacada | No | Imagen de la tarjeta y de la noticia |
| Texto alternativo de la imagen | No | Describe la imagen para lectores de pantalla |
| Bajada | No | Texto breve que acompaña el título |
| Etiquetas (tags) | No | Texto libre para etiquetar la noticia (no reemplaza a los Temas) |
| Temas | No | Clasificación editorial |
| Áreas | No | Campos profesionales |
| Personas mencionadas | No | Personas que aparecen en la noticia (se muestra en su Ficha) |
| Organizaciones mencionadas | No | Organizaciones que aparecen en la noticia (se muestra en su Ficha) |
| Actividad que cubre | No | Actividad realizada que relata la noticia (Cobertura) |
| Publicación de Instagram relacionada | No | Publicación de Instagram vinculada a la noticia |
| Video (YouTube) | No | Video que se muestra debajo del cuerpo |
| Enlaces | No | Hasta 6 botones bajo el título: Etiqueta y Dirección |
| Galería de imágenes | No | Hasta 12 imágenes en una grilla que se amplía al hacer clic |
| ↳ Imagen | Sí dentro de cada entrada | Imagen de la galería |
| ↳ Texto alternativo | Sí dentro de cada entrada | Describe la imagen de la galería |
| Contenido incrustado | No | Hasta 10 enlaces que se muestran después del cuerpo, como reproductor o tarjeta |
| ↳ Enlace | Sí dentro de cada entrada | Dirección pública (`https://`) |
| ↳ Título | No dentro de cada entrada | Describe el contenido para lectores de pantalla |
| Cuerpo | Sí | Texto principal de la noticia |

### Agenda (colección de Actividades)

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Nombre de la actividad | Sí | Título de la actividad |
| Publicado | Sí (por defecto: no) | Hace visible la actividad |
| Tipo | Sí | Seminario, Charla, Congreso, Taller, etc. |
| Inicio | Sí | Fecha y hora de inicio (hora de Chile) |
| Término | No | Fecha y hora de término, si dura varios días o tiene un cierre |
| Modalidad | Sí | Presencial, En línea o Híbrida |
| Lugar | No | Dirección o sala, si aplica |
| Organizadores | Sí (al menos uno) | Personas u Organizaciones responsables |
| Expositores | No | Personas que presentan, dictan o modera |
| Áreas | No | Campos profesionales |
| Enlace de inscripción o información | No | Enlace externo para inscribirse o informarse; es el botón principal |
| Enlaces | No | Hasta 6 botones a su lado: Etiqueta y Dirección |
| Imagen | No | Imagen de la actividad |
| Contenido incrustado | No | Hasta 10 enlaces que se muestran después de la descripción |
| Descripción | Sí | Texto principal de la actividad |

### Anuncios

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Título | Sí | Título del anuncio |
| Publicado | Sí (por defecto: no) | Hace visible el anuncio |
| Tipo de oportunidad | Sí | Oferta de trabajo, Práctica profesional, Pasantía, etc. |
| Oferente | Sí | Persona u Organización que ofrece la oportunidad |
| Áreas | No | Campos profesionales |
| Fecha de publicación | Sí | Fecha desde la que el anuncio existe |
| Fecha límite | No | Último día vigente; sin ella, vence 60 días después de la fecha de publicación |
| Contacto | Sí | Correo, teléfono o enlace (texto libre) |
| Enlace externo | No | Sitio o formulario externo |
| Descripción | Sí | Texto principal del anuncio |

### Repositorio (colección de Documentos)

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Título | Sí | Título del documento |
| Publicado | Sí (por defecto: no) | Hace visible el documento |
| Tipo de documento | Sí | Decreto, Reglamento, Ley, Informe, etc. |
| Año | Sí | Año del documento |
| Enlace al archivo (Drive) | Sí | Enlace al archivo en Google Drive |
| Descripción | No | Resumen del documento |
| Temas | No | Clasificación editorial |
| Áreas | No | Campos profesionales |
| Palabras clave | No | Términos para encontrar el documento |

### Banners

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Título | Sí | Título del banner |
| Publicado | Sí (por defecto: no) | Hace visible el banner |
| Texto | No | Texto que acompaña la imagen |
| Imagen | Sí | Imagen de la diapositiva |
| Enlace | Sí | Ruta interna (`/noticias/…` o `/p/…`) o URL externa |
| Inicio de vigencia | Sí | Desde cuándo se muestra |
| Fin de vigencia | Sí | Hasta cuándo se muestra |

### Páginas

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Título | Sí | Título de la página; la dirección `/p/…` sale de él |
| Publicado | Sí (por defecto: no) | Sin publicar, la página da 404 |
| Bajada | Sí | Resumen bajo el título, en buscadores y en el menú |
| Imagen destacada | No | Imagen sobre el texto |
| Texto alternativo de la imagen | No | Descripción para lectores de pantalla |
| Mostrar en | Sí (por defecto: Ninguno) | Ninguno, Pie de página, Menú «La carrera» o Menú «Comunidad» |
| Video (YouTube) | No | Video que se abre en una ventana, debajo de la bajada |
| Enlaces | No | Hasta 6 botones bajo la bajada: Etiqueta y Dirección |
| Título de los bloques destacados | No | Título sobre la franja de bloques; vacío, la franja no lleva título |
| Bloques destacados | No | Franja oscura después del contenido, en dos columnas |
| ↳ Título | Sí dentro de cada bloque | Título del bloque |
| ↳ Texto | Sí dentro de cada bloque | Texto del bloque |
| Contenido | No | El texto de la página |

Con video o bloques destacados, la página usa el diseño de **¿Qué es la Bioingeniería?**: cabecera ancha, texto
sobre fondo gris y, si hay bloques, la franja oscura. Sin ninguno, es una columna de texto.

### Instagram (Publicaciones de Instagram)

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Descripción breve | Sí | Texto de la tarjeta y para lectores de pantalla |
| Enlace de la publicación | Sí | Enlace de una publicación (`/p/…`) o reel (`/reel/…`) |
| Fecha | Sí | Fecha de la publicación |
| Publicado | Sí (por defecto: no) | Hace visible la publicación |
| Miniatura (opcional) | No | Captura para la tarjeta liviana |

### Áreas y Temas

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Nombre | Sí | Nombre de la entrada en la lista (Áreas o Temas) |

### Redes sociales

| Campo (label) | Obligatorio | Para qué sirve |
|---|---|---|
| Instagram, Facebook, X (Twitter), LinkedIn, YouTube, TikTok, Threads, Bluesky, Mastodon / Fediverso | No | Dirección completa del perfil (`https://…`). Vacío = la red no aparece en el pie |

### SEO

- **SEO del sitio** (en **Archivos**): descripción del sitio, imagen por defecto, descripción de cada listado y códigos de
  verificación de buscadores. Todo opcional.
- **SEO (opcional)** (Noticias, Actividades, Anuncios, Documentos, Páginas y Personas): título y descripción para
  buscadores y redes (máx. 60 y 160 caracteres), imagen para compartir y «No mostrar en buscadores».

Detalle en la sección 4.15.

## Apéndice B · Preguntas frecuentes

- _Pendiente:_ recopilar durante la capacitación (dudas reales del Encargado/a).
