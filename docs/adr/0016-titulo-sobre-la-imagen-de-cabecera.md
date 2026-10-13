# 0016 · Título e introducción sobre la imagen de cabecera de los listados

- **Estado:** Accepted · 2026-10-12 · decisión de la persona responsable del proyecto (pidió integrar la imagen de cabecera con el título)
- **Decisores:** persona responsable del proyecto
- **Contexto relacionado:** `../design.md` (Encabezado de los listados) · ADR 0011 (encabezados de listado; esta decisión reemplaza su diseño visual con imagen)

## Contexto

Con el ADR 0011, un listado con imagen mostraba la imagen arriba, a ancho completo, y el título con su ícono y la
intro debajo. La persona quería que el título y la intro quedaran integrados con la imagen, como una cabecera de
portada, sin que el encabezado ocupara más espacio vertical del necesario.

## Decisión

1. El título (con su ícono) y la intro van **sobre** la imagen, alineados abajo a la izquierda, en blanco.
2. Un velo degradado (`from-black/80 via-black/40 to-transparent`, de abajo arriba) asegura el contraste AA del texto
   blanco sobre cualquier foto, en claro y en oscuro. El texto no cambia con el tema.
3. La imagen tiene altura mínima (`min-h-72` móvil, `sm:min-h-64`) para que una intro larga no se corte en móvil; la
   proporción 16/7 y 3/1 sigue siendo la base.
4. Sin imagen, el encabezado se ve como antes (título + intro sobre el fondo normal).

## Consecuencias

- El título pasa a ser texto blanco sobre la imagen: si la carrera cambia la foto, el velo sigue garantizando el contraste,
  pero una foto muy clara en su zona inferior se verá más oscura de lo que es. Conviene elegir fotos con zona inferior sobria.
- Un título con palabras largas se parte (`break-words` en un `span`), porque una palabra sin espacios (p. ej.
  «bioingenieros/as») no cabe en móvil y, sin esto, se sale de la tarjeta.
- La decisión de ADR 0011 «sin velo, título debajo de la imagen» queda reemplazada en lo visual; el resto de 0011
  (campos del panel, íconos, intro) sigue vigente.

## Alternativas

- **Título debajo de la imagen** (ADR 0011): sin riesgo de contraste, pero ocupa más alto y no integra el título con la
  imagen, que era lo pedido.
- **Imagen de fondo con velo parejo** (sin degradado): el texto abajo queda con menos contraste en fotos claras; se descartó
  en favor del degradado, que oscurece solo donde va el texto.
