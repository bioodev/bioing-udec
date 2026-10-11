# Wireframes (ASCII) — Sitio BIOING+

Bocetos de baja fidelidad de cada pantalla, para acordar estructura y contenido antes de maquetar. No son el diseño final: el estilo visual lo define `docs/DESIGN.md` (acento azul `#0066cc`, tipografía Inter, hairlines en vez de sombras, bandas de fondo alternado claro/oscuro).

**Guía de referencia:** [farmacia.udec.cl](https://farmacia.udec.cl/) (misma universidad), de donde se toman patrones probados: hero en carrusel, tarjetas de noticia con categoría e imagen, detalle con caja "Información del artículo" + galería + "Te puede interesar", y agenda con pestañas Todos / Próximos / Pasados.

**Leyenda:** `[imagen]` imagen · `▣`/`◻` bloque multimedia · `▾` desplegable simple (Select) · `🔎▾` combobox con autocompletado (Combobox) · `→`/`↗` enlace (externo) · `▶` video en modal · banda sombreada = fondo alterno.

**Controles de filtro — combobox vs desplegable:** se usa **combobox** (`Combobox` de Starwind, con búsqueda por texto) en los filtros cuya lista **crece o es larga**: Área, Organización, Categoría/Tema, Tag y Generación. Se deja **desplegable simple** (`Select`) en listas **cortas y fijas**: Año, Tipo de actividad (enum de ~9), Tipo de documento y el control "Ordenar por". Las **pestañas** de Agenda (Todos/Próximos/Pasados) no son selector. En móvil el combobox abre a pantalla completa.

> Desktop. En móvil todo colapsa a una columna y el menú principal pasa a botón hamburguesa (Sheet).

---

## Chrome común (cabecera + pie, en todas las páginas)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ BIOING+   Inicio · ¿Qué es? · Noticias · Agenda · Instagram ·     [FCB ↗] │  ← sticky
│           Directorio · Anuncios · Repositorio                     [🔍]    │
└──────────────────────────────────────────────────────────────────────────┘
                              (contenido de la página)
┌──────────────────────────────────────────────────────────────────────────┐
│ BIOING+                                                                    │
│ Logo FCB · Universidad de Concepción                                       │
│ Contacto · Instagram ↗ · Web FCB ↗ · Créditos                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Inicio (`/`)

El antiguo "banner vigente" pasa a ser un **hero en carrusel**: cada Banner vigente es un slide (imagen a sangre + título + botón). Rota automático, con flechas y puntos; se detiene al pasar el cursor; accesible por teclado.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ‹                           [ imagen del slide ]                        › │  HERO
│                                                                            │  carrusel
│      Título del banner                                                     │  (slides =
│      Bajada corta                                                          │   Banners
│      [ Conoce más → ]                                                      │   vigentes)
│                              ●  ○  ○  ○                                    │
├──────────────────────────────────────────────────────────────────────────┤
│  Noticias recientes                                            Ver más →   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                                  │
│  │ [imagen] │  │ [imagen] │  │ [imagen] │                                  │
│  │ [Categoría]            │  │ …        │                                  │
│  │ Título   │  │ Título   │  │ Título   │                                  │
│  │ bajada…  │  │ bajada…  │  │ bajada…  │                                  │
│  │ hace 2 d │  │ hace 1 m │  │ …        │                                  │
│  └──────────┘  └──────────┘  └──────────┘                                  │
├──────────────────────────────────── (fondo alterno) ──────────────────────┤
│  Próximas actividades                                          Ver más →   │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐        │
│  │ [imagen]          │ │ [imagen]          │ │ [imagen]          │        │
│  │ [tipo]            │ │ [tipo]            │ │ [tipo]            │        │
│  │ Título            │ │ Título            │ │ Título            │        │
│  │ 📅 fecha · 🕒 hora │ │ …                 │ │ …                 │        │
│  │ 📍 lugar          │ │                   │ │                   │        │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘        │
├──────────────────────────────────────────────────────────────────────────┤
│  Anuncios                                                      Ver más →   │
│  • Título …                                     [práctica]  vence 30 nov   │
│  • Título …                                     [proyecto]  vence 15 dic   │
├──────────────────────────────────── (fondo oscuro) ───────────────────────┤
│  En Instagram        ◻ ◻ ◻ ◻   (tarjetas livianas, cargan al pedir)       │
├──────────────────────────────────────────────────────────────────────────┤
│  Directorio de bioingenieros/as   →  Busca egresados/as por generación…    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Noticias — listado (`/noticias`)

Con imágenes, **categoría** y **tags**, buscador, filtros y **ordenamiento** (recientes · antiguas · alfabético A-Z · relevancia).

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Noticias                                                                  │
│  ┌ Buscar ───────────┐ ┌ Categoría 🔎▾┐ ┌ Tag 🔎▾┐ ┌ Año ▾ ┐             │
│  │ Título o bajada    │ │ Todas         │ │ Todos  │ │ Todos │             │
│  └────────────────────┘ └──────────────┘ └───────┘ └───────┘               │
│  Ordenar por: [Recientes ▾]  (Recientes · Antiguas · A-Z · Relevancia)     │
│  Se muestran 12 de 42 noticias                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                                    │
│  │ [imagen] │ │ [imagen] │ │ [imagen] │                                    │
│  │[Categoría]│ │[Categoría]│ │[Categoría]│                                  │
│  │ Título   │ │ Título   │ │ Título   │                                    │
│  │ bajada…  │ │ bajada…  │ │ bajada…  │                                    │
│  │ #tag #tag│ │ #tag     │ │ #tag #tag│                                    │
│  │ hace 2 d │ │ hace 1 m │ │ …        │                                    │
│  └──────────┘ └──────────┘ └──────────┘                                    │
│                      ‹ Anterior   1 2 3   Siguiente ›                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Noticia — detalle (`/noticias/[id]`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Título de la noticia                                                      │
│  ┌──────────────────────────────────────────────────────────────┐         │
│  │                     [ imagen destacada ]                       │         │
│  └──────────────────────────────────────────────────────────────┘         │
│  ┌ Información de la noticia ─────────────┐   Cuerpo … … …                 │
│  │ 📅 10 de octubre de 2026 (hace 2 d)    │   Subtítulos, citas,           │
│  │ 🏷 Categoría: Logros                    │   párrafos.                    │
│  │ # Tags: simulación, clínica, …          │   Bloques multimedia:         │
│  │ ⏱ Lectura: 4 min                        │    ▶ video (modal) ·          │
│  └─────────────────────────────────────────┘    galería ◻◻◻ · Drive · PDF  │
│                                                                            │
│  Galería de imágenes:  ◻ ◻ ◻ ◻ ◻   (clic → ampliar)                       │
│                                                                            │
│  Personas mencionadas:  Ana Pérez →   Juan Soto                           │
│  Organizaciones:        Laboratorio de Biomateriales UdeC →               │
│  Cubre la actividad:    Seminario de Biomateriales 2027 →                 │
│                                                                            │
│  Te puede interesar:  ┌ noticia ┐  ┌ noticia ┐                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Agenda (`/agenda`)

Pestañas **Todos / Próximos / Pasados** (con conteo) + buscador + filtro por **tipo**. Próximos en orden ascendente; pasados (archivo) descendente.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Agenda                                                                    │
│  [ Todos (24) ] [ Próximos (3) ] [ Pasados (21) ]       ┌ Buscar ───────┐  │
│  Tipo: [ Todos ▾ ] (seminario · charla · congreso · taller · …)           │
│  ┌───────────────────────────────┐ ┌───────────────────────────────┐      │
│  │ [imagen]           [tipo]     │ │ [imagen]           [tipo]     │      │
│  │ Título de la actividad        │ │ Título                        │      │
│  │ 📅 fecha · 🕒 hora             │ │ 📅 fecha · 🕒 hora             │      │
│  │ 📍 lugar / modalidad          │ │ 📍 lugar / modalidad          │      │
│  │ 👤 Organizador                 │ │ 👤 Organizador                 │      │
│  │ Descripción corta (emojis 🎉) │ │ Descripción corta …           │      │
│  │ [ Más información ↗ ]          │ │ [ Más información ↗ ]          │      │
│  └───────────────────────────────┘ └───────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Actividad — detalle (`/agenda/[id]`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [tipo]  Título de la actividad                                            │
│  ┌──────────────────────────────────────────────────────────────┐         │
│  │                        [ imagen ]                              │         │
│  └──────────────────────────────────────────────────────────────┘         │
│  📅 fecha · 🕒 hora      📍 lugar / modalidad                              │
│  👤 Organizador: …        🎤 Expositores: Ana Pérez →, …                   │
│  Áreas: Biomateriales                                                      │
│  Descripción (markdown, soporta emojis 🧪) … … …                          │
│  [ Más información / Inscripción ↗ ]        ▶ video (modal, si hay)        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Directorio (`/directorio`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Directorio de bioingenieros/as            🖨 Ver anuario en PDF →        │
│  Egresados/as que autorizaron publicar su perfil.                          │
│  ┌ Nombre ──────────┐ ┌ Generación 🔎▾┐ ┌ Área 🔎▾┐ ┌ Organización 🔎▾┐    │
│  │ Buscar por nombre│ │ Todas         │ │ Todas   │ │ Todas            │    │
│  └──────────────────┘ └───────────────┘ └────────┘ └─────────────────┘      │
│  3 egresados/as                                                            │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                                 │
│  │   (foto)  │ │   (foto)  │ │    A      │  ← inicial si no hay foto        │
│  │ Ana Pérez │ │ C. Rojas  │ │ …         │                                 │
│  │ Cargo·Org │ │ Egreso 20…│ │           │                                 │
│  │ [área][área]            │ │           │                                 │
│  └───────────┘ └───────────┘ └───────────┘   → cada tarjeta lleva a su Ficha│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Ficha de Persona (`/personas/[id]`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌────────┐   Ana Pérez                                                    │
│  │ (foto) │   Bioingeniera, investigadora en biomateriales                 │
│  └────────┘   Cargo: Investigadora · Laboratorio de Biomateriales UdeC     │
│               Egreso: 2019 (generación 2014)                               │
│               Áreas: Biomateriales                                         │
│               🔗 LinkedIn ↗                                                 │
├──────────────────────────────────────────────────────────────────────────┤
│  Expuso en        ┌───┐ ┌───┐ ┌───┐     (actividades)                      │
│  Organizó         ┌───┐ ┌───┐                                              │
│  Noticias         ┌───┐ ┌───┐ ┌───┐                                        │
│  Oportunidades    ┌───┐                                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Anuncios (`/anuncios`) · 9. Repositorio (`/repositorio`)

```
ANUNCIOS                                   REPOSITORIO
┌───────────────────────────────────┐     ┌───────────────────────────────────┐
│ Anuncios                          │     │ Repositorio                        │
│ ┌ Buscar ─┐ ┌ Tipo ▾ ┐            │     │ ┌ Buscar ─┐ ┌Tipo▾┐ ┌Tema 🔎▾┐ ┌Año▾┐│
│ Vigentes                          │     │ 📄 Reglamento de titulación  2025 │
│ • Título          [práctica]      │     │ 📄 Decreto …                 2024 │
│   vence 30 nov · Contacto · ↗     │     │ 📄 Informe …                 2023 │
│ ─────────────────────────────     │     │    (filtrado en cliente)          │
│ Archivo (vencidos)                │     │    vista previa Drive / PDF        │
└───────────────────────────────────┘     └───────────────────────────────────┘
```

---

## 10. ¿Qué es la Bioingeniería? · 11. Instagram · 12. Buscar · 13. 404

```
¿QUÉ ES?                          INSTAGRAM                 BUSCAR (/buscar)
┌────────────────────────┐        ┌───────────────┐        ┌────────────────────┐
│ Título + bajada        │        │ ◻ ◻ ◻ ◻       │        │ 🔍 [ término……… ]  │
│ [ ▶ video en modal ]   │        │ ◻ ◻ ◻ ◻       │        │ Resultados:        │
│ Características:        │        │ (carga bajo   │        │ • Noticia … →      │
│  ▪ Formación científica│        │  demanda)     │        │ • Ficha … →        │
│  ▪ Ingeniería aplicada │        └───────────────┘        │ • Documento … →    │
│  ▪ Campo laboral       │                                 └────────────────────┘
│  ▪ Investigación       │        404 → "Página no encontrada" + enlaces Inicio/Buscar
└────────────────────────┘
```

---

## Versión responsiva (móvil, ~375 px)

Reglas generales: menú principal → botón **hamburguesa** que abre un **Sheet** lateral; todo a **una columna**; los filtros se **colapsan** tras un botón "Filtros" (abre un Sheet o acordeón); el hero reduce altura y el texto se centra abajo; sin scroll horizontal; objetivos táctiles ≥ 44 px.

### Cabecera + menú (Sheet)

```
┌───────────────────────────┐        al tocar ☰:
│ BIOING+              🔍 ☰ │        ┌───────────────────────────┐
└───────────────────────────┘        │ BIOING+                 ✕ │
                                      │ ───────────────────────── │
                                      │ Inicio                    │
                                      │ ¿Qué es la Bioingeniería? │
                                      │ Noticias                  │
                                      │ Agenda                    │
                                      │ Instagram                 │
                                      │ Directorio                │
                                      │ Anuncios                  │
                                      │ Repositorio               │
                                      │ ───────────────────────── │
                                      │ [ Facultad FCB ↗ ]        │
                                      └───────────────────────────┘
```

### Inicio

```
┌───────────────────────────┐
│ ‹   [ imagen slide ]    › │  hero más bajo
│   Título del banner       │  texto centrado
│   [ Conoce más → ]        │
│        ● ○ ○ ○            │
├───────────────────────────┤
│ Noticias recientes        │
│ ┌───────────────────────┐ │
│ │ [imagen]              │ │  1 columna,
│ │ [Categoría]           │ │  se apilan
│ │ Título · hace 2 d     │ │
│ └───────────────────────┘ │
│ ┌───────────────────────┐ │
│ │ …                     │ │
│ └───────────────────────┘ │
│            Ver más →      │
├───────────────────────────┤
│ Próximas actividades      │
│ ┌───────────────────────┐ │
│ │ [imagen]  [tipo]      │ │
│ │ Título                │ │
│ │ 📅 fecha · 🕒 hora     │ │
│ │ 📍 lugar              │ │
│ └───────────────────────┘ │
├───────────────────────────┤
│ Anuncios → …              │
│ En Instagram  ◻ ◻         │
│ Directorio → …            │
└───────────────────────────┘
```

### Listados (Noticias / Agenda / Directorio / Anuncios / Repositorio)

```
NOTICIAS                        AGENDA
┌───────────────────────────┐   ┌───────────────────────────┐
│ Noticias                  │   │ Agenda                    │
│ ┌ Buscar ───────────────┐ │   │ [Todos][Próx.][Pasados]   │  pestañas
│ │                       │ │   │  (scroll horizontal →)    │  deslizables
│ └───────────────────────┘ │   │ ┌ Buscar ───────────────┐ │
│ [ Filtros ▾ ] [Orden ▾]   │   │ │                       │ │
│  (abre Sheet con los      │   │ └───────────────────────┘ │
│   combobox Categoría/Tag/ │   │ [ Tipo 🔎▾ ]              │
│   Año)                    │   │ ┌───────────────────────┐ │
│ 12 de 42                  │   │ │ [imagen]   [tipo]     │ │
│ ┌───────────────────────┐ │   │ │ Título                │ │
│ │ [imagen]              │ │   │ │ 📅 fecha · 🕒 hora     │ │
│ │ [Categoría]           │ │   │ │ 📍 lugar              │ │
│ │ Título                │ │   │ │ 👤 Organizador         │ │
│ │ bajada…               │ │   │ │ Descripción 🎉        │ │
│ │ #tag #tag             │ │   │ │ [ Más información ↗ ] │ │
│ │ hace 2 d              │ │   │ └───────────────────────┘ │
│ └───────────────────────┘ │   └───────────────────────────┘
│ ‹ Ant.   1 2 3   Sig. ›   │
└───────────────────────────┘

DIRECTORIO                      el botón "Filtros" abre:
┌───────────────────────────┐   ┌───────────────────────────┐
│ Directorio                │   │ Filtros                ✕ │
│ 🖨 Anuario PDF →          │   │ Generación 🔎▾            │
│ ┌ Buscar nombre ────────┐ │   │ Área        🔎▾            │
│ └───────────────────────┘ │   │ Organización 🔎▾          │
│ [ Filtros ▾ ]  3 result.  │   │ ───────────────────────── │
│ ┌───────────────────────┐ │   │ [ Limpiar ] [ Aplicar ]   │
│ │   (foto)              │ │   └───────────────────────────┘
│ │ Ana Pérez             │ │
│ │ Cargo · Org           │ │   cada tarjeta a ancho completo,
│ │ [área][área]          │ │   se apilan en 1 columna
│ └───────────────────────┘ │
└───────────────────────────┘
```

### Detalles (Noticia / Ficha / Actividad)

```
NOTICIA                         FICHA
┌───────────────────────────┐   ┌───────────────────────────┐
│ Título                    │   │      ┌────────┐           │
│ ┌───────────────────────┐ │   │      │ (foto) │           │  foto arriba,
│ │ [ imagen destacada ]  │ │   │      └────────┘           │  centrada
│ └───────────────────────┘ │   │ Ana Pérez                 │
│ ┌ Información ──────────┐ │   │ Cargo · Org               │
│ │ 📅 fecha (hace 2 d)   │ │   │ Egreso 2019 (gen. 2014)   │
│ │ 🏷 Categoría          │ │   │ Áreas: Biomateriales      │
│ │ # tags…               │ │   │ 🔗 LinkedIn ↗             │
│ │ ⏱ 4 min               │ │   │ ───────────────────────── │
│ └───────────────────────┘ │   │ Expuso en    ┌──┐ ┌──┐    │
│ Cuerpo … ▶ galería ◻◻◻   │   │ Noticias     ┌──┐ ┌──┐    │  secciones
│ Mencionados: Ana →        │   │ (1 columna por sección)   │  apiladas
│ Te puede interesar: ┌──┐  │   └───────────────────────────┘
└───────────────────────────┘
```

**Notas:** la caja "Información de la noticia" pasa **arriba del cuerpo** en móvil (en desktop va al costado). Las pestañas de Agenda, si no caben, se deslizan horizontalmente. Los combobox y el Sheet de filtros ocupan el ancho completo y se cierran con ✕ o gesto.

---

## Cambios respecto a la implementación actual

Estos wireframes incorporan el feedback de la reunión e implican ajustes sobre lo ya construido:

| # | Pantalla | Cambio | Implica |
|---|----------|--------|---------|
| 1 | Inicio | Banner vigente → **hero en carrusel** (un slide por Banner vigente, autoplay, flechas, puntos, accesible) | Componente `HeroCarrusel` nuevo; los Banners ya existen como colección |
| 2 | Inicio / Agenda | Tarjeta de actividad con **imagen, tipo, título, fecha, hora, organizador, lugar, descripción (emojis), "Más información" (enlace externo)** y **video en modal** | `TarjetaActividad` amplía campos; la descripción es el cuerpo markdown (soporta emojis); "Más información" = `enlace_inscripcion`/enlace externo |
| 3 | Noticias | Tarjetas **con imagen** (ya), **categoría** y **tags** visibles | Categoría ↔ **Tema** (ya existe); **tags = campo nuevo de etiquetas libres** (decidido) |
| 4 | Noticias | **Ordenar por** recientes · antiguas · alfabético · relevancia | Control de orden en el listado (cliente); "relevancia" solo aplica con búsqueda activa |
| 5 | Agenda | **Pestañas Todos / Próximos / Pasados** (con conteo) + filtro por tipo + buscador | Reorganiza el listado actual (hoy separa próximas/realizadas sin pestañas) |
| 6 | Noticia detalle | Caja **"Información de la noticia"** (fecha, categoría, tags, tiempo de lectura) + **galería** + **"Te puede interesar"** | Patrón tomado de farmacia.udec.cl; tiempo de lectura y relacionadas son nuevos |

**Decisión de modelo (acordada):** en CONTEXT.md, **Tema** = clasificación editorial → se muestra como **"Categoría"** de la Noticia (ya existe en el modelo). Los **tags** se resuelven con un **campo nuevo de etiquetas de texto libre** en Noticias (p. ej. `etiquetas: string[]`), editable por el Encargado de comunicaciones sin crear entradas de colección. Implica: añadir el campo en `app/web/src/content.config.ts` (y su espejo en `public/admin/config.yml`), mostrarlo en la tarjeta y el detalle, y permitir filtrar por él. El término canónico sigue siendo **Tema** para la clasificación editorial; "Categoría" es solo su etiqueta visible en Noticias.
