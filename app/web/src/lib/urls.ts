// Validación de las direcciones que vienen del panel y terminan en un href o src. `z.url()` de Zod acepta cualquier
// esquema (`javascript:`, `data:`…), así que los campos de enlace usan estos esquemas. La CSP ya bloquea `javascript:`,
// pero el contenido no debe depender de ella (defensa en profundidad).
import { z } from 'astro/zod';

/** Dirección externa: solo http o https. */
export const urlWeb = z.url({ protocol: /^https?$/, error: 'Debe ser una dirección completa que empiece con https://' });

/** Ruta interna del sitio (`/…`, no `//…`) o dirección externa http(s). */
export const enlaceDelSitio = z.union([z.string().regex(/^\/(?!\/)\S*$/, 'Ruta interna: debe empezar con /'), urlWeb]);
