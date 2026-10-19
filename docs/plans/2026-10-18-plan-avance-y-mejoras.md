# Plan de avance y mejoras (2026-10-18)

> **Para agentes:** cada tarea es independiente salvo donde se indica «Depende de». Ejecutar en rama o worktree
> propio, sin push (ADR 0004), con `npm run verificar` en verde antes de integrar en `develop`.

**Meta:** ordenar lo que queda hasta la entrega (Hito 5, 15-mar-2027) en lo que **se puede hacer ya** y lo que
**espera a la carrera**, y cerrar los riesgos de entrega que aún no tienen tarea.

**Estado de partida:** `develop` = `c31b972` (solo documentación sobre `main` = `33a54ca`). Hitos 1–3 con todas las
secciones del alcance funcionando con contenido de prueba (anuario incluido); 580 tests, `astro check` 0. Vista
previa en `bioing.bioodev.work` (cuenta personal, `noindex`). Lo pendiente vive en
[`pendientes-infra.md`](../pendientes-infra.md); este plan lo prioriza, no lo reemplaza.

**Validación:** revisado por un agente Claude Code Sonnet (Herdr) el 2026-10-18 contra `pendientes-infra.md`,
`propuesta-desarrollo.md` §3/§9/§11/§13/§14, `preguntas-reunion.md`, ADR 0003, el plan de ambientes y
`auditoria/`. Se incorporaron: frente legal (Ley 21.719), respaldos, plan B de dependencias externas, checklist de
traspaso, ruta crítica por el nombre de la cuenta, y se descartó el arnés Playwright + axe.

**Fechas que mandan** (`propuesta-desarrollo.md` §11 y §13):

| Fecha | Qué |
|---|---|
| 30-nov-2026 | Hito 3: aceptación de la contraparte (secciones restantes) |
| **1-dic-2026** | **Entra en vigencia la Ley 21.719** de datos personales (riesgos 1 y 2 de la propuesta §9) |
| 15-dic-2026 | Carrera: dominio, tarjeta, identidad visual (la cuenta central la adelanta el proveedor, ADR 0003) |
| 15-ene-2027 | Carrera: listado de egresados/as con autorizaciones y contenidos iniciales |
| 31-ene-2027 | Hito 4: producción en el dominio definitivo, metas de calidad cumplidas |
| 15-mar-2027 | Hito 5: capacitación, documentación y acta de entrega |

**Ruta crítica:** visto bueno del nombre de la cuenta central → cuentas (2.1) → migración y OAuth (2.2) → pruebas
reales en el panel (2.3). Todo lo demás puede ir en paralelo.

---

## Bloque 0 — Desbloquear ya (esta semana)

- [ ] **Pedir por escrito el visto bueno del nombre de la cuenta central**, por mensaje y sin esperar la reunión
      (la etapa 0 del plan de ambientes lo permite «por escrito»).
- [ ] Pedir la **designación formal del Encargado de comunicaciones** y de los **dos administradores** de la
      carrera (propuesta §13; riesgo 8). El criterio del Hito 4 («publica sin ayuda») depende de que exista.

---

## Bloque 1 — Cerrar el Hito 3 (→ 30-nov)

### 1.1 Reunión con la contraparte
- [ ] Agenda corta desde `preguntas-reunion.md`: §6 (identidad, alcance, **correo oficial** para `security.txt`),
      §7.1 (Página destacada), §8 (panel), §9 (redes, organizaciones «(ejemplo)», **9.2 enlace del Google Form**
      del Directorio). Vista previa abierta como guion.
- [ ] **Datos personales (Ley 21.719):** decidir con la carrera (y asesoría jurídica UdeC si corresponde) entre
      (a) procedimiento documentado de supresión que incluya el historial de Git, o (b) datos del Directorio fuera
      del repositorio; y confirmar el Google Form como registro de consentimiento. **ADR antes de cargar egresados/as
      reales** (es la decisión más cara de revertir).
- [ ] Pedir el **listado de URLs del sitio WordPress actual** para `_redirects` (supuesto contractual, §10).
- [ ] Pedir la **aceptación formal del Hito 3** y fijar por escrito qué pasa si se atrasan el dominio (15-dic) o el
      listado (15-ene): ver «Plan B» en el Bloque 5.
