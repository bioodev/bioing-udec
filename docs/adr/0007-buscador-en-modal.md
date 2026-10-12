# 0007 · Buscador en modal (y /buscar como página)

- **Estado:** Accepted · 2026-10-12 · la persona responsable del proyecto lo decidió («modal + página»)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `../design.md` («Buscador (modal y /buscar)») · `../architecture.md` (§6 Capas del sitio, Navbar y buscador)

## Contexto

El buscador vivía solo en `/buscar`: para buscar había que salir de la página. Pagefind 1.5 trae un modal
(`<pagefind-modal>`) que se abre desde cualquier página y responde a `Ctrl+K`. La CSP pública no admite
`'unsafe-inline'` en `script-src`, y ClientRouter reemplaza el DOM al navegar.

## Decisión

1. **Modal** de Pagefind (component UI) abierto desde «Buscar» del escritorio, «Buscar en el sitio» del menú móvil,
   `Ctrl+K` y `/`. Solo existe en el build; en `npm run dev` los botones siguen llevando a `/buscar`.
2. **Carga diferida**: el script y el CSS del componente se agregan al DOM tras la carga de cada página, desde un
   módulo del sitio. No hay JavaScript inline nuevo, así que no cambian los hashes de la CSP.
3. **`/buscar` se mantiene** como página directa (enlaces, pie, sin JS) con su UI clásica y un «Volver».
4. Estilo con las variables `--pf-*` mapeadas a los tokens del tema, también en modo oscuro.

## Consecuencias

- Buscar es un paso menos desde cualquier página. El índice sigue siendo el de `postbuild`: sin `npm run postbuild`
  el modal abre sin resultados, como hoy `/buscar`.
- Dos interfaces de Pagefind conviven (modal y `/buscar`). Migrar `/buscar` a la UI de componentes queda como
  trabajo posterior si se quiere una sola.
- Un Esc seguido de `Ctrl+K` en el mismo instante no reabre el modal de inmediato: el componente se marca como
  cerrado en el evento `close` del `<dialog>`, y `abrirBuscador` espera ese evento (ver `src/scripts/buscador.ts`).

## Alternativas

- **Solo página** (`/buscar`): sin cambios, pero obliga a salir de la página para buscar.
- **`<pagefind-modal-trigger>`**: el trigger del componente trae su propio atajo y botón; el navbar ya tiene el suyo
  y el atajo `/` que el trigger no hace, así que se abre el modal por API (`open()`).
- **Migrar `/buscar` a `<pagefind-searchbox>`**: un solo estilo, pero rehacer filtros y resultados; se dejó para después.
