# DB Custom Garage — Site Structure Plan

---

## Section 1 — Client Overview

### Pages in the plan

All pages use the VIPER Security section structure (Hero → About → Services → Stats → How It Works → CTA → Bottom CTA), except **Gallery** which groups images by service. Pricing/Membership excluded — DBC does custom builds, not fixed rates or tiers. Each page carries a WhatsApp-connected lead form with service-specific fields.

Service pages add service-specific content per section — **Hero** (subtitle, CTA, image, lead form fields), **About**, **Services**, **Stats**, **How It Works**, **CTA**, **Bottom CTA** — all vary per service page.

| Page | Purpose |
|---|---|
| **Home** `/` | Overview |
| **Services** `/services` | Service listing |
| **Supercar Transport** `/services/supercar-transport` | Detail page |
| **Car & Motorcycle Auction & Sale** `/services/auction` | Detail page |
| **Import & Export of Cars** `/services/import-export` | Detail page |
| **Customizing & Design Projects** `/services/customizing` | Detail page |
| **Gallery** `/gallery` | Build photos grouped by service (+ lightbox) |
| **Admin** `/admin` | Edit all content (GitHub login) |

### How to edit

Admin at `/admin` (GitHub login):

- **Hero** — brand, tagline, subtitle, CTA button text, form fields per service page
- **Services** — service cards (title + description, optional image) + per-service detail pages with custom Hero + form fields
- **How It Works** — step titles + descriptions
- **Gallery** — add/remove/reorder photos, group by service
- **Page Content** → **UI Labels** — all button text, nav links, form labels, headings
- **Page Content** → **SEO / Meta** — page title, meta description, social image
- **Page Content** → **About, Stats, CTA, Bottom CTA** — section text/numbers

### Things to decide

- **Contact form** — no phone/WhatsApp number set. Form shows error. Provide a real number. ⛔
- **Hero image** — home has no background image (text only). Provide one or confirm text-only.

---

## Section 2 — Dev Notes

### Current state

- **Pages (live):** `/` (`index.astro`), `/gallery` (`gallery.astro`), `/admin` (`admin.astro`), `/404` (`404.astro`)
- **Content collections (live):** `hero`, `how-it-works`, `services`, `gallery`, `page-content`
- **Sections in use (7):** `Hero`, `AboutSection`, `Services`, `StatsSection`, `HowItWorks`, `CtaBanner`, `BottomCta`
- **Sections available:** `Marquee`, `Fleet`, `Pricing`, `Membership` (not needed for this plan)
- **Asset pipeline:** Astro 7 static build. Tailwind v4 via `@tailwindcss/vite`. No adapter.
- **Deploy:** Netlify, push to `main` → auto-build. Build command: `npm run build --workspace=@garage/dbc`. Output: `sites/dbc/dist-dbc`.

### Data flow

`index.astro` fetches all collections in frontmatter, resolves `{placeholder}` templates, passes props to 7 section components. Same pattern for all service pages — only collection differs.

### File map

```
sites/dbc/
├── astro.config.mjs          → fonts (Montserrat x3), PWA, sitemap
├── netlify.toml              → build, redirects, security headers (CSP source of truth)
├── src/
│   ├── pages/
│   │   ├── index.astro       → home (7 sections + gallery link)
│   │   ├── gallery.astro     → image grid + lightbox, grouped by service
│   │   ├── admin.astro       → CMS shell
│   │   ├── 404.astro         → branded 404
│   │   └── services/           (NEW — one .astro per service)
│   │       ├── supercar-transport.astro
│   │       ├── auction.astro
│   │       ├── import-export.astro
│   │       └── customizing.astro
│   ├── layouts/
│   │   └── SiteLayout.astro  → Nav + Footer wrapper
│   ├── content/
│   │   ├── hero/hero.md      → brand, tagline, subtitle, CTA
│   │   ├── how-it-works/garage-steps.md → 3 steps
│   │   ├── services/services.md → 5 offerings (master list)
│   │   ├── gallery/gallery-01..12.md → build photos
│   │   └── page-content/content.md → SEO, JSON-LD, stats, CTA, about, labels
│   ├── config/site.ts        → site identity (name, url, themeColor, whatsappNumber)
│   ├── content.config.ts     → Zod schemas for all collections
│   └── components/
│       └── PageNotFound.astro → 404 component
├── public/
│   ├── admin/config.yml       → CMS config (collections + field wiring)
│   ├── _headers               → security headers
│   ├── robots.txt
│   └── images/                → og-dbc.webp, favicon, apple-touch-icon.png
```

### Section components

All in `@garage/shared/sections/`. Props table:

