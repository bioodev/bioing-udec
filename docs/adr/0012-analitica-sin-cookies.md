# 0012 · Analítica sin cookies (Cloudflare Web Analytics)

- **Estado:** Accepted · 2026-10-12 · decisión de la persona responsable del proyecto (pidió Google Analytics y eligió analítica sin cookies)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `../guia-mantencion.md` §8 · `../guia-usuario.md` (4.15) · `../architecture.md` (§ 8) · ADR 0010 (SEO desde el panel, donde vive el token)

## Contexto

La carrera quería medir visitas al sitio. Google Analytics coloca cookies y, para cumplirlo con la Ley 21.719 de protección
de datos personales, exigiría un banner de consentimiento en cada visita y enviar datos de navegación a Google. La persona
responsable descartó esa vía. Cloudflare Web Analytics mide visitas agregadas sin cookies ni identificadores en el navegador,
así que no necesita banner. El sitio ya está pensado para ser estático y sin terceros (ver `guia-evolucion.md` §3.6).

## Decisión

1. **Cloudflare Web Analytics**, opcional y configurable desde el panel: grupo **Analítica (opcional)** dentro de
   «SEO del sitio» (`src/content/seo/seo.yml`, clave `analitica.cloudflare_token`). El campo recibe solo el token del
   «manual snippet» de Cloudflare.
2. **Sin token, no se carga nada**: `Base.astro` agrega el `<script>` del beacon solo si `analiticaCloudflare()`
   (`src/lib/seo.ts`, puro, probado) devuelve un valor. El HTML sin token queda igual al anterior.
3. **Con token**: `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"…","spa":true}'>`.
   `spa: true` mide las navegaciones del ClientRouter (View Transitions) como visitas. Es el valor por defecto de
   Cloudflare; se deja explícito para no depender de ese default.
4. **CSP**: la regla `/*` de `public/_headers` admite `https://static.cloudflareinsights.com` en `script-src` y
   `https://cloudflareinsights.com` en `connect-src`. Es la única excepción a «ningún script de terceros»; `csp.test.ts`
   la vigila.
5. **Google Analytics no se implementa.**

## Consecuencias

- Sin cookies ni banner. Cloudflare conserva los datos crudos 7 días y luego los agrega; el panel muestra 6 meses. No hay
  exportación de datos crudos. Si la carrera necesitara más, habría que evaluar otra herramienta.
- Si el dominio está proxied por Cloudflare y la analítica se activa también desde el panel de Cloudflare, se cuenta
  dos veces: el token debe quedar vacío en ese caso.
- El formato del token no está confirmado en la documentación de Cloudflare. El patrón usado (20–64 letras y números) está
  en `seo.ts` y en `config.yml`; si el panel rechaza un token real, hay que revisar ese patrón.
- Hasta que la carrera tenga cuenta de Cloudflare, el beacon no se carga y el sitio no mide nada. La activación queda en
  `pendientes-infra.md`.

## Alternativas

- **Google Analytics 4 con banner de consentimiento**: descartada por la persona (cookies, banner y datos de navegación a Google).
- **Google Analytics 4 sin banner** (modo sin consentimiento): descartada por la persona.
- **Analítica propia en el servidor**: el sitio no tiene backend ni base de datos (ver `architecture.md`).
