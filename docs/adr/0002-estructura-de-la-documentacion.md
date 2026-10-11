# 0002 · Estructura de la documentación del proyecto

- **Estado:** Accepted · 2026-10-11
- **Decisores:** proveedor
- **Contexto relacionado:** `../README.md` (índice) · `../../AGENTS.md`

## Contexto

La documentación había crecido sin una regla: la raíz tenía `docs/context.md` (glosario) y `AGENTS.md` (con
instrucciones y, a la vez, detalle de arquitectura y de UI); `docs/` mezclaba propuestas comerciales,
especificaciones funcionales, bitácora de sesiones, wireframes y planes con nombres dispares
(`Propuesta de … .md`, `docs/design.md`, `docs/bitacora.md`, `superpowers/plans/`). Además de ser difícil de recorrer,
esa mezcla obligaba a duplicar contenido: el mismo dato aparecía en `AGENTS.md`, `README.md` y `docs/`, y se
desincronizaba.

## Decisión

Adoptar una estructura única (convención global del entorno de trabajo), sin perder información: cada
documento existente se movió con `git mv` (para conservar el historial) y el detalle se consolidó en
documentos *evergreen* por tema.

- **Raíz**, solo nombres canónicos en mayúsculas: `README.md` (puerta de entrada) y `AGENTS.md` (breve y
  operativo; apunta a `docs/` sin volcar detalle). `CHANGELOG.md`, `LICENSE` y `CONTRIBUTING.md` cuando
  apliquen.
- **`docs/`**, todo en minúsculas y kebab-case:
  - Evergreen (sin fecha, se actualizan en sitio): `README.md` (índice), `context.md` (propósito, alcance y
    glosario canónico), `architecture.md` (estado actual del sistema), `design.md` (UI/UX: referencia +
    implementación).
  - Fechados: `planes/YYYY-MM-DD-plan-tema.md` y `analisis/YYYY-MM-DD-tema.md`.
  - Decisiones: `adr/NNNN-titulo-kebab-case.md` con Estado, Contexto, Decisión, Consecuencias y Alternativas.
  - Referencia operativa vigente: `pendientes-infra.md`, `preguntas-reunion.md`, `bitacora.md`, y las
    propuestas y documentos originales de la carrera (`propuesta-*.md/.pdf/.docx`).

`AGENTS.md` conserva solo lo operativo (comandos, convenciones y trampas conocidas) y el resto vive una sola
vez en `docs/`; `README.md` queda como puerta de entrada y resumen del estado.

## Consecuencias

- Un dato, un lugar: el detalle de dominio en `context.md`, el técnico en `architecture.md`, el visual en
  `design.md`. `AGENTS.md` y `README.md` apuntan en vez de repetir.
- Los documentos evergreen se editan en sitio; los fechados (planes, análisis) son fotos del momento y no se
  reescriben.
- Los planes históricos siguen citando rutas y nombres de su fecha; cuando una ruta se movió, se actualizaron
  las referencias internas en el mismo cambio.
- `docs/context.md` (raíz) pasó a `docs/context.md` y `docs/design.md` a `docs/design.md`: cualquier referencia
  externa al repositorio (correo, chat con la contraparte) debe apuntar a las rutas nuevas.

## Alternativas consideradas

- **Dejar la estructura como estaba** y solo agregar reglas para lo nuevo: no resolvía la duplicación entre
  `AGENTS.md`, `README.md` y `docs/`, que es la causa de que se desincronicen.
- **Documentación por audiencia** (`docs/usuario/`, `docs/proveedor/`, `docs/tecnica/`): más carpetas y
  duplicación de los mismos hechos en varios sitios; se descartó frente a la división por tipo de documento.
- **Un único `AGENTS.md` extenso** (como estaba): cómodo para agentes, pero frágil para personas y para el
  traspaso final a la institución.
