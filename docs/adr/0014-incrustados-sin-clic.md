# 0014 · Incrustados e Instagram se cargan solos, con esqueleto

- **Estado:** Accepted · 2026-10-12 · decisión de la persona responsable del proyecto (pidió que «Ver publicación aquí» se dispare solo y aceptó dejarlo así)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `../plans/2026-10-10-plan-instagram.md` (diseño anterior, con clic) · `../design.md` (Contenido incrustado, Publicación de Instagram) · ADR 0012 (analítica sin cookies)

## Contexto

Las publicaciones de Instagram (en el Inicio y en `/instagram`) mostraban una tarjeta con el botón «Ver publicación
aquí». El iframe de Meta solo se creaba al hacer clic, con el aviso «Al verla aquí se carga contenido de Instagram
(Meta)». Ese clic funcionaba como consentimiento: sin él, el navegador no contactaba a Meta. El resto del Contenido
incrustado (Spotify, Vimeo, Google Maps…) ya se cargaba con `loading="lazy"`, sin clic, y mientras cargaba se veía un
hueco vacío.

## Decisión

1. **Instagram sin botón**: el iframe se crea cuando la tarjeta se acerca a la pantalla (IntersectionObserver con
   200 px de margen). Se mantiene «Abrir en Instagram». El aviso pasa a «Contenido de Instagram (Meta)». Sin enlace
   incrustable, la tarjeta queda sin iframe.
2. **Esqueleto** en todo iframe incrustado (`Incrustados.astro` y `PublicacionInstagram.astro`): un bloque `bg-muted`
   del mismo tamaño, con pulso suave (sin pulso con `prefers-reduced-motion`), que se quita con el evento `load` del
   iframe. Si el `load` no llega, el iframe se muestra igual a los 8 s. Sin JavaScript, el incrustado se ve como antes.
3. **YouTube no cambia**: `VideoModal` sigue con miniatura y reproductor al hacer clic, en `youtube-nocookie.com`.

## Consecuencias

- Quien visita el Inicio o `/instagram` contacta a Meta sin hacer clic, al bajar hasta las publicaciones. Meta puede
  poner sus cookies dentro del iframe. Si la carrera publica una política de privacidad o un aviso de cookies, debe
  mencionarlo (pregunta 8.16 en `preguntas-reunion.md`).
- El Inicio carga hasta tres iframes de Instagram más al bajar. Con `loading="lazy"` y el observador, no afecta la
  carga inicial.
- La CSP no cambia: `frame-src` ya admite `https://www.instagram.com`.

## Alternativas

- **Mantener el clic y sumar solo el esqueleto.** Conserva el consentimiento explícito. Se descartó porque la persona
  quería ver la publicación sin pasos extra. Volver a esa opción solo exige restaurar el botón en
  `PublicacionInstagram.astro`; el esqueleto sirve igual.
- **Cargar `embed.js` de Instagram.** Necesita un script de terceros en la CSP. Descartado.