| Component | Props | Data source |
|---|---|---|
| `Hero.astro` | subtitle, cta_text, tagline, hero_image, fleetHref, phoneSpain, phoneItaly, services, form_fields, pageContent | `hero` + `pageContent` + `site.ts` + per-service frontmatter |
| `Marquee.astro` | pageContent | `labels.marquee_text` |
| `AboutSection.astro` | pageContent | `pageContent.about` + per-service frontmatter override (Option 3) |
| `Services.astro` | pageContent, marbella, milano | `services` collection |
| `StatsSection.astro` | pageContent | `pageContent.stats` |
| `HowItWorks.astro` | steps, pageContent | `how-it-works` collection |
| `CtaBanner.astro` | pageContent, ctaHref | `pageContent.cta` |
| `BottomCta.astro` | pageContent, fleetHref | `pageContent.bottomcta` |

### New pages — dev effort

| Page | Files | Effort |
|---|---|---|
| `/services` | `services.astro` | S — route mirrors index |
| 4 service pages | 4 `.astro` files + schema additions | M — each needs service-specific Hero/About overrides |
| Gallery grouped | `gallery.astro` (edit) + schema field | S/M — add `service_group` field to gallery items |

### Service-specific content challenge

Current `page-content/content.md` has a **single** entry — DBC destructures `[pageContentEntry]` (only one file allowed). This means service-specific Hero/About content can't override the generic page-content without changes:

**Recommended approach:** Option 3 — extend `services` collection `offerings` schema with optional frontmatter fields per service. Each service page fetches its offering by slug, passes override props to Hero/AboutSection. No new collection needed. Schema change: 4 optional fields (`hero_subtitle`, `hero_cta`, `hero_image`, `about_text`) + optional `form_fields` array for service-specific form field labels (5 fields).

### Schema change needed

`services` collection schema in `content.config.ts` needs optional per-service fields:

```ts
offerings: z.array(
  z.object({
    region: z.string(),
    title: z.string(),
    description: z.string(),
    image: image().optional(),
    // NEW — service-specific overrides for detail pages
    hero_subtitle: z.string().optional(),
    hero_cta: z.string().optional(),
    hero_image: image().optional(),
    about_text: z.string().optional(),
    // NEW — service-specific form field labels
    form_fields: z.array(
      z.object({
        label: z.string(),
        placeholder: z.string().optional(),
        name: z.string(),
      }),
    ).optional(),
  }),
),
```

CMS `config.yml` services fields get new optional inputs per field above. Service pages fetch offering by slug, pass overrides into Hero/AboutSection + form field labels.

**Form fields:** Hero component renders a garage-form (name, phone, service-select, date, message textarea). DBC's `services` collection drives the service-select dropdown via the `services` prop. Per-service form field overrides let each service page customize field labels (e.g. transport = "Origin/Destination", auction = "Vehicle Details"). Schema adds `form_fields` array with `{label, placeholder, name}` per field.

### Config layers

1. **`site.ts`** — identity (name, url, themeColor, whatsappNumber) — single source
2. **`config/labels.js`** — merges `labels.*` from CMS over `strings.js` defaults
3. **`config/strings.js`** — default UI text (nav, buttons, headings, form labels)

### Audit status (DBC-relevant only)

| ID | Issue | Status |
|---|---|---|
| B2 | Contact form dead (no phone) | ⛔ Open — needs real WhatsApp number |
| H5 | Hero no background image | ⛔ Open — provide image or confirm text-only |
| H1 | JSON-LD `telephone:["",""]` if phones empty | Fixed — BaseLayout filters empties |
| H4 | DBC og:image | Fixed — `/images/og-dbc.webp` |
| H10 | `map_embed_url` unvalidated | Fixed — regex in content.schema |
| H2 | SW precaches 8MB gallery | Fixed — webp dropped from precache glob |
| M6 | Admin indexable | Fixed — noindex + robots disallow |
| M9 | npm audit vulns | Fixed — sharp override added |
| B1 | CMS config.yml relative paths | Fixed — absolute paths |
| H3 | og:image broken | Fixed — og-dbc.webp live |
| M3 | HowItWorks empty h2 | Fixed — heading added to content.md |
| M5 | No DBC 404 | Fixed — 404.astro created |

### Remaining (needs client decision)

- B2: Provide WhatsApp/phone number for `site.ts` + `content.md` jsonld
- H5: Provide hero background image, or confirm text-only intentional
- H11: DBC CMS writes to same repo (`markom01/viper-security` main) — accept or split
- M10: All services use `region: Garage` — add per-service grouping labels in CMS
