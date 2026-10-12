# Preguntas abiertas para reunión con BIOING+

Preguntas que conviene resolver con el equipo BIOING+ antes de cerrar el modelo de datos del sitio. Junto a cada pregunta va una **propuesta por defecto**: es lo que haremos si no hay otra indicación.

---

## 1. Personas y Directorio de egresados

**1.1 ¿Qué significa "generación"?**
¿Es el año de ingreso a la carrera (cohorte) o el año de egreso? La propuesta pide ambos campos.
_Propuesta:_ Generación = año de ingreso; Año de egreso = año de titulación. Se guardan los dos.

**1.2 ¿Quién aparece en el Directorio?**
¿Solo titulados/as? ¿También quienes terminaron la carrera pero aún no se titulan? ¿Y quienes no terminaron la carrera?
_Propuesta:_ Solo titulados/as de Bioingeniería UdeC.

**1.3 ¿Existe hoy un listado de egresados/as?**
¿En qué formato está (Excel, Google Sheets, papel)? ¿Cuántas personas incluye aproximadamente? ¿Quién lo mantiene?
_Propuesta:_ Importar el listado existente como carga inicial.

**1.4 ¿Cómo se obtiene la autorización para publicar datos personales?**
¿Qué datos se muestran públicamente y cuáles quedan solo para uso interno? ¿Se publica el correo o el teléfono?
_Propuesta:_ Nadie aparece sin autorización explícita. Se publican nombre, generación, área, organización, cargo y enlaces profesionales. El correo y el teléfono no se publican.

**1.5 ¿Cómo funciona el Google Form para agregar, modificar o quitar información?**
¿Los cambios se publican automáticamente o los revisa la persona encargada? ¿Cómo se verifica que quien pide un cambio es la misma persona?
_Propuesta:_ Todo cambio pasa por revisión de la persona encargada antes de publicarse.

**1.6 ¿Cuáles son las Áreas de la Bioingeniería?**
El "área de desempeño" será una lista cerrada que se usa también para clasificar noticias, actividades, anuncios y documentos, y así poder cruzarlos (p. ej. biotecnología, acuicultura, industria alimentaria, salud, medio ambiente…). ¿Qué áreas debería tener?
_Propuesta:_ La persona encargada puede editar la lista.

**1.7 ¿Se guarda la trayectoria laboral o solo el cargo actual?**
Una persona cambia de organización y de cargo con los años.
_Propuesta:_ Solo el cargo y la organización actuales.

**1.8 Anuario de egresados/as en PDF**
¿Qué contiene cada ficha? ¿Cómo se ordena (por generación, alfabéticamente)? ¿Cada cuánto se genera? ¿Es público o de distribución restringida?
_Propuesta:_ Un PDF anual, ordenado por generación, con los mismos datos que muestra el Directorio público.

**1.9 ¿Están de acuerdo con que las personas mencionadas en el sitio tengan una ficha pública?**
Puede tener ficha cualquier persona que aparezca en noticias o actividades (estudiantes, académicos/as, invitados/as). La ficha muestra solo el nombre, una descripción breve y los contenidos del sitio donde aparece. Los datos de egresado aparecen solo con autorización. Todas las personas tienen ficha por defecto, y se puede desactivar para cada una.

**1.10 ¿Qué pasa si alguien pide ser eliminado/a o fallece?**
_Propuesta:_ Si alguien pide salir, se quita del Directorio y de las fichas públicas. En caso de fallecimiento se decide caso a caso.

---

## 2. Noticias

**2.1 ¿Qué temas editoriales se usan para noticias y documentos?**
Son distintos de las Áreas profesionales (p. ej. institucional, logros, vida estudiantil, admisión).
_Propuesta:_ La persona encargada puede editar la lista.

**2.2 ¿Cuántas noticias se esperan al mes?**
Ayuda a dimensionar el buscador y la portada.

**2.3 ¿Se replican noticias de la web de la FCB?**
¿Se copian completas o se enlazan?
_Propuesta:_ Se enlazan a la noticia original. Si se confirma, se agrega a la Noticia un campo opcional
"Fuente" (`fuente_url`) que se muestra como "Publicada originalmente en…".

**2.4 ¿Se adjuntan documentos (Drive o PDF) a las noticias?**
¿Basta con un enlace dentro del texto o hace falta un bloque propio con ícono y tamaño?
_Propuesta:_ Por ahora, enlaces dentro del texto. El bloque propio se agrega cuando se defina el campo
"documento" (Drive o R2) del Repositorio, para usar el mismo en los dos lugares.

