# Guía de usuario del panel — BIOING+

> **Para quién es:** la persona Encargada de comunicaciones de la carrera (y su respaldo). No hace falta
> saber programar ni usar Git.
> **Estado:** _esqueleto — pendiente de escribir el contenido_ (los pantallazos del panel se agregan en la
> Fase C, cuando exista el repositorio definitivo y el login real).
> **Relacionados:** [`context.md`](context.md) (términos del dominio) ·
> [`architecture.md`](architecture.md) (cómo funciona por dentro) · [`pendientes-infra.md`](pendientes-infra.md).

**Convención de esta guía:** cada tarea se escribe como *objetivo → pasos → cómo comprobar que quedó bien →
errores típicos*. Los nombres de campos son los que se ven en el panel y los que usa el código (no se
inventan pantallas).

---

## 1. Qué puedes hacer (y qué no) con el panel

- Resumen de una pantalla: crear, editar, previsualizar y publicar todo el contenido del sitio.
- Lo que **sí** se administra desde el panel: Noticias, Actividades, Anuncios, Documentos, Personas
  (Fichas y Directorio), Organizaciones, Banners del Inicio, ¿Qué es la Bioingeniería?, Publicaciones de
  Instagram, y las listas de Áreas y Temas.
- Lo que **no** se hace desde el panel: cambiar el diseño, agregar secciones nuevas, pegar código, gestionar
  cuentas o usuarios, y (por ahora) aprobar contenido de otras personas.

## 2. Antes de empezar

### 2.1 Tu cuenta y cómo se entra

- Cuenta de GitHub (en producción) con **doble factor**; quién la crea y quién puede dar acceso.
- Dirección del panel (`https://<dominio>/admin/`) y qué hacer si no carga o si no te reconoce.
- Diferencia entre entrar al **panel** (editar) y ver el **sitio público**.
- _Pendiente:_ botón de inicio de sesión y pantallazos (Fase C).

### 2.2 Cómo se publica (reglas que conviene saber de memoria)

- **Borrador vs Publicado**: el interruptor `Publicado` es lo que hace visible un contenido.
- Un cambio publicado tarda **1 o 2 minutos** en verse en el sitio.
- Lo que depende de la fecha (Actividades próximas/realizadas, Anuncios vencidos, Banners vigentes) se
  actualiza **una vez al día**, en la reconstrucción nocturna; un Anuncio vencido puede seguir visible hasta
  esa hora.
- Cada cambio queda guardado con historial: se puede revertir (ver §8 y la guía de mantención).

### 2.3 La pantalla del panel

- Cómo está organizado (colecciones a la izquierda, buscador interno, botón de guardar).
- Cómo se guarda un borrador y cómo se ve la vista previa.
- Qué significa que el panel escriba en el repositorio del proyecto (los cambios quedan registrados a tu
  nombre).
- _Pendiente:_ pantallazos (Fase C).

## 3. Los conceptos del modelo, en lenguaje llano

> El detalle canónico está en [`context.md`](context.md); acá va la versión corta y con ejemplos.

- **Persona** vs **Organización** (y cuándo usar cada una).
- **Ficha**: existe por defecto; se puede desactivar y el nombre deja de enlazar.
- **Área** (campo profesional: acuicultura, biomateriales…) vs **Tema** (editorial: institucional, logros,
  vida estudiantil…). De qué sirve cada uno y dónde se usan.
- **Oferente** (quien ofrece un Anuncio) y **Organizador** (quien hace una Actividad).
- **Contacto** de un Anuncio: es texto libre, nunca una Persona.
- **Perfil de egresado** y **autorización**: nadie aparece en el Directorio sin autorización previa.
- **Publicación de Instagram**: se pega el enlace, el sitio arma el embed.

## 4. Tareas paso a paso

> Cada una con: dónde ir, qué campos llenar, qué es obligatorio, cómo comprobar, errores típicos.

### 4.1 Publicar una Noticia
- Campos: título, fecha, imagen, bajada, Temas, Áreas, personas mencionadas, organizaciones mencionadas,
  Actividad (si cubre una), Publicación de Instagram, etiquetas libres.
- **Crear una Persona nueva sin salir de la Noticia** (el caso más frecuente).
- Cómo se ve en Inicio, en `/noticias` y en la Ficha de la Persona.
- Fechas futuras: la Noticia no aparece hasta ese día.

### 4.2 Publicar una Actividad en la Agenda
- Campos: tipo, inicio, fin (si dura varios días), modalidad, lugar, organizadores, expositores, Áreas,
  enlace de inscripción, imagen.
- Próximas vs realizadas; qué pasa cuando la fecha pasa.

### 4.3 Publicar un Anuncio
- Campos: tipo de oportunidad, oferente, Áreas, fecha, fecha límite, contacto, enlace.
- Regla de vencimiento: sin fecha límite, vence a los 60 días; al vencer pasa al archivo.

