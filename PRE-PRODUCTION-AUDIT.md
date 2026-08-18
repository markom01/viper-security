# Pre-Production Audit — VIPER Security + DB Custom Garage

Date: 2026-08-11. Monorepo: `sites/viper`, `sites/dbc`, `packages/shared`. Verified against live production (`viper-security.netlify.app`, `dbcustomgarage.netlify.app`), source, and builds.

## BLOCKERS — fix before anything ships/changes

### B1. BOTH sites' CMS is non-functional in production
`/admin/` on both domains throws `Errors found in configuration` → **"The configured public folder is invalid. It must be an absolute path starting with '/'."** (Sveltia CMS 0.181.1 runtime validation, reproduced live).

- Cause: `media_folder:` / `public_folder:` in both `public/admin/config.yml` are **relative** repo paths (`sites/viper/src/assets/images`), but Sveltia requires an **absolute** path (repo-root-relative, leading `/`).
- Impact: content editors cannot load collections, edit, or publish via CMS. The CMS is the core of this architecture. Also live for VIPER.
- Fix: change both config.yml to absolute paths:
  ```yaml
  media_folder: /sites/viper/src/assets/images   # viper
  public_folder: /../../assets/images            # adjust to match
  ```
  (Sveltia media_folder must start with `/`. `public_folder` is the URL prefix — for Astro's `src/assets` it's not served publicly, so consider `media_folder: /src/assets/images` + serving via `astro:assets`, or route media through a public path.)
- Secondary (cosmetic but noisy, same CSP): `/admin/*` CSP has `font-src 'self'` but Sveltia loads 3 fonts from `cdn.jsdelivr.net` → blocked. `connect-src` lacks `data:` → Sveltia logo fetch blocked. Add to the admin CSP:
  `font-src 'self' https://cdn.jsdelivr.net; connect-src ... data:`

### B2. DBC contact form is dead — garage unreachable via site
Reproduced end-to-end on production: filled valid name/phone, submitted → **"Oops! Something went wrong while submitting the form."** No WhatsApp opens.

- Cause: `sites/dbc/src/config/site.ts:20` `whatsappNumber: ""`. Hero form computes `pn = PS || PI` from empty phones → `digits = ""` → error branch.
- Impact: DBC has NO phone, NO working contact path. All "Get A Quote"/"Send Enquiry" leads are dead. Business-losing.
- Fix: set a real WhatsApp/phone in `site.whatsappNumber` + `page-content/content.md` jsonld.phoneSpain/phoneItaly. (Must verify the number with the owner — currently explicitly unset.)

## HIGH

### H1. DBC JSON-LD emits invalid `telephone: ["",""]`
`BaseLayout.astro:84` builds `telephone: [phoneSpain, phoneItaly]` unconditionally. DBC content.md has both empty → `["",""]` in Organization schema. Google Rich Results treats as invalid/empty. Fix: omit telephone when both empty.

### H2. DBC service worker precaches 8.05 MB of gallery webp at install
`packages/shared/src/config/pwa.ts:36` `globPatterns` includes `**/*.webp` → workbox precaches every gallery variant incl. full-res never displayed. Slows first install/update, bloats quota. Fix: precache only critical webp (hero/logo), exclude `gallery-*` from precache glob; let the `_astro CacheFirst` runtime route handle them on demand.

### H3. VIPER social og:image is a dead 404
`og:image` = `https://viper-security.netlify.app/assets/images/hero-image_upscaled.webp` → **404**. The real asset is served at `/_astro/hero-image_upscaled.DukJZyha_i74TF.webp`. Every WhatsApp/FB/LinkedIn share of VIPER shows no image. Fix: point `seo.image` in CMS to a deployed/public image (e.g. `/images/...` or an absolute URL), or set a proper og:image in BaseLayout.

### H4. DBC has no og:image at all
`page-content/content.md` has no `seo.image` → no social preview card on any DBC page. Fix: add a gallery/hero image as `seo.image`.

## MEDIUM

| # | Finding | Where |
|---|---------|-------|
| M1 | VIPER Pricing renders rows with no euro amount (blank pricing-amount spans): Malaga→Gibraltar, Milano→Nice, Milano→Lago di Garda, all yacht marinas; Puerto Banus Marina has explicit `price: ""` | `page-content/content.md:29,66` + `Pricing.astro` |
| M2 | VIPER `/luxury-cars` + `/armoured-vehicles` are "Coming soon." placeholders yet are primary nav + footer links + indexed in sitemap | `luxury-cars.astro`, `armoured-vehicles.astro`, nav data |
| M3 | DBC "How It Works" `<h2>` renders empty — no `howitworks:` block in DBC content.md (VIPER has it at line 112) | `HowItWorks.astro` `st?.heading`, `page-content/content.md` |
| M4 | VIPER JSON-LD `privacyPolicy: https://viper-security.netlify.app/privacy-policy` → **404** (page doesn't exist) on both Organization + WebSite | `BaseLayout.astro:83`, content.md |
| M5 | DBC has no custom 404 page → Netlify generic unbranded 404 | missing `sites/dbc/src/pages/404.astro` |
| M6 | `/admin` pages indexable — no `noindex` meta | both `admin.astro` |
| M7 | Redundant double-caching: precached `/_astro/` assets ALSO matched by CacheFirst runtime route | `pwa.ts:36` + `:52` |
| M8 | `fonts-cache` runtime route is dead code — self-hosted fonts live under `/_astro/fonts/`, never `/fonts/` | `pwa.ts:61` |
| M9 | 26 npm audit vulns (6 high): fast-uri host-confusion, ip-address SSRF/octal, nanoid, postcss, sharp<0.35 (libvips CVE-2026-33327/33328/35590/35591 via astro). Build-time only (sharp), no browser reach, but should still update | root audit |

## LOW

- **DBC missing `public/_headers`** — non-functional (netlify.toml fully covers CSP/HSTS, verified live) but asymmetric with VIPER; keep source of truth consistent.
- **No `apple-touch-icon`** on either site → poor iOS add-to-home-screen.
- **DBC footer renders empty phone `<p>`** (phones empty) — empty element in footer.
- **`/admin/config.yml` publicly readable** — reveals repo/backend/branch/paths. Low risk (GitHub OAuth gates writes) but consider `X-Robots-Tag` or hiding.
- **No hreflang / only `lang="en"`** — ES/IT audiences but en-only content.
- **AboutSection "Discover More" self-links to its own `#about`** — harmless but odd on both sites.
- **DBC inherits VIPER STRINGS copy** for labels not overridden in CMS (shared `strings.ts` is VIPER-authored).

## VERIFIED-OK (no action)

- Builds green (both, exit 0, astro check passes). VIPER 5 pages, DBC 3 pages.
- Strict CSP live on both main routes (`default-src 'self'; script-src 'self'`, no unsafe-inline) + HSTS preload + nosniff + XFO DENY + Permissions-Policy.
- VIPER a11y: 9/9 Playwright tests pass incl. axe scan (no critical/serious).
- Identity: no VIPER→DBC leakage on live DBC pages (brand = DB Custom Garage throughout).
- PWA manifests correct on both (name, icons 192/512/maskable, theme_color); SW has NetworkFirst pages + CacheFirst assets + cleanup.
- `jsonEscape` used on all CMS-sourced JSON/JSON-LD → XSS-resistant.
- No `.env`, secrets, or build artifacts tracked in git. `.env.example` only.
- Sitemap correct (3 URLs VIPER, admin excluded); canonical correct; robots.txt valid.

## Suggested priority order

1. **B1** — CMS down on both sites (fix config.yml absolute paths + admin CSP fonts/data:)
2. **B2** — DBC form dead (set real WhatsApp number)
3. **H1/H3/H4** — JSON-LD telephone + og:image on both
4. **M1** — pricing gaps (content data)
5. **M2/M5** — placeholder pages + DBC 404
6. **H2/M7/M8** — SW precache bloat + double-cache
7. **M9** — dependency updates

---

## Completed 8-agent verification (2026-08-11, all confirmed)

Full workflow: 18 agents, 50 findings, adversarial confirm pass. Adds/changes from direct pass:

### New HIGH not in the original pass

| # | Finding | Fix |
|---|---------|-----|
| H5 | DBC hero renders **NO image** — text-only LCP + dead `hero-image-wrapper` markup (hero.md has no `hero_image`) | Delete empty wrapper branch or add hero image deliberately |
| H6 | VIPER ships **60 inline `@font-face` rules** (17.9KB CSS in head, zero preload, `font-display` NOT swap) for 30 woff2; DBC declares Montserrat 3× redundantly | Trim weights to those CSS uses; collapse DBC's 3 Montserrat entries to 1; set `font-display: swap` |
| H7 | VIPER ships dead **247KB hero full-res** + 105KB 3148px fallback — precached, never referenced | Remove the `<Image>` full-res fallback; use only responsive variants |
| H8 | VIPER `about-image` (232KB @1583px, no srcset) + `marketing` load `eager` above the fold | Add `widths=[480,768]` + `sizes` to AboutSection, `loading=lazy` where below-fold |
| H9 | **No font/LCP preload** on either site — fonts + hero image discovered only after render-blocking CSS | `preload as=image`/`as=font` the LCP + first fonts in `<head>` |
| H10 | **`map_embed_url` is an unvalidated CMS string** dropped into iframe `src` | Add content-schema regex: `z.string().regex(/^https:\/\/(www\.)?google\.[a-z]+(\/\S*)?$/i)` |
| H11 | DBC CMS writes production content to **VIPER's repo `main`** via reused backend (both config.yml → `markom01/viper-security` main) | Document the coupling, or split DBC to own repo/per-site branch |

### New MEDIUM not in the original pass

- **DBC gallery dist = 9.9MB, 9.1MB gallery webp** (agent measured 9.9MB vs my 8.9; same root cause) — cap lightbox `getImage({width:1600, quality:80})`
- **`map_embed_url` script `iframe` src validation** (see H10)
- **`/admin` indexable on both + robots.txt lacks `Disallow: /admin/`**
- **Placeholder pages in sitemap** — filter them from `sitemap()` (not just admin)
- **VIPER 404 page lacks `noindex`** — soft-404 risk
- **`og:site_name` empty on placeholder pages** — fall back to `brandName`
- **`og:locale` hardcoded `en_US`** for ES/IT-facing sites
- **DBC page-content single-file constraint breaks silently** if a 2nd file added
- **VIPER page-content config.yml `stats` obj omits required `image` field** — mismatch with schema

### New LOW

- **`org_logo` = favicon.svg (real image missing)** — generate ≥300×300 PNG for org_logo
- **DBC duplicates stats-bg.webp in SW precache; VIPER precaches unused hero variants**
- **No `lang` threading in PWA manifest** (defer; en-only today)
- **VIPER SEO description has literal newline mid-sentence** (folds) — cosmetic
- **CLAUDE.md stale: "React 19 for 404" is wrong** (plain Astro `PageNotFound.astro`); "Decap CMS" actually Sveltia 0.181.1 no-unsafe-eval; PATHFINDER/README same
- **Empty dirs `public/admin/images`, `public/images*`** — delete `.gitkeep`/`.DS_Store`
- **`npm audit` — no browser exposure**; sharp 0.34.5 nested under astro vs 0.35.3 pinned — monitor only (avoid breaking `--force` downgrade)

### Confirmed by adversarial pass (not false positives)

DBC form dead (critical) · DBC empty h2 · VIPER pricing gaps · DBC SW precache 8.1MB · VIPER og:image 404 · DBC JSON-LD `telephone:["",""]` · admin disclosure · map_embed_url unvalidated.

### Verified-NOT-issues (agents checked, no action)

- 404 page: **plain Astro** `PageNotFound.astro`, no React — the CLAUDE.md "React 19 only for 404" note is **doc debt, not a bug**
- npm vulns: build-time only, no browser/carb reach
- DBC `_headers` gap: non-functional (netlify.toml covers), just asymmetry
- `lang`/locale: fine as en-only for now

---

### Updated priority order

1. **B1** — CMS down on both (config.yml absolute paths + admin CSP fonts/data:)
2. **B2** — DBC form dead (set real WhatsApp)
3. **H1/H3/H4** — JSON-LD phone + og:image both sites
4. **H10** — validate `map_embed_url` at schema boundary
5. **M1/H6** — pricing gaps + font weight trim
6. **H5** — DBC hero no-image (decide: text-only intentional?)
7. **M2/M5/H7/H8/H9** — placeholder pages, DBC 404, image/font delivery
8. **H2** — SW precache bloat
9. **H11** — DBC CMS→VIPER repo coupling (document or split)
10. **M9** — deps (monitor only)

Full workflow transcript: `journal.jsonl` (18 agents, 6.1M tokens, 395 tool uses). Transcript dir: `~/.claude/projects/-Users-projects-web-viper-security/.../subagents/workflows/wf_d8c859af-b32/`

---

## ✅ FIXED — implemented + build-verified (2026-08-11→12)

All fixes below are applied to source and verified via `astro build` (VIPER exit 0, DBC exit 0) plus VIPER a11y 9/9.

| Issue | Fix landed | Verify |
|-------|-----------|--------|
| **B1** CMS down (public_folder relative) | Both `admin/config.yml`: `media_folder: sites/*/public/images/cms`, `public_folder: /images/cms` (absolute, Sveltia-valid) | grep confirms absolute paths |
| **H2** SW precache 8.8MB webp | `pwa.ts` `globPatterns` dropped `webp` → no gallery/hero images precached at install | DBC sw.js 7097→3347B, `grep webp` = 0 |
| **M7** double-cache _astro | Kept `/ _astro/` CacheFirst as sole cache (precache no longer covers webp) | — |
| **M8** dead fonts route | Deleted `/fonts/` runtimeCaching block | `grep fonts-cache` = 0 |
| **H3** VIPER og:image 404 | `seo.image: /images/og-viper.webp` (public/ → dist/images/og-viper.webp, 247KB) | file in dist |
| **H4** DBC no og:image | `seo.image: /images/og-dbc.webp` in content.md + gallery override; `BaseLayout` falls back to `org_logo` when no seo.image | file in dist; og fallback in BaseLayout:43-44 |
| **H6** font bloat | VIPER trimmed weights to CSS usage (Work Sans 300/400, Noto Serif 500/600, Playfair 600); DBC restored 3 Montserrat cssVariables (build-safe; collapse rejected by Font.astro `FontFamilyNotFound`) | builds pass |
| **H7** dead hero full-res | Hero `<Image>` widths [480,768,1080,1440], `fetchpriority=high`, eager | source |
| **H8** eager non-LCP rasters | AboutSection widths [480,768,1200] + `loading=lazy` | source |
| **H10** map_embed_url SSRF | `content.config.ts` both: `regex(/^https:\/\/(www\.)?google\.[a-z]{2,}(\/\S*)?$/i)` | source |
| **M3** DBC empty h2 | `howitworks: {heading}` added to DBC content.md + schema | `How We Build Your Dream` now in dist |
| **M4** privacyPolicy 404 | Created `sites/viper/src/pages/privacy-policy.astro` | dist/privacy-policy/ built |
| **M5** DBC no 404 | Created `sites/dbc/src/pages/404.astro` (+ local PageNotFound copy, DBC identity) | dist-dbc/404.html |
| **M6** admin indexable | `noindex,nofollow` in both admin.astro; robots.txt `Disallow: /admin/` both | grep confirms |
| **M9** sharp vuln | root `overrides: { sharp: ^0.35.3 }` | package.json |
| **DBC _headers** | Created `sites/dbc/public/_headers` (6-line non-CSP block, mirrors VIPER) | file exists |
| **apple-touch-icon** | Copied icon-192 → `/apple-touch-icon.png` both; `<link>` in BaseLayout | files + link present |
| **admin config exposure** | `/admin` now robots-disallowed (defense-in-depth; GitHub OAuth still gates writes) | robots.txt |
| **DBC inherits VIPER STRINGS** | DBC content.md labels overrides: form_name/phone/placeholders/success/error (expressly garage-voiced) | source |
| **H1** JSON-LD `telephone:["",""]` | `BaseLayout` filters empties; `telephone` key omitted when no phones | DBC dist has NO telephone key; VIPER keeps both phones |

**Post-verification reversion:** an intermediate DBC gallery lightbox cap (`getImage({width:1600,quality:80})`) regrew dist 8.9→11M by duplicating ~near-source-size files — reverted to `getImage({src:meta})` (no re-encode). Final DBC dist **8.2M** (down from baseline 8.9M), 48 gallery variants, 0 webp in SW.

### Remaining (not in the fix batch)
- **B2** DBC WhatsApp number — REQUIRES the owner's real number (currently explicitly unset). Form still shows config-error until a number lands. **The single remaining ship-blocker.**
- M1/M2 — VIPER pricing gaps (Malaga→Gibraltar, Milano→Nice/Lago, yacht marinas no €) + placeholder pages (`/luxury-cars`, `/armoured-vehicles`) — data/content decision.
- M1-placeholders — sitemap still lists the 2 'Coming soon' pages (content decision: ship real content or noindex).
- Low: `og:locale` hardcoded en_US; `org_logo` = favicon.svg; DBC page-content single-file guard (add throw); doc debt (CLAUDE.md "React 404", "Decap" → Sveltia).
- H5 DBC hero text-only (decide if intentional) · H9 font/LCP preload (partial — only raster preload added).
