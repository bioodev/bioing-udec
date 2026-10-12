# Guía de evolución de la plataforma — BIOING+

> **Para quién es:** quien mantiene el sitio y agrega o quita funciones: hoy el proveedor, mañana otra persona
> con conocimientos de Astro. Sirve para hacer cambios sin romper lo que ya funciona y para que la plataforma
> crezca de forma ordenada. El uso diario del panel (publicar contenido) está en
> [`guia-usuario.md`](guia-usuario.md).
> **Estado:** primera versión, 2026-10-11. Las recetas están verificadas contra el código de la rama
> `guia-evolucion`; los ejemplos de código marcados como *propuesta* **no están implementados**.
> **Relacionados:** [`context.md`](context.md) (dominio y glosario) · [`architecture.md`](architecture.md)
> (estado del sistema) · [`design.md`](design.md) (UI/UX) · [`guia-mantencion.md`](guia-mantencion.md)
> (operación) · [`adr/`](adr/) (decisiones) · [`../AGENTS.md`](../AGENTS.md) (comandos y reglas).

**Convención de esta guía:** cada receta sigue el formato *cuándo → cómo → cómo verificar → cómo revertir*.
Las rutas son relativas a `app/web/` salvo que digan otra cosa.

---

## 1. Principios para crecer sin romper nada

1. **Lo editable va al panel.** Textos, imágenes, fechas, listas y relaciones que cambian con el tiempo son
   contenido: se modelan en `public/admin/config.yml` para que el Encargado de comunicaciones los edite sin
   tocar código. Si algo solo lo puede cambiar un desarrollador, probablemente debería ser contenido.
2. **Cambios pequeños, uno por commit.** Una rama o worktree por cambio, un commit por tarea, en español e
   imperativo (ver `AGENTS.md`). Así cada cambio se revierte con un solo `git revert`.
3. **Los tres espejos del modelo.** Un cambio de modelo de dominio se hace en **tres lugares** que deben
   coincidir: `public/admin/config.yml` (lo que ve el editor), `src/content.config.ts` (la validación Zod del
   build) y `docs/context.md` (el glosario). Si cambia uno y no los otros, el panel acepta algo que el build
   rechaza, o al revés.
4. **Lógica pura en `src/lib/` con TDD.** Reglas de fecha, filtros, enlaces, CSP y similares van en un módulo
   puro con su `*.test.ts` (Vitest). Escribir la prueba antes que el código cuando hay lógica.
5. **Las páginas no tienen lógica de negocio.** Consultan el contenido mediante `src/lib/contenido.ts`
   (`publicados()`, `noticiasVisibles()`, `vinculosDe()`…). No usar `getCollection` directo en colecciones con
   campo `publicado`: se mostrarían borradores.
6. **CSP sin `'unsafe-inline'` y con lista cerrada de embeds.** `public/_headers` solo admite los proveedores
   de `frame-src` que ya están. Nada de `onclick=`/`onsubmit=` en el HTML ni HTML pegado por el editor. Los
   scripts inline se agregan a la CSP por hash en `scripts/postbuild-csp.mjs`.
7. **Accesibilidad y rendimiento son requisitos, no mejoras.** WCAG 2.1 AA y Lighthouse ≥ 90 en las cuatro
   categorías (metas en `architecture.md` §9). Toda imagen lleva texto alternativo; ningún emoji es el único
   portador de un significado; los contenedores reservan su aspecto para no mover el diseño (CLS).
8. **Documentar en el mismo cambio.** Una decisión de arquitectura lleva un ADR nuevo en `docs/adr/`
   (próximo número: `0007`). Si cambia comportamiento, interfaces o supuestos, actualizar `architecture.md` o
   `context.md`. La bitácora (`bitacora.md`) registra lo acordado en reuniones.

---

## 2. Tabla de decisión: ¿qué forma tiene la función?