### 4.4 Agregar un Documento al Repositorio
- Campos: título, tipo, año, enlace (Google Drive), descripción, Temas, Áreas, palabras clave.
- Reglas de Drive: propiedad de la cuenta central, carpeta pública dedicada, permiso "cualquiera con el
  enlace".

### 4.5 Editar ¿Qué es la Bioingeniería?
- Bajada, video (YouTube/Vimeo) y bloques de características.

### 4.6 Seleccionar una publicación de Instagram
- Pegar el enlace (`/p/…` o `/reel/…`), título y fecha; qué pasa si el embed deja de funcionar.

### 4.7 Banners del Inicio
- Cómo se elige qué se destaca; campos de vigencia (inicio y fin) y enlace interno o externo.

### 4.8 Directorio: altas y cambios de egresados/as
- Ficha de la Persona + Perfil de egresado (generación, año de egreso, Áreas, Organización, cargo, enlaces).
- **Autorización de datos**: dónde se registra y qué datos nunca se publican.
- Cómo llegan los cambios de la comunidad (Google Form) y qué revisar antes de publicar.
- Pedidos de baja o fallecimiento: qué hacer.

### 4.9 Organizaciones
- Cuándo crear una Organización en vez de escribir el nombre; tipo, sitio web, logo.

### 4.10 Listas de Áreas y Temas
- Quién las edita, cómo agregar una nueva y por qué conviene mantenerlas cortas.

## 5. Imágenes y archivos

- Qué se puede subir (formatos, HEIC de iPhone) y qué se evita (capturas ilegibles, fotos sin permiso).
- El panel **optimiza solo**: reduce a 2048 px, convierte a WebP y borra los metadatos (incluida la
  ubicación GPS).
- Tamaño y orientación recomendados; cómo se ve cada imagen en las tarjetas (aspecto reservado).
- Texto alternativo: cuándo el sitio lo pone solo y cuándo conviene describirlo.
- Documentos: Drive vs subida al servidor (R2) — cuál usar en cada caso.

## 6. Buenas prácticas de redacción

- Título y bajada: de ahí salen el título de la pestaña, la tarjeta social (Open Graph) y los datos
  estructurados que usan buscadores y asistentes de IA.
- Imagen destacada: la primera impresión de la tarjeta.
- Temas y Áreas: clasifican y permiten encontrar el contenido; no son etiquetas decorativas.
- Fechas: cómo se escriben y cómo se muestran.
- Enlaces: texto descriptivo ("Ver las bases"), no "clic aquí".
- Nombres propios: buscar primero si la Persona u Organización ya existe, para no duplicar.

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
| Publiqué y no lo veo en el sitio | Tarda 1–2 minutos, o quedó en borrador | Esperar y recargar; revisar `Publicado` |
| Una Noticia con fecha futura no aparece | Es el comportamiento previsto | Nada: aparece ese día |
| Un Anuncio vencido sigue visible | La actualización de fechas es diaria | Esperar la reconstrucción nocturna |
| El nombre de una Persona "no enlaza" | Su Ficha está desactivada | Revisar `Ficha activa` en la Persona |
| Falta un contenido o aparece un aviso de error en el build | Alguna referencia quedó apuntando a algo que se borró | Avisar a soporte con el detalle (el sitio no se cae) |
| La vista previa de un PDF/Documento no carga | Permisos de Drive | Compartir como "cualquiera con el enlace" |
| El embed de Instagram no aparece | Bloqueador del navegador o cambio de Meta | La tarjeta sigue enlazando a la publicación |

## 9. Qué no se puede hacer (y por qué)

- Pegar HTML, iframes o scripts: solo enlaces de proveedores de la lista cerrada.
- Cambiar el diseño, agregar secciones o campos nuevos: es un cambio de alcance (se cotiza).
- Publicar datos personales sin autorización.
- Gestionar cuentas, accesos o facturación del servicio.

## 10. Glosario mínimo

- Tabla corta: Noticia, Actividad, Anuncio, Documento, Persona, Organización, Ficha, Directorio, Área, Tema,
  Banner, Publicación de Instagram, Borrador, Publicado. (Enlaza a [`context.md`](context.md).)

## 11. ¿A quién pedir ayuda?

- Canal de soporte, qué se considera una falla (y qué no) y tiempos de respuesta de la garantía.
- Qué información adjuntar al reportar (URL, nombre del contenido, qué esperabas ver, captura).
- Cómo pedir la reversión de un cambio publicado por error.

---

## Apéndice A · Campos de cada tipo de contenido

- Tabla por colección, generada desde `app/web/public/admin/config.yml` (obligatorio/opcional y qué
  significa cada campo). _Pendiente._

## Apéndice B · Preguntas frecuentes

- _Pendiente:_ recopilar durante la capacitación (dudas reales del Encargado/a).