- [ ] Registrar respuestas en `preguntas-reunion.md`; decisiones como ADR.
- [ ] Proponer como oportunidad los **componentes de editor** para video/PDF/mapa (`guia-evolucion.md` §4).

### 1.2 Puesta al día de la documentación de hitos
- [x] `propuesta-desarrollo.md` §11 marca el Hito 3 «en curso»: actualizar el estado sin tocar lo comprometido.

---

## Bloque 2 — Adelantar el Hito 4 sin esperar a la carrera (ADR 0003)

### 2.1 Cuentas (manual, la persona) — Depende de: Bloque 0
- [ ] Cuenta central (Gmail) con 2FA doble, códigos de respaldo y gestor compartido; reenvío a la jefatura.
- [ ] Organización de GitHub y cuenta de Cloudflare a nombre de la cuenta central, con los administradores
      designados como miembros.

### 2.2 Migración y ambientes — Depende de: 2.1
- [ ] `gitleaks git --log-opts="--all" --redact` y `gitleaks dir . --redact` **antes** del `push --mirror`.
- [ ] Ejecutar las etapas 0–5 de [`2026-10-11-plan-ambientes-qa-produccion.md`](2026-10-11-plan-ambientes-qa-produccion.md)
      (actualizar sus datos viejos al ejecutarlo, p. ej. «develop va 74 commits adelante»): repo privado, Workers
      `bioing-web-qa` y `bioing-web` con Workers Builds, Sveltia Authenticator en `/auth`, `config.yml` con el repo
      definitivo, COOP de `/admin`.
- [ ] Deploy Hook + secret `CF_DEPLOY_HOOK_URL` para `reconstruccion-diaria.yml`.
- [ ] Aviso por correo ante build fallido (sin fallar por `Invalid content reference`). Al tener acceso al dashboard,
      revisar el log del **check rojo del 2026-10-13** (`pendientes-infra.md`).
- [ ] **Respaldos** (riesgo 7; `guia-mantencion.md` §7 está solo con títulos): segundo mirror programado del
      repositorio (p. ej. GitHub Action a otra ubicación de la cuenta central), y una prueba de restauración
      documentada. Completar §7 de la guía.
- [ ] Desmontar la vista previa personal (etapa P) y actualizar ADR 0001 y `AGENTS.md`.

### 2.3 Pruebas reales en el panel — Depende de: 2.2 (login OAuth)
- [ ] Imagen nueva: ruta `'@/assets/media/…'` y sin EXIF/GPS.
- [ ] «Agregar Persona» desde una Noticia, en el mismo commit.
- [ ] Página libre en `/p/<nombre>` enlazada desde un Banner.
- [ ] Incrustados reales (uno por tipo) y Enlaces interno/externo.
- [ ] Ensayo del criterio del Hito 4 con el Encargado designado: publica una Noticia de principio a fin sin ayuda
      (anotar dónde se traba; alimenta la guía de usuario).

---

## Bloque 3 — Calidad verificable

La última evidencia es de la **Fase A (2026-10-11, 12 páginas en `auditoria/resumen-lighthouse.csv`)**, antes de
la segunda y tercera tanda visual (hero, cabeceras sobre imagen, QR, tiempo relativo, «Síguenos»). Lighthouse ya
incluye axe-core, así que **no** se agrega un arnés Playwright + axe (dos dependencias, ~500 MB de navegadores y
mantención para una persona).

### 3.1 Lighthouse — oficial después de 2.2
- [x] **Ahora, solo control rápido**: re-correr las 12 páginas sobre el build local para detectar regresiones de
      las tandas 2 y 3; sumar Anuncio individual y una Página libre.
- [ ] **Medición oficial** sobre el build real de Cloudflare (compresión, `_headers`, CSP) tras 2.2, y de nuevo con
      el contenido real (Bloque 5). Si con volumen (`datos:generar`) sigue bajo 90, ajustar `widths`/`sizes`.

### 3.2 Revisión manual de accesibilidad (WCAG 2.1 AA)
- [ ] Lo que Lighthouse/axe no cubre: orden de foco en el modal del buscador, carrusel del hero (pausa y teclado),
      `prefers-reduced-motion` en GSAP y parallax, contraste del texto blanco sobre las cabeceras con fotos reales.