| Necesidad | Solución | Ejemplos reales |
|---|---|---|
| Un dato nuevo de una entrada que ya existe | **Campo** en la colección (`config.yml` + Zod) | `imagen_alt` y `video` en Noticias (`config.yml` ~l. 135 y 167) |
| Varias entradas que se listan y tienen ficha o detalle | **Colección** | `areas`, `temas`, `banners`, `instagram` |
| Un dato que apunta a otra entrada | **Relación** (`widget: relation` + `reference()`) | `personas_mencionadas` en Noticias; `oferente` en Anuncios |
| Un control o bloque visual reutilizable | **Componente** en `src/components/` | `TarjetaNoticia.astro`, `VideoModal.astro`, `FiltrosPlegables.astro`, `GaleriaImagenes.astro` |
| Una pieza dentro del cuerpo de un texto (video, mapa, PDF) | **Componente de editor de Sveltia** + transformación en el build; o un campo dedicado | Ver §4. Hoy: campos `video` y `galeria` |
| Una sección navegable con su propia URL | **Página nueva** (+ entrada en el menú) | `anuario.astro`, `instagram.astro` |
| Un servicio externo que se incrusta | **Proveedor de embed** en la lista cerrada de la CSP | YouTube (`youtube-nocookie.com`), Vimeo, Drive, Instagram |

Regla práctica: empezar por el nivel más bajo que resuelva el caso. Un campo nuevo es más barato que una
colección; una colección es más barata que una página nueva.

---

## 3. Recetas

### 3.1 Agregar un campo a una colección

- **Cuándo:** una entrada necesita un dato que hoy no se modela (por ejemplo, un enlace de inscripción en
  Noticias).
- **Cómo:**
  1. En `public/admin/config.yml`, dentro de la colección, agregar el campo con su `widget`, `label` y, si
     corresponde, `hint`. Ejemplo real: `imagen_alt` en Noticias (`widget: string`, `required: false`).
  2. En `src/content.config.ts`, agregar el mismo campo al `z.object` de la colección. Un campo con
     `required: false` va como `.optional()`: `config.yml` usa `output.omit_empty_optional_fields: true`, así
     que los campos vacíos **no se escriben** en el archivo y la validación debe aceptar que falten.
  3. Si es un término del dominio, agregarlo al glosario de `docs/context.md`.
  4. Mostrarlo donde corresponda (`src/pages/…` o un componente). Un campo sin uso visible no aporta nada.
  5. Opcional: agregar un valor de ejemplo en `scripts/datos-sinteticos.mjs` para probarlo.
- **Contenido existente:** un campo nuevo **siempre como opcional**. Las entradas actuales no lo tienen y
  siguen siendo válidas. Si después se quiere hacerlo obligatorio, primero se completa el contenido y recién
  entonces se cambia el esquema; si no, el build falla por validación de Zod en las entradas sin el dato.
- **Cómo verificar:** `npm test`, `npx astro check` (0 errores), `npm run build` y revisar que la salida no
  tenga `[ERROR] [content]`. Abrir `/admin/` (con `python3 -m http.server` en `app/web/public`) y comprobar que
  el campo aparece.
- **Cómo revertir:** quitar las líneas de `config.yml` y del esquema Zod. Zod descarta las claves que no
  declara, así que las entradas que aún tengan el campo no rompen el build. El dato queda en los archivos
  hasta que se borre con Git.

### 3.2 Quitar un campo (sin romper contenido existente)

- **Cuándo:** un campo ya no se usa.
- **Cómo, en tres pasos separados (cada uno en su commit):**
  1. **Deprecar:** dejar de mostrar el campo en las páginas y marcarlo en `config.yml` con `hint: "En desuso
     (…); se quitará el …"`. El contenido sigue validando.
  2. **Migrar:** mover o borrar el dato de las entradas que lo tengan (con un script o a mano desde el panel).
     Comprobar con `grep -rl "<campo>:" src/content/` que no quedan archivos con él.
  3. **Borrar:** quitar el campo de `config.yml` y de `content.config.ts`, y el término de `context.md` si
     corresponde.
- **Cómo verificar:** `npm run verificar` (tests, `astro check`, build, postbuild, JSON-LD) en cada paso.
- **Cómo revertir:** cada paso es un commit: `git revert` del paso afectado. El paso 2 deja copias en el
  historial, así que nunca se pierde el dato.

