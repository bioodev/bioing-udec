# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

BIOING+ es el sitio web de la comunidad de Bioingeniería de la Facultad de Ciencias Biológicas (FCB), Universidad de Concepción. **Plazo: debe estar listo en marzo de 2027.**

Stack decidido (ver `docs/adr/0001-sveltia-cms-astro.md`): sitio estático **Astro** en `app/web` con contenido en archivos editados mediante **Sveltia CMS**; sin backend ni base de datos (`app/api` queda sin uso por ahora). Repositorio: `https://gitea.bioodev.work/bioing/bioing-udec` (Gitea propio detrás de Cloudflare: no hay SSH, git funciona por HTTPS con token guardado en un credential helper limitado a ese host).

## Comandos

Desde `app/web` (Astro 7, Node ≥ 22.12):

```sh
npm run dev          # servidor local en localhost:4321 (admin en /admin/index.html; /admin/ solo funciona en el build)
npx astro check      # tipos y esquemas de contenido
npm run build        # sitio estático en dist/
npm run postbuild    # índice de Pagefind en dist/pagefind/ (no se dispara solo con npm 11: correr build+postbuild)
npm run preview      # sirve dist/ en localhost:4322; el buscador /buscar solo funciona aquí (o en producción)
npm test             # Vitest: reglas puras en src/lib/*.test.ts
npm run datos:generar  # contenido sintético (Faker + lorem ipsum) con prefijo sint-, ignorado por git
npm run datos:limpiar  # borra solo el contenido sint-
npm run dev:tunel      # expone el dev en una URL pública de cloudflared (revisar desde el celular; requiere cloudflared)
```

Tras `datos:generar` con el servidor de desarrollo corriendo, reiniciarlo (`npx astro dev stop` y volver a levantar): no detecta bien cientos de archivos nuevos de una vez.

No hay linter todavía. Una referencia rota entre colecciones (un slug que no existe, p. ej. una Persona borrada que sigue mencionada) se registra como `[ERROR] [content] Invalid content reference` pero **no** hace fallar el build: las páginas envuelven `getEntries()` con `existentes()` (`src/lib/reglas.ts`) y descartan la entrada faltante. Revisar la salida del build para limpiar esas referencias. Noticias y Anuncios con fecha futura no aparecen hasta ese día (`noticiasVisibles()` / `anunciosVisibles()`).

## Astro

