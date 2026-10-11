# Evaluación — Tolaria como herramienta del Encargado de comunicaciones

**Estado: A EVALUAR** (no reemplaza la decisión de `docs/adr/0001-sveltia-cms-astro.md`).

> Añadido 2026-10-11. El equipo lo sugirió como posible forma de "actualizar el sitio"; se documenta
> objetivamente para decidir en una reunión con la carrera (ver `docs/preguntas-reunion.md` §7).

## Qué es Tolaria

Sitio: <https://tolaria.md/> · Repo: <https://github.com/refactoringhq/tolaria> (~9,9 k ⭐).
App de **escritorio**, local-first y open source (AGPL-3.0): organiza notas como **Markdown + YAML
frontmatter** en un "vault" (carpeta), con **Git integrado** (commit, push, historial por nota),
editor de bloques tipo Notion, wikilinks/relaciones, y soporte de agentes IA. Gratis, sin cuenta.

## Por qué encaja en principio

- **Mismo formato que el sitio**: nuestro contenido son archivos Markdown (`.md`) y YAML (`.yml`)
  con frontmatter en `app/web/src/content/<colección>/` — el modelo de Tolaria es compatible.
- **Git nativo**: el sitio se publica desde el repo (CI en Cloudflare); editar + commit + push
  desde la misma app es un flujo coherente.
- Es gratis, sin cuenta y sin datos en la nube (privacidad: dato sensible para datos personales).

## Por qué es solo "a evaluar" (riesgos/brechas)

- **Sin validación de nuestro esquema**: Tolaria no conoce los modelos Zod de
  `src/content.config.ts` ni las relaciones por slug (referencias "Persona u Organización",
  noticia → actividad, etc.). Hoy eso lo garantizan los **formularios de Sveltia CMS** (selects
  sobre las colecciones). En Tolaria cada campo/relación se escribiría/configuraría a mano; hay
  que probar cuánto se puede modelar con sus "types"/relaciones.
- **Media**: Sveltia sube imágenes a `src/assets/media` y las optimiza al subir (WebP, 2048 px,
  calidad 85, EXIF). El flujo de imágenes en Tolaria (carpeta de medios, rutas `../../assets/media/…`)
  no está validado.
- **Perfil del usuario**: el Encargado de comunicaciones es de la carrera (no técnico).
  Sveltia corre en el navegador en `/admin/` ante **cualquier equipo sin instalar nada**, con
  login GitHub; Tolaria exige **instalar/actualizar una app de escritorio**, clonar el repo con
  credenciales y entender vault/frontmatter/commit-push.
- **Licencia**: AGPL-3.0 — uso interno sin problema (el sitio entregado es estático y no se
  distribuye la app); anotar en la revisión legal de la Fase D si acaso.

## Comparación rápida

| Criterio | Sveltia CMS (hoy, ADR-0001) | Tolaria (a evaluar) |
|---|---|---|
| Dónde corre | Web, en `/admin/` del sitio (C3) | App de escritorio local |
| Instalación para el encargado | Ninguna (navegador + login GitHub) | Instalar app + clonar repo |
| Formularios con relaciones | Sí (dropdowns sobre colecciones) | Parcial (editar frontmatter con "types"; mapear) |
| Validación del esquema | Sí (Zod/forms de Sveltia) | No la conoce |
| Imágenes al subir (optimiz) | Sí (A4) | A validar |
| Editor | Formularios (menos vistoso) | Bloques tipo Notion (más rico) |
| Offline | No | Sí (local-first) |
| Historial/undo por contenido | Git | Git integrado por nota |
| Costo/licencia | Open source (MIT/Apache) | AGPL-3.0 (gratis) |

## Criterios para decidir (con la carrera)

1. **Perfil del Encargado**: ¿prefiere un editor de formularios en la web o una app de escritorio
   "como Notion"? ¿Necesita trabajar **offline**?
2. **Mapeo real**: probar un vault de ejemplo con 2–3 entradas reales (campos y relaciones exactas
   del frontmatter) y una imagen, para ver cuánto frontmatter hay que escribir a mano.
3. **Media y referencias**: confirmar que las rutas de imagen (`../../assets/media/…`) y los slugs
   de las relaciones salen bien tras el push.
4. **Respaldo**: ¿el respaldo usaría la misma herramienta?

## Acciones pendientes

- [ ] Probar un vault de ejemplo con la estructura real de `src/content` (una Noticia con
      personas/áreas/actividad, una Persona con perfil de egresado, un Documento).
- [ ] Validar subida de imagen → `src/assets/media` y commit/push desde Tolaria.
- [ ] Llevar la comparación a la reunión con la carrera (preguntas-reunion §7) y decidir si se
      mantiene Sveltia (recomendado por defecto) o se adopta Tolaria para el encargado/respaldo.
- [ ] Si se adopta: definir capacitación (Fase D) y ajustar `config.yml`/documentación.
      Si no: cerrar la evaluación y dejar el ADR-0001 como está.

## Veredicto provisional

Por defecto **seguimos con Sveltia CMS** (decidido y probado: A4/A6, web sin instalar, esquema
validado). Tolaria es atractivo por formato/Git/editor, pero **solo se justifica** si la carrera
prefiere el escritorio/offline o un editor de bloques y acepta escribir/mantener el frontmatter
con sus tipos. Decidir antes de la Fase D (capacitación); no bloquea Fases A–C.