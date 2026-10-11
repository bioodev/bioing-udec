# Evaluación — Tolaria como herramienta de edición (interna, del proveedor)

**Estado: A EVALUAR (interno, solo el proveedor).** No se lleva a la carrera por ahora.
Tampoco reemplaza la decisión de `docs/adr/0001-sveltia-cms-astro.md` (Sveltia CMS).

> Añadido 2026-10-11. Evaluación personal: si Tolaria sirve como herramienta del Encargado de
> comunicaciones (o del respaldo), y en el futuro si conviene crear un **skill** que la
> complemente para que los agentes también editen contenido/Git cuando se requiera.

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

## Criterios de evaluación (internos, del proveedor)

1. **¿Para qué caso?** El Encargado usa Sveltia (web, formularios, validado) — Tolaria solo
   tendría sentido si la edición migrara al escritorio/offline o a un editor de bloques, o como
   herramienta del respaldo.
2. **Mapeo real**: probar un vault de ejemplo con 2–3 entradas reales (campos y relaciones
   exactas del frontmatter) y una imagen, para ver cuánto frontmatter hay que escribir a mano.
3. **Media y referencias**: confirmar que las rutas de imagen (`../../assets/media/…`) y los slugs
   de las relaciones salen bien tras el push.
4. **Agentes**: si los agentes (p. ej. opencode) editan contenido/Git directamente, ¿hace falta un
   skill de Tolaria (vault + frontmatter + commit/push) o alcanza con editar los archivos a mano
   como hoy?

## Acciones pendientes

- [ ] Probar un vault de ejemplo con la estructura real de `src/content` (una Noticia con
      personas/áreas/actividad, una Persona con perfil de egresado, un Documento).
- [ ] Validar subida de imagen → `src/assets/media` y commit/push desde Tolaria.
- [ ] Evaluar (más adelante) si conviene **crear un skill** que documente Tolaria + el modelo de
      contenido del repo, para que los agentes puedan editar contenido y Git con esa herramienta
      cuando se requiera (vault, frontmatter exacto, rutas de media, commit+push).
- [ ] Si se adopta: definir capacitación (Fase D) y ajustar `config.yml`/documentación.
      Si no: cerrar la evaluación y dejar el ADR-0001 como está.

## Veredicto provisional

Por defecto **seguimos con Sveltia CMS** (decidido y probado: A4/A6, web sin instalar, esquema
validado). Tolaria es atractivo por formato/Git/editor, pero **solo se justifica** si se prefiere
el escritorio/offline o un editor de bloques y se acepta escribir/mantener el frontmatter con sus
types. Evaluación interna del proveedor; **no bloquea Fases A–C** y no requiere decisión de la
carrera por ahora. La posible creación de un skill complementario se evalúa más adelante.