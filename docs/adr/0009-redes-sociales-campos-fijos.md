# 0009 · Redes sociales: campos fijos en el panel

- **Estado:** Accepted · 2026-10-12 · la persona responsable del proyecto lo decidió («campos fijos»)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `../context.md` (Redes sociales) · `../architecture.md` (§ Redes sociales en el pie) · `../design.md` (Pie)

## Contexto

La comunidad tiene perfiles en varias redes (Instagram, LinkedIn, Mastodon…) y el pie del sitio debía mostrarlos.
La cuenta de Instagram estaba fija en el código (`URL_INSTAGRAM`, pendiente de confirmar). Las redes cambian y las
debe poder actualizar el equipo desde el panel, sin tocar código.

## Decisión

1. **Campos fijos**: un archivo único `src/content/redes/redes.yml` (colección `redes`, editado como archivo «Redes
   sociales» de la colección `paginas`) con **una URL opcional por red**, en un orden fijo: Instagram, Facebook, X,
   LinkedIn, YouTube, TikTok, Threads, Bluesky y Mastodon / Fediverso.
2. Solo se muestran las redes con URL `https://`. Las demás no aparecen (ni en el pie ni en el JSON-LD).
3. Cada red tiene un ícono de **Phosphor** y un nombre accesible («BIOING+ en Instagram»). Los enlaces abren una
   ventana nueva con `rel="noopener me"` (`me` permite verificar el perfil en Mastodon).
4. Las URLs alimentan el `sameAs` de la Organization (JSON-LD) y el botón «Seguir en Instagram» de `/instagram`.
5. Son enlaces simples a perfiles: sin scripts ni incrustados. No son botones de compartir (ver
   `../preguntas-reunion.md` 2.6).

## Consecuencias

- Agregar una red nueva no es solo del panel: exige cambiar el código (`REDES` en `src/lib/redes.ts`, el ícono en
  `RedesSociales.astro`, el campo en `config.yml` y en `content.config.ts`). Es el costo de no tener una lista libre.
- Un cambio de URL o una red que se quita se publica en el siguiente build (como el resto del panel).
- El orden y las etiquetas son los del código, no los del archivo: el equipo no puede reordenarlas desde el panel.

## Alternativas

- **Lista libre** (widget `list` con nombre, URL e ícono elegido): más flexible, pero el ícono y el nombre quedan
  sin validar contra los íconos disponibles, y hay que resolver cada red desconocida.
- **Enlaces en el pie como Páginas libres**: sin íconos, y mezcla los perfiles con el contenido del sitio.
- **Dejar la cuenta fija en el código** (estado anterior): obliga a un cambio de código por cada cambio de perfil.
