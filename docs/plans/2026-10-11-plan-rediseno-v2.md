# Rediseño v2 (wireframes) — Plan de ejecución (workstream 2)

> Para opencode. TDD en la lógica pura (filtros/orden) con su `*.test.ts`; UI se valida con build. Casillas `- [ ]`.

**Meta:** aplicar el feedback de la reunión capturado en `docs/analisis/2026-10-11-wireframes.md`: hero en carrusel, tarjetas de actividad completas, orden y etiquetas en Noticias, pestañas en Agenda y comboboxes en filtros largos. Guía visual: `docs/design.md`. Referencia: farmacia.udec.cl.

## Resultado (ejecutado 2026-10-11, opencode en worktree `rediseno-v2`)

**COMPLETADO y validado.** 6 commits: hero carrusel · tarjeta de actividad completa · etiquetas libres en Noticias · orden + filtro por etiqueta en Noticias · Agenda en pestañas (Todos/Próximos/Pasados) con buscador y filtro por tipo · comboboxes en filtros largos (Directorio, Noticias, Repositorio). Nuevo campo `etiquetas` en `noticias` (`content.config.ts` + `config.yml`). Lógica pura con tests (`filtro-noticias`, `filtro-agenda`). Verificación en `develop` combinado: `npm test` 69 ✓ (11 nuevos) · `astro check` 0/0 · `build` 28/30 páginas ✓.

## Restricciones (IMPORTANTES)
- Rama de trabajo: **`rediseno-v2`**. Carpeta: `app/web`.
- **Toca SOLO estos archivos** (para no chocar con el otro workstream):
  `app/web/src/pages/index.astro`, `app/web/src/components/HeroCarrusel.astro` (nuevo),
  `app/web/src/components/TarjetaActividad.astro`, `app/web/src/components/TarjetaNoticia.astro`,
  `app/web/src/pages/agenda/index.astro`, `app/web/src/pages/noticias/index.astro`,
  `app/web/src/pages/directorio.astro`, `app/web/src/pages/repositorio/index.astro`,
  `app/web/src/content.config.ts`, `app/web/public/admin/config.yml`,
  `app/web/src/lib/filtro-noticias.ts` (+ `.test.ts`), `app/web/src/lib/filtro-agenda.ts` (+ `.test.ts`).
  **No edites** `Base.astro`, `astro.config.mjs`, `package.json`, `404.astro`, `buscar.astro`, `public/_headers/_redirects/robots.txt`, `wrangler.jsonc`.
- Usa componentes Starwind ya instalados (`combobox`, `select`, `card`, `badge`, `sheet`). Sin dependencias nuevas. Íconos Phosphor. Textos en español.
- No commitees `CLAUDE.md` ni `AGENTS.md`. Leer antes: `app/web/AGENTS.md`, `docs/context.md`, `docs/analisis/2026-10-11-wireframes.md` (fuente de verdad del diseño), `docs/context.md`.
- Mantén la convención: en colecciones con `publicado` usar helpers de `contenido.ts`, no `getCollection` directo. Commits en español, imperativo, uno por tarea.

## Tareas
- [x] **T1 — Hero en carrusel (Inicio).** `HeroCarrusel.astro`: recibe los Banners vigentes y muestra un slide por banner (imagen a sangre + título + bajada + botón "Conoce más"), autoplay con pausa al hover, flechas, puntos, accesible por teclado y `prefers-reduced-motion`. En `index.astro`, reemplaza el bloque de banner único por el carrusel. Si no hay banners vigentes, no renderiza hero. Verifica con build + revisión.
- [x] **T2 — Tarjeta de actividad completa.** `TarjetaActividad.astro`: imagen, [tipo], título, 📅 fecha · 🕒 hora, 📍 lugar/modalidad, 👤 organizador(es), descripción corta (del cuerpo markdown, soporta emojis), y botón "Más información ↗" (usa `enlace_inscripcion` si existe). Reutilizable en Inicio y Agenda. Mantener accesible.
- [x] **T3 — Etiquetas (tags) en Noticias.** En `content.config.ts` añade a `noticias` el campo `etiquetas: z.array(z.string()).optional()` (tags de texto libre; Categoría sigue siendo `temas`). Refleja el campo en `public/admin/config.yml` (lista de strings, `required: false`). Muestra categoría (Tema) y tags en `TarjetaNoticia.astro` y permite filtrar por tag. Valida `config.yml` (JSON Schema + cargar `/admin/`).
- [x] **T4 — Orden en Noticias.** En `filtro-noticias.ts` añade función pura de orden: `recientes` (por fecha desc, por defecto), `antiguas` (fecha asc), `alfabetico` (título localeCompare 'es'), `relevancia` (solo con búsqueda activa; si no, cae a recientes). Test primero (`filtro-noticias.test.ts`). En `noticias/index.astro` añade el control "Ordenar por" (Select) y el filtro por tag (Combobox) además de los existentes.
- [x] **T5 — Pestañas en Agenda.** En `agenda/index.astro`: pestañas Todos / Próximos / Pasados con conteo, buscador y filtro por tipo (Combobox). Lógica pura de partición/cuenta en `filtro-agenda.ts` con test. Próximos ascendente, pasados descendente.
- [x] **T6 — Comboboxes en filtros largos.** Cambiar a `Combobox` de Starwind los selectores de lista larga: Directorio (Generación, Área, Organización), Noticias (Categoría, Tag), Repositorio (Tema). Dejar `Select` en listas cortas (Año, Tipo de actividad, Tipo de documento, "Ordenar por"). Mantener accesibilidad y el filtrado en cliente existente.

## Cierre
- [x] `npm test` verde (incluye tests nuevos), `npx astro check` 0/0, `npm run build`. Commits por tarea en `rediseno-v2`. Reporta en una línea qué quedó y cualquier decisión tomada.
