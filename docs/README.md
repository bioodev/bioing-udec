# Documentación — BIOING+

Índice de la documentación del proyecto. El código y el contenido viven en [`app/web`](../app/web); acá está
el porqué, el cómo y el estado.

## Empezar por aquí (evergreen: se actualizan en sitio, sin fecha)

| Documento | Qué es | Cuándo leerlo |
|---|---|---|
| [`context.md`](context.md) | Propósito, alcance y **glosario canónico** del dominio | Antes de nombrar o modelar cualquier cosa |
| [`architecture.md`](architecture.md) | Estado actual: stack, componentes, modelo de contenido, rutas, build y despliegue | Antes de tocar código o la config del CMS |
| [`design.md`](design.md) | Sistema de diseño (referencia estilo Apple + implementación con Starwind UI v3) | Antes de crear o cambiar pantallas |

## Referencia operativa vigente

| Documento | Qué es |
|---|---|
| [`pendientes-infra.md`](pendientes-infra.md) | Checklist de lo que falta para producción (cuentas, dominio, CI/CD, contenidos) |
| [`preguntas-reunion.md`](preguntas-reunion.md) | Preguntas abiertas con el equipo BIOING+, cada una con propuesta por defecto |
| [`bitacora.md`](bitacora.md) | Requisitos acordados en reuniones + ajustes y decisiones de cada sesión |
| [`despliegue-cloudflare.md`](despliegue-cloudflare.md) | Procedimiento paso a paso del despliegue (ambiente de desarrollo y camino a producción) |
| [`guia-evolucion.md`](guia-evolucion.md) | Cómo agregar o quitar funciones sin romper nada: principios, tabla de decisión y recetas para quien mantiene el sitio |

## Guías de entrega (entregables de cierre)

| Documento | Para quién | Estado |
|---|---|---|
| [`guia-usuario.md`](guia-usuario.md) | Encargado/a de comunicaciones: cómo publicar desde el panel | Esqueleto (los pantallazos llegan en la Fase C) |
| [`guia-mantencion.md`](guia-mantencion.md) | Quien tome el proyecto después: rutinas, despliegue, incidentes, traspaso | Esqueleto |

## Propuestas y documentos de la carrera

- [`propuesta-arquitectura-y-contenidos.md`](propuesta-arquitectura-y-contenidos.md) (+ [`.pdf`](propuesta-arquitectura-y-contenidos.pdf)) — especificación funcional principal; leerla antes de diseñar cualquier sección.
- [`propuesta-desarrollo.md`](propuesta-desarrollo.md) (+ [`propuesta-desarrollo-v2.docx`](propuesta-desarrollo-v2.docx)) — propuesta comercial, arquitectura, plan de trabajo, costos y garantía.

## Decisiones (ADR)

En [`adr/`](adr/), numeradas, con Estado · Contexto · Decisión · Consecuencias · Alternativas:

- [`0001-sveltia-cms-astro.md`](adr/0001-sveltia-cms-astro.md) — el stack del sitio.
- [`0002-estructura-de-la-documentacion.md`](adr/0002-estructura-de-la-documentacion.md) — esta estructura.
- [`0003-cuenta-central-anticipada-y-ambientes.md`](adr/0003-cuenta-central-anticipada-y-ambientes.md) — cuenta central adelantada; ambientes QA y producción.
- [`0004-flujo-de-trabajo-una-persona.md`](adr/0004-flujo-de-trabajo-una-persona.md) — solo `main` se construye; QA a mano; agentes sin push.
- [`0008-secciones-desactivables.md`](adr/0008-secciones-desactivables.md) — secciones fijas que el panel desactiva del todo (404, sitemap, buscador, Inicio), con integración de build.
- [`0009-redes-sociales-campos-fijos.md`](adr/0009-redes-sociales-campos-fijos.md) — redes sociales del pie como campos fijos opcionales en el panel (Mastodon/Fediverso con `rel="me"`).
- [`0010-seo-desde-el-panel.md`](adr/0010-seo-desde-el-panel.md) — SEO configurable desde el panel: descripción y verificación del sitio, bloque SEO por contenido y «No mostrar en buscadores».
- [`0011-encabezados-de-listado-e-iconos.md`](adr/0011-encabezados-de-listado-e-iconos.md) — imagen e ícono opcionales en los encabezados de los listados y en el bloque «¿Eres egresado/a?»; lista curada de íconos Phosphor en el panel.
- [`0012-analitica-sin-cookies.md`](adr/0012-analitica-sin-cookies.md) — analítica con Cloudflare Web Analytics (sin cookies ni banner), token opcional desde el panel; Google Analytics descartado.
- [`0013-orden-del-panel-y-archivos-aparte.md`](adr/0013-orden-del-panel-y-archivos-aparte.md) — colecciones agrupadas con divisores, archivos únicos (singletons) en la sección «Archivos», «Páginas libres» → «Páginas» y campos en orden de uso.
- [`0005-paginas-libres-desde-el-panel.md`](adr/0005-paginas-libres-desde-el-panel.md) — páginas creables desde el panel, en `/p/<slug>`, con `mostrar_en` para el menú o el pie.

## Trabajo (histórico, fechado: son fotos del momento, no se reescriben)

- [`plans/`](plans/) — planes de ejecución por hito (`YYYY-MM-DD-plan-tema.md`). Vigente para infraestructura:
  [`2026-10-11-plan-ambientes-qa-produccion.md`](plans/2026-10-11-plan-ambientes-qa-produccion.md).
- [`analisis/`](analisis/) — wireframes acordados, comparativa EmDash, evaluación de Tolaria, revisión de seguridad (2026-10-12) y [datos faltantes del contenido](analisis/2026-10-12-datos-faltantes.md) (2026-10-12).
- [`biotech-imgs-demo/`](biotech-imgs-demo/) — fotos originales (Unsplash) usadas como material de prueba; la
  versión optimizada que usa el sitio está en `app/web/src/assets/media/`.

## Convenciones

- La raíz solo lleva nombres canónicos en mayúsculas: `README.md` y `AGENTS.md` (más `CHANGELOG.md`,
  `LICENSE` o `CONTRIBUTING.md` si algún día aplican). Todo lo demás vive en `docs/`, en minúsculas y
  kebab-case.
- Evergreen: sin fecha. Artefactos de trabajo: fecha ISO primero (`YYYY-MM-DD-tipo-tema.md`).
- `AGENTS.md` es breve y operativo; el detalle vive una sola vez en `docs/` (ver ADR 0002).
