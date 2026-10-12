# Revisión de seguridad del sitio (2026-10-12)

Revisión hecha sobre `develop` antes de publicar. Cubre el sitio público, el panel de Sveltia CMS, las cabeceras HTTP,
el contenido que llega desde el panel, las dependencias y los secretos del repositorio.

## Superficie de ataque

- **Sitio estático**: Cloudflare Workers sirve solo los archivos de `dist/` (`wrangler.jsonc` no tiene código de
  servidor). No hay base de datos, sesiones, cookies ni formularios que envíen datos al sitio.
- **Contenido**: lo escribe la persona encargada en el panel, que lo guarda como commits en GitHub. El riesgo
  principal es **contenido malicioso** que entre por una cuenta de editor comprometida o por un commit directo.
  Ese contenido termina en `href`, en `src` o en el HTML del cuerpo.
- **Panel** (`/admin/`): Sveltia CMS desde unpkg. El acceso depende de los permisos del repositorio en GitHub.
- **JavaScript del cliente**: scripts propios, sin `innerHTML` con datos, y Pagefind.
- **Terceros**: iframes de la lista cerrada de incrustados y, si hay token, el beacon de Cloudflare Web Analytics.

## Hallazgos y correcciones

| # | Hallazgo | Riesgo | Corrección |
|---|---|---|---|
| 1 | El HTML crudo del cuerpo Markdown se publicaba tal cual. La CSP frenaba `<script>`, los eventos `on…` y `javascript:`, pero **no** frenaba `<meta http-equiv="refresh">` (redirige a otro sitio), un `<form>` falso para robar datos ni un enlace con `style` que tapara la página. | Medio | Plugin de Sätteri `src/lib/sanear-html.ts` (en `astro.config.mjs`): quita todo el HTML crudo del cuerpo y los enlaces o imágenes con esquemas que no sean http, https, mailto o tel. Las páginas reales quedan idénticas byte a byte. |
| 2 | `z.url()` de Zod acepta `javascript:` y `data:`. Esos campos van a un `href`: enlaces de Personas, sitio web de Organizaciones, inscripción de Actividades, enlace de Anuncios y Documentos y video. El enlace del Banner no tenía ninguna validación. | Bajo (la CSP bloquea `javascript:`) | `src/lib/urls.ts`: `urlWeb`, que acepta solo http(s), y `enlaceDelSitio`, que acepta una ruta interna o http(s). El Banner tiene además un `pattern` en el panel. |
| 3 | La CSP pública no tenía `form-action`. | Bajo | `form-action 'self'`. |
| 4 | Faltaban `Permissions-Policy` y `Cross-Origin-Opener-Policy` en el sitio público. | Bajo | `Permissions-Policy` apaga cámara, micrófono, ubicación, pagos y USB. `Cross-Origin-Opener-Policy: same-origin`. El panel la reemplaza con `!` por `same-origin-allow-popups`, que necesita su inicio de sesión. |
| 5 | `wrangler` 4.148 traía `sharp` con una vulnerabilidad de librsvg (CVE-2026-96889), y `http-cache-semantics` tenía otra. | Bajo (solo en desarrollo y build) | `wrangler` 4.149.0 y `npm audit fix`. |
| 6 | gitleaks detectaba como clave el token ficticio de una prueba (`seo.test.ts`). | Falso positivo | Marcado con `gitleaks:allow`. |
| 7 | Sveltia se cargaba sin versión fija (hecho antes en esta misma sesión). | Medio | Versión fija con `integrity` (SRI) y procedimiento de actualización en `despliegue-cloudflare.md` §12. |

Todas las correcciones tienen pruebas en `src/lib/` (`sanear-html.test.ts`, `urls.test.ts`, `csp.test.ts`,
`panel-sveltia.test.ts`). Se probaron sobre el build servido con `wrangler dev` y las cabeceras reales: 0 errores de
consola y de CSP. Funcionan las páginas, el buscador (Ctrl+K), el formulario del Directorio y el panel.

## Lo que estaba bien

- CSP pública sin `'unsafe-inline'` ni `'unsafe-eval'` en `script-src`. Los scripts inline llevan hash
  (`postbuild-csp.mjs`) y `frame-src` es una lista cerrada que vigila una prueba.
- `X-Frame-Options: DENY` y `frame-ancestors 'none'`, HSTS, `nosniff` y `Referrer-Policy`.
- El JSON-LD escapa `</script` (`src/lib/schema.ts`).
- Las URL de los incrustados se reconstruyen desde IDs validados con expresiones regulares, no se copian tal cual.
- Los enlaces externos llevan `rel="noopener"`. El `postMessage` de Instagram verifica el origen.
- No hay `innerHTML`, `eval` ni `document.write` con datos.
- No hay secretos en el historial de git (gitleaks sobre todos los commits).

## Riesgos aceptados

- **CSP del panel con `'unsafe-inline'` y `'unsafe-eval'`**: Sveltia los necesita. El panel no muestra contenido de
  terceros y solo entra quien tiene permisos en el repositorio.
- **Ingreso provisional al panel con token personal de GitHub (PAT)**: se reemplaza por OAuth con la cuenta de la
  carrera (`pendientes-infra.md`). Mientras tanto, usar un *fine-grained token* limitado a este repositorio y con
  vencimiento.
- **`postcss-selector-parser`** (vía `@tailwindcss/typography`): complejidad cuadrática al leer selectores CSS. Solo
  corre en el build sobre CSS propio, así que no es explotable desde el contenido. El arreglo que propone `npm audit`
  baja a una versión antigua de typography; se revisa en la actualización semestral.
- **Disponibilidad de unpkg**: si unpkg cae, el panel no abre. El sitio público no depende de unpkg.
- **`style-src 'unsafe-inline'`** en el sitio público: lo usan componentes y GSAP. El cuerpo Markdown ya no puede
  traer estilos, porque se quitó el HTML crudo.

## Pendiente (fuera del código)

- Doble factor obligatorio en las cuentas de GitHub y Cloudflare de quienes editan (`guia-mantencion.md` §10).
- `security.txt` con un contacto para reportar vulnerabilidades (`pendientes-infra.md`).
- Repetir esta revisión en la mantención semestral: `npm audit`, gitleaks y las pruebas de cabeceras.
