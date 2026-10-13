# Datos faltantes del contenido (2026-10-12)

Revisión del contenido real de `app/web/src/content/` (sin los `sint-*` ni los archivos marcados para borrar:
`noticias/noticia-demo-borrar-luego*.md`, `instagram/publicacion-udec.yml`). Se recorrieron los 44 archivos con un
script de inventario de campos vacíos y se revisaron las imágenes usadas por el contenido.

Criterio: se completa **solo lo que se deduce del propio contenido**, sin inventar nombres, cifras, fechas, correos,
URLs ni cargos. Lo demás queda en la lista de pendientes con quién debería darlo.

## 1. Completado

| Archivo | Campo | Valor | Por qué sale del contenido |
|---|---|---|---|
| `inicio/inicio.md` | `comunidad.directorio.imagen_alt` | Manos con guantes sostienen una placa de Petri con cultivo rosado en un laboratorio | Describe `demo-03.jpg`, que es la imagen de la tarjeta del Directorio |
| `inicio/inicio.md` | `comunidad.repositorio.imagen_alt` | Pipeta dosificando líquido en tubos de muestra de colores sobre una gradilla | Describe `demo-06.jpg`, imagen de la tarjeta del Repositorio |
| `noticias/nueva-generacion-bioingenieria.md` | `imagen_alt` | Manos con guantes cargan una jeringa desde un frasco | Describe `demo-04.jpg` |
| `noticias/charla-acuicultura-convoca-estudiantes.md` | `areas` | `acuicultura` | La noticia enlaza la actividad «Charla de acuicultura sostenible», cuya área es acuicultura |
| `noticias/egresada-premio-innovacion.md` | `areas` | `salud` | El título dice «premio de innovación en salud» |

Verificación: `npm run verificar` en verde (522 tests, `astro check` con 0 errores y 0 warnings, build, Pagefind,
JSON-LD).

No se completó `imagen_alt` en las noticias cuya imagen es un color plano de ejemplo (`ejemplo-verde.png`,
`ejemplo-seminario.png`, `ejemplo-azul.png`). Describir un rectángulo de color no aporta; quedan sin texto alternativo
(decorativas) hasta que haya fotos reales.

## 2. Pendientes: falta información real

| Dato faltante | Dónde | Quién debería darlo |
|---|---|---|
| Redes sociales (Instagram, Facebook, etc.) | `redes/redes.yml` (vacío: `{}`) | Encargada de comunicaciones de la carrera |
| Enlace del Google Form del Directorio | `menu/menu.yml` → `formulario_directorio` (vacío: no sale el botón) | Quien administra el formulario |
| Sitio web del laboratorio | `organizaciones/laboratorio-de-biomateriales-udec.yml` → `sitio_web` (hoy `https://www.udec.cl`, que parece genérico) | Laboratorio de Biomateriales |
| Sitio web, logo y tipo real de las organizaciones de ejemplo | `organizaciones/acuicola-del-sur-ejemplo.yml`, `alimentos-bio-ejemplo.yml`, `centro-de-estudiantes-bioingenieria.yml` | Las organizaciones; hoy son nombres de ejemplo |
| Descripción y datos de Enrique Fernandez (solo tiene nombre y `ficha_activa`) | `personas/enrique-fernandez.yml` | Persona encargada del Directorio |
| Generación de Camila Herrera, Sofía Muñoz e Ignacio Morales (sin `generacion`) | `personas/camila-herrera.yml`, `sofia-munoz.yml` | Egresados/as o secretaría de la carrera |
| Enlaces profesionales de los egresados (`enlaces`) | `personas/*.yml` (solo Ana Pérez tiene LinkedIn, que es `linkedin.com` sin perfil) | Cada egresado/a, con autorización |
| Fotos de las personas (`foto`) | `personas/*.yml` | Cada persona, con autorización |
| Bajadas de las noticias reales (`bajada`) | Las 5 noticias reales. Su cuerpo es solo el texto «Contenido de ejemplo», así que no hay de dónde resumir | Redacción de la noticia |
| Cuerpo real de las noticias, actividades, anuncios y página «¿Qué es la Bioingeniería?» | Todos los `.md` (el cuerpo dice «Contenido de ejemplo. Borrar cuando haya contenido real.») | Redacción de la carrera |
| Enlace de inscripción de las actividades (`enlace_inscripcion`) | Las 3 actividades | Quien organiza cada actividad |
| Texto del banner «Admisión 2027» (`texto`, opcional) | `banners/admision-2027.yml` | Admisión / comunicaciones |
| Video institucional real de la página libre | `paginas-libres/bioingenieria.md` → `video` apunta a un video de prueba | Comunicaciones de la carrera |
| Imagen real de la página libre (`imagen`, `imagen_alt`) y de los banners de ejemplo | `paginas-libres/bioingenieria.md`, `banners/*.yml` | Comunicaciones de la carrera |
| Enlace real del reglamento de titulación (hoy `https://drive.google.com/`, sin archivo) | `documentos/reglamento-de-titulacion.yml` (no publicado) | Secretaría de la carrera |
| Documentos del Repositorio: solo hay uno, de prueba | `documentos/` | Secretaría y dirección de la carrera |
| Descripción de la página «Directorio» y las demás listas | `seo/seo.yml` ya trae descripciones; falta confirmar que sean las definitivas | Comunicaciones |

## 3. Anotaciones para el modelo (no se cambió nada)

- **Actividades sin `imagen_alt`**: resuelto después de esta revisión. El campo se agregó al modelo (panel, esquema y
  `context.md`) y la charla de acuicultura ya tiene su texto alternativo.
- **Noticias con imagen de color plano**: ver el punto 1. Se pueden reemplazar por fotos reales cuando estén.
- **Bajada opcional en las noticias.** Sin bajada ni `seo.descripcion`, la noticia no tiene descripción para
  buscadores. Esto no se verificó en la vista previa del panel; habría que comprobarlo antes de decidir si la bajada
  debe ser obligatoria.

## 4. Archivos que no se tocaron

- `src/content/encabezados/encabezados.yml`, `public/admin/config.yml` y componentes o páginas (fuera del alcance de
  esta tarea).
- `noticias/noticia-demo-borrar-luego*.md` e `instagram/publicacion-udec.yml` (marcados para borrar).
- Contenido `sint-*` (no se generó en este worktree).
