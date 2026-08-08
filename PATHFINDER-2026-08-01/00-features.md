# Feature Inventory — VIPER Security (2026-08-01)

Single-page marketing site. All source read in full (17 files). Feature boundaries below reflect the actual dependency flow: `index.astro` (data hub) → 13 section components + `BaseLayout` (shell).

## Features

| #   | Feature                   | Entry points                                       | Core files                                                    | Purpose                                                                                                   |
| --- | ------------------------- | -------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| F1  | **Content Data Layer**    | `src/pages/index.astro:22-28`                      | `src/content.config.ts`, `src/content/*/*.md` (7 collections) | Zod-validated markdown collections; single source of truth for all site copy, region data, pricing, fleet |
| F2  | **Template Resolution**   | `src/pages/index.astro:33-63`                      | `src/config/templates.js:24-45`                               | `{location1}`-style placeholder substitution driven by `booking_data`                                     |
| F3  | **Booking Form**          | `src/components/sections/Hero.astro:56-107`        | `Hero.astro` script `196-262`                                 | Location→service→route→price cascade, name/phone validation, WhatsApp deep-link submission                |
| F4  | **Section Rendering**     | `src/pages/index.astro:78-91`                      | `src/components/sections/*.astro` (13 files)                  | Presentational sections, all content from props                                                           |
| F5  | **Pricing Cards**         | `src/components/sections/Pricing.astro:9-51`       | `Pricing.astro`, `src/content/pricing/hourly.md`              | Builds 2 regional cards from `booking_data` + hourly rates                                                |
| F6  | **SEO / JSON-LD / Shell** | `src/layouts/BaseLayout.astro`                     | `BaseLayout.astro:24-104`                                     | HTML shell, Org/WebSite JSON-LD, OG/Twitter meta, scroll-reveal observer                                  |
| F7  | **CMS Admin**             | `src/pages/admin.astro`, `public/admin/config.yml` | `config.yml:1-274`                                            | Decap CMS, git-gateway, writes markdown → Netlify rebuild                                                 |
| F8  | **Deploy / Security**     | `netlify.toml`, `public/_headers`                  | both                                                          | CSP, HSTS, cache headers, redirects                                                                       |

## Dependency graph

```
F7 CMS ──writes──▶ F1 Content ──▶ F2 Templates ──▶ F3/F4/F5/F6
F8 Netlify ──serves──▶ dist/ (all features)
```

**External deps:** WhatsApp `wa.me` (F3, F4 Footer), Google Fonts + Netlify Identity/Decap CDN (F6/F7), Netlify Forms hook (`data-netlify` on Hero form).
