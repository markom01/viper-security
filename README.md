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

```bash
node scripts/verify-cms.js   # Validates Decap CMS config matches Astro content schemas
```

### Deploy

Push to `main` — Netlify auto-builds and deploys. No manual deploy steps.

## Project Structure

```
.
├── src/
│   ├── components/        # 14 React .jsx components (13 section + 1 root)
│   │   ├── PageRoot.jsx        # Root — receives all data, composes all sections
│   │   ├── Nav.jsx             # Header navigation, scroll effects, mobile menu
│   │   ├── Hero.jsx            # Full-viewport hero with staggered animations
│   │   ├── HowItWorks.jsx      # Booking steps (3-step grid)
│   │   ├── Services.jsx        # Two-region service grid (uses ServiceCard 10x)
│   │   ├── ServiceCard.jsx     # Reusable glassmorphism card
│   │   ├── Fleet.jsx           # Vehicle showcase with scroll-reveal
│   │   ├── Pricing.jsx         # Hourly rates + airport transfer pricing
│   │   ├── Membership.jsx      # 3-tier VIP membership cards
│   │   ├── Faq.jsx             # FAQ accordion
│   │   ├── Contact.jsx         # Contact section wrapper
│   │   ├── ContactForm.jsx     # React 19 form with Netlify Forms + a11y
│   │   ├── Footer.jsx          # Footer with shimmer animation
│   │   └── MobileActionBar.jsx # Fixed bottom bar for mobile
│   ├── content/            # 7 Zod-validated content collections
│   │   ├── hero/
│   │   ├── services/
│   │   ├── fleet/
│   │   ├── pricing/
│   │   └── membership/
│   ├── layouts/
│   │   └── BaseLayout.jsx      # React HTML shell, SEO meta, JSON-LD schema
│   ├── pages/
│   │   ├── index.astro         # Data-fetching wrapper for the React root
│   │   └── 404.astro           # 404 page in React
│   └── styles/
│       └── global.css          # Tailwind v4 @theme, fluid typography, animations
├── public/
│   ├── admin/                  # Decap CMS configuration
│   └── images/                 # CMS media uploads
├── scripts/
│   └── verify-cms.js           # CMS ↔ content schema validation
├── AGENTS.md                   # Project knowledge base
├── DESIGN.md                   # Design system specification
├── netlify.toml                # Netlify build + redirect config
└── README.md                   # This file
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
| `services-marbella` | `src/content/services/marbella.md` | Marbella service details |
| `services-milano` | `src/content/services/milano.md` | Milano service details |
| `fleet` | `src/content/fleet/*.md` | Vehicle fleet entries |
| `pricing-hourly` | `src/content/pricing/hourly.md` | Hourly chauffeur rates |
| `pricing-airport` | `src/content/pricing/airport-transfers.md` | Airport transfer pricing |
| `membership` | `src/content/membership/tiers.md` | VIP membership tiers |

## Architecture Decisions

- **Single-page only** — no SSR, no routing, no Astro adapter.
- **React-only rendering** — all components are React `.jsx`. `.astro` pages are thin data-fetching wrappers only.
- **`client:load` on root** — `PageRoot.jsx` hydrates the entire page. No individual `client:*` directives.
- **No Tailwind config file** — Tailwind v4 uses CSS-first configuration via `@theme` in `global.css`.
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

- **ServiceCard.astro** — extracted from 10x duplicated markup in `Services.astro` into a reusable, slot-based component
- **Footer.astro** — empty frontmatter block removed (pure markup)
- **Nav.astro** — added `aria-current="section"` tracking script for hash-based navigation
- **ContactForm.jsx** — accessibility hardening: `aria-invalid` on error fields, `aria-describedby` linking errors to inputs, `aria-live="polite"` on success screen, `role="alert"` on error banner
- **global.css** — fluid typography utilities (`text-fluid-*`), `text-body-readable` (65ch max-width), `text-light-on-dark` (improved line-height), global `prefers-reduced-motion` rule
- **BaseLayout.astro** — injected `Organization` + `WebSite` JSON-LD structured data

## Contributing

See [AGENTS.md](AGENTS.md) for the project knowledge base, conventions, and anti-patterns.

## License

MIT
