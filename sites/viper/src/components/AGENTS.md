# COMPONENTS — VIPER SECURITY

**13 `.astro` section components + 1 React `.jsx` 404 page.**

## WHERE TO LOOK

| Component    | File                                  | Key Patterns                                                                                                            |
| ------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Page Root    | `src/pages/index.astro`               | **Data-fetching hub** — loads all content collections, resolves templates, composes all sections inside `BaseLayout`    |
| Layout Shell | `src/layouts/BaseLayout.astro`        | HTML shell (`<head>`/`<body>`), SEO meta, JSON-LD, Google Fonts, scroll-reveal IntersectionObserver                     |
| Nav          | `Nav.astro`                           | Mobile menu toggle, `aria-current="section"` on hash links, inline `is:inline` script                                   |
| Hero         | `Hero.astro`                          | Embedded booking form — client JS in `define:vars` `SCRIPT_DATA` populates selects from `booking_data`, WhatsApp submit |
| Marquee      | `Marquee.astro`                       | Scrolling ticker                                                                                                        |
| About        | `AboutSection.astro`                  | Static copy from `page-content`                                                                                         |
| Services     | `Services.astro`                      | Marbella + Milano service grids (same `services` data rendered twice)                                                   |
| Fleet        | `Fleet.astro`                         | `_3-column-collection` car cards, mixed string/number capacity fields, `fleetFeatures` sentence prop                    |
| Stats        | `StatsSection.astro`                  | `page-content` stats items                                                                                              |
| How It Works | `HowItWorks.astro`                    | Maps `steps` array from `how-it-works`                                                                                  |
| Pricing      | `Pricing.astro`                       | Two regional cards from `booking_data` + hourly rates from `pricing`/`hourly` entry                                     |
| Membership   | `Membership.astro`                    | 3-tier cards, `is_featured` badge                                                                                       |
| CTA          | `CtaBanner.astro` + `BottomCta.astro` | Static copy from `page-content`                                                                                         |
| Footer       | `Footer.astro`                        | Gold accent border, nav links, phones                                                                                   |
| 404 Page     | `PageNotFound.jsx`                    | React 19 component, inline styles, used by `pages/404.astro`                                                            |

## DATA FLOW

```
src/pages/index.astro (Astro page — frontmatter fetches all collections, resolves templates)
  └── BaseLayout.astro
       ├── Nav.astro ← brandName, pageContent
       ├── Hero.astro ← hero fields, pageContent (booking_data)
       ├── Marquee / About / Services / Fleet / Stats / HowItWorks / Pricing / Membership
       │      ← collection data + pageContent props
       ├── CtaBanner / BottomCta / Footer
```

Sections are stateless `.astro` templates — no client JS except Nav menu + Hero booking form (both `is:inline` / `define:vars`). Animations are CSS + the global `[data-scroll-reveal]` IntersectionObserver in `BaseLayout`.

## CONVENTIONS

- **All sections** are `.astro` files in `src/components/sections/`. Only `PageNotFound.jsx` is React (used by `pages/404.astro`).
- **Content collection data is fetched only in `.astro` page frontmatter**, passed as props to sections. Sections never call `getCollection`.
- **All copy from CMS collections** — no hardcoded business text in components. Non-CMS technical strings go in `src/config/strings.js`, inline SVGs in `src/config/icons.js`.
- **Template placeholders** (`{location1}`, `{site_name}`, `{vehicle}`) are resolved by the shared assembler (`assembleHome`/`assembleService` in `@garage/shared/lib/assemble`) via `resolveTemplates`, not inside sections or page templates. Page templates must not re-run `resolveTemplates`.
- **CSS**: Tailwind v4 utilities + class hooks into `public/styles/global.css` design tokens (`--colors--*`, `--font-families--*`). No CSS modules, no CSS-in-JS.
- **Aria labels** on interactive sections, `aria-hidden="true"` on decorative, `role="list"`/`role="listitem"` for collection grids.
- **Motion**: CSS transitions/keyframes + `[data-scroll-reveal]` attribute — `BaseLayout` observes, adds `data-scroll-reveal-visible` when in view. Respect `prefers-reduced-motion`.

## ANTI-PATTERNS

- **Do NOT** fetch content inside `.astro` sections — data comes from `index.astro` props only.
- **Do NOT** hardcode business copy in components — goes in a collection file, CMS-editable.
- **Do NOT** add CSS-in-JS or new CSS files — utilities + `global.css` tokens.
- **Do NOT** add React components unless extending `PageNotFound.jsx` scope.
- **Do NOT** edit `public/admin/config.yml` without mirroring `src/content.config.ts` Zod schemas.
- **Do NOT** trust old README claims about a React architecture — this is Astro; the old JSX tree was deleted.

> Historical note: this file previously documented a React 19 `.jsx` section architecture (PageRoot.jsx, ServiceCard.jsx, BaseLayout.jsx) that no longer exists. All sections were rebuilt as Astro components; conventions above reflect current code.
