# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server → localhost:4321
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run test:a11y    # Playwright a11y tests (serves dist/ on :4322, needs build first)
npx astro check      # Type-check .astro files (uses @astrojs/check)
```

No lint script. Tests are Playwright-only (`e2e/a11y.spec.ts`); vitest is installed but has no test script. Build before `npm run test:a11y` — the webServer in `playwright.config.js` serves `dist/`.

## Architecture

Astro 7 static site (no SSR, no adapter, no routing beyond `/`, `/404`, `/admin`). Tailwind v4 via `@tailwindcss/vite` — no config file, CSS-first. React 19 used only for the 404 page. Deployed to Netlify: push to `main` → auto-build.

- **Content**: 7 Zod-validated markdown collections in [src/content.config.ts](src/content.config.ts) under `src/content/`: `hero`, `how-it-works`, `services`, `fleet`, `pricing`, `membership`, `page-content`. All copy lives in these files.
- **Data hub**: [src/pages/index.astro](src/pages/index.astro) fetches every collection in frontmatter, resolves `{placeholder}` templates via `resolveTemplates`, then passes props to 13 `.astro` section components in `src/components/sections/`.
- **Config layers** in `src/config/`:
  - `templates.js` — `resolveTemplates` substitutes `{location1}/{location1_full}/{location1_name}`, `{location2...}`, `{site_name}`, `{vehicle}` using `page-content` `booking_data`. Applied in `index.astro` to prose fields before rendering.
  - `strings.js` — technical UI strings with no CMS path (STRINGS default export + `SITE_NAME`).
  - `icons.js` — inline SVG strings injected via `set:html`.
- **CMS**: Decap at `/admin/` ([src/pages/admin.astro](src/pages/admin.astro) + [public/admin/config.yml](public/admin/config.yml)), git-gateway backend, repo `markom01/viper-security`, writes to `main` → deploys on save.
- **Hero booking form** ([src/components/sections/Hero.astro](src/components/sections/Hero.astro)): client JS in `define:vars` `SCRIPT_DATA` populates location→service→destination selects from `booking_data`, validates name/phone (Unicode regex), opens WhatsApp `wa.me/<phone>?text=...` on submit. Also carries `data-netlify="true"` for Netlify Forms.
- **Layout** ([src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro)): SEO meta, JSON-LD Organization/WebSite from `pageContent.jsonld`, fonts, skip-link, IntersectionObserver scroll-reveal on `[data-scroll-reveal]`.
- **Styles**: [public/styles/global.css](public/styles/global.css) — Webflow-normalized, design tokens `--colors--*` (onyx/gold/amber/cloud/ivory), `--font-families--*` (Work Sans / Noto Serif / Playfair Display).
- **Security headers**: duplicated in both `netlify.toml` and `public/_headers` (strict main, lax `/admin/*` for Decap CDN + `unsafe-eval`).

## Gotchas

- **`src/components/AGENTS.md` is STALE** — describes a deleted React/JSX architecture (PageRoot.jsx, ServiceCard.jsx, etc.). Ignore it; real sections are `.astro`. README.md and this file are accurate.
- **Pricing collection key is `pricing`**, entry id `hourly` (`getEntry('pricing', 'hourly')`). README/memory may say `pricing-hourly` — wrong, that was the old name.
- **`getCollection('page-content')` is destructured as `[pageContentEntry]`** — exactly one `content.md` allowed; a second file breaks the destructure.
- **After editing `src/content.config.ts` schemas or collection files**: dev server may serve stale content. Press `s` then Enter in the dev terminal to re-sync the content layer (README-documented).
- **Fleet capacity fields are mixed types**: `seats`/`baggage`/`year` are strings from CMS ("3"), `capacity_passengers`/`capacity_suitcases`/`capacity_carryon` are numbers. Both rendered in Fleet.astro.
- `public/_headers` and `netlify.toml` both define security headers — Netlify merges them; change both when editing CSP.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