**2.5 ¿Las Organizaciones mencionadas tienen ficha propia?**
Hoy solo las Personas tienen Ficha. En la noticia, las Organizaciones aparecen como texto.
_Propuesta:_ Mantenerlas como texto hasta que haya contenido suficiente para una ficha (descripción, sitio
web, egresados/as que trabajan ahí).

**2.6 ¿Se quieren botones para compartir las noticias?**
_Propuesta:_ Un solo botón "Compartir", que usa el menú del teléfono (WhatsApp, Instagram, correo) y, en el
computador, copia el enlace. Sin botones de redes sociales de terceros, que rastrean a quien visita y
cargan scripts externos.

---

## 3. Agenda

**3.1 ¿Hay actividades de varios días o que se repiten?**
Por ejemplo, un congreso de tres días o un seminario mensual.
_Propuesta:_ Se permiten actividades de varios días. Las que se repiten se publican como actividades separadas.

**3.2 ¿La inscripción se hace siempre en otro sitio?**
_Propuesta:_ Sí, solo se publica un enlace externo. El sitio no gestiona inscripciones.

---

## 4. Anuncios

**4.1 ¿Qué pasa con un anuncio cuando vence?**
¿Desaparece? ¿Pasa a un archivo? ¿Y cuánto dura un anuncio sin fecha límite?
_Propuesta:_ Al vencer pasa a un archivo. Si no tiene fecha límite, vence a los 60 días.

---

## 5. Repositorio

**5.1 ¿Los documentos quedan en Google Drive?**
¿El sitio solo enlaza a los archivos de Drive o los muestra con su propia ficha (tipo, tema, año, palabras clave)?
_Propuesta:_ Los archivos quedan en Drive y el sitio tiene una ficha por documento con sus datos y un enlace a Drive. Así el buscador funciona.

**5.2 ¿Todos los documentos son públicos?**
_Propuesta:_ Sí. En el repositorio solo se publican documentos públicos.

**5.3 ¿Qué tipos de documento hay?**
Decretos, reglamentos, leyes, informes, publicaciones… ¿La lista está cerrada?
_Propuesta:_ Lista cerrada y editable por la persona encargada.

---

## 6. Gestión, identidad y alcance

**6.1 ¿Una sola persona administra todo el sitio?**
¿Hay alguien de respaldo? ¿Se necesitan distintos niveles de permiso?
_Propuesta:_ Una persona encargada y una de respaldo, ambas con los mismos permisos.

**6.2 Instagram**
¿Cuál es la cuenta oficial? ¿Quién tiene acceso a ella? (Se necesita para mostrar el feed automáticamente.)

**6.3 Identidad visual**
¿Existe ya un logo BIOING+? ¿Hay un manual de marca UdeC/FCB que debamos seguir? ¿Quién aprueba el diseño?

**6.4 Dominio y alojamiento**
¿El sitio irá en un dominio UdeC (p. ej. bioing.udec.cl) o en uno propio? ¿TI de la UdeC impone restricciones?

**6.5 ¿Solo en español?**
_Propuesta:_ Sí, solo en español.

**6.6 ¿Qué es imprescindible para marzo de 2027?**
Si no alcanza el tiempo, ¿qué secciones pueden quedar para una segunda etapa?
_Propuesta:_ Para marzo de 2027: Inicio, ¿Qué es la Bioingeniería?, Directorio y Noticias. En la segunda etapa: Agenda, Anuncios, Repositorio y el anuario PDF.

## 7. Inicio y páginas

**7.1 ¿«¿Qué es la Bioingeniería?» debe aparecer en el Inicio?**
La propuesta la pone como ítem de primer nivel del menú y pide que el Inicio priorice el contenido dinámico, pero
no la incluye en el Inicio. Hoy es una Página libre (`/p/bioingenieria`) y va primera en el menú «La carrera ▾».
_Implementado (ADR 0006), para validar con la contraparte:_ un switch «Destacar en el
Inicio» en las Páginas libres. La página destacada se muestra como un bloque entre el carrusel y «Noticias
recientes», con su resumen, el video en una ventana y un enlace «Ver más». Puntos a decidir:
- ¿Una sola página destacada a la vez, o hasta dos? (Se propone una, para no alejar las noticias, sobre todo en
  el celular).
- ¿El resumen sale de la bajada o de un campo propio «Resumen para el Inicio»?
- ¿Se muestran «datos clave» (por ejemplo, los primeros bloques destacados de la página)?
- ¿Basta con el desplegable «La carrera ▾», o «¿Qué es la Bioingeniería?» debe ser un enlace de primer nivel,
  como en la propuesta?
- Quedarían tres formas de destacar algo en el Inicio: los Banners (temporales, en el carrusel), la página
  destacada (institucional, permanente) y las Secciones destacadas (accesos al final). ¿Se entiende la
  diferencia?
