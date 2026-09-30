# Demo del frontend para la reunión con BIOING+

## Propósito

Construir en local una demo navegable del sitio para mostrar en la reunión con el equipo BIOING+. Debe validar la estructura, el estilo y el Directorio, y destrabar las preguntas abiertas de `docs/preguntas-reunion.md` con algo concreto en pantalla. El código de base (layout, tema, componentes) se reutiliza en la versión definitiva; el contenido es de ejemplo.

## Decisiones tomadas

- **Componentes**: Starwind UI completo (CLI, componentes copiados a `src/components/starwind/`) sobre Tailwind v4. Sin React ni otros frameworks de islas.
- **Identidad**: `docs/DESIGN.md` tal cual, con logos de relleno ("BIOING+", "FCB UdeC"). La marca definitiva se decide en la reunión (pregunta 6.3); cambiar el acento es cambiar una variable.
- **Catálogo**: página `/componentes` solo en desarrollo, en lugar de Storybook.
- **Publicación**: la demo se ve en local (`npm run dev`); no depende de la infraestructura pendiente (`docs/pendientes-infra.md`).

## Alcance

Incluido:

1. **Base**: `layouts/Base.astro` con menú fijo (sticky), acceso permanente a la FCB, footer institucional y menú móvil (Sheet de Starwind).
2. **Inicio**: Banner vigente; 3 Noticias más recientes; próximas Actividades; Anuncios vigentes.
3. **Detalle de Noticia** (`/noticias/[id]`).
4. **Ficha de Persona** (`/personas/[id]`), rediseño de la actual.
5. **Directorio** (`/directorio`) con filtros.
6. **`/componentes`** (solo desarrollo).
7. **Contenido de ejemplo**: ~10 Personas, 4 Noticias, 3 Actividades, 2 Anuncios, las Organizaciones, Áreas y Temas que necesiten.

Fuera de alcance: Agenda, Anuncios y Repositorio como secciones propias, buscadores (Pagefind), Instagram, "¿Qué es la Bioingeniería?", Ficha de Organización, anuario PDF, modo oscuro. Los ítems del menú sin página muestran "Próximamente".

## Estructura

```
app/web/src/
  styles/starwind.css        tokens de DESIGN.md mapeados a variables de Starwind
  layouts/Base.astro
  components/starwind/       instalados por la CLI de Starwind
  components/                propios: TarjetaNoticia, TarjetaActividad, TarjetaAnuncio, Banner, CabeceraFicha, TarjetaEgresado
  pages/
    index.astro
    noticias/[id].astro
    personas/[id].astro
    directorio.astro
    [...componentes].astro   catálogo; getStaticPaths devuelve [] en producción, así no se publica
    [seccion].astro          "Próximamente" para secciones fuera de alcance
```

## Tema

| Variable Starwind | Valor (DESIGN.md) |
|---|---|
| `--primary` | `#0066cc` |
| `--primary-foreground` | `#ffffff` |
| `--background` | `#ffffff` |
| `--foreground` | `#1d1d1f` |
| `--muted` | `#f5f5f7` |
| `--border` / `--input` | `#e0e0e0` |
| `--outline` | `#0071e3` |
| `--radius` | `18px` (tarjetas); botones en píldora |

Tipografía del sistema (`system-ui, -apple-system, sans-serif`): SF Pro no tiene licencia fuera de Apple.

## Datos

Todas las páginas son estáticas y leen el contenido solo mediante `src/lib/contenido.ts` (`publicados()`, `vinculosDe()`, formatos de fecha). Se agregan ahí los helpers que falten:

- `bannerVigente(ahora)`: Banner publicado con `inicio <= ahora <= fin`; el más reciente si hay varios.
- `proximasActividades(ahora)` y `anunciosVigentes(ahora)`: Anuncio vigente si no tiene `fecha_limite` o no ha vencido.
- `egresadosDelDirectorio()`: Personas con `perfil_egresado.autorizado` y `ficha_activa`.

"Ahora" es la fecha del build (el sitio se reconstruirá a diario en producción).

- **Detalle de Noticia**: Personas y Organizaciones mencionadas enlazan a su Ficha solo si `ficha_activa`; si no, aparecen como texto. Si la Noticia tiene `actividad`, se muestra como Cobertura.
- **Directorio**: el build renderiza todas las tarjetas con atributos `data-` (generación, Áreas, Organización, nombre normalizado sin tildes). Un `<script>` en la página filtra mostrando u ocultando tarjetas según los controles de Starwind (select para generación, Área y Organización; input para nombre). Contador de resultados y mensaje cuando no hay coincidencias.

## Casos límite

- Secciones del Inicio sin datos (sin Banner vigente, sin próximas Actividades, sin Anuncios vigentes): la sección no se renderiza.
- Tarjetas sin imagen: fondo `--muted` en lugar de imagen.
- Persona sin Perfil de egresado autorizado: su Ficha no muestra datos de egresado.

## Verificación

- `npx astro check` y `npm run build` sin errores ni `Invalid content reference`.
- Revisión en navegador de cada página en escritorio y móvil (capturas).
- Directorio: probar cada filtro, combinaciones y el caso sin resultados.
- Revisión de accesibilidad según la skill de Astro (contraste, foco visible, textos alternativos, navegación con teclado del menú móvil).
- `/componentes` muestra todos los componentes propios y de Starwind usados, con sus variantes.