### 3.3 Agregar una colección nueva

- **Cuándo:** aparece un tipo de entidad que se lista, tiene detalle propio y se relaciona con otras (como
  Documentos o Banners).
- **Cómo:**
  1. Crear la carpeta `src/content/<nombre>/` con archivos `.yml` (datos sin cuerpo, como `areas`) o `.md`
     (con cuerpo, como `noticias`). Verificar que la carpeta exista antes de referenciarla.
  2. En `public/admin/config.yml`, agregar la colección con `folder`, `slug`, los campos y, si tiene vigencia,
     el campo `publicado` (booleano, `default: false`) como en el resto de colecciones.
  3. En `src/content.config.ts`, definir la colección con `loader: yml('<nombre>')` o `md('<nombre>')` y su
     `schema`, y **agregarla al objeto que exporta `collections`** (al final del archivo, ~l. 188). Sin ese paso
     la colección no existe para las páginas.
  4. En `src/lib/contenido.ts`, agregar la consulta que usan las páginas (`publicados('<nombre>')` y, si hace
     falta, un helper con nombre de dominio).
  5. Crear la página: listado `src/pages/<nombre>/index.astro` y ficha `src/pages/<nombre>/[id].astro`, con
     `getEntries`/`getEntry` y `existentes()` de `src/lib/reglas.ts`. Como referencia, copiar la estructura de
     `src/pages/anuncios/`.
  6. Agregar la colección a `COLECCIONES` y `CANTIDAD` en `scripts/datos-sinteticos.mjs` para que el panel
     tenga datos de prueba (`npm run datos:generar`).
  7. Agregar el término a `docs/context.md` y una sección a la guía de usuario (`docs/guia-usuario.md`).
  8. Si la colección se enlaza desde otras, usar `widget: relation` con `reference()` en el esquema.
- **Cómo verificar:** `npm run datos:generar`, reiniciar el servidor de dev (`astro dev stop` y volver a
  levantar), recorrer el listado y la ficha, y luego `npm run verificar`. Revisar la salida del build por
  referencias rotas.
- **Cómo revertir:** quitar la colección de `config.yml`, `content.config.ts`, `contenido.ts`, las páginas y
  `datos-sinteticos.mjs`; borrar `src/content/<nombre>/` solo si no tiene contenido real (ver §6).

### 3.4 Agregar un componente a una página

- **Cuándo:** una página necesita un control o bloque que no existe (un carrusel, un acordeón, una tarjeta).
- **Cómo:**
  1. **Componente propio:** crear `src/components/<Nombre>.astro` con las props tipadas. Si tiene lógica en el
     navegador, la lógica pura va en `src/lib/<nombre>.ts` con su `*.test.ts` (TDD), y el `<script>` solo
     conecta el DOM.
  2. **Componente de Starwind UI:** `npx starwind@latest add <nombre>` lo copia a `src/components/starwind/`.
     **Starwind v3 no es v2**: la documentación en línea de v2 no aplica. Los cambios de valor se escuchan con
     `starwind:value-change`; los `SelectTrigger` necesitan `aria-labelledby`; traducir los textos en inglés
     que traiga (`aria-label`, `sr-only`). Revisar el resultado con `design.md` antes de usarlo.
  3. **Íconos:** solo **Phosphor** (`phosphor-astro`, p. ej. `import ArrowRight from 'phosphor-astro/ArrowRight.astro'`).
     Son SVG sin tamaño propio: dimensionar con `size-*` y marcar `aria-hidden="true"` si son decorativos. Si
     `starwind add` trae íconos Tabler, reemplazarlos.
  4. **Scripts y ClientRouter:** un `<script>` corre una sola vez, pero las páginas navegan sin recargar (View
     Transitions). Por eso el init va en `astro:page-load`, con una guarda de ruta o una marca para no duplicar
     listeners, o se escucha de forma delegada en `document`. Ejemplo real: `src/scripts/url-filtros.ts`.
  5. **Filtros en la URL:** usar `sincronizarFiltrosEnUrl` (`src/scripts/url-filtros.ts`), **nunca**
     `history.replaceState(null, …)`: ClientRouter guarda su estado en `history.state` y, sin él, el botón
     «atrás» deja de navegar.
  6. **Sin atributos de evento inline** (`onclick=`): la CSP no admite `'unsafe-inline'`.
  7. **Medios:** toda imagen con `<Image>` (o `getImage`) y `widths`/`sizes`; las tarjetas reservan aspecto
     (`aspect-video`/`aspect-square`) con un placeholder `bg-muted` si no hay imagen.
