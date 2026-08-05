# shared/ — cross-site reuse seam

This monorepo hosts two Astro sites, each deployed independently:

- **VIPER Security** — root `./`, site `https://vipersecurity.com`
- **DB Custom Garage** — `./dbc/`, site `https://dbcustomgarage.netlify.app`

They share ONE copy of everything below (edit once, both update):

| Shared asset | Location |
|---|---|
| Layout (Nav + Footer chrome, SEO, JSON-LD) | `../src/layouts/BaseLayout.astro` |
| Nav (data-driven, `navItems`/`ctaLabel` props) | `../src/components/sections/Nav.astro` |
| Footer (data-driven, `footerItems` props) | `../src/components/sections/Footer.astro` |
| Sections (Hero, Stats, HowItWorks, Cta, BottomCta, ...) | `../src/components/sections/*` |
| Default UI labels + brand-neutral strings | `../src/config/strings.js` |
| CMS label resolution | `../src/config/labels.js` (`resolveLabels`) |
| Icons | `../src/config/icons.js` |

**How a site reuses it**: via Vite + tsconfig aliases defined in each site's
`astro.config.mjs`/`tsconfig.json` — `@sections`, `@layouts`, `@shared`.

**How sites stay different** (all per-site, never in `shared/`):
- Content collections + schema — `dbc/src/content.config.ts`, `dbc/src/content/*`
- Brand tokens/theme — `dbc/public/styles/global.css` (orange vs VIPER gold)
- Pages + CMS admin — `dbc/src/pages/*`, `dbc/public/admin/*`
- `pageContent` content collection — schemas differ per site (e.g. dbc has no `fleet`)