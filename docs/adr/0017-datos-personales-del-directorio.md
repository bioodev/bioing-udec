# 0017 · Datos personales del Directorio y Ley 21.719

- **Estado:** Proposed · 2026-10-18 · **espera la decisión de la carrera (y, si corresponde, de la
  asesoría jurídica de la UdeC)** antes de cargar egresados/as reales
- **Decisores:** contraparte de la carrera; el proveedor propone y ejecuta lo que se apruebe
- **Contexto relacionado:** `../propuesta-desarrollo.md` §9 riesgos 1 y 2, §13 ·
  `../plans/2026-10-18-plan-avance-y-mejoras.md` (Bloque 1.1 y Bloque 5) ·
  `../preguntas-reunion.md` 1.4, 1.5, 1.10 · `../guia-mantencion.md` §6 y §7 ·
  `../analisis/2026-10-12-revision-seguridad.md`

## Contexto

El Directorio publica datos personales de egresados/as (nombre, generación, año de egreso, áreas,
organización, cargo y enlaces profesionales). Hoy el modelo ya exige autorización explícita: el campo
`perfil_egresado.autorizado` empieza en `false` y el Directorio solo muestra a quien tiene la marca
(`src/content.config.ts`, `src/lib/contenido.ts`). Las altas, bajas y cambios llegan por un Google Form y
pasan por revisión del Encargado/a.

El problema es **dónde viven esos datos**: las fichas del Directorio son archivos del repositorio
(`app/web/src/content/personas/*.yml`) y sus fotos están en `app/web/src/assets/media/`. Cada guardado del
panel deja un commit; cada bloqueo de la ficha o corrección deja otro. Git es, por diseño, un historial que
no olvida: si alguien pide ser eliminado/a, borrar el archivo y publicar deja el dato en el commit anterior
(y en cada clon, y en los objetos del repositorio). Lo mismo vale para las fotos.

La **Ley 21.719** de protección de datos personales entra en vigencia el **1 de diciembre de 2026**, antes de
la puesta en producción del sitio (Hito 4, 31 de enero de 2027) y antes de la carga de egresados/as reales
(15 de enero de 2027). El derecho de supresión es uno de sus ejes. La propuesta comercial ya lo registra
como los riesgos 1 (eliminación) y 2 (registro del consentimiento), los dos de impacto **alto**, y el
documento canónico del dominio prevé que los datos personales solo se publican con autorización previa
(`../context.md`, «Contacto»).

De esto depende la decisión de arquitectura más cara de revertir del proyecto: una vez cargados los
egresados/as, cambiar de modelo obliga a rehacer la carga y, si se elige la opción (b), a mover datos ya
publicados.

## Decisión (a confirmar)

Se pide a la carrera elegir **una** de estas dos opciones y dejarla por escrito. Ambas asumen que el Google
Form sigue siendo el registro oficial del consentimiento (con fecha y alcance) y que el sitio solo publica
los perfiles con `autorizado: true`.

### Opción (a) — Procedimiento documentado de supresión que incluya el historial de Git

Los datos siguen en el repositorio. Se documenta, en `../guia-mantencion.md` §6, un procedimiento de
supresión con prioridad que incluye:

1. desactivar el perfil (`autorizado: false` y/o `ficha_activa: false`) y **redesplegar el mismo día**, para
   que el dato deje de estar publicado en el sitio, en el sitemap, en el buscador y en el JSON-LD;
2. retirar la ficha y su foto, y reescribir el historial del repositorio (`git filter-repo`) para que el dato
   y la imagen desaparezcan de todos los commits;
3. forzar el push (`main`), invalidar los clones y los respaldos, y volver a construir y desplegar.

Consecuencia técnica: la reescritura cambia el hash de todo el historial, obliga a coordinar con Workers
Builds y el espejo de GitHub, invalida los clones del equipo y exige rehacer el mirror de respaldo. Es un
procedimiento de emergencia que conviene **haber probado al menos una vez** (prueba de restauración +
ensayo de supresión).

### Opción (b) — Datos del Directorio fuera del repositorio

Los perfiles del Directorio dejan de vivir en Git. El build los lee de un almacén aparte, por ejemplo:

- **Cloudflare R2 o KV** como origen de los perfiles (JSON) y de las fotos, con clave de solo lectura para
  el build;
- o un archivo publicado fuera del control de versiones (Google Drive/Sheets de la cuenta central) que el
  build consulta.

El panel deja de ser el editor del Directorio (o se limita a la parte no personal) y la supresión es un
borrado puntual en ese almacén, sin tocar el historial. Consecuencias: más arquitectura (una dependencia
externa más en el build, clave de R2 y su rotación —ver riesgo 6 de la propuesta—, y menos revisión por Git);
a cambio, el derecho de supresión se cumple sin reescribir la historia. El resto del contenido del sitio
(noticias, actividad, páginas) seguiría en el repositorio, porque no lleva datos personales masivos.

### Propuesta del proveedor (a confirmar por la carrera)

Preferir la **opción (b) acotada al Directorio** si se confirma que habrá R2 o un origen externo; si no, la
**opción (a)** con el procedimiento probado y la promesa —explícita y por escrito en la política— de
publicar de inmediato `autorizado: false` al recibir una solicitud, antes de la reescritura.

En cualquier caso:

- El **Google Form es el registro oficial** de consentimiento (fecha, alcance y quién lo dio); la evidencia se
  respalda fuera del sitio (`../guia-mantencion.md` §7).
- El Directorio publica solo nombre, generación, año de egreso, áreas, organización, cargo y enlaces
  profesionales. **Ni correo ni teléfono** (`../preguntas-reunion.md` 1.4).
- Se documenta la política de privacidad del sitio (incluida la de las publicaciones de Instagram, ADR 0014 y
  `../preguntas-reunion.md` 8.16) y se enlaza desde el Directorio.

## Consecuencias

- La decisión debe estar tomada **antes** de cargar el listado de egresados/as (15-ene-2027) y antes del
  1-dic-2026, cuando rige la ley.
- Con cualquiera de las dos opciones, la supresión incluye el caso de fallecimiento y el de «no quiero
  aparecer», con revisión del Encargado/a (`../preguntas-reunion.md` 1.10).
- Queda una tarea de mantención: **probar** la supresión (opción a) o el borrado en el almacén (opción b) al
  menos una vez al año, junto con la prueba de restauración de respaldos.
- La guía de mantención §6 (reversión con datos personales) se completa con el procedimiento que salga de
  acá; hoy está solo con títulos.

## Alternativas

- **No publicar perfiles y mostrar solo un enlace al formulario**: cumple de sobra con la ley, pero deja el
  Directorio sin su razón de ser (era parte del alcance aprobado).
- **Publicar solo el nombre con consentimiento verbal registrado en planilla**: menos datos, pero el
  consentimiento verbal es débil como prueba y el nombre sigue siendo dato personal en Git.
- **Confiar en el borrado del archivo sin tocar el historial**: es lo que hace hoy el panel, y es
  precisamente lo que la ley no permite sostener ante un pedido de supresión.
- **Migrar todo el contenido fuera del repositorio**: resuelve el fondo del problema, pero pierde la revisión
  por Git de noticias y páginas, el flujo de trabajo actual (ADR 0004) y el costo de la migración; se
  descarta para este proyecto.