- **Cómo verificar:** en `npm run dev`, la página `/componentes` muestra el catálogo interno (solo existe en
  desarrollo, ver `src/pages/[...componentes].astro`). Después, sobre el build: `npm run build`,
  `npm run postbuild` y `npm run preview`, probando la navegación con «atrás» y «adelante» y el teclado.
- **Cómo revertir:** quitar el import y el uso en la página; borrar el archivo si ya nadie lo usa. Si se
  agregó con `starwind add`, borrar también la carpeta copiada.

### 3.5 Agregar una página nueva

- **Cuándo:** una sección con URL propia (por ejemplo, un listado institucional).
- **Antes de programar, revisa si basta una Página libre** (ADR 0005). Una Página libre es un texto con título,
  bajada, imagen y cuerpo, creable desde el panel en `/p/<slug>`, que aparece en «La carrera», en
  «Comunidad», en el pie o en ninguno. **Basta** para textos informativos sin lógica propia (normas, becas,
  preguntas frecuentes, historia). **Hace falta código** para un listado o buscador, una tabla con datos
  propios, un diseño especial, un nuevo desplegable o un nuevo valor de `mostrar_en`.
- **Cómo** (página con código):
  1. **Entrada en el menú:** en `src/lib/navegacion.ts`, agregar un ítem a `MENU` con `etiqueta`, `href` y
     `disponible`. Mientras la página no esté lista, `disponible: false` hace que `src/pages/[seccion].astro`
     genere una página «Próximamente». Cuando la página exista, cambiar a `disponible: true` (la estática
     gana a la dinámica, pero dejar el valor coherente evita confusiones). `MENU` alimenta el navbar y el
     footer de `src/layouts/Base.astro`.
  2. **Página:** crear `src/pages/<ruta>.astro` (o `src/pages/<ruta>/index.astro`) usando `Base` con las props
     `titulo` y, si aplica, `descripcion` e `imagen` (la `og:image`).
  3. **SEO y datos estructurados:** pasar `jsonLd` a `Base`. Los constructores puros están en
     `src/lib/schema.ts` (`migas`, `noticia`, `actividad`, `persona`, `documento`, `listaElementos`…). Si la
     página es un listado, agregar un `BreadcrumbList` con `migas`. `Base` siempre emite `WebSite` y
     `Organization`.
  4. **Sitemap:** `@astrojs/sitemap` la incluye sola. Para excluirla, ajustar el `filter` de `astro.config.mjs`
     (hoy excluye `/admin/` y `/componentes/`).
  5. **Buscador:** si la página tiene contenido buscable, revisar el buscador general (`/buscar`, Pagefind) en
     `npm run preview`.
  6. **Documentación:** agregar la ruta a la tabla de §5 de `architecture.md` y, si es sección del menú, al
     alcance funcional de `context.md`.
- **Cómo verificar:** `npm run verificar` y `npm run verificar:jsonld` (sobre `dist/`); revisar `dist/` para
  confirmar que la página se generó; probar el menú en móvil y escritorio.
- **Cómo revertir:** quitar la página y su ítem de `MENU` (si el ítem queda, el menú muestra un enlace
  «Próximamente», lo que es preferible a un enlace roto).

### 3.6 Agregar un proveedor de embed a la lista cerrada

- **Cuándo:** se quiere incrustar un video, documento o mapa de un servicio nuevo (por ejemplo, Vimeo ya
  está; uno nuevo sería, p. ej., un visor de documentos distinto de Drive).