### 3.3 Navegadores
- [ ] Firefox y Chrome en escritorio a mano; Safari iOS real por `dev:tunel`; Edge (Chromium) basta con un recorrido.
      Evidencia breve en `auditoria/`.

### 3.4 (Opcional) Script de humo sobre el build servido
- [ ] Solo si sobra tiempo: script corto que revise errores de CSP en consola y el «atrás» con filtros en la URL
      (lo que `dev` no muestra). Sin axe.

---

## Bloque 4 — Mantención técnica

- [x] **Parches de bajo riesgo** (un commit por paquete, `verificar` entre cada uno): `astro` 7.3.8, `vitest`
      5.0.5, `wrangler` 4.151.0 (fijado exacto en `package.json`: cambiar la versión a mano).
- [x] **Con revisión visual**: `@starwind-ui/astro` 1.3.0 (minor; revisar componentes) y
      `@astrojs/markdown-satteri` 0.4.4 (0.x, fijado exacto; alimenta `recuadros` y `sanearHtml`: revisar una Noticia
      con recuadros y los tests de `sanear-html`).
- [ ] **TypeScript 7** fuera (major; evaluar aparte con `astro check`).
- [x] Anotar en `guia-mantencion.md` la versión de Sveltia que carga `public/admin/index.html` (pre-1.0; el schema de
      `config.yml` se valida contra esa misma versión).
- [ ] Linter: fuera de este plan. Si se retoma, Biome (un archivo de config) antes que ESLint + plugins.

---

## Bloque 5 — Entrega (dic-2026 → mar-2027)

- [ ] **Plan B si se atrasa la carrera** (propuesta §10: el atraso desplaza las fechas): con el dominio atrasado, el
      Hito 4 se demuestra en `bioing-web.*.workers.dev` de la cuenta central y el dominio queda como redespliegue
      final; con el listado atrasado, se publica el Directorio vacío o solo con perfiles autorizados. Avisar por
      escrito en cuanto se pase cada fecha.
- [ ] **Dominio** (15-dic): titular si es `.cl` y autorización de «UdeC»; `SITE_URL` definitivo, redespliegue,
      actualizar `security.txt` ya existente (`Contact`, `Canonical`, `Expires`), token de Web Analytics,
      validación externa de JSON-LD (Rich Results Test), `_redirects` con las URLs del sitio actual.
- [ ] **Contenido real** (15-ene): egresados/as según el ADR de datos personales, redes (`redes.yml`), imágenes
      reales de `encabezados.yml`, textos institucionales.
- [ ] **Documentos**: decidir R2 sí/no y el campo «documento» (Drive o R2) (`pendientes-infra.md`).
- [ ] **Borrar el contenido de prueba** (lista en `pendientes-infra.md`).
- [ ] **Guía de usuario con pantallazos** del panel real; guía de mantención revisada (respaldos, salud del sitio).
- [ ] **Capacitación**: guion de las dos sesiones de 2 h (Noticia, Actividad, Anuncio, Persona, Banner, Página libre;
      qué hacer si el build falla; supresión de datos personales), con grabación.
- [ ] **Evidencia de verificación** (entregable §14): `npm run verificar`, CSV de Lighthouse oficial y notas de
      la revisión manual y de navegadores, en `auditoria/`.
- [ ] **Checklist de traspaso** (ADR 0003): rotar Deploy Hook, secretos y OAuth App; teléfono y códigos de 2FA;
      quitar al proveedor como dueño; acta de entrega.

---

## Pendientes menores sin bloque (de `pendientes-infra.md`)

- Aviso cuando el repositorio supere 1 GB y revisión periódica de enlaces rotos de Drive (una GitHub Action que solo
  avisa sirve para ambos).
- Build incremental de Astro: **no** hasta que el build crezca (hoy ~1 s).

## Orden recomendado

1. **Esta semana:** Bloque 0 (mensajes), agendar 1.1, parches de bajo riesgo (Bloque 4), control rápido de 3.1.
2. **Antes del 30-nov:** reunión 1.1 con el ADR de datos personales, 1.2, 3.2, 3.3, parches con revisión visual.
3. **Al tener el nombre aprobado:** 2.1 → 2.2 → 2.3; Lighthouse oficial.
4. **Dic–mar:** Bloque 5.
