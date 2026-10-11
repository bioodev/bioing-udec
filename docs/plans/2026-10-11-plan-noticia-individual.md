# Noticia individual (`/noticias/[id]`): plan de mejora

**Meta:** llevar la página de Noticia a lo acordado en los wireframes (§3 y tabla de cambios, ítem 6), que el
rediseño v2 dejó fuera, y cerrar los pendientes de SEO y de contenido que quedaron sueltos.

**Origen:** auditoría del 2026-10-11, contra `analisis/2026-10-11-wireframes.md`,
`analisis/2026-09-30-diseno-demo-frontend.md`, `propuesta-desarrollo.md` §6.3, los planes de Fase A, rediseño
v2 y agentes, `context.md` y el código. Hallazgos principales:

- **Hecho:** fecha, título, bajada, imagen, cuerpo, Temas enlazados, Instagram, Cobertura de Actividad,
  Personas mencionadas con enlace a su Ficha, y JSON-LD `NewsArticle` + `BreadcrumbList`.
- **Pedido y nunca planificado:** caja "Información de la noticia" (fecha, categoría, etiquetas, tiempo de
  lectura), etiquetas visibles, galería con ampliación, video en modal y "Te puede interesar". El rediseño v2
  dejó `noticias/[id].astro` fuera de su lista de archivos.
- **Sueltos:** `og:image` de la noticia (el plan del Hito 4 la pide; la página no pasa `imagen` a `Base`); las
  Áreas se cargan pero no se muestran; las Organizaciones nunca enlazan (contradicción entre la demo y
  `EnlaceFicha`).

Reglas: las de `AGENTS.md`. Lógica pura en `src/lib/` con TDD; la página solo consulta `src/lib/contenido.ts`.
Términos según `context.md` (Tema, Etiqueta, Área, Persona mencionada, Cobertura). Un cambio de modelo va en
tres lugares (`config.yml`, `content.config.ts`, `context.md`). Hay que verificar sobre el build servido
(`wrangler dev` o la vista previa), por la CSP.

---

## Fase 1: sin cambios de modelo (se puede hacer ya)

### T1. Metadatos para compartir
- [ ] `[id].astro` pasa `imagen={noticia.data.imagen}` a `Base`: la Noticia con imagen tiene `og:image` y
      `twitter:image` absolutas y propias. Sin imagen se mantiene la por defecto.
- [ ] Verificar en `dist/` que una noticia con imagen trae su `og:image` (URL absoluta con `SITE_URL`).

### T2. Tiempo de lectura (lógica pura)
- [ ] `src/lib/lectura.ts` + test: `minutosLectura(texto)` a ~200 palabras/min, mínimo 1. Antes de contar se
      descartan la sintaxis Markdown, las URLs y las etiquetas HTML.
- [ ] Se calcula en el build desde `noticia.body`.

### T3. Caja "Información de la noticia"
Según el wireframe §3: fecha, categoría, etiquetas y lectura.
- [ ] En escritorio, columna lateral fija (`sticky`) junto al cuerpo. En móvil va **arriba del cuerpo** (nota
      del wireframe).
- [ ] Muestra: fecha (`<time>`), **Categoría** (los Temas, con rótulo y enlace a `/noticias?tema=`),
      **Etiquetas** (enlace a `/noticias?etiqueta=`), **Áreas** (texto) y **Lectura: N min**. Las filas vacías
      se omiten.
- [ ] Los badges de Temas debajo del título se quitan, porque pasan a la caja. El cuerpo conserva su ancho de
      lectura (`max-w-prose` o similar).
- [ ] Ninguna fila envuelve un Badge en `<p>` (trampa conocida: el Badge es un `<div>`).

### T4. Migas de pan visibles
- [ ] Inicio › Noticias › título, arriba de la fecha. Mismo orden que el `BreadcrumbList` del JSON-LD.
      `<nav aria-label="Migas de pan">` con `aria-current="page"` en el último ítem.
- [ ] Componente reutilizable (`Migas.astro`) para usarlo después en Agenda, Anuncios y Repositorio. En esta
      fase solo se usa en Noticia.

### T5. "Te puede interesar" (noticias relacionadas)
- [ ] `src/lib/relacionadas.ts` + test: `noticiasRelacionadas(actual, todas, n = 3)`.
  - Puntaje por coincidencia: Temas compartidos ×3, Etiquetas ×2, Áreas ×1.
  - Desempate por fecha más reciente.
  - Excluye la actual. Si faltan resultados, completa con las más recientes.
  - Solo considera noticias visibles.
- [ ] Sección al final con `TarjetaNoticia` (grilla de 3 en escritorio, 1 en móvil) y enlace "Ver todas las
      noticias".
- [ ] `contenido.ts` expone la consulta. La página no calcula nada.

### T6. Verificación de la fase
- [ ] `npm test`, `npx astro check` (0 errores), `npm run build && npm run postbuild`,
      `npm run verificar:jsonld`.
- [ ] Revisar en el navegador una noticia con y sin imagen, con y sin etiquetas, y a 375 px y 1280 px.
      Comprobar: tema claro y oscuro, navegación con teclado, sin errores de CSP en la consola, y que el
      "atrás" vuelve al listado.

---

## Fase 2: cambios de modelo (piden validar con el Encargado de comunicaciones)

Cada campo nuevo va en `config.yml`, en `content.config.ts` y en `context.md`. Todos son opcionales, así que
el contenido existente sigue siendo válido.

### T7. Texto alternativo de la imagen
- [ ] Campo `imagen_alt` (texto, opcional, con ayuda en el CMS: "describe lo que se ve, no repitas el
      título"). La imagen destacada usa `alt={imagen_alt ?? ''}`. Lo mismo en `TarjetaNoticia`.

### T8. Video en modal
- [ ] Campo `video` (URL de YouTube). Se reutiliza `VideoModal` y `idYouTube()` (ya usados en
      `bioingenieria.astro`). Va debajo de la imagen o del cuerpo.
- [ ] Revisar `frame-src`/`img-src` de la CSP (ya permite `youtube-nocookie` e `i.ytimg.com`).

### T9. Galería de imágenes con ampliación
- [ ] Campo `galeria`: lista de `{ imagen, alt }` (máximo sugerido: 12). Grilla de miniaturas con
      `astro:assets`. Al hacer clic se abre un `<dialog>` modal con la imagen grande, anterior/siguiente con
      teclado (← →) y cierre con Esc. Sin librerías; el script se inicia en `astro:page-load`.
- [ ] La optimización al subir (WebP, 2048 px) ya está configurada en Sveltia.

---

## Fase 3: decisiones pendientes (no implementar sin respuesta)

| Tema | Pregunta | Recomendación |
|---|---|---|
| Documentos en una Noticia (Drive/PDF) | ¿Bloque propio o enlace en el cuerpo? | Empezar con enlaces en el cuerpo. El bloque, cuando se defina el campo "documento" (Hito 4, C5) |
| "Noticia original" (réplica de la FCB) | `preguntas-reunion.md` §2.3 | Campo opcional `fuente_url`, si la carrera lo confirma |
| Ficha de Organización | La demo y el wireframe la enlazan; `EnlaceFicha` dice "fuera de alcance" | Confirmar el alcance. Mientras tanto, corregir el documento que sobra para que no se contradigan |
| Compartir | No está documentado | Si se pide: Web Share API, con "copiar enlace" como alternativa. Nada de botones de terceros (rastreo y CSP) |
| Anterior / siguiente | No está documentado | "Te puede interesar" lo cubre; no agregarlo por ahora |

## Limpieza documental (junto con la Fase 1)
- [ ] `plans/2026-10-11-plan-rediseno-v2.md`: corregir la ruta duplicada de la cabecera y marcar las casillas
      de las tareas hechas (dice "COMPLETADO", pero T1–T6 siguen en `[ ]`).
- [ ] `design.md`: describir la página de Noticia (caja de información, migas y relacionadas) cuando la Fase 1
      quede integrada.

## Ejecución
- **Fase 1:** un subagente (Claude Haiku en Herdr), en el worktree `noticia-fase1`, con commits por tarea. El
  orquestador revisa el diff, verifica en el navegador sobre la vista previa e integra en `develop`.
- **Fase 2:** después de validar los campos con la carrera.
- **Fase 3:** queda en `preguntas-reunion.md`.