- `src/content.config.ts` es el espejo en Zod de `public/admin/config.yml`: cada campo con `required: false` es `.optional()` (porque `omit_empty_optional_fields: true`), cada `relation` es `reference()`, y los objetos "Persona u Organización" son `z.discriminatedUnion('tipo', …)`.
- Las páginas consultan el contenido mediante `src/lib/contenido.ts`: `publicados()` filtra los Borradores y `vinculosDe()` da el índice inverso para las Fichas. No usar `getCollection` directo en colecciones con campo `publicado`.
- Fechas: los campos con hora llevan offset de America/Santiago y se muestran con `formatoFechaHora`. Las fechas solas (`AAAA-MM-DD`) se parsean como medianoche UTC y se muestran con `formatoFecha` (en UTC), para no correr el día.
- Las imágenes van en `src/assets/media` y se referencian con ruta relativa (`../../assets/media/…`) para que `image()` las optimice.
- Starwind UI **v3**: componentes en `src/components/starwind/` (se agregan con `npx starwind@latest add <nombre>`); el tema está en `src/styles/starwind.css` con los tokens de `docs/DESIGN.md`. Ojo: la documentación en línea de v2 no aplica; en v3 los cambios de valor se escuchan con el evento `starwind:value-change` (burbujea y se emite antes de fijar el valor), y los `SelectTrigger` necesitan `aria-labelledby` apuntando a su `Label`. Para fijar un valor desde código se despacha `starwind:set-value` (con `detail.value`) sobre la raíz del Select/Combobox. Los componentes nuevos de `starwind add` pueden traer textos en inglés (`aria-label`, `sr-only`): traducirlos.
- Listados con filtros (`/directorio`, `/noticias`): el build renderiza todas las tarjetas con atributos `data-*` y un `<script>` filtra con la función pura correspondiente (`filtro-directorio.ts`, `filtro-noticias.ts`). `/noticias` además pagina de a 12 y refleja los filtros en la URL (`?tema=`, `?persona=`, `?anio=`, `?q=`, `?pagina=`).
- Íconos: solo **Phosphor** vía `phosphor-astro` (`import MapPin from 'phosphor-astro/MapPin.astro'`), también dentro de los componentes de Starwind (se reemplazó Tabler). Son SVG sin tamaño propio: dimensionar con `size-*` y marcar `aria-hidden="true"` cuando son decorativos. Ojo: `npx starwind@latest add` trae componentes nuevos con íconos Tabler; hay que cambiarlos a Phosphor.
- Las reglas con fechas o filtros van en módulos puros (`src/lib/reglas.ts`, `src/lib/filtro-directorio.ts`) con tests; las páginas solo consultan `src/lib/contenido.ts`.
- `/componentes` es un catálogo que solo existe en `npm run dev`.
- **Logo**: la marca vive en una sola fuente, `src/assets/logo.svg`, y se renderiza con `src/components/Logo.astro` en navbar y footer. Para cambiarla, reemplaza ese archivo (manteniendo el nombre); no hay que tocar código. Es un placeholder hasta la identidad definitiva (Fase B/C2).
- **Animaciones (GSAP + View Transitions)**: transiciones entre páginas con `ClientRouter` (Astro 7) y estilos en `src/styles/transitions.css`; animaciones intra-página con `src/scripts/animaciones.ts` (GSAP + ScrollTrigger, con limpieza por `gsap.context()` en `astro:before-swap` y reinicio en `astro:page-load`). Marcado declarativo: `data-animar="hero"` (entrada al cargar), `"fade-up"` (aparece al scrollear) y `"grilla"` (hijos escalonados). Todo respeta `prefers-reduced-motion` y es visible sin JavaScript (clase `.anima` + guard en `Base.astro`). Para añadir una animación basta marcar el elemento con el atributo.
- **Imágenes (rendimiento)**: todo pasa por `<Image>` de Astro (o `getImage`) con `widths`/`sizes`; las tarjetas reservan aspecto (`aspect-video`/`aspect-square`) y las que no tienen imagen usan un placeholder `bg-muted` — así no hay CLS. El **hero** (slide 0) va con `priority` (`fetchpriority=high` + eager); en `index.astro` se emite además un `<link rel="preload">` del LCP (getImage + slot head). El resto carga `lazy` por defecto. Mantener estos atributos al agregar imágenes.
- **Hero**: foto del slide con tinte cálido sutil (`.hero-imagen` con `sepia/saturate`) a opacity 70 % + velo oscuro plano (`bg-foreground/30`) para el contraste del título. **Se probó Paper Shaders WebGL (`@paper-design/shaders`) y una textura halftone CMYK en CSS/máscaras, y ambas se descartaron** (WebGL: TBT y perf < 90; la textura: el equipo no la quiso). Evitar reintroducir efectos de puntos/impresión en el hero.
- El contenido que dice "Contenido de ejemplo" en `src/content/` es de prueba y se borra cuando haya contenido real.

## Sveltia CMS