- **Cómo:**
  1. **Validar el enlace:** agregar la regla en `src/lib/incrustados.ts`, que es el punto único para sumar
     proveedores de contenido incrustado. Reutiliza los parsers de `src/lib/enlaces.ts` (`idYouTube`,
     `vistaPreviaDrive`) y de `src/lib/instagram.ts` (`embedInstagram`). Si el servicio no admite iframe, va a
     la lista de tarjetas-enlace (`SIN_IFRAME`). Escribir los casos en `src/lib/incrustados.test.ts`: al menos
     uno válido y uno inválido, y los hosts con y sin `www.` o `m.`. Un enlace no reconocido se muestra como
     tarjeta-enlace, nunca como reproductor.
  2. **Lista cerrada en la CSP:** agregar el origen a `frame-src` de la regla `/*` en `public/_headers`. Si el
     proveedor sirve miniaturas, agregarlo a `img-src`. Ver la advertencia de `_headers` sobre la suma de reglas:
     no tocar la regla `/admin/*` por esto.
  3. **Componente:** `src/components/Incrustados.astro` ya renderiza los `<iframe>` (con `title`,
     `loading="lazy"` y alto fijo o `aspect-video`). Para un proveedor nuevo basta con agregar, si hace falta,
     su permiso en `PERMISOS` y su alto en `ALTO`. Las clases van completas, sin construirlas con texto.
  4. **Documentación:** agregar el proveedor a la lista de `architecture.md` §7 y a la tabla de incidentes de
     `guia-mantencion.md` §9.
- **Cómo verificar:** la CSP **no se aplica en `npm run dev`**, así que una violación solo aparece sobre el
  build servido: `npm run build && npm run postbuild && npx wrangler dev` (sirve `dist/` según `wrangler.jsonc`).
  Revisar que la cabecera llegue con `curl -I`, que el embed cargue y que la consola del navegador no muestre
  errores de `frame-src`.
- **Cómo revertir:** quitar el origen de `frame-src` y la regla del parser. Los contenidos que ya usan el enlace
  pasan a verse como tarjeta-enlace, sin romper la página, porque el parser nunca lanza un error.

**Proveedores de contenido incrustado** (estado actual de `src/lib/incrustados.ts`):

| Proveedor | Se muestra como | Origen en `frame-src` |
|---|---|---|
| YouTube | `VideoModal` (sin cookies) | `www.youtube-nocookie.com` |
| Spotify | reproductor, 152 px (episodio, pista) o 352 px | `open.spotify.com` |
| SoundCloud | reproductor, 166 px (pista) o 450 px (set) | `w.soundcloud.com` |
| Apple Podcasts | reproductor, 175 px (episodio) o 450 px | `embed.podcasts.apple.com` |
| Vimeo | reproductor 16:9 | `player.vimeo.com` |
| Instagram | reproductor, 600 px (publicación o reel) | `www.instagram.com` |
| Facebook | plugin de publicación (600 px) o de video 16:9 | `www.facebook.com` |
| Google Maps | mapa de búsqueda, 400 px, o el `embed` tal cual | `www.google.com` |
| Google Drive / Docs | vista previa, 480 px | `drive.google.com`, `docs.google.com` |
| X, TikTok, LinkedIn, Threads, Bluesky, `maps.app.goo.gl` | tarjeta-enlace con el nombre del servicio | ninguno |
| Cualquier otra `https:` | tarjeta-enlace sin nombre | ninguno |


---

## 4. Contenido enriquecido dentro del cuerpo

Esta sección resuelve lo que pidió la carrera: que el texto pueda llevar imágenes, emojis, video, PDF y mapas
sin que la persona editora escriba HTML.

