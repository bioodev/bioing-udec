# Diseño — BIOING+

> **Sistema de diseño del sitio.** Se mantiene en sitio: no lleva fecha.
> Todo lo que sigue hasta la sección **«Implementación en BIOING+»** es el **análisis de referencia** (estilo
> Apple) que originó el sistema: por eso habla de las páginas de Apple y no del sitio. La última sección
> describe cómo se implementa el sistema en BIOING+ con Starwind UI v3 + Tailwind v4, y qué se descartó.
> Para el estado del código ver `architecture.md` (§7 imágenes, §9 rendimiento).

## Overview

Apple's web presence is a masterclass in **reverent product photography framed by near-invisible UI**. Every page is a stack of edge-to-edge product "tiles" — alternating light and dark canvases, each centered on a hero headline, a one-line tagline, two tiny blue pill CTAs, and an impossibly crisp product render. Nothing competes with the product. Typography is confident but quiet; color is either pure white, an off-white parchment, or a near-black tile; interactive elements are a single, quiet blue.

Density is unusually low even by contemporary SaaS standards. Each tile occupies roughly one viewport, and there is no decorative chrome — no borders, no gradients, no decorative frames, no shadows on headlines. Elevation appears only when a product image rests on a surface (a single soft `rgba(0, 0, 0, 0.22) 3px 5px 30px` drop for visual weight). The result is a catalog that feels more like a museum gallery: the wall disappears and the artifact takes over.

Store and shop surfaces retain the same chassis but switch modes. The product configurator (iPhone 17 Pro, accessories grid) introduces a tight grid of white utility cards at `{rounded.lg}` (18px) radius with a thin border, paired with a persistent thin sub-nav strip. The environment page leans darker and more editorial. Across all five surfaces the typographic system, spacing rhythm, and the single blue accent are consistent — this is one design language expressed at different volumes.

