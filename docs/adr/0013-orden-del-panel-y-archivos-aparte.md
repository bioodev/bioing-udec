# 0013 · Orden del panel: contenido agrupado y archivos aparte

- **Estado:** Accepted · 2026-10-12 · decisión de la persona responsable del proyecto (pidió un panel menos desordenado y eligió esta opción entre las propuestas)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** ADR 0005 (Páginas libres), ADR 0009 y ADR 0010 (archivos de la colección `paginas`), `../guia-usuario.md` §1 y §2.3

## Contexto

El panel listaba todas las colecciones en una sola fila larga, mezcladas con cinco archivos de configuración (Inicio, Secciones del sitio, Redes sociales, SEO del sitio y Encabezados de los listados), que vivían dentro de una colección llamada «Páginas». Además, la colección «Páginas libres» tenía un nombre que no explicaba qué era, y en Noticias el campo **Cuerpo** quedaba al final del formulario, después de siete campos opcionales.

## Decisión

1. **Grupos en el menú lateral**, separados con divisores (`- divider: true` en `collections`): **Contenido** (Noticias, Agenda, Anuncios, Repositorio, Banners, Páginas, Instagram), **Comunidad** (Personas, Organizaciones) y **Listas** (Áreas, Temas). El esquema de la versión fija de Sveltia (0.235.1) no admite un título para cada grupo; el divisor solo separa.
2. **Sección «Archivos»**: los cinco archivos pasan a `singletons` del config, aparte de las colecciones. Mismas rutas, nombres y campos: el contenido y el sitio no cambian.
3. **«Páginas libres» se llama «Páginas» en el panel.** El nombre interno (`paginas_libres`) y sus archivos no cambian.
4. **Ícono** (Material Symbols) y **descripción** de una línea en cada colección.
5. **Orden de los campos**: lo obligatorio y el contenido principal primero (el Cuerpo justo después de la bajada); lo opcional agrupado por tema; el SEO al final. Solo se reordena: no cambian nombres, tipos, `required` ni valores por defecto.
6. **Ancla YAML** `&seo_contenido`: se define en Noticias, que es ahora la primera colección que la usa.

## Consecuencias

- Cambiar el orden del panel es cambiar `config.yml`; el esquema Zod (`content.config.ts`) y el sitio no se enteran.
- Los singletons no admiten descripción ni grupo en el panel. Si se quiere un título de grupo, depende de una versión futura de Sveltia.
- Una colección nueva necesita elegir su grupo y su lugar: el orden de `collections` es el orden del panel.
- Las capturas de la guía de usuario quedan por rehacer (pendientes desde antes).

## Alternativas

- **Solo renombrar y agregar íconos.** No resolvía el orden del Cuerpo ni la duda sobre qué eran «Páginas».
- **Dejar los cinco archivos dentro de «Páginas».** Obliga a abrir una colección para ajustes que no son contenido.
- **Títulos de grupo en lugar de divisores.** No está en el esquema de Sveltia 0.235.1.