| Elemento | Estado | Cómo |
|---|---|---|
| **Imágenes en el texto** | Funciona (comprobado el 2026-10-11) | El editor del panel inserta `![alt](@/assets/media/…)` (`public_folder` global de `config.yml`) y Astro la optimiza a WebP con `width`/`height` y `loading="lazy"`. Los datos sintéticos incluyen imágenes en el cuerpo para verlo. |
| **Emojis** | Funciona | Son Unicode y no necesitan configuración. Regla de accesibilidad: un emoji nunca es el único portador de un significado; acompañarlo con texto. |
| **Video (YouTube)** | Ya existe como campo | Noticias tiene el campo `video` y se muestra con `VideoModal` debajo del cuerpo. Para incrustar un video *dentro* del texto, ver la propuesta de componente de editor más abajo. |
| **PDF** | Parcial | Para Documentos, `src/lib/enlaces.ts` (`vistaPreviaDrive`) convierte el enlace de Drive en vista previa (`src/pages/repositorio/[id].astro`). Un PDF propio (R2) **no está implementado**. |
| **Mapa** | No implementado | Ver propuesta abajo. |

### 4.1 Por qué no HTML pegado

El editor no debe aceptar HTML crudo: la CSP lo bloquea (sin `'unsafe-inline'`, los `<script>` y los estilos
inline no cargan) y además abre la puerta a contenido inseguro. Todo lo que el editor inserta debe pasar por un
**componente** con parámetros validados.

### 4.2 Opciones para video, PDF y mapa

| Opción | Ventajas | Riesgos |
|---|---|---|
| **A. Campo dedicado** (como `video`) | Simple, validado por Zod, sin código nuevo en el editor | Un campo por cada lugar donde se quiera; poco flexible para varios bloques en un texto |
| **B. Componente de editor de Sveltia + transformación en el build** | Varios bloques dentro del texto, con formulario en el panel | Depende de la API de Sveltia (pre-1.0); requiere un plugin de Markdown y una dependencia nueva; hay que mantener el patrón de sintaxis |

**Recomendación:** empezar con la opción A para video y PDF (ya casi resuelta) y evaluar B solo si aparece la
necesidad de varios bloques incrustados en un mismo texto.

### 4.3 Propuesta (no implementada): componente de editor para mapa

Sveltia permite registrar componentes propios para los campos `richtext` y `markdown` con
`CMS.registerEditorComponent`. Según su documentación oficial (`sveltiacms.app/en/docs/api/editor-components`),
cada componente tiene `id`, `fields`, `pattern`, `toBlock` y, opcionalmente, `fromBlock`, `label` y `toPreview`.
La forma de la sintaxis queda a criterio del equipo.

Ejemplo de **propuesta** para `public/admin/mapa-editor.js` (cargado como archivo externo, para que la CSP
`script-src 'self'` lo permita sin `'unsafe-inline'`):

```js
// PROPUESTA — no implementada. Registrar después de que cargue sveltia-cms.js
// (confirmar el momento exacto de carga en la documentación de Sveltia).
CMS.registerEditorComponent({
  id: 'mapa',
  label: 'Mapa',
  icon: 'map',
  fields: [
    { name: 'titulo', label: 'Título del mapa', widget: 'string' },
    { name: 'url', label: 'Enlace de OpenStreetMap o Google Maps', widget: 'string' },
  ],
  pattern: /^:::mapa\s+titulo="([^"]*)"\s+url="([^"]*)"\s*:::$/m,
  fromBlock: (m) => ({ titulo: m[1], url: m[2] }),
  toBlock: ({ titulo, url }) => `:::mapa titulo="${titulo}" url="${url}":::`,
  toPreview: ({ titulo }) => `[Mapa: ${titulo}]`,
});
```

En `public/admin/config.yml`, el campo `body` de Noticias o Actividades debe permitir el componente:

```yaml
- { name: body, label: Cuerpo, widget: richtext, editor_components: [image, mapa] }
```

Para que el sitio lo convierta en un `<iframe>` accesible, haría falta una transformación en el build. Se haría
con un plugin de remark en `astro.config.mjs`, dentro de `markdown.remarkPlugins` (Astro lo admite en la
configuración de Markdown), que reemplace el párrafo `:::mapa …:::` por un nodo HTML con `title`,
`loading="lazy"` y aspecto reservado, y que valide la URL contra la lista cerrada. **Propuesta, no
implementada**: requiere agregar una dependencia para recorrer el árbol de Markdown y probar el plugin en
una página de prueba.