**Key Characteristics:**
- Photography-first presentation; UI recedes so the product can speak.
- Alternating full-bleed tile sections: white/parchment ↔ near-black, with the color change itself acting as the section divider.
- Single blue accent (`{colors.primary}` — #0066cc) carries every interactive element. No second brand color exists.
- Two button grammars: tiny blue pill CTAs (`{rounded.pill}`) and compact utility rects (`{rounded.sm}`).
- SF Pro Display + SF Pro Text — negative letter-spacing at display sizes for the signature "Apple tight" headline feel.
- Whisper-soft elevation used only when a product image needs to breathe — exactly one drop-shadow in the entire system.
- Tight two-row nav: slim `{component.global-nav}` + product-specific `{component.sub-nav-frosted}` with persistent right-aligned primary CTA.
- Section rhythm across multiple pages: light hero → dark product tile → light utility tile → dark tile → parchment footer — a predictable pulse.

## Colors

> **Source pages analyzed:** homepage, environment, store, iPhone 17 Pro buy page, accessories index. The color system is identical across all five surfaces; only the surface-mode mix differs.

### Brand & Accent
- **Action Blue** (`{colors.primary}` — #0066cc): The single brand-level interactive color. All text links, all blue pill CTAs ("Learn more", "Buy"), and the focus ring root. This is Apple's quiet but universal "click me" signal. Press state shifts to a slightly darker variant via the active scale transform rather than a hex change.
- **Focus Blue** (`{colors.primary-focus}` — #0071e3): A marginally brighter sibling of Action Blue, reserved for the keyboard focus ring on buttons (`outline: 2px solid`).
- **Sky Link Blue** (`{colors.primary-on-dark}` — #2997ff): A brighter blue used on dark surfaces for in-copy links and inline callouts, where Action Blue would disappear against the tile background.

### Surface
- **Pure White** (`{colors.canvas}` — #ffffff): The dominant canvas. Content, utility cards, store tiles, configurator grids.
- **Parchment** (`{colors.canvas-parchment}` — #f5f5f7): The signature Apple off-white. Used for alternating light tiles, footer region, and the default page canvas in store utility sections. Just different enough from white to create rhythm.
- **Pearl Button** (`{colors.surface-pearl}` — #fafafc): A near-white used as the fill for secondary "ghost" buttons — lighter than the parchment canvas so the button still reads as a button against `{colors.canvas-parchment}`.
- **Near-Black Tile 1** (`{colors.surface-tile-1}` — #272729): The primary dark-tile surface on the homepage product grid.
- **Near-Black Tile 2** (`{colors.surface-tile-2}` — #2a2a2c): A micro-step lighter — used where a dark tile sits directly above or below Tile 1 to create the faintest separation.
- **Near-Black Tile 3** (`{colors.surface-tile-3}` — #252527): A micro-step darker — used at the bottom of the stack and in embedded video/player frames.
- **Pure Black** (`{colors.surface-black}` — #000000): Reserved for true void — video player backgrounds, edge-to-edge photographic overlays, the global nav bar background.
- **Translucent Chip Gray** (`{colors.surface-chip-translucent}` — #d2d2d7): The base hex of the translucent gray chip used over photography for circular control buttons. In production, applied at ~64% alpha as `rgba(210, 210, 215, 0.64)`.

### Text
- **Near-Black Ink** (`{colors.ink}` — #1d1d1f): The voice of every headline, every body paragraph, and the dark utility button's fill. Chosen instead of pure black to keep the page feeling photographic rather than printed.
- **Body** (`{colors.body}` — #1d1d1f): Same hex as ink — Apple uses one near-black tone for all text on light surfaces.
- **Body On Dark** (`{colors.body-on-dark}` — #ffffff): All text on dark tiles and on the global nav bar.
- **Body Muted** (`{colors.body-muted}` — #cccccc): Secondary copy on dark tiles where pure white would be too loud.
- **Ink Muted 80** (`{colors.ink-muted-80}` — #333333): Body text on the white Pearl Button surface — slightly softer than pure black.
- **Ink Muted 48** (`{colors.ink-muted-48}` — #7a7a7a): Disabled button text and legal fine-print.

### Hairlines & Borders
- **Divider Soft** (`{colors.divider-soft}` — #f0f0f0): The "border" tone on secondary buttons — functions as a ring shadow rather than a hard line. In production, often applied as `rgba(0, 0, 0, 0.04)`.
- **Hairline** (`{colors.hairline}` — #e0e0e0): The 1px hairline border on store utility cards and configurator chips.

### Brand Gradient
**No decorative gradients.** Atmospheric depth on product photography (the iPhone 17 Pro camera plate, the Apple Watch bands, AirPods reflections) is inherent to the imagery, not a CSS gradient overlay. The environment page's hero uses photographic atmosphere (mountain vista at dawn) but no gradient tokens are defined. Apple is the rare luxury-brand site with zero gradient-based design tokens.

## Typography

### Font Family
- **Display**: `SF Pro Display, system-ui, -apple-system, sans-serif` — Apple's proprietary display face, optimized for sizes ≥ 19px. Defines the voice of every headline.
- **Body / UI**: `SF Pro Text, system-ui, -apple-system, sans-serif` — the text-optimized variant used for body copy, captions, buttons, and links below 20px.
- **OpenType features**: `font-variant-numeric: numerator` is enabled on numeric links (pricing tables, spec sheets). Display sizes rely on tight tracking rather than contextual ligatures.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 600 | 1.07 | -0.28px | Hero headline; the signature "Apple tight" tracking |
| `{typography.display-lg}` | 40px | 600 | 1.10 | 0 | Tile headlines atop every product tile |
| `{typography.display-md}` | 34px | 600 | 1.47 | -0.374px | Section heads (SF Pro Text at display proportions) |
| `{typography.lead}` | 28px | 400 | 1.14 | 0.196px | Product tile subcopy |
| `{typography.lead-airy}` | 24px | 300 | 1.5 | 0 | Environment-page lead paragraphs (the rare weight 300) |
| `{typography.tagline}` | 21px | 600 | 1.19 | 0.231px | Sub-tile tagline; sub-nav category name |
| `{typography.body-strong}` | 17px | 600 | 1.24 | -0.374px | Inline strong emphasis |
| `{typography.body}` | 17px | 400 | 1.47 | -0.374px | Default paragraph |
| `{typography.dense-link}` | 17px | 400 | 2.41 | 0 | Footer / store utility link lists (relaxed leading) |
| `{typography.caption}` | 14px | 400 | 1.43 | -0.224px | Secondary captions, button text |
| `{typography.caption-strong}` | 14px | 600 | 1.29 | -0.224px | Emphasized captions |
| `{typography.button-large}` | 18px | 300 | 1.0 | 0 | Store hero CTAs (the rare weight 300) |
| `{typography.button-utility}` | 14px | 400 | 1.29 | -0.224px | Utility/nav button labels |
| `{typography.fine-print}` | 12px | 400 | 1.0 | -0.12px | Fine-print, footer body |
| `{typography.micro-legal}` | 10px | 400 | 1.3 | -0.08px | Micro legal disclaimers |
| `{typography.nav-link}` | 12px | 400 | 1.0 | -0.12px | Global nav menu items |

### Principles

- **Negative letter-spacing at display sizes.** Every headline at 17px and up carries a slight tracking tighten (`-0.12 → -0.374px`). This produces the iconic "Apple tight" headline cadence. Never used at 12px or below.
- **Body copy at 17px, not 16px.** Apple breaks the SaaS convention and runs paragraph text at 17px. The extra pixel gives the page an unmistakable "reading, not scanning" pace.
- **Weight 300 is real and rare.** Used deliberately on a handful of large-size reads (`{typography.button-large}` at 18px/300 and `{typography.lead-airy}` at 24px/300). It's not an accident — it's a light-atmosphere cue reserved for moments where the content should feel airy.
- **Weight 600, not 700, for headlines.** Apple's headlines sit at weight 600. Weight 700 is used sparingly for `{typography.tagline}` (21px) when a touch more assertion is needed.
- **Line-height is context-specific.** Display sizes use 1.07–1.19 (tight). Body uses 1.47. Utility link stacks in the footer/store use an unusually relaxed 2.41 (`{typography.dense-link}`). The 2.41 is not a bug — it's how the footer's dense link columns breathe.
- **Weight 500 is deliberately absent.** The ladder is 300 / 400 / 600 / 700. Mid-weight readings always use 600.

### Cortes de línea (`text-wrap`)
- **Títulos (`h1`–`h4`)**: `text-wrap: balance` en la base global (`app/web/src/styles/starwind.css`), para que
  los títulos de 2–4 líneas repartan el texto y no dejen una palabra sola en la última línea.
- **Párrafos y textos largos (`p`, `li`, `dd`, `dt`, `figcaption`, `blockquote`)**: `text-wrap: pretty`, que evita
  que la última línea quede con una sola palabra. Cubre las bajadas, descripciones de tarjetas, ítems y el
  cuerpo `prose` de noticias y páginas.
- Un título que no sea `h*` (p. ej. un `span` o un `p` con rol de título) recibe la utilidad `text-balance`
  en su elemento. Las utilidades de Tailwind ganan a la base, así que una utilidad explícita siempre manda.
- Solo cambian el corte de línea: no alteran tamaños, pesos ni textos. Navegadores sin soporte muestran el
  corte normal.

### Note on Font Substitutes
SF Pro is Apple's proprietary system font. When building off-system:

- Use `system-ui, -apple-system, BlinkMacSystemFont` as the first stack entry — on macOS/iOS/Safari this resolves to the real SF Pro.
- For non-Apple platforms, **Inter** (Google Fonts, variable) is the closest open-source equivalent. Inter at weight 600 with `font-feature-settings: "ss03"` approximates SF Pro's rounded "a" character.
- Nudge `letter-spacing` down by `-0.01em` on display sizes to re-create the Apple tight feel; Inter's default tracking runs slightly wider than SF Pro.
- For body text, tighten line-height by `0.03` (from 1.47 → 1.44) when substituting Inter — Inter's taller x-height needs less leading.

## Layout

### Spacing System
- **Base unit:** 8px. Sub-base values (2, 4, 5, 6, 7) are used for tight typographic adjustments; structural layout snaps to 8/12/16/20/24.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 17px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px.
- **Section vertical padding:** `{spacing.section}` (80px) inside a product tile; tiles stack edge-to-edge with 0 gap (the color change provides the break).
- **Card padding:** `{spacing.lg}` (24px) inside utility grid cards.
- **Button padding:** 8–11px vertical, 15–22px horizontal.
- **Universal rhythm constants:** the 17px body line-height multiplier (~25px line) and 21px tagline size show up on every analyzed page.

### Grid & Container
- **Max content width:** ~980px on text-heavy sections (environment), ~1440px on product grids (store, accessories), full-bleed for product tiles (homepage).
- **Column patterns:** 3 to 5 column utility card grid on store/accessories; 2-column side-by-side tiles on homepage occasional sections; single-column centered stack on product tile heroes.
- **Gutters:** 20–24px between cards in a utility grid.

### Whitespace Philosophy
Apple's whitespace is the product's pedestal. Every tile begins with at least 64px of air above its headline and 48–64px below. Product renders are never crowded; the nearest content to a product image is at least 40px away. The footer is the only area that breaks this — there, Apple goes deliberately dense to make the full information architecture visible at a glance.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Full-bleed tiles, global nav, footer, body sections |
| Soft hairline | 1px `rgba(0, 0, 0, 0.08)` border | Utility cards, sub-nav frosted-glass separator |
| Backdrop blur | `backdrop-filter: blur(N)` on Parchment 80% | Sub-nav and the iPhone buy floating sticky bar |
| Product shadow | `rgba(0, 0, 0, 0.22) 3px 5px 30px 0` | Product renders resting on a surface (the only true "shadow" in the system) |

**Shadow philosophy.** Apple uses **exactly one** drop-shadow, and it is applied to photographic product imagery — never to cards, never to buttons, never to text. Elevation in the UI comes from (a) surface-color change (light tile ↔ dark tile) and (b) backdrop-blur on sticky bars. The single shadow is about giving the product weight, not about UI hierarchy.

### Decorative Depth
- **Atmospheric imagery** on the environment page (photographic vista) supplies mood; no CSS gradient involved.
- **Edge-to-edge tile alternation** creates rhythm without borders or shadows — the color change itself is the divider.
- **Backdrop-filter blur** on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` creates a "floating over content" effect that's functional, not decorative.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Full-bleed product tiles (no corner rounding) |
| `{rounded.xs}` | 5px | Inline links when styled as subtle chips (rare) |
| `{rounded.sm}` | 8px | Dark utility buttons (Sign In, Bag), inline card imagery |
| `{rounded.md}` | 11px | White Pearl Button capsules |
| `{rounded.lg}` | 18px | Store utility cards, accessories grid cards |
| `{rounded.pill}` | 9999px | Primary blue pill CTAs, sub-nav buy button, configurator option chips, search input — the signature Apple pill |
| `{rounded.full}` | 9999px / 50% | Circular control chips floating over photography |

### Photography Geometry
- **Hero imagery**: full-bleed, 21:9 or taller on the homepage; 16:9 on environment and shop pages. Product renders are photographic-realistic, often shot on a tinted surface that becomes the tile background.
- **Product renders**: PNG/WebP with transparency; rest on a surface tile and pick up the system shadow.
- **Accessory grid**: square 1:1 crops at `{rounded.lg}` (18px) radius, light neutral backgrounds, product centered with 20–40px internal padding.
- **No rounded imagery in hero tiles** — images are full-bleed rectangular. Rounding (`{rounded.sm}`, `{rounded.lg}`) appears only on inline card imagery.
- Lazy-loading via responsive `srcset` and `sizes` across all breakpoints; CDN-optimized WebP.

## Components

### Top Navigation

**`global-nav`** — Persistent, ultra-thin black nav bar pinned to the top of every page. Background `{colors.surface-black}`, height 44px, text `{colors.on-dark}` in `{typography.nav-link}` (12px / 400 / -0.12px tracking). Links are quiet, spaced ~20px apart, running edge-to-edge across the top. Right-aligned cluster: Search, Bag icons — always visible. On mobile, collapses to hamburger at ~834px and the Apple logo centers.

**`sub-nav-frosted`** — Surface-specific nav that sticks below the global nav. Background `{colors.canvas-parchment}` at 80% opacity with backdrop-filter blur, creating a frosted-glass effect. Height 52px. Content on left: product category name ("iPhone", "Store", "Accessories") in `{typography.tagline}` (21px / 600). Content right: inline nav links in `{typography.button-utility}` (14px), ending in a persistent `{component.button-primary}` ("Buy") or a utility link.

### Buttons

**`button-primary`** — The signature Apple action. Background `{colors.primary}` (Action Blue #0066cc), text `{colors.on-primary}` in `{typography.body}` (SF Pro Text 17px / 400), rounded `{rounded.pill}` (full pill — capsule-shaped), padding 11px × 22px. The full-pill radius IS the brand action signal.
- Active state: `{component.button-primary-active}` — `transform: scale(0.95)` (the system-wide micro-interaction).
- Focus state: `{component.button-primary-focus}` — 2px solid `{colors.primary-focus}` outline.

**`button-secondary-pill`** — Used as the second CTA when two blue pills appear together ("Learn more" / "Buy"). Background transparent, text `{colors.primary}`, 1px solid `{colors.primary}` border, rounded `{rounded.pill}`, padding 11px × 22px. Reads as a "ghost pill."

**`button-dark-utility`** — Global nav actions (Sign In, Bag, language selector). Background `{colors.ink}` (#1d1d1f), text `{colors.on-dark}` in `{typography.button-utility}` (14px / 400 / -0.224px tracking), rounded `{rounded.sm}` (8px), padding 8px × 15px. Active state shrinks via `transform: scale(0.95)`.

**`button-pearl-capsule`** — Product-card secondary button. Background `{colors.surface-pearl}` (#fafafc), text `{colors.ink-muted-80}` in `{typography.caption}` (14px), 3px solid `{colors.divider-soft}` border (functions as a soft ring rather than a visible line), rounded `{rounded.md}` (11px), padding 8px × 14px.

**`button-store-hero`** — A larger primary CTA used on store hero surfaces. Same Action Blue + Paper White as `{component.button-primary}`, but with `{typography.button-large}` (18px / 300 — note the rare weight 300) and slightly more padding (14px × 28px). Used sparingly on the store landing.

**`button-icon-circular`** — Floats over photography. 44 × 44px, background `{colors.surface-chip-translucent}` at ~64% alpha, icon in `{colors.ink}`, rounded `{rounded.full}`. Used for carousel controls, close buttons, and in-image controls (product image thumbnails on the iPhone buy page).

**`text-link`** — Inline body links in `{colors.primary}` (Action Blue). Underlined or non-underlined per context.

**`text-link-on-dark`** — Inline body links on dark tiles in `{colors.primary-on-dark}` (Sky Link Blue #2997ff) — Action Blue would disappear against `{colors.surface-tile-1}`.

### Cards & Containers

**`product-tile-light`** — Full-bleed light tile. Background `{colors.canvas}` (white), text `{colors.ink}`, rounded `{rounded.none}` (0 — tiles touch edges), vertical padding `{spacing.section}` (80px). Centered stack: product name in `{typography.display-lg}` (40px / 600) → one-line tagline in `{typography.lead}` (28px / 400) → two `{component.button-primary}` CTAs ("Learn more" / "Buy") → product render resting on the surface with the system shadow.

**`product-tile-parchment`** — Same as `{component.product-tile-light}` but on `{colors.canvas-parchment}` (#f5f5f7). Used to break two consecutive white tiles.

**`product-tile-dark`** — Full-bleed dark tile. Background `{colors.surface-tile-1}` (#272729), text `{colors.on-dark}`, rounded `{rounded.none}`, vertical padding `{spacing.section}` (80px). Same content stack as the light tile but with `{component.text-link-on-dark}` for inline copy and `{component.button-primary}` (Action Blue still works on the dark surface). Used on the homepage product grid as the alternating dark band.

**`product-tile-dark-2`** — Variant on `{colors.surface-tile-2}` (#2a2a2c). Used where a dark tile sits directly above or below `{component.product-tile-dark}` to create the faintest separation through micro-step lightness change.

**`product-tile-dark-3`** — Variant on `{colors.surface-tile-3}` (#252527). Used at the bottom of the stack and in embedded video/player frames.

**`store-utility-card`** — Used in store grid and accessories grid. Background `{colors.canvas}` (white), 1px solid `{colors.hairline}` border, rounded `{rounded.lg}` (18px), padding `{spacing.lg}` (24px). Top: product image (1:1 crop with `{rounded.sm}` (8px) inner image radius). Below: product name in `{typography.body-strong}` (17px / 600), price in `{typography.body}` (17px / 400), and a `{component.text-link}` ("Buy" or "Learn more"). No shadow by default; product render itself carries the system product-shadow.

**`configurator-option-chip`** — Pill-shaped tappable cell used in the iPhone 17 Pro buy page. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.caption}`, rounded `{rounded.pill}`, padding 12px × 16px. Contains a small product thumbnail + label + price delta. Arranged in a grid of 4–5 options per row.

**`configurator-option-chip-selected`** — Selected state. Border upgrades to 2px solid `{colors.primary-focus}`. Same shape, same content.

**`environment-quote-card`** — A photographic-canvas hero specific to the environment page. Dark photographic backdrop (mountain vista at dawn) with `{colors.surface-tile-1}` as the fallback color, centered white-text headline in `{typography.display-lg}` (40px), small green "Apple 2030" pictographic logo above the headline, single `{component.button-primary}` below. Padding `{spacing.section}` (80px).

**`floating-sticky-bar`** — Floats at the bottom of the viewport on the iPhone 17 Pro buy page during scroll. Background `{colors.canvas-parchment}` at 80% opacity with `backdrop-filter: blur(N)`, height 64px, padding 12px × 32px. Left: running price total in `{typography.body}`. Right: `{component.button-primary}` ("Add to Bag").

### Inputs & Forms

**`search-input`** — The accessories search input. Background `{colors.canvas}`, text `{colors.ink}` in `{typography.body}` (17px), 1px solid `rgba(0, 0, 0, 0.08)` border, rounded `{rounded.pill}` (full pill — search is also pill-shaped, matching the CTA grammar), padding 12px × 20px, height 44px. Leading icon: search glyph at 14px, muted tint.

Error and validation states were not surfaced in the analyzed pages.

### Footer

**`footer`** — Background `{colors.canvas-parchment}` (#f5f5f7), text `{colors.ink-muted-80}`. Link columns in `{typography.dense-link}` (17px / 400 / 2.41 line-height — the relaxed leading is what makes the dense columns scannable). Column headings in `{typography.caption-strong}` (14px / 600). Legal row at the very bottom in `{typography.fine-print}` (12px / 400) with `{colors.ink-muted-48}` text. Vertical padding 64px.

## Do's and Don'ts

### Do
- Use `{colors.primary}` (Action Blue #0066cc) for every interactive element — links, pill CTAs, focus signals — and nothing else. The single accent is non-negotiable.
- Set headlines in `{typography.hero-display}` or `{typography.display-lg}` with negative letter-spacing (`-0.28 → -0.374px`) to get the signature "Apple tight" cadence.
- Run body copy at `{typography.body}` (17px / 400 / 1.47 / -0.374px) — not 16px. The extra pixel defines the brand's reading pace.
- Alternate `{component.product-tile-light}` (or parchment) and `{component.product-tile-dark}` for full-bleed section rhythm. The color change IS the divider.
- Reserve `{rounded.pill}` for the primary blue CTA and any other element that should read as an "action" (configurator chips, search input, sticky bar CTA).
- Apply the single product-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) only to product renders resting on a surface — never on cards, buttons, or text.
- Use `transform: scale(0.95)` as the active/press state on every button — it's the system-wide micro-interaction.
- Keep the global nav `{colors.surface-black}` (true black) — it's the only place pure black appears on most pages.

### Don't
- Don't introduce a second accent color; every "click me" signal is `{colors.primary}` (Action Blue).
- Don't add shadows to cards, buttons, or text — shadow is reserved for product imagery.
- Don't use gradients as decorative backgrounds; atmosphere comes from photography.
- Don't set body copy at weight 500 — Apple's ladder is 300 / 400 / 600 / 700, with 500 deliberately absent. Body is always 400; strong inline is 600; display is 600.
- Don't round full-bleed tiles — tiles are rectangular and edge-to-edge; the color change is the divider.
- Don't tighten line-height below 1.47 for body copy — the editorial leading is part of the brand.
- Don't mix radii grammars — use `{rounded.sm}` for compact utility, `{rounded.lg}` for utility cards, `{rounded.pill}` for pills, and nothing in between (except the rare `{rounded.md}` Pearl Button).
- Don't use `{colors.primary-on-dark}` (Sky Link Blue) on light surfaces — it's the dark-tile-only variant. Action Blue is for light surfaces.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Small phone | ≤ 419px | Single-column tiles; sub-nav collapses to category name + primary CTA only; hero typography drops to 28px |
| Phone | 420–640px | Single-column stack; product renders scale to 80% of tile width; hero h1 drops to 34px |
| Large phone | 641–735px | Tiles transition to tighter padding (48px vertical vs 80px); fine-print wraps |
| Tablet portrait | 736–833px | Global nav collapses to hamburger; sub-nav hides category chips, keeps primary CTA |
| Tablet landscape | 834–1023px | Global nav returns fully expanded; 3-column utility grids become 2-column |
| Small desktop | 1024–1068px | Product tiles use 2/3 width with margin gutters; hero h1 stays at 40px |
| Desktop | 1069–1440px | Full layout; 4–5 column store grids; 1440px content max |
| Wide desktop | ≥ 1441px | Content locks at 1440px, margins absorb extra width |

The structural breakpoints that matter for agents: 1440px (content lock), 1068px (small-desktop), 833px (tablet landscape switch), 734px (tablet portrait), 640px (phone), 480px (small phone).

### Touch Targets
- Minimum 44 × 44px. `{component.button-primary}` lands at ~44 × 100px (with the full-pill radius making the visible hit area more generous than the label suggests).
- `{component.button-icon-circular}` is exactly 44 × 44px.
- Global nav utility links are smaller (~32 × 80px) — they deliberately sit at a tighter target because they're precision desktop actions, and the mobile hamburger replaces them at ≤ 833px.

### Collapsing Strategy
- **Global nav**: full horizontal link row on desktop → collapses to Apple logo + hamburger + bag icon at 834px and below.
- **Sub-nav**: category name + inline links + primary CTA → category name + primary CTA only at mobile; inline links move into a hamburger tray.
- **Product tiles**: stack from 2-column to 1-column at 834px; vertical padding tightens from 80px → 48px at small-phone.
- **Utility grids** (store, accessories): 5-col → 4-col (1440px) → 3-col (1068px) → 2-col (834px) → 1-col (640px).
- **Hero typography**: `{typography.hero-display}` (56px) → `{typography.display-lg}` (40px) at 1068px → 34px at 640px → 28px at 419px.

### Image Behavior
- All product imagery uses responsive `srcset` with breakpoint-matched crops.
- Hero photography may switch art direction at mobile (e.g., the environment page's vista crops to a taller aspect ratio on mobile, framing the subject differently).
- Product renders maintain their 1:1 or 4:3 aspect ratios across breakpoints; only scale changes.
- Lazy-loading is default; the above-fold hero loads eagerly.

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key directly (`{component.product-tile-dark}`, `{component.search-input}`).
2. Variants of an existing component (`-active`, `-focus`, `-2`, `-3`) live as separate entries in `components:`.
3. Use `{token.refs}` everywhere — never inline hex.
4. Never document hover. Default and Active/Pressed states only.
5. Display headlines stay SF Pro Display 600 with negative letter-spacing. Body stays SF Pro Text 400 at 17px. The boundary is unbreakable.
6. The single drop-shadow (`rgba(0, 0, 0, 0.22) 3px 5px 30px`) is reserved for product photography only.
7. When in doubt about emphasis: alternate surface (light → dark tile) before adding chrome.

## Known Gaps

- Form validation and error states were not surfaced on the analyzed pages; only the neutral search input is documented.
- The homepage's embedded video/player frame uses `{colors.surface-black}`; interior player controls are not documented (they're a platform widget, not a web-design token).
- Some component imagery is dynamic (rotating product hero) and its specific copy varies per surface — component specs name the structure, not the rotating content.
- Dark-mode counterparts for store and accessories utility cards were not surfaced on the analyzed pages; the system documented is the daytime/light-dominant variant Apple ships by default.
- Atmospheric photography (environment page mountain vista) is a content asset, not a design token; the documented `{component.environment-quote-card}` describes the structural surface only.
- The exact backdrop-filter blur radius on `{component.sub-nav-frosted}` and `{component.floating-sticky-bar}` is platform-dependent; production CSS uses `saturate(180%) blur(20px)` as a typical baseline but the value isn't formalized as a token.

---

## Implementación en BIOING+

El sistema de referencia se aplica con **Starwind UI v3** sobre **Tailwind v4**. El tema vive en
`app/web/src/styles/starwind.css` y los componentes, copiados al repositorio, en
`app/web/src/components/starwind/` (se agregan con `npx starwind@latest add <nombre>`).

### Estilo (cómo se traduce la referencia)

- Tiles a sangre alternando claro/oscuro (`<section>` con `bg-muted` / `bg-background`) como separador.
- **Un único acento azul** (`--primary: #0066cc`) y ninguna otra marca; botones en píldora.
- Sin gradientes ni chrome decorativo. **Sombra tenue solo en las tarjetas** (clase `tarjeta-elevada`, en
  `starwind.css`): en reposo, una sombra muy leve además del borde. Las tarjetas que son enlace
  (`tarjeta-elevada-enlace`: Noticia, Actividad, Anuncio, Documento, Egresado, publicación de Instagram, las dos tarjetas de «Comunidad y documentos» del Inicio y el bloque «¿Eres egresado/a?» del Directorio; estas últimas no son un enlace completo, pero tienen acciones dentro) suben 2 px y ganan sombra al pasar el
  puntero (solo en dispositivos con puntero, `@media (hover: hover)`, para que no quede pegado al tocar; además el
  borde toma el color del foco, `--outline` al 60 %) o con foco de teclado dentro, en ~200 ms; con
  `prefers-reduced-motion` no suben. Esto se aparta
  de la referencia Apple, que no usa sombras en tarjetas. **Sin sombras** en botones, texto, títulos, navbar ni
  secciones; los hairlines (`--border: #e0e0e0`) siguen separando.
- Tipografía del sistema (`system-ui, -apple-system`) y radios amplios (`--radius: 18px`).
- Texto enriquecido del panel (cuerpo de Noticias y Páginas libres, con ¿Qué es la Bioingeniería?): clase `prose` de `@tailwindcss/typography`, con sus colores mapeados a los tokens del tema en `starwind.css`; el modo oscuro sale solo, sin `dark:prose-invert`.
- Densidad baja: cada sección con aire y titulares `text-3xl`/`text-4xl` semibold con tracking negativo.

### Tokens (valores reales en `starwind.css`)

| Token | Claro | Oscuro |
|---|---|---|
| `--background` / `--foreground` | `#ffffff` / `#1d1d1f` | neutral-950 / neutral-50 |
| `--primary` / `--primary-foreground` | `#0066cc` / `#ffffff` | blue-700 / neutral-50 |
| `--secondary` / `--muted` | `#f5f5f7` (parchment) | neutral-800 |
| `--muted-foreground` | `#6e6e73` | neutral-400 |
| `--border` / `--input` | `#e0e0e0` | neutral-50 al 10–15 % |
| `--outline` (foco) | `#0071e3` | neutral-500 |
| `--radius` | `18px` | ídem |
| `--sombra-tarjeta` (reposo) | `0 1px 2px rgb(0 0 0 / 0.04), 0 2px 8px rgb(0 0 0 / 0.04)` | `… / 0.3` (ambas sombras) |
| `--sombra-tarjeta-hover` | `0 4px 12px rgb(0 0 0 / 0.08), 0 12px 32px rgb(0 0 0 / 0.08)` | `0 4px 12px rgb(0 0 0 / 0.4), 0 12px 32px rgb(0 0 0 / 0.5)` |

### Recuadros destacados

Dentro del cuerpo Markdown (Noticias, Agenda, Anuncios y Páginas) un párrafo puede ir en un recuadro `<aside>`
(`src/lib/recuadros.ts`, plugin de Sätteri). Sintaxis de las alertas de GitHub: una cita cuya primera línea es
`[!NOTA]`, `[!IMPORTANTE]`, `[!CONSEJO]` o `[!ATENCIÓN]` (también los nombres en inglés `NOTE`, `IMPORTANT`, `TIP`,
`WARNING`). Una marca desconocida queda como cita normal.

- **Forma**: borde izquierdo de 4 px en el color del tipo, fondo tenue (8 % del color sobre `--background`), radio
  `--radius` solo en el lado derecho. Título visible con ícono de Phosphor (trazos de `phosphor-astro`, licencia MIT)
  y el texto del recuadro siempre en `--foreground`.
- **Color por tipo** (`--recuadro-color`, en `starwind.css`, fuera de `@layer` para ganar a `prose`):

| Tipo | Ícono | Claro | Oscuro |
|---|---|---|---|
| Nota | `NotePencil` | `#0060c0` | `#7fb8ff` |
| Importante | `WarningCircle` | `#b91c1c` | `#fca5a5` |
| Consejo | `Lightbulb` | `#166534` | `#86efac` |
| Atención | `Warning` | `#92400e` | `#fcd34d` |

- **Contraste**: el título y el borde usan el color del tipo sobre el fondo tenue (AA: ≥ 4,5 : 1 en ambos modos); el
  texto usa `--foreground`. Sin animación: no depende de `prefers-reduced-motion`.
- **Panel**: la vista previa del panel muestra la cita tal cual; el recuadro se ve en el sitio publicado.
- **Seguridad**: el plugin va antes de `sanearHtml` y solo genera nodos propios (nada de HTML crudo).

### Badges

Un solo componente, `Distintivo.astro`, con la regla y el ícono (Phosphor, decorativo) de cada clase de dato. El
mismo dato se ve igual en el listado y en el detalle. No usar `<Badge>` directo en las páginas.

| Clase | Estilo | Ícono | Ejemplos |
|---|---|---|---|
| `tipo` | con borde (`outline`) | `Tag` | Charla, Oferta de trabajo, Decreto |
| `tema` | con borde | `FolderSimple` | Logros, Institucional (Noticias; enlaza al filtro) |
| `modalidad` | con borde | `MapPin` / `Monitor` / `Devices` | Presencial / En línea / Híbrida |
| `clave` | con borde | `Hash` | Palabras clave del Repositorio |
| `etiqueta` | gris (`secondary`) | `Hash` (reemplaza el «#» escrito) | Etiquetas libres de Noticias (enlazan al filtro) |
| `vencido` / `realizada` | gris | `CalendarX` / `CheckCircle` | Anuncio vencido, Actividad realizada |

- **Con borde para clasificar** (lo más frecuente, lo más liviano); **gris para estados y etiquetas libres**.
- **El negro (`default`) no se usa**: pesaba más que el dato. Si algo debe destacar (p. ej. «Vence pronto»), va con el
  acento azul (`primary`).

### Componentes y marca

- **Componentes** en `src/components/starwind/`; los propios del sitio (tarjetas de Noticia, Actividad,
  Anuncio, Documento, Egresado; `EnlaceFicha`, `HeroCarrusel`, `Banner`, `Logo`, `ThemeToggle`,
  `VideoModal`, `PublicacionInstagram`, `Migas`) en `src/components/`.
- **Starwind v3 ≠ v2**: la documentación en línea de v2 no aplica. Los cambios de valor se escuchan con el
  evento `starwind:value-change` (burbujea y se emite antes de fijar el valor); los `SelectTrigger` necesitan
  `aria-labelledby` apuntando a su `Label`; para fijar un valor desde código se despacha
  `starwind:set-value` (con `detail.value`) sobre la raíz del Select/Combobox. Los componentes nuevos pueden
  traer textos en inglés (`aria-label`, `sr-only`): traducirlos.
- **Íconos**: solo **Phosphor** (`phosphor-astro`), también dentro de los componentes de Starwind (se
  reemplazó Tabler). Son SVG sin tamaño propio: dimensionar con `size-*` y marcar `aria-hidden="true"`
  cuando son decorativos. Ojo: `starwind add` trae íconos Tabler que hay que cambiar.
- **Logo**: una sola fuente, `src/assets/logo.svg`, renderizada por `Logo.astro` en navbar y footer; hoy es
  un placeholder hasta la identidad definitiva. **Favicon**: sale del mismo logo. `npm run favicon` (desde `app/web`)
  genera `public/favicon.svg` (copia exacta), `favicon.ico` (PNG 32 × 32) y `apple-touch-icon.png` (180 × 180, con
  fondo lleno del color del primer `<rect>` del logo, porque iOS redondea las esquinas). Al cambiar el logo, correrlo:
  `src/lib/favicon.test.ts` falla mientras no coincidan.
- **Tarjetas 100 % clicables**: imagen y tarjeta llevan al detalle (Noticia/Actividad con overlay;
  Anuncio/Documento/Egresado con un solo enlace), conservando los enlaces secundarios.
- **Footer**: columnas (marca, navegación derivada de `MENU`, comunidad, contacto) y barra de copyright. Bajo el
  enlace a la FCB, en la columna de marca, van las redes sociales con URL (`RedesSociales.astro`): íconos de Phosphor
  de 44 px de área táctil, sin texto visible, con nombre accesible («BIOING+ en Instagram») y el aviso sr-only de que
  se abre en una ventana nueva. Si ninguna red tiene URL, no se dibuja nada (ni título).

### Tema claro/oscuro

Toggle en navbar y menú móvil. La preferencia se guarda en `localStorage` (`tema`) con fallback al sistema,
se aplica antes del primer pintado con un script inline en `<head>` (sin FOUC) y se vuelve a aplicar en
`astro:page-load` porque View Transitions resetea las clases del `<html>`.

### Navbar (cabecera)

Componente `src/components/Navbar.astro` (el `<header>` completo; `Base.astro` solo lo incluye). Estructura en
`MENU_PRINCIPAL` (`src/lib/navegacion.ts`), que agrupa los enlaces de `MENU` por `href` sin duplicar etiquetas:

- **Escritorio (≥ 1024 px)**: `Inicio` · `La carrera ▾` (Repositorio y, después, las Páginas libres con `mostrar_en: la-carrera`, como ¿Qué es la Bioingeniería?) · `Noticias` ·
  `Agenda` · `Comunidad ▾` (Directorio, Anuncios, Instagram). A la derecha: «Buscar» con la pista `Ctrl K`
  (≥ 1280 px), el tema y «FCB UdeC». Todo en una línea (`whitespace-nowrap`), también a 1024 px.
- **Página activa**: enlace con `aria-current="page"` y barra inferior de 2 px `border-primary`; un grupo con
  un enlace activo se marca con la misma barra en su botón (sin `aria-current`, que es para enlaces). Nunca
  depende solo del color. Las subrutas cuentan (`/noticias/x` activa Noticias; `/repositorio/x` activa La carrera).
- **Desplegables** (patrón *Disclosure Navigation Menu* de WAI-ARIA, no `role="menu"`): botón con
  `aria-expanded` y `aria-controls`; el panel tiene una descripción corta por enlace. Enter/Espacio abren y
  cierran, `Escape` cierra y devuelve el foco al botón, Tab fuera del panel lo cierra, clic fuera lo cierra y
  abrir uno cierra el otro. Solo se abren con clic o teclado (no hay hover).
- **Atajo de búsqueda**: `Ctrl+K` / `Cmd+K` en cualquier lugar, y `/` cuando el foco no está en un campo de
  texto. Abre el modal del buscador (ver «Buscador» abajo); si el modal no está disponible (`npm run dev`), va a
  `/buscar` con `navigate()` de ClientRouter y enfoca su campo.
- **Ocultar al bajar**: el header (`sticky`) se oculta al bajar pasados 80 px y reaparece al subir
  (`src/lib/ocultar-header.ts`, puro y con test). No se oculta con un desplegable abierto, con el foco dentro
  del header ni con el menú móvil abierto. Con `prefers-reduced-motion` el ocultado es instantáneo, sin
  transición: se decidió ocultar igual, porque no es una animación sino un cambio de posición.
- **Menú dinámico**: los enlaces fijos viven en `MENU_PRINCIPAL`; las Páginas libres se agregan a «La carrera» o
  «Comunidad» según `mostrar_en`, ordenadas por título: en «La carrera» van antes de los fijos (así «¿Qué es la
  Bioingeniería?» queda primera) y en «Comunidad», después. Su bajada es la descripción del
  enlace. El pie usa la misma fuente (`enlacesFooter`).
- **Menú móvil (< 1024 px)**: un `Sheet` de Starwind (`<dialog>`, así que el `transform` del header no lo
  afecta) con «Buscar en el sitio» arriba, los mismos grupos con su título, un ícono Phosphor por enlace, la
  página activa con fondo `bg-muted`, barra lateral y `aria-current`, zonas táctiles de 44 px, y al final el
  tema y «Facultad de Ciencias Biológicas». Cada enlace cierra el menú al navegar.
- **Comportamiento**: `src/scripts/navbar.ts`. Los listeners se registran una sola vez y se delegan en
  `document`; el estado de cada página se reinicia en `astro:page-load`.

### Buscador (modal y `/buscar`)

- **Modal** (Pagefind component UI, `<pagefind-modal id="buscador">` en `Base.astro`): el botón «Buscar» del
  escritorio, la entrada «Buscar en el sitio» del menú móvil y `Ctrl+K` / `/` lo abren sobre la página actual.
  Esc lo cierra y el foco vuelve al botón. En el menú móvil el modal se abre cuando el Sheet termina de cerrarse.
- **Solo en el build.** El elemento se renderiza con `import.meta.env.PROD`; el script `pagefind-component-ui.js` y
  su CSS (`/pagefind/`, generados por el postbuild) se agregan después de la carga (`requestIdleCallback`) desde
  `src/scripts/buscador.ts`. En `npm run dev` no hay modal y los botones llevan a `/buscar`.
- **Estilo**: `src/styles/buscador.css` mapea las variables `--pf-*` a los tokens de `starwind.css` sobre el propio
  `<pagefind-modal>`, así sigue el modo oscuro (`.dark`). El resaltado de coincidencias usa `--primary` (en oscuro, un
  azul más claro): Pagefind lo cambia solo con `[data-pf-theme="dark"]`, que el sitio no usa.
- **`/buscar`** conserva la UI clásica (`pagefind-ui.js`), con el estilo de la página. Se decidió no migrarla a la
  UI de componentes para no tener que rehacer sus filtros y resultados: el modal ya da el mismo buscador en todo el
  sitio, y `/buscar` queda como página directa (enlaces, pie, mejora progresiva).
- **«Volver»** (`/buscar`, ícono `ArrowLeft`): sin JS es un enlace a `/`. Con JS, si hay de dónde volver (referrer
  del mismo sitio o navegación interna de ClientRouter, regla `puedeVolverAtras` en `src/lib/volver.ts`), usa
  `history.back()`; si no, va a `/`.
- Pagefind indexa solo `<main data-pagefind-body>`: el modal y el navbar no entran en el índice.

### Hero (Inicio)

Foto del Banner con tinte cálido sutil (`.hero-imagen` con `sepia`/`saturate`) a opacity ~70 %. Cada slide de
`HeroCarrusel.astro` tiene, sobre su foto, dos capas:

- **Velo radial** (`.hero-velo`): más oscuro al centro, donde va el título, y más claro hacia los bordes. Con
  `--hero-velo-centro: 0.5`, el peor caso (foto blanca) da contraste ≈ 5:1 con el texto blanco.
- **Desenfoque radial** (`.hero-desenfoque`): `backdrop-filter: blur` con `mask-image` radial: nítido al centro y
  levemente borroso hacia los bordes.

**Ajuste**: las cuatro variables están en `src/styles/starwind.css` (bloque «Hero del Inicio», en `:root`):

| Variable | Por defecto | Qué hace |
|---|---|---|
| `--hero-velo-centro` | `0.5` | Opacidad del velo en el centro (0 a 1). Subirla da más contraste al título. |
| `--hero-velo-opacidad` | `0.25` | Opacidad del velo en los bordes (0 a 1). |
| `--hero-blur` | `4px` | Desenfoque máximo, en los bordes. |
| `--hero-blur-radio` | `40%` | Hasta dónde llega la zona nítida, en % del radio de la elipse. |

Poner una variable en `0` (o `0px`) apaga su efecto. La vista previa del Banner en el panel
(`public/admin/vista-previa-banner.js`) usa las mismas variables: sus valores están copiados en
`public/admin/vista-previa.css`, así que si se cambian en el sitio, cambiarlos también ahí.

- **Modo oscuro**: el hero es oscuro en los dos temas. El texto y los controles van en blanco fijo y el fondo en
  `#1d1d1f`; no usan `text-background`/`bg-background`, que se invierten en modo oscuro.
- **Rendimiento**: el `backdrop-filter` cubre el hero completo y puede costar en móviles de gama baja. No se
  midió en un dispositivo real. Si se nota, `--hero-blur: 0px` lo desactiva sin tocar el resto.

**Descartados**: los shaders WebGL de Paper Shaders
(rompían el rendimiento ≥ 90 por TBT) y la textura halftone CMYK en CSS/máscaras (no gustó al equipo). No
reintroducir efectos de puntos/impresión en el hero.

### Noticia individual (`/noticias/[id]`)

- **Orden**: migas de pan (`Migas.astro`, con `aria-current="page"` en el último ítem), título, bajada,
  imagen destacada y luego el cuerpo.
- **Caja "Información de la noticia"** (`<aside>` con `<dl>`): fecha, Categoría (los Temas, enlazados a
  `/noticias?tema=`), Etiquetas (enlazadas a `/noticias?etiqueta=`), Áreas (texto) y Lectura (minutos,
  `minutosLectura`). Las filas vacías se omiten. En escritorio (`lg`) es una columna lateral `sticky` junto
  al cuerpo; en móvil va arriba del cuerpo.
- **Cuerpo** en la columna de lectura de 48 rem; Instagram, Cobertura de la Actividad y Personas
  mencionadas van debajo.
- **"Te puede interesar"**: tres `TarjetaNoticia` (3 columnas en `md`, 1 en móvil) con enlace "Ver todas las
  noticias". El ranking está en `src/lib/relacionadas.ts` (Temas ×3, Etiquetas ×2, Áreas ×1).
- La imagen de la noticia es la `og:image` de la página (se pasa a `Base`).
- **Texto alternativo** de la imagen destacada: campo `imagen_alt` (en el detalle y en la tarjeta); sin él, la
  imagen es decorativa (`alt=""`).
- **Video** (`video`, enlace de YouTube): `VideoModal` debajo del cuerpo, con el mismo comportamiento que en
  Inicio y Páginas libres (centrado, bloquea el desplazamiento del fondo). Si `idYouTube` no reconoce
  el enlace, no se muestra nada.
- **Galería** (`galeria`, hasta 12 imágenes con texto alternativo): grilla de miniaturas optimizadas (2 columnas en
  móvil, 3 en escritorio) debajo del video. Al hacer clic se abre un `<dialog>` con la versión de 1600 px (WebP):
  anterior/siguiente con botones o con ← →, cierre con Esc o el botón, contador «N de M» y el foco vuelve a la
  miniatura al cerrar. Navegación circular (`src/lib/galeria.ts`). Sin librerías; `GaleriaImagenes.astro`.
- **Contenido incrustado** (`incrustados`, hasta 10 URLs): sección «Multimedia» con h2 propio, en una
  columna. En Noticias va después del video y antes de la galería; en Actividades y Páginas libres, después del cuerpo. Cada
  item es un reproductor de alto fijo por proveedor (clases Tailwind literales, `h-[152px]`…), `aspect-video`
  para Vimeo y Facebook video, o el `VideoModal` si es YouTube; las tarjetas-enlace llevan el nombre del servicio,
  el título o la URL y un ícono de enlace externo (`rel="noopener noreferrer"`). Sin estilos inline. Mientras carga el
  iframe, un esqueleto `bg-muted` con el nombre del proveedor ocupa el mismo lugar (`motion-safe:animate-pulse`; sin JS no
  aparece). Al disparar `load` se quita con un fundido de 300 ms (`motion-reduce` sin transición).
- **Publicación de Instagram**: la tarjeta no tiene botón de carga; el embed se crea al acercarse a la pantalla, con el
  mismo esqueleto, y el aviso dice «Contenido de Instagram (Meta)». Sin enlace incrustable, la tarjeta queda sin iframe.

### Columna lateral de las fichas (Noticia, Actividad, Anuncio)

- **Patrón común**: en escritorio (`lg`, 1024 px) el encabezado (migas, título, bajada) y el cuerpo van en
  la columna de lectura de 48 rem; a la derecha, un `<aside>` de 18 rem (`lg:grid-cols-[minmax(0,48rem)_18rem]`)
  que ocupa las dos filas y es `sticky` bajo la navbar (`lg:top-24`, `self-start`). En móvil el aside va entre
  el título y el cuerpo, con los datos clave arriba del texto sin duplicarlos.
- **Contenido del aside** (solo datos que ya tiene la ficha): `<h2>` oculto («Datos de …») y la lista de datos
  (`<dl>`), los Enlaces de la ficha (en Actividades, la inscripción como botón principal mientras sea próxima),
  los organizadores o el oferente, y el bloque **Compartir** (`Compartir.astro`).
- **Compartir**: botón «Copiar enlace» y enlaces `<a>` a WhatsApp, LinkedIn, X y correo. Las URL se arman en
  `src/lib/compartir.ts`, con la URL absoluta del sitio. Sin scripts de terceros; el script del botón es delegado
  en `document` y corre una vez.
  - **Botón copiado:** al copiar, el ícono `Copy` se desvanece y escala a `Check` (200 ms) y el texto pasa a
    «Enlace copiado» durante 2 s; luego vuelve. El estado vive en `data-copiado` (lo enciende el script; el CSS
    hace el cambio). Con `prefers-reduced-motion` el cambio es instantáneo, sin escala. Si falla, el aviso visible
    dice «No se pudo copiar…».
  - **Aviso `aria-live`:** tras copiar, el texto «Enlace copiado» queda solo para lectores de pantalla (`sr-only`),
    para no repetir lo que ya se ve en el botón. Los errores sí se muestran.
  - **Código QR:** bloque plegado por defecto («Código QR», `<details>`) con el QR de la URL absoluta de la ficha,
    generado en el build como SVG (`src/lib/qr.ts`, `uqr`). Negro sobre blanco en ambos temas, para que se pueda
    escanear. Alt: «Código QR de esta página». «Descargar QR» baja el SVG (`codigo-qr-<segmento>.svg`) desde una
    data URL; no necesita JS.
- **Relacionados**: en Noticias se mantiene «Te puede interesar» debajo del cuerpo a ancho completo (tres
  tarjetas, `relacionadas.ts`), porque tres tarjetas en 18 rem quedan apretadas. Actividades usan «Cobertura»
  y Anuncios no tienen relacionados: no se inventan.
- **Documentos (`/repositorio/[id]`)**: no llevan columna lateral. Sus datos son pocos (temas, áreas, palabras
  clave) y la vista previa ocupa el ancho completo; una columna con tres líneas quedaría casi vacía.

### Filtros de los listados y modales

- **Filtros plegables** (`FiltrosPlegables.astro` + `src/scripts/filtros-plegables.ts`, lógica en
  `src/lib/filtros-plegables.ts`): en Noticias, Repositorio, Directorio y Agenda, el buscador de texto queda
  siempre visible y el resto de los filtros se agrupa en un pliegue con el botón «Filtros · N activos».
  - **Estado inicial:** plegado si no hay filtros activos; desplegado si llegan filtros por la URL (en móvil y
    en escritorio).
  - **Móvil (< md):** acordeón a ancho completo.
  - **Escritorio (≥ md):** el `<form>` es flex en fila (`md:flex-row md:flex-wrap md:items-end`): el buscador
    ocupa el ancho disponible (`md:flex-1`) y a su derecha, alineados abajo, van «Filtros» y «Limpiar filtros» con
    su ancho natural (`md:w-auto`). Al desplegar, la región ocupa una fila propia (`md:basis-full`) y sus campos se
    ordenan en una grilla de 1 a 4 columnas (prop `columnas`, por página).
  - **Requisito para las páginas:** el `<form id="filtros">` no debe ser grilla; si lo fuera, cada botón ocupa una
    columna entera junto al buscador.
  - **«Limpiar filtros»:** visible solo con ≥ 1 activo. Vacía los campos del pliegue (no el buscador de texto)
    y dispara el mismo `change` que usa cada página, así que el filtrado y la URL no se reimplementan.
  - **Accesibilidad:** `aria-expanded` y `aria-controls` en el botón. Botón y «Limpiar» vienen con `hidden`:
    sin JavaScript no hay botones muertos y los filtros quedan visibles.
- **Modales** (VideoModal, galería): tamaño con unidades dinámicas `dvw`/`dvh` y `max-w-none max-h-none` para
  anular el tope que el navegador pone a los `<dialog>`. El video toma el 16:9 más grande que cabe; la galería
  ocupa casi toda la pantalla con la imagen en `object-contain`. Mientras hay un modal abierto, el fondo no se
  desplaza (`html:has(dialog[open]:modal)` en `starwind.css`).

### Carrusel de Banners (Inicio)

- `HeroCarrusel.astro`: flechas, puntos, autoplay de 6 s (se pausa con el puntero o el foco encima) y **swipe** con
  dedo o mouse. El track sigue al puntero; al soltar, `destinoArrastre` (`src/lib/carrusel.ts`) cambia de slide si se
  arrastró más del 20 % del ancho o fue un gesto rápido. `touch-action: pan-y` deja el scroll vertical al navegador, y
  un arrastre no activa el botón «Conoce más» que quedó debajo.
- Los contenedores de las flechas y los puntos llevan `pointer-events-none` (solo los botones reciben el puntero): si
  no, tapan el swipe que empieza cerca de un borde.
- Con un solo Banner vigente no hay controles ni swipe: se ve como una portada fija.

### Página destacada (bloque del Inicio)

- Bloque entre el carrusel de Banners y «Noticias recientes» (`PaginaDestacada.astro`), para una Página libre con
  **Destacar en el Inicio**. Solo se muestra una a la vez; la elige `paginaDestacadaInicio()` (`src/lib/contenido.ts`,
  regla pura en `src/lib/pagina-destacada.ts`).
- Fondo `bg-muted`, etiqueta «Destacado», título h2 y resumen (`resumen_inicio` o, si falta, la bajada). Con imagen,
  dos columnas en escritorio (la imagen a la izquierda) y la imagen arriba en móvil. Sin imagen pero con video, el
  video ocupa ese lugar (para no dejar media sección vacía); sin imagen ni video, una columna.
- Hasta tres títulos de los bloques destacados se muestran como chips («datos clave»). Se eligió chips porque el
  bloque es un resumen: los textos largos quedan en la página.
- Video: con imagen, el `VideoModal` va debajo del resumen, en un ancho máximo de 28 rem; sin imagen, al lado del
  texto (ver arriba). Botón «Ver más» → `/p/<id>`.
- Sin JavaScript propio: el video usa el `VideoModal` existente. Las animaciones son `data-animar="fade-up"`.

### Enlaces (botones bajo el título)

- `Enlaces.astro`, bajo el título de Noticias, Actividades y Páginas libres. El botón principal (la inscripción de
  una Actividad próxima) va relleno (`variant="primary"`); los demás, con borde (`variant="outline"`). Todos son
  `rounded-full`: ancho completo en móvil y automático desde `sm`, en fila con `flex-wrap gap-3`.
- Los externos llevan `ArrowUpRight`, abren en pestaña nueva y tienen un texto oculto «(se abre en una pestaña
  nueva)» para lectores de pantalla. Los internos llevan `ArrowRight` y no abren pestaña nueva.
- Sin estilos inline ni `onclick`. Si no hay botones, el componente no renderiza nada.

### Secciones destacadas del Inicio

- Al final del Inicio hay una lista de **secciones destacadas** editable en el panel (colección `inicio`, archivo
  `src/content/inicio/inicio.md`). El orden de la lista es el orden en la página; las no publicadas no se muestran.
- Cada sección (`SeccionDestacada.astro`) es de ancho completo, con altura mínima de 50 vh en móvil y 60 vh en
  escritorio. La imagen de fondo va con `<Image>` (`widths` 640–2560, `sizes="100vw"`, `loading="lazy"`) y una capa
  `bg-black/60` para que el texto blanco cumpla contraste AA sobre cualquier foto.
- **Parallax** (`src/scripts/parallax.ts`, GSAP + ScrollTrigger con `scrub`): la imagen mide 175 % de la sección,
  centrada (`top: -37,5 %`), y se desplaza de −20 % a +20 % de su propio alto mientras la sección cruza el viewport.
  Con ese recorrido el borde de la imagen nunca entra en la sección (en las pruebas, 0 de 11 puntos con hueco). Si se
  sube el recorrido, hay que recalcular la altura. Con `prefers-reduced-motion: reduce` no hay
  parallax (imagen fija y centrada). Sin JavaScript la imagen queda centrada. No se usa
  `background-attachment: fixed` (falla en iOS).
- Imagen decorativa: si `imagen_alt` está vacío, `alt=""`. Un enlace externo abre en una ventana nueva y lo anuncia.

### Banda «Comunidad y documentos» (Inicio)

Bloque con datos reales entre las Páginas destacadas y las Secciones destacadas (`BandaComunidad.astro`; datos en
`bandaComunidad`, src/lib/contenido.ts, y reglas puras en `src/lib/comunidad.ts`). Reemplaza a las antiguas secciones
a pantalla completa del Directorio y el Repositorio, que daban ~1,5 pantallas para dos enlaces.

- **Sin fondo de sección**: la banda va sobre el blanco; las tarjetas son `bg-card` con borde `border-border` y radio
  `rounded-lg`. Así no choca con el `bg-muted` de Agenda o Instagram que tenga al lado.
- **Una tarjeta bajo la otra, a todo el ancho.** En escritorio cada tarjeta se divide en 2/5 de **imagen a sangre** y
  3/5 de contenido (`md:grid-cols-5`), en zigzag: la imagen del Directorio a la izquierda y la del Repositorio a la
  derecha. La imagen va `absolute inset-0` dentro de su celda: toma el alto del contenido en vez de imponer el suyo
  (una foto vertical estiraba la tarjeta y dejaba huecos). El contenido se lee en una columna: título y texto → datos →
  acciones, con las acciones al pie (`grid-rows-[auto_1fr]` + `mt-auto`). **Sin imagen**, el contenido usa todo el
  ancho en dos columnas (presentación a la izquierda, datos y acciones a la derecha). En móvil, la imagen arriba (21:9)
  y el contenido debajo. Si el panel apaga una sección, la otra tarjeta sale igual.
- **Tarjeta del Directorio**: foto opcional; título `h3`, texto, **cifras** en una `<dl>` de tres columnas entre dos
  líneas finas (el número grande arriba y la etiqueta debajo, con `flex-col-reverse` para no alterar el orden `dt`/`dd`) y
  un buscador por nombre. El buscador es un `<form action="/directorio" method="get" role="search">` con `<label>` (sr-only) y
  `<input type="search" name="texto">`; al enviar lleva a `/directorio?texto=…`, que el Directorio aplica al cargar.
  Debajo del buscador, **chips de áreas** («Explora por área»: las 5 áreas con más egresados/as, con su conteo), que son
  enlaces a `/directorio?area=<id>`. Botón «Ir al Directorio» al pie y, a su lado, «¿Eres egresado/a? Suma tu
  perfil» (enlace externo al formulario, con `target="_blank"` y `rel="noopener"`; ver guía de usuario §4.8). La línea solo
  sale si hay formulario configurado.
- **Tarjeta del Repositorio**: foto opcional igual, título, texto, «Documentos recientes» con los **4 más recientes** en
  una `<ul role="list">` (cada ítem: título enlazado a `/repositorio/<id>` y, debajo, tipo y año), y «Ir al Repositorio».
- **Sin datos**: cada cifra en cero no se muestra (nunca «0»; sin egresados/as no sale la `<dl>`); sin documentos no
  sale la lista. El texto y el botón de la tarjeta siempre salen.
- **Alineación**: el botón queda al pie de la columna izquierda aunque la columna de datos sea más alta.
- **Íconos**: Phosphor `MagnifyingGlass` (buscador) y `ArrowRight` (botones), decorativos (`aria-hidden`).
- **Móvil (390 px)**: el campo de búsqueda tiene un ancho base de 14 rem (`basis-56`); si no cabe junto al botón,
  «Buscar» baja a su propia línea y el placeholder no se corta.
- **Semántica**: `<section id="inicio-comunidad" aria-labelledby="inicio-comunidad-titulo">`, cada tarjeta un
  `<article aria-labelledby>`. Las cifras y la lista siguen las convenciones de «HTML semántico».
- **Modo claro y oscuro**: solo tokens del tema (`bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`).

### Animaciones

GSAP + ScrollTrigger con **fade solo** (sin deslizamientos), marcadas de forma declarativa en el HTML:
`data-animar="hero"` (entrada al cargar), `"fade-up"` (aparece al hacer scroll) y `"grilla"` (hijos
escalonados). Se limpian con `gsap.context()` en `astro:before-swap` y se reinician en `astro:page-load`.
Transiciones entre páginas en fade con `ClientRouter` y estilos en `src/styles/transitions.css`. Todo respeta
`prefers-reduced-motion` y es visible sin JavaScript (clase `.anima` + guard en `Base.astro`).

**Llamados a la acción** (estilos en `src/styles/animaciones.css`, sin GSAP): al pasar el puntero o tener el foco,
la flecha se desplaza 4 px a la derecha (150 ms). Se usan tres clases, para no repetir listas de utilidades:

- `cta`: en el enlace o botón del llamado a la acción.
- `cta-flecha`: en el ícono de flecha dentro de ese enlace o botón.
- `cta-relleno`: solo en los botones rellenos (primarios); suma una elevación de 1 px y un brillo de 108 %.

Ya están en «Conoce más» del hero y del Banner, las secciones destacadas, la página destacada, la banda
«Comunidad y documentos», los enlaces de Noticias, Actividades y Páginas, y los «Ver más» / «Ver todas…» del Inicio.
Con `prefers-reduced-motion: reduce` no hay movimiento; queda solo el cambio de brillo. No usan sombras (ver
«Sin sombras» en Implementación).

### Imágenes

Todo pasa por `<Image>` de Astro (o `getImage`) con `widths`/`sizes`; las tarjetas reservan aspecto
(`aspect-video`/`aspect-square`) y las que no tienen imagen usan un placeholder `bg-muted`, así no hay CLS.
El hero (slide 0) va con `priority`; en `index.astro` se emite además un `<link rel="preload">` del LCP. El
resto carga `lazy` por defecto. Mantener estos atributos al agregar imágenes.

### Accesibilidad

Metas WCAG 2.1 AA y Lighthouse ≥ 90 en accesibilidad: skip-link al contenido, `aria-current` en el menú
activo, foco visible global (`:focus-visible`), nombres accesibles en los controles de Starwind, jerarquía de
encabezados sin saltos y estados vacíos («Aún no hay…») en las páginas sin contenido.


### ids

Sirven para anclas (`#inicio-anuncios`), analítica y pruebas. Convención:

- Piezas fijas ya asignadas: `navbar` (header), `navbar-menu` y `navbar-menu-movil` (los dos menús), `navbar-buscar`
  y `navbar-buscar-movil` (los botones de búsqueda), `contenido` (`<main>`), `pie` (footer), `buscador` (modal),
  `buscar` (sección de `/buscar`) y `seccion-<ruta>` (páginas «próximamente»).
  La banda del Inicio usa `inicio-comunidad` (sección), `inicio-directorio` y `inicio-repositorio` (sus tarjetas),
  con `-titulo` para los encabezados.

- Formato: español, kebab-case, sin tildes, con el prefijo de la página o de la pieza: `inicio-noticias`,
  `agenda-listado`, `noticia-galeria`, `actividad-cobertura`, `anuario-generacion-2015`, `pagina-bloques`.
- Cada `<section>` lleva `id`. Las piezas únicas de una página (`inicio-carrusel`, `inicio-pagina-destacada`,
  `incrustados`, `banner-<id>`, `inicio-comunidad`) lo llevan en su elemento raíz.
- Las tarjetas toman el id de su entrada: `noticia-<id>`, `actividad-<id>`, `anuncio-<id>`, `documento-<id>`,
  `persona-<id>`, `instagram-<id>`. Si la misma tarjeta puede salir dos veces en una página, no lleva `id`: usa
  `data-id` (p. ej. `TarjetaActividad` con `sinId` en `/personas/[id]`, donde una actividad puede estar en
  «Expuso en» y en «Organizó»).
- Las secciones de Inicio no tienen id en el contenido: `SeccionDestacada` deriva `inicio-seccion-<titulo>` del
  título sin tildes. Por eso los títulos de las secciones deben ser distintos.
- No duplicar: un id repetido en una página rompe las anclas. Antes de agregar uno, buscar que no exista ya
  (`VideoModal` usa `video-<id>-titulo`).

### HTML semántico

Convenciones que mantienen la semántica de las páginas (auditoría sobre `dist/`: 1 `<h1>`, sin saltos de
encabezado, un solo `<main>`, `<section>` con nombre):

- **Tarjetas** (`TarjetaNoticia` es la referencia): `<article>` con `relative` y `group`; el enlace va en el
  título (`<h3><a … after:absolute after:inset-0>`), y el área del enlace cubre toda la tarjeta. El foco se marca
  en la tarjeta con `has-[:focus-visible]:outline-2`. Las tarjetas que son un `<li>` (Egresado) conservan el
  `<li>` como caja y usan `<article>` dentro. Sin enlaces dentro de otros enlaces.
- **Listados de tarjetas**: `<ul role="list">` con un `<li>` por tarjeta (Tailwind quita los bullets y Safari
  pierde la semántica sin `role="list"`).
- **Fechas**: `<time datetime>` en toda fecha visible. Fecha sola → `AAAA-MM-DD`; con hora → ISO con el offset
  (ver «Trampas conocidas» en `AGENTS.md`).
- **Secciones con nombre**: cada `<section>` lleva `aria-labelledby` apuntando al id de su encabezado
  (`<prefijo>-titulo`, p. ej. `inicio-noticias-titulo`). En los listados el encabezado es el `<h1>` de la página.
  Una sección sin encabezado (p. ej. un bloque de datos) es un `<div>` con su `id`.
- **Página libre en diseño ancho** (`/p/[id]`): la rama con bloques va dentro de un `<article>`, igual que la simple.
- **Contacto** de un anuncio: `<address>` (dentro de la tarjeta, que es el anuncio del autor).

### Encabezado de los listados (ADR 0011)

- `EncabezadoListado.astro` es el `<h1>` de las seis páginas de listado. Con imagen, la imagen va arriba a ancho completo,
  con `rounded-xl`, proporción 16/7 en móvil y 3/1 desde `sm`, y el título debajo con 24 px de separación. Sin velo: el
  contraste del título no depende de la foto ni del modo oscuro.
- El ícono va a la izquierda del título, en `text-primary`, de 36 px (`size-9`), decorativo (`aria-hidden`). Sin ícono,
  el título no cambia de clases.
- La introducción (`intro`, opcional) va bajo el `<h1>` en un `<p>` con `text-muted-foreground`, `mt-3` y ancho de lectura
  (`max-w-prose`). Sin texto, no se dibuja nada.
- Sin imagen ni ícono, el encabezado es el de siempre (`text-4xl font-semibold tracking-tight`).
- El bloque «¿Eres egresado/a?» del Directorio usa el mismo criterio: la imagen, si hay, va a sangre en la parte de arriba
  de la tarjeta, y el ícono de 28 px (`size-7`) va junto al título.