- Admin en `app/web/public/admin/` (`index.html` + `config.yml`). Las colecciones de `config.yml` reflejan `CONTEXT.md`; un cambio en el modelo de dominio se hace en ambos.
- El contenido se guarda en `app/web/src/content/<colección>/`. Las relaciones guardan el slug de la entrada referenciada. Las referencias "Persona u Organización" (Organizadores, Oferente) son objetos de tipo variable con `typeKey: tipo`.
- Borrador/Publicado es el campo booleano `publicado`. No activar el Editorial Workflow, porque desactiva la creación de entradas relacionadas desde el editor.
- Validar cada cambio de `config.yml` de dos formas: contra el JSON Schema (`https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json`) y cargando `/admin/` para leer la pantalla de inicio de sesión (p. ej. `python3 -m http.server` en `app/web/public`).
- Lo que depende de la fecha (Agenda próximas/realizadas, Anuncios vencidos, Banners vigentes) se resuelve en el build, así que el sitio necesita reconstruirse a diario.

## Lenguaje del dominio

`CONTEXT.md` es el glosario canónico (Persona, Perfil de egresado, Ficha, Organización, Área vs Tema, etc.). Usar esos términos en código y conversación, y evitar los listados en `_Avoid_`. Las preguntas aún sin resolver con el equipo BIOING+ están en `docs/preguntas-reunion.md`; si una sección de este archivo contradice `CONTEXT.md`, prevalece `CONTEXT.md`.

## Documentos fuente (`docs/`)

- `Propuesta de arquitectura y contenidos para sitio web BIOING.md` (y su PDF): especificación funcional principal. Leerla antes de diseñar cualquier sección.
- `notas.md`: requisitos acordados en reuniones que complementan o precisan la propuesta.
- `DESIGN.md`: sistema de diseño de referencia (estilo Apple: tiles a sangre alternando claro/oscuro, un único acento azul, sin gradientes, una sola sombra). Es la guía visual a seguir, conciliándola con la identidad gráfica institucional UdeC/FCB.

## Arquitectura funcional

Menú principal (sticky en la landing): INICIO | ¿QUÉ ES LA BIOINGENIERÍA? | NOTICIAS | AGENDA | INSTAGRAM | BASE DE DATOS | ANUNCIOS | REPOSITORIO, más un acceso permanente a la web de la FCB.

Colecciones de contenido y sus campos clave:
- **Noticias**: imagen destacada, fecha, categorías/temas, participantes; buscador y filtros por tema, participante y fecha; archivo.
- **Agenda**: actividades (seminarios, charlas, congresos, talleres, etc.) con ficha propia (nombre, fecha/hora, lugar/modalidad, descripción, organizador, participantes, enlace de inscripción); vista separada de próximas (orden cronológico) y realizadas (archivo).
- **Anuncios**: título, tipo de oportunidad (trabajo, práctica, pasantía, proyecto, convocatoria…), descripción, fecha de publicación, fecha límite opcional, contacto, enlace externo.
- **Base de datos de bioingenieros/as** (componente prioritario): nombre y apellido, generación, año de egreso, área de desempeño, organización/institución, cargo/profesión, enlaces (LinkedIn u otros), contacto solo con autorización. Buscable por nombre, generación, área y organización. Debe poder exportarse como anuario de egresados en PDF.
- **Repositorio**: documentos (decretos, reglamentos, informes, etc.) filtrables por tipo, tema, año y palabra clave. Según `notas.md`, la biblioteca vive en Google Drive.
- **Instagram**: feed embebido que se actualiza automáticamente.
- **¿Qué es la Bioingeniería?**: contenido mayormente estático; el video se muestra en un modal.

Relaciones entre colecciones (requisito explícito): la ficha de un bioingeniero/a debe enlazar a las noticias en que participa, las actividades de agenda que organiza o en que participa, y los anuncios relacionados. Modelar las personas como entidad referenciable desde noticias/agenda/anuncios, no como texto libre.

Buscadores requeridos en: noticias, agenda, anuncios, base de datos y repositorio.

## Flujo de contenidos

Una única persona encargada de comunicaciones recibe, valida y publica todo el contenido; la comunidad no publica directamente. Las altas/bajas/cambios de datos en la base de egresados llegan mediante un enlace a un Google Form. Los datos personales solo se publican con autorización previa.