**Cambios de CSP que requeriría cada proveedor de mapa** (se hacen con la receta §3.6):

- OpenStreetMap: `https://www.openstreetmap.org` en `frame-src`.
- Google Maps: `https://www.google.com` en `frame-src`, y revisar si el embed pide algo en `img-src` o `connect-src`.

Ninguno de los dos está en la lista cerrada hoy; agregarlos es una decisión que conviene registrar como ADR.

---

## 5. Quitar una función

Una función se quita en el mismo orden que un campo (§3.2), pero aplicado a una página o componente:

1. **Ocultar** el acceso (quitar el ítem de `MENU` o el enlace) en un commit.
2. **Migrar** el contenido que dependía de ella (noticias, anuncios, documentos) o confirmar que no tiene.
3. **Borrar** la página, el componente y su prueba, y actualizar `architecture.md` y `context.md`.
4. Si la función tenía un embed o una colección, quitar también el origen de `frame-src` y la colección (§3.3).

Cada paso es un commit y se verifica con `npm run verificar`. No borrar contenido real sin consultar (`AGENTS.md`).

---

## 6. Hoja de ruta sugerida

Backlog ordenado por valor para la carrera. El esfuerzo (S/M/L) es una **estimación** del proveedor, no un
compromiso; las dependencias indican qué debe existir antes.

| # | Ítem | Esfuerzo | Depende de |
|---|---|---|---|
| 1 | **Despliegue automático al publicar** con Workers Builds y login OAuth de Sveltia (etapas 3–4 del [plan de ambientes](plans/2026-10-11-plan-ambientes-qa-produccion.md)) | L | Cuenta central y repositorio definitivo |
| 2 | **Limpieza del contenido de ejemplo** y de la noticia de prueba antes de la entrega | S | Revisión con la carrera |
| 3 | **Componentes de editor** para video, PDF y mapa (§4) | M | Decisión entre opciones A y B (§4.2) |
| 4 | **Guía de usuario con pantallazos** (`guia-usuario.md`) | S | Cuenta oficial del panel |
| 5 | **Fase 3 de la Noticia**: preguntas a la carrera (`preguntas-reunion.md`) | M | Respuestas de la reunión |
| 6 | **Analítica sin cookies** (Cloudflare Web Analytics), ver `guia-mantencion.md` §8 | S | Dominio definitivo y ampliar la CSP |
| 7 | **R2 para documentos propios** (PDF que no estén en Drive) | M | Cuenta de Cloudflare de la carrera y decidir si se usa |
| 8 | **Mejoras de búsqueda**: hoy los buscadores corren en el navegador, adecuados para cientos o miles de registros | M | Crecimiento real del contenido |

---

## 7. Checklist de cada cambio

Antes de cada commit o mezcla a `main`:

- [ ] `npm test` en verde (Vitest; reglas puras y pruebas nuevas para la lógica agregada).
- [ ] `npx astro check` con **0 errores**.
- [ ] `npm run verificar` en verde antes de mezclar a `main` (incluye tests, check, build, postbuild y JSON-LD).
- [ ] Revisar la salida del build: ninguna línea `[ERROR] [content]` nueva (referencias rotas).
- [ ] Si se tocó la CSP o un embed: probar sobre el build servido (`npx wrangler dev`), no en `npm run dev`.
- [ ] Revisión en móvil y con teclado (foco visible, nombres accesibles, sin desplazamiento horizontal).
- [ ] Los datos nuevos de prueba son `sint-*` y no se commitean (`npm run datos:limpiar` antes del commit).
- [ ] Documentación: `architecture.md` / `context.md` si cambió comportamiento, interfaces o supuestos; ADR si
      es una decisión.
- [ ] Sin secretos: revisar con gitleaks (`gitleaks git --log-opts="--all" --redact`) antes de subir a un remoto
      nuevo.
- [ ] Los agentes no hacen `push`: lo hace la persona (ADR 0004).
