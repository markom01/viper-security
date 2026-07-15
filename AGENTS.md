# VIPER SECURITY — PROJECT KNOWLEDGE BASE

> **Name clarification**: Despite the "Security" in its name, VIPER Security is a **luxury private chauffeur service** — executive transport, airport transfers, and VIP travel in Marbella and Milano. This is not a security company.

**Stack:** Astro 7 + React 19 + Tailwind CSS v4 + Decap CMS → Netlify
**Node:** >=22.12.0 | **Deploy:** `git push main` → Netlify auto-build

## STRUCTURE

```
./
├── src/
│   ├── components/    # 10 .astro components + 1 React island (ContactForm.jsx)
│   ├── content/       # Markdown content collections (7 collections, Zod-validated)
│   ├── layouts/       # BaseLayout.astro (HTML shell, SEO, fonts, JSON-LD schema)
│   ├── pages/         # index.astro — sole route, imports 6 section components
│   └── styles/        # global.css — Tailwind v4 @theme tokens, fluid typography, animations
├── public/
│   ├── admin/         # Decap CMS (CDN-loaded, git-gateway backend)
│   └── images/        # CMS media folder (currently empty)
├── scripts/           # verify-cms.js — checks Decap ↔ Astro schema alignment
├── .sisyphus/         # Agentic workflow artifacts (ADRs, plans, evidence)
├── DESIGN.md          # Lamborghini-inspired design system spec
└── netlify.toml       # Build command + admin SPA redirect
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Page layout & composition | `src/pages/index.astro` | Imports all 6 sections |
| Visual identity & tokens | `src/styles/global.css` | Tailwind v4 `@theme` block |
| Full design spec | `DESIGN.md` | Colors, typography, spacing, Do/Don't |
| New section component | `src/components/` | Follow existing `.astro` patterns |
| Reusable card component | `src/components/ServiceCard.astro` | Slot-based, used 10x in Services.astro |
| Interactive form logic | `src/components/ContactForm.jsx` | React 19, Netlify Forms |
| Content editing (admin) | `public/admin/config.yml` | Decap CMS collections |
| Content schemas | `src/content.config.ts` | Zod schemas, must match admin config |
| CMS config validation | `scripts/verify-cms.js` | `node scripts/verify-cms.js` |

## CONVENTIONS (deviations from standard Astro)

- **No linter/formatter** — ESLint, Prettier, Biome all absent. Self-enforce style.
- **No path aliases** — all imports are relative (`../`, `./`). No `@/` configured.
- **No CI/CD** — no `.github/workflows/`. Netlify auto-deploys from `main`.
- **Tailwind v4 CSS-first** — no `tailwind.config.js`. Theme in `global.css` via `@theme`.
- **React boundary** — React ONLY for `ContactForm.jsx` (interactive island). All other components are pure `.astro`.
- **ContactForm hydration** — uses `client:load` (eager), not `client:idle` or `client:visible`.
- **No Astro adapter** — static output only (no SSR, no edge functions).
- **Env vars** — `PUBLIC_*` prefix exposes to client. Only 2 vars documented.

## ANTI-PATTERNS (THIS PROJECT)

- **Do NOT** add additional accent colors beyond gold — black+gold only (per DESIGN.md).
- **Do NOT** use border-radius > 0 on buttons, cards, or containers.
- **Do NOT** use JS animation libraries — CSS transitions/animations only.
- **Do NOT** add lowercase to display headings — all-caps is the default voice.
- **Do NOT** add shadows to elements — depth via surface color layering.
- **Do NOT** bypass `netlify.toml` + `public/_redirects` sync — admin SPA redirect must be in both.
- **Do NOT** modify `src/content.config.ts` without mirroring changes in `public/admin/config.yml`.
- **Do NOT** use `--color-black` (#0B0B0B) for body background — use hardcoded `#000000` per DESIGN.md.

## UNIQUE STYLES

- **Design voice**: "Lamborghini-inspired nocturnal luxury" — pure black canvas, gold CTAs, sharp geometry.
- **Typography**: Playfair Display (headings, serif) + Manrope (body, sans-serif), non-render-blocking via `media="print"` swap.
- **Animations**: Staggered fade-in-up on hero (`nth-child` delays), IntersectionObserver scroll-reveal on fleet card, hover scale on fleet image.
- **Content model**: Dual-managed — Astro Content Collections (build-time) + Decap CMS (edit-time). Must stay in sync.
- **Glassmorphism**: Service cards use `backdrop-blur-sm` with `rgba(255,255,255,0.05)` on `bg-charcoal/50`.
- **Fluid typography**: CSS `clamp()` utilities (`text-fluid-xs`, `text-fluid-sm`, `text-fluid-base`) for responsive sizing without breakpoints.
- **Content visibility**: Below-fold sections (`#services`, `#fleet`, `#pricing`, `#membership`, `#contact`) use `content-visibility: auto` with `contain-intrinsic-size` for layout stability during lazy rendering.
- **Reduced motion**: Global `prefers-reduced-motion` media query disables all animations/transitions.
- **JSON-LD structured data**: `BaseLayout.astro` injects `Organization` + `WebSite` schema for search engine rich results.

## COMMANDS

```bash
npm run dev       # astro dev (localhost:4321)
npm run build     # astro build → dist/
npm run preview   # astro preview (serve built site)
node scripts/verify-cms.js   # validate Decap ↔ content config alignment
```

## NOTES

- **`src/index.astro.bak`** was dead code — has been deleted.
- **No 404 page** — single-page site, but needs one for production.
- **`body { background-color: #000000 }`** is intentional mismatch from `--color-black: #0B0B0B` — do not "fix".
- **Netlify Forms** handles contact submissions — no backend API.
- **Decap CMS writes directly to `main`** → triggers production deploy on every save.
- **`public/admin/` is NOT Astro-bundled** — loaded from unpkg CDN.
