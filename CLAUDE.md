# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session auto-behavior

At the start of any task-oriented session — any interaction where you will use tools and produce deliverables — invoke the `task-observer` skill before beginning work. This ensures skill-improvement opportunities are captured throughout the session. (Auto-load is also injected by the SessionStart hook; this line is the belt-and-suspenders fallback.)

## Commands

Monorepo (npm workspaces). This repo hosts two independent Astro sites + a shared package:

- `sites/viper` — VIPER Security (live: https://viper-security.netlify.app)
- `sites/dbc` — DB Custom Garage (live: https://dbcustomgarage.netlify.app)
- `packages/shared` — `@garage/shared`: layout, sections, config defaults (strings/labels/icons/templates), types

Run per workspace from root, or `cd` into a site dir:

```bash
# VIPER
npm run dev -w @garage/viper            # or cd sites/viper && npm run dev  → :4321
npm run build -w @garage/viper          # → sites/viper/dist
npm run test:a11y -w @garage/viper      # Playwright (serves sites/viper/dist)
(cd sites/viper && npx astro check)     # type-check

# DB Custom Garage
npm run dev -w @garage/dbc              # or cd sites/dbc && npm run dev   → :4322
npm run build -w @garage/dbc            # → sites/dbc/dist-dbc
(cd sites/dbc && npx astro check)
```

No lint script. Tests are Playwright-only (`sites/viper/e2e/a11y.spec.ts`); Build before `npm run test:a11y` — the webServer in `sites/viper/playwright.config.js` serves `dist/`.

## Architecture

Astro 7 static site (no SSR, no adapter, no routing beyond `/`, `/404`, `/admin`). Hand-written CSS (no Tailwind runtime; `global.css` + site `theme.css` tokens). Deployed to Netlify: push to `main` → auto-build.

- **Content**: per-page Zod-validated collections in each site's `src/content.config.ts`, each page owns one collection with one entry; all sections nested as sub-objects/arrays. VIPER: `home`, `service`, `fleet`, `pricing`, `membership`, `privacy`, `site`. DBC: `home`, `service`, `gallery`, `privacy`, `site` (DBC has no standalone fleet/pricing/membership — per-service vehicles live in `services/<slug>.yaml` `fleet[]`). All copy lives in `src/content/<collection>/<entry>.{yaml,md}`.
- **Data hub / assembler**: shared `assembleHome` / `assembleService` (`@garage/shared/lib/assemble`) is the single source of truth for `{placeholder}` resolution (`resolveTemplates` for `{location1}/{location1_full}/{location1_name}`, `{location2...}`, `{site_name}`, `{vehicle}` using site-global `booking_data`). Page templates call the assembler — they do NOT call `resolveTemplates` themselves. `home`/`site` are singletons (id `content` via `content.yaml`); `service`/`fleet`/`gallery` are `*.yaml` globbed by filename slug; `privacy` stays `content.md` (rendered via `render()`).
- **Config layers** in `src/config/`:
  - `templates.js` — `resolveTemplates` substitutes `{location1}/{location1_full}/{location1_name}`, `{location2...}`, `{site_name}`, `{vehicle}` using `booking_data`. Owned by the assembler; page templates must not re-run it.
  - `strings.js` — technical UI strings with no CMS path (STRINGS default export + `SITE_NAME`).
  - `icons.js` — inline SVG strings injected via `set:html`.
- **CMS**: Decap at `/admin/` ([src/pages/admin.astro](src/pages/admin.astro) + [public/admin/config.yml](public/admin/config.yml)), git-gateway backend, repo `markom01/viper-security`, writes to `main` → deploys on save.
- **Hero booking form** ([src/components/sections/Hero.astro](src/components/sections/Hero.astro)): client JS in `define:vars` `SCRIPT_DATA` populates location→service→destination selects from `booking_data`, validates name/phone (Unicode regex), opens WhatsApp `wa.me/<phone>?text=...` on submit. Also carries `data-netlify="true"` for Netlify Forms.
- **Layout** ([src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro)): SEO meta, JSON-LD Organization/WebSite from `pageContent.jsonld`, fonts, skip-link, IntersectionObserver scroll-reveal on `[data-scroll-reveal]`.
- **Styles**: [public/styles/global.css](public/styles/global.css) — Webflow-normalized, design tokens `--colors--*` (onyx/gold/amber/cloud/ivory), `--font-families--*` (Work Sans / Noto Serif / Playfair Display).
- **Security headers**: duplicated in both `netlify.toml` and `public/_headers` (strict main, lax `/admin/*` for Decap CDN + `unsafe-eval`).

## Gotchas

- **`src/components/AGENTS.md` is current** — real sections are `.astro`, one React `.jsx` 404 page. Updated in the monorepo refactor (`a90a821`) — describes the Astro architecture including the deleted JSX tree in a historical note.
- **Pricing collection key is `pricing`**, entry id `hourly` (`getEntry('pricing', 'hourly')`). README/memory may say `pricing-hourly` — wrong, that was the old name.
- **Each page owns one collection, one entry.** `home`/`site` are singletons (`content.yaml` → id `content`): `getEntry('home','content')`, `getEntry('site','content')`. `service`/`fleet`/`gallery` are globbed `*.yaml` by filename slug. `privacy` stays `content.md` (rendered via `render(policy)`).
- **`resolveTemplates` lives in the assembler, not templates.** Page templates must NOT call `resolveTemplates` — `assembleHome`/`assembleService` (`@garage/shared/lib/assemble`) resolve `{placeholder}` tokens (incl. `jsonld.org_name`/`org_description`) before `pageContent` reaches the layout. Re-running it in a template double-resolves.
- **Service `stats`/`cta` are optional objects, not nullable.** In YAML, a service offering with no stats/cta must OMIT the key — `stats: null` / `cta: null` FAILS Zod (the shared `serviceDetailSchema` has no `.nullable()`). Empty-string `form_fields[].type`/`side` and `null` `fleet[].capacity_*` are also written as omitted (content-validation does not run the schema's `""/null→undefined` preprocess; only runtime/type-gen does).
- **After editing `src/content.config.ts` schemas or collection files**: dev server may serve stale content. Press `s` then Enter in the dev terminal to re-sync the content layer (README-documented).
- **Fleet capacity fields are mixed types**: `seats`/`baggage`/`year` are strings from CMS ("3"), `capacity_passengers`/`capacity_suitcases`/`capacity_carryon` are numbers. Both rendered in Fleet.astro.
- CSP is defined only in `netlify.toml` (sole source of truth) — `public/_headers` carries non-CSP headers only. Edit CSP in `netlify.toml` only.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
