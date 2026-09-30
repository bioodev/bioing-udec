# Sveltia CMS + Astro como stack del sitio

BIOING+ se construye como sitio estático en Astro (`app/web`) con el contenido en archivos dentro del repositorio, editado mediante Sveltia CMS; no hay backend ni base de datos propios. Se eligió porque hay un único Encargado de comunicaciones, bajo volumen y un plazo fijo (marzo 2027), y porque el contenido queda en archivos portables: si Sveltia (pre‑1.0) se abandona, se reemplaza el editor sin migrar datos.

## Considered Options

- **EmDash**: resuelve mejor relaciones y privacidad (base de datos, roles), pero está en beta pública desde abril 2026, guarda el contenido en su propia base y ata el sitio a Cloudflare; aporta plugins y RBAC que el proyecto no necesita.
- **Aplicación propia (`app/web` + `app/api`)**: máxima flexibilidad, pero obliga a construir y mantener admin, autenticación y API para un solo editor.

## Consequences

- Las Fichas, los cruces por Área, los buscadores y el anuario PDF se calculan en el build de Astro, no en el CMS.
- Lo que depende de la fecha (Agenda próximas/realizadas, Anuncios vencidos, Banners vigentes) exige una reconstrucción diaria programada.
- El repositorio debe ser privado y solo contiene datos autorizados para publicarse; los datos de contacto internos quedan fuera (planilla del Google Form).
- El repositorio vive en una instancia Gitea propia (`gitea.bioodev.work`, detrás de Cloudflare, sin SSH: git por HTTPS con token). El Encargado de comunicaciones necesita una cuenta en esa instancia con acceso de escritura; el inicio de sesión del CMS usa PKCE directo contra Gitea, sin cliente OAuth intermedio, y la instancia debe permitir CORS desde el dominio del admin.
- La instancia Gitea la mantiene una persona, no la institución: si el proyecto cambia de manos, hay que migrar el repositorio o traspasar la instancia.
- Las referencias "Persona u Organización" (Oferente, Organizador) se modelan como objetos de tipo variable con un campo de relación por tipo.
- Borrador/Publicado es un campo del contenido; no se usa el Editorial Workflow, porque impide crear entradas relacionadas desde el editor.
- `app/api` queda sin uso por ahora.
