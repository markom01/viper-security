# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session auto-behavior

At the start of any task-oriented session — any interaction where you will use tools and produce deliverables — invoke the `task-observer` skill before beginning work. This ensures skill-improvement opportunities are captured throughout the session. (Auto-load is also injected by the SessionStart hook; this line is the belt-and-suspenders fallback.)

## Commands

Monorepo (npm workspaces). This repo hosts two independent Astro sites + a shared package:

- `sites/viper` — VIPER Security (live: https://vipersecurity.ch — Cloudflare Workers)
- `sites/dbc` — DB Custom Garage (live: https://dbcustomgarage.com — Netlify)
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

Astro 7 static site (no SSR, no adapter, no routing beyond `/`, `/404`, `/admin`). Hand-written CSS (no Tailwind runtime; `global.css` + site `theme.css` tokens). Deploy path differs per site: VIPER ships through GitHub Actions (`Deploy VIPER`) to Cloudflare Workers (`sites/viper/wrangler.toml`, `viper-security.garage-viper.workers.dev`, custom domain `vipersecurity.ch`); DBC ships through Netlify (`sites/dbc/netlify.toml`, gated by `npm run validate:cms`). Both trigger on push to `main`.

- **Content**: per-page Zod-validated collections in each site's `src/content.config.ts`, each page owns one collection with one entry; all sections nested as sub-objects/arrays. VIPER: `home`, `service`, `fleet`, `pricing`, `membership`, `privacy`, `site`. DBC: `home`, `service`, `gallery`, `privacy`, `site` (DBC has no standalone fleet/pricing/membership — per-service vehicles live in `services/<slug>.yaml` `fleet[]`). All copy lives in `src/content/<collection>/<entry>.{yaml,md}`.
- **Data hub / assembler**: shared `assembleHome` / `assembleService` (`@garage/shared/lib/assemble`) is the single source of truth for `{placeholder}` resolution (`resolveTemplates` for `{location1}/{location1_full}/{location1_name}`, `{location2...}`, `{site_name}`, `{vehicle}` using site-global `booking_data`). Page templates call the assembler — they do NOT call `resolveTemplates` themselves. `home`/`site` are singletons (id `content` via `content.yaml`); `service`/`fleet`/`gallery` are `*.yaml` globbed by filename slug; `privacy` stays `content.md` (rendered via `render()`).
- **Config layers** in `src/config/`:
  - `templates.js` — `resolveTemplates` substitutes `{location1}/{location1_full}/{location1_name}`, `{location2...}`, `{site_name}`, `{vehicle}` using `booking_data`. Owned by the assembler; page templates must not re-run it.
  - `strings.js` — technical UI strings with no CMS path (STRINGS default export + `SITE_NAME`).
  - `icons.js` — inline SVG strings injected via `set:html`.
- **CMS**: [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin/` ([public/admin/index.html](public/admin/index.html) — a static public file since `7194b85`, not an Astro page — boots `@sveltia/cms`, [public/admin/config.yml](public/admin/config.yml)), **github backend** (not git-gateway), repo `markom01/viper-security`, branch `main` → deploys on save. Each site has its own `public/admin/config.yml` (separate `media_folder`/`public_folder`/collections).
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
- **DBC CMS stores label keys with underscores** (`nav_contact`), not dots (`nav.contact`) — Sveltia rejects dotted field names. `SiteLayout.astro` (and `gallery.astro`) normalize `_`→`.` before passing labels to `resolveLabels`. VIPER's CMS does the same normalization in its own config. Add DBC labels as `foo_bar`, not `foo.bar`.
- **`fleetSection` arg is declared but NOT consumed by `assembleService`.** DBC's `[slug].astro` monkeypatches `a.pageContent.fleet.heading` post-assembly (the source notes this as "Task 8" — the assembler side was never wired). Don't assume `fleetSection` flows through the assembler; it does not today.
- **"Currently Selling" has one vehicle source per site, not one shared collection.** Both sites now have a `currently-selling` collection (`src/content/currently-selling/*.yaml`, CMS folder `currently-selling`, globbed by filename slug, shared `fleetVehicleSchema`) and both expose the same entry fields: `vehicle` (NHTSA widget), `description`, `images`, `order`. DBC still has a legacy `offering.fleet[]` fallback — the collection wins whenever it is non-empty. VIPER's legacy `fleet[]` was removed from `luxury-cars-sale.yaml`; its services CMS no longer exposes a fleet list. Fleet resolution is shared: `resolveServiceFleet` in `@garage/shared/lib/service-fleet` (collection first, `offering.fleet[]` fallback, sorted by `order` then id) is called by both `[slug].astro` pages. Both use `fleet_section` (heading + subheadline) but only the page template writes the subheadline: DBC sets label key `fleet_subheadline` BEFORE the `_`→`.` normalization, VIPER sets `labels["fleet.subheadline"]` AFTER normalization. Fleet entries use the shared fleet fields incl. the `nhtsa_vehicle` widget; Sveltia writes `null` for untouched optionals, which the schemas preprocess back to `undefined`.
- **The `nhtsa_vehicle` CMS field is vendored, not a CDN plugin.** `packages/shared/src/admin/nhtsa-field.js` (control) + `packages/shared/src/lib/nhtsa.js` (vPic client) are bundled by `scripts/build-cms-field.mjs` into `sites/*/public/admin/vehicle-lookup.js` via each site's `prebuild` hook (or root `npm run cms:field`). Registration must stay synchronous: `public/admin/index.html` loads `/admin/vehicle-lookup.js` after the Sveltia CDN script (no defer), and the field no-ops when `CMS.React` is absent. Admin CSP carries `https://vpic.nhtsa.dot.gov` (both `netlify.toml` `/admin/*` blocks + `sites/viper/deploy/cloudflare/_headers`). Empty or failed lookups degrade to plain text inputs, so editing never blocks.
- **`/admin/` 404s on the local Astro dev server — expected.** The admin entry is `public/admin/index.html`, and Astro dev serves `public/` files by exact path only; it never resolves a directory index. Use `http://localhost:4321/admin/index.html` / `:4322/admin/index.html` locally. Netlify serves the directory index, so `https://vipersecurity.ch/admin/` and `https://dbcustomgarage.com/admin/` work in production. Don't "fix" this by re-adding `src/pages/admin.astro` — the static file is deliberate (`7194b85`).
- **`node scripts/validate-cms.mjs` is currently red on `other_vehicles`.** `form_fields[].other_vehicles: true` in `sites/dbc/src/content/services/{auction,customizing}.yaml` is not declared in `sites/dbc/src/content/json-schemas/services.json`; the concurrent copy-audit branch ships that schema fix with its image-rename program. Expected pre-merge state is 7 valid / 2 errors — don't "fix" it by adding fields here without that session.

## graphify (only when the CLI is installed)

If the `graphify` CLI is installed and this project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships, use it. Otherwise skip this section and use normal search.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## TypeScript errors — editor Problems tab vs CLI checkers

When a user reports "TS errors" in a TS/TSX/Astro project, the VS Code Problems tab uses **tsserver + the framework's TS plugin** (e.g. `@astrojs/ts-plugin`). The CLI `astro check` (for Astro) and `tsc --noEmit` (for TS/TSX) use the SAME checker core — they match the editor **as long as the framework TS plugin is installed + listed in tsconfig `compilerOptions.plugins`**.

**If `astro check`/`tsc` report 0 errors but the editor shows errors, the first thing to check is whether the framework's TS plugin is installed + in tsconfig `plugins`.** Missing plugin = CLI checker never runs the plugin → CLI clean but editor dirty. Adding the plugin to tsconfig makes `astro check` catch exactly what the editor shows (verify by planting a deliberate type error — both should report it).

Pre-handoff checklist for TS work:

1. `astro check` on every site/workspace (or `tsc --noEmit` for plain TS projects)
2. If editor-only errors persist with CLI clean → check plugin present in tsconfig `plugins`
3. If CLI matches editor but errors remain in `node_modules/**` → framework-internal bugs, not app code — leave them, don't write custom checkers

Known framework-internal errors (Astro): `virtual:astro:assets/fonts/internal` (2307) + `inferSize` (2339) in `node_modules/astro/components/Font.astro`/`Picture.astro` are Astro's own bugs. `env.d.ts` can clear the 2307 via `declare module`; the 2339 is unfixable app-side. `astro check` ignores both. Leave them.
