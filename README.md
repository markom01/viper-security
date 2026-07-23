# VIPER Security

> Luxury private chauffeur service — executive transport, airport transfers, and VIP travel in Marbella and Milano.

[![Astro](https://img.shields.io/badge/Astro-7.x-BC52EE?logo=astro)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify)](https://www.netlify.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why This Exists

VIPER Security is a single-page marketing website for a luxury chauffeur business operating in two premium European regions: Costa del Sol (Marbella) and Northern Italy (Milano). The site presents services, fleet, pricing, membership tiers, and a contact form — all with a Lamborghini-inspired nocturnal luxury aesthetic.

## Quick Start

```bash
npm install
npm run dev
```

Open [localhost:4321](http://localhost:4321) in your browser.

> **Note**: After modifying content collections or their Zod schemas (`src/content.config.ts`), press `s` then `Enter` in the dev terminal to sync the content layer, or restart the dev server. Without this, the dev server may serve stale cached content.

## Installation

**Prerequisites**: Node.js 22.12+, npm 10+

```bash
npm install
```

## Usage

### Development

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

### Content Validation

Content is validated at build-time via Zod schemas in `src/content.config.ts`. No separate validation script required.

### Deploy

Push to `main` — Netlify auto-builds and deploys. No manual deploy steps.

## Project Structure

```
.
├── src/
│   ├── components/            # .astro section components, .jsx helpers
│   │   ├── sections/          # 13 section .astro components
│   │   │   ├── Nav.astro      # Header navigation, mobile menu
│   │   │   ├── Hero.astro     # Hero section + embedded booking form
│   │   │   ├── Marquee.astro  # Scrolling marquee ticker
│   │   │   ├── AboutSection.astro
│   │   │   ├── Services.astro # Marbella + Milano service grids
│   │   │   ├── Fleet.astro    # Vehicle showcase with scroll-reveal
│   │   │   ├── StatsSection.astro
│   │   │   ├── HowItWorks.astro
│   │   │   ├── Pricing.astro  # Hourly + airport transfer pricing
│   │   │   ├── Membership.astro# 3-tier VIP membership cards
│   │   │   ├── CtaBanner.astro
│   │   │   ├── BottomCta.astro
│   │   │   └── Footer.astro
│   │   └── PageNotFound.jsx   # 404 page React component
│   ├── content/               # 7 Zod-validated content collections
│   │   ├── hero/
│   │   ├── services/
│   │   ├── fleet/
│   │   ├── pricing/
│   │   └── membership/
│   ├── layouts/
│   │   └── BaseLayout.astro   # HTML shell, SEO meta, JSON-LD, fonts, security
│   ├── pages/
│   │   ├── index.astro        # Data-fetching hub, composes all sections
│   │   ├── 404.astro          # 404 page using React
│   │   └── admin.astro        # Decap CMS admin entry
│   └── content.config.ts      # Zod content schemas
├── public/
│   ├── admin/                 # Decap CMS config.yml
│   ├── images/                # Optimized WebP images
│   └── template_files/        # Webflow template assets (SVG icons, legacy CSS/JS)
├── netlify.toml               # Netlify build + redirect + cache config
├── astro.config.mjs           # Astro configuration
└── README.md                  # This file
```

## Configuration

### Decap CMS

Content is managed via Decap CMS at `/admin/`. Configuration lives in `public/admin/config.yml` and mirrors the Zod schemas in `src/content.config.ts`. The CMS writes directly to `main`, triggering a production deploy on every save.

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `PUBLIC_*` | Any variable prefixed with `PUBLIC_` is exposed to the client |

*Only 2 documented environment variables currently exist.*

### Content Collections

| Collection | File(s) | Purpose |
|------------|---------|---------|
| `hero` | `src/content/hero/hero.md` | Hero banner copy |
| `services` | `src/content/services/services.md` | Both Marbella + Milano service details |
| `fleet` | `src/content/fleet/*.md` | Vehicle fleet entries |
| `pricing-hourly` | `src/content/pricing/hourly.md` | Hourly chauffeur rates |
| `membership` | `src/content/membership/tiers.md` | VIP membership tiers |

## Architecture Decisions

- **Single-page only** — no SSR, no routing, no Astro adapter.
- **Astro section components** — all sections are `.astro` files using Webflow template HTML injection with content placeholder replacement. React is used only for the 404 page (`PageNotFound.jsx`).
- **No Tailwind config file** — Tailwind v4 uses CSS-first configuration via `@tailwindcss/vite` plugin.
- **Static output** — no server-side rendering, edge functions, or API endpoints.
- **Netlify Forms** handles contact submission — no backend API required.
- **No JavaScript animation libraries** — all motion is CSS transitions, keyframes, and `IntersectionObserver`.

## Design System

See [DESIGN.md](DESIGN.md) for the full Lamborghini-inspired design specification including:

- **Color tokens**: Black (`#000000` body, `#0B0B0B` surfaces), Gold (`#B08D45` CTAs), Charcoal (`#1A1A1A` cards)
- **Typography**: Playfair Display (serif headings) + Manrope (sans-serif body)
- **Spacing**: 0-radius buttons/cards, no shadows (depth via surface color layering)
- **Animations**: CSS-only, `prefers-reduced-motion` respected globally

## What's New (Recent Refactors)

- **Pre-production audit fixes** — JSON-LD structured data, canonical URL, skip-to-content link, `<main>` landmark, `:focus-visible` styles, OG tags, Cache-Control headers, GDPR cookie consent placeholders, semantic HTML, `prefers-reduced-motion` support across all sections, alt text improvements, dead code removal, Milano services data fix, CSP hardening, favicon fix, stray file cleanup

## Contributing

See [AGENTS.md](AGENTS.md) for the project knowledge base, conventions, and anti-patterns.

## License

MIT
