# CMS Restructure: Per-Page Content Collections (VIPER + DBC)

**Date:** 2026-08-27
**Status:** Approved design (pending implementation plan)
**Scope:** Reorganize the Astro CMS data model so each *page* owns one content
collection, one entry, with all sections nested. Applies to both sites in the
monorepo (`sites/viper`, `sites/dbc`).

---

## 1. Context & Motivation

Today the CMS is **section-based**, not page-based. Each homepage fans out to
7+ collections (`hero`, `how-it-works`, `services`, `fleet`, `pricing`,
`membership`, `page-content`, `privacy` for VIPER; + `gallery` for DBC) and hand-
threads each slice into shared `@garage/shared` sections via individual props
plus a `pageContent` "bag".

Pain points this fixes:
- **Duplicated schemas.** `services` schema (62 lines) is copy-pasted between
  `sites/viper/src/content.config.ts` and `sites/dbc/src/content.config.ts` with
  subtle `preprocess`/`nullable` drift.
- **Duplicated templating.** `resolveTemplates` (location-merge logic) is copied
  verbatim (~10 fields) across both `index.astro` files — a live bug risk the two
  homepages can drift.
- **Mixed concepts in `page-content`.** It actually holds *site-global* data
  (`jsonld`, `booking_data`, `vehicle_name`, `labels`, `how-it-works` steps,
  `branding`) consumed by `BaseLayout` AND every service-detail page, plus
  *page-specific* copy (`seo`, `stats`, `cta`, `bottomcta`, `about`).

Approved decisions (from brainstorming):
1. **Granularity:** one entry, all sections nested.
2. **Data flow:** shared `assembleHome` / `assembleService` helper in
   `@garage/shared`; shared sections keep their current prop interfaces.
3. **Entry format:** YAML via the `glob()` loader (id = filename slug, matching
   current code). `.md` retained only for `privacy` (long-form body via `render()`).
4. **Item lists:** `fleet` (vehicles) + `gallery` (images) stay standalone
   collections (items, not page copy).

### Research basis (Astro 5.18.2)
- `defineCollection` with `schema: z.object({...})` fully supports nested
  sub-objects and `z.array(z.object(...))` — the per-page nested model is idiomatic.
- **`glob()` loader** default id = filename slug (`data.slug ?? slugified path`).
  Verified in `node_modules/astro/dist/content/loaders/glob.js`. This is what the
  current singleton collections already use (`pricing/hourly.md` → `getEntry("pricing","hourly")`).
- **`file()` loader gotcha (verified in `node_modules/astro/dist/content/loaders/file.js`):**
  for a single nested object, `file()` iterates `Object.entries(data)` and creates
  **one entry per top-level key** — so `home.yaml: {hero, services}` would become two
  entries, not one `home` entry. For that reason singleton page collections use
  `glob()`, NOT `file()`. `file()` is reserved for genuinely array-shaped data
  (none in current scope).
- `SchemaContext` (`schema: ({ image }) => z.object({...})`) enables reusable schema
  fragments — used to DRY the cross-site schemas into `@garage/shared`.

---

## 2. Target Collection Map

### VIPER — `sites/viper/src/content.config.ts`
```
collections = {
  home,        // src/content/home/content.yaml    — hero + services[summary] ONLY (home-only fields)
  service,     // src/content/services/*.yaml      — ONE file per [slug] detail page (rich fields)
  fleet,       // src/content/fleet/*.yaml         — list, shared by home + service pages
  pricing,     // src/content/pricing/hourly.yaml  — singleton
  membership,  // src/content/membership/tiers.yaml — singleton
  privacy,     // src/content/privacy/content.md    — long-form body via render()
  site,        // src/content/site/content.yaml     — jsonld, booking_data, vehicle_name, labels, branding,
              //   howItWorksSteps, howItWorksHeading, fleetHeading, AND page copy stats/cta/bottomcta/about/seo/map_embed_url
              //   (consumed by home AND service-detail pages via shared sections/BaseLayout)
}
```

### DBC — `sites/dbc/src/content.config.ts`
```
collections = {
  home,        // src/content/home/content.yaml
  service,     // src/content/services/*.yaml
  gallery,     // src/content/gallery/*.yaml        — list (DBC only)
  privacy,     // src/content/privacy/content.md
  site,        // src/content/site/site.yaml
}
```
**Key difference:** DBC keeps no standalone `fleet` collection. Its per-service
vehicles (import/export "currently selling", hauler transport) live inside each
`service.<slug>.yaml` as `fleet[]`. VIPER keeps `fleet` standalone because both
home and service pages show the full fleet. `pricing`/`membership` are VIPER-only
(home shows Pricing + Membership sections; DBC does not).

### What dissolves
- `page-content` collection is **deleted**. Its fields split:
  - *site-global* → `site` collection: `jsonld`, `booking_data`, `vehicle_name`,
    `labels`, `how-it-works` steps (→ `site.howItWorksSteps`), `branding`.
  - *page-specific* → `home` collection: `seo`, `stats`, `cta`, `bottomcta`,
    `about`, `map_embed_url`.
- `hero`, `how-it-works`, `services`, `membership` (viper), `pricing` (viper)
  top-level collections are **deleted**; their data is nested into the owning
  page collection. (The shared `ServicePage`/`BaseLayout` consume `stats/cta/
  bottomcta/about/seo/fleetHeading/howItWorksHeading` as the BASE for service
  pages, so those fields are site-global — they live in `site`, not `home`. Only
  `home.hero` + `home.services.offerings` are home-only.)

---

## 3. Data Flow (shared assembler — sections unchanged)

New file: `packages/shared/src/lib/assemble.ts`

```ts
// Composes a page's section props from the nested page entry + site globals,
// centralizing resolveTemplates so viper/dbc cannot drift.
export function assembleHome(args: {
  home: HomeData;
  siteGlobals: SiteGlobals;
  siteName: string;
}): HomeAssembled;

export function assembleService(args: {
  offering: ServiceDetailData;
  siteGlobals: SiteGlobals;
  siteName: string;
  // VIPER-only extras when present:
  fleetVehicles?: FleetEntry[];
  fleetFeaturesText?: string;
  hourly?: PricingData;
  membershipTiers?: MembershipTier[];
}): ServiceAssembled;
```

Page template shrinks to ~15 lines:
```ts
// viper/src/pages/index.astro
const home = (await getEntry('home','content'))!.data;
const siteGlobals = (await getEntry('site','content'))!.data;
const a = assembleHome({ home, siteGlobals, siteName: SITE_NAME });
// ...pass a.hero.subtitle etc. into existing <Hero/>, a.fleet into <Fleet/>, etc.
```

- `resolveTemplates` moves **into** the assembler (single source of truth).
- **Shared section components are NOT rewritten** — they keep current prop
  interfaces (`<Hero subtitle=... />`, `<Fleet vehicles=... />`, etc.).
- `BaseLayout` keeps receiving a `PageContent` object; the assembler composes
  `pageContent` from `home` page-specific fields + `siteGlobals` (jsonld,
  booking_data, vehicle_name, labels).

### Service-detail pages
`[slug].astro` `getStaticPaths` changes: iterate `getCollection('service')`
entries (one per slug) instead of `services.md` `offerings[]`. Each `service.<slug>.yaml`
contains the rich detail fields (`hero`, `steps`, `include`, `about`, `stats`,
`cta`, `form_fields`, `bottomcta`, plus VIPER `seo`). The home `services` summary
cards come from `home.services.offerings` (title/region/description/image only).

---

## 4. Schema Strategy (DRY across sites)

New file: `packages/shared/src/content/schemas.ts` — one fragment per section,
authored once:

```ts
import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

export const heroSchema = ({ image }: SchemaContext) =>
  z.object({ brand_name: z.string().optional(), tagline: z.string().optional(),
    subtitle: z.string().optional(), cta_text: z.string().optional(),
    hero_image: z.string().optional(), phone_italy: z.string().optional(),
    phone_spain: z.string().optional() });

export const offeringSummarySchema = z.object({
  region: z.string(), title: z.string(), description: z.string(),
  image: z.string().optional(), slug: z.string().optional() });

export const serviceDetailSchema = z.object({
  title: z.string(), slug: z.string().optional(), marquee: z.string().optional(),
  about_text: z.string().optional(), about_image: z.string().optional(),
  hero: z.object({ subtitle: z.string().optional(), cta_text: z.string().optional(),
    tagline: z.string().optional(), image: z.string().optional() }).optional(),
  steps: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
  include: z.array(z.object({ title: z.string(), text: z.string(),
    image: z.string().optional() })).optional(),
  stats: z.object({ subheading: z.string().optional(),
    items: z.array(z.object({ label: z.string(), title: z.string() })).optional() }).optional(),
  cta: z.object({ heading: z.string().optional(), text: z.string().optional() }).optional(),
  form_fields: z.array(z.object({ label: z.string(), placeholder: z.string().optional(),
    name: z.string(), type: z.enum(["text","location","country","vehicle"]).optional(),
    side: z.enum(["left","right"]).optional() })).optional(),
  bottomcta: z.object({ heading: z.string().optional(),
    values: z.array(z.object({ title: z.string(), text: z.string() })).optional() }).optional(),
  // DBC per-service sale fleet (import/export, haulers)
  fleet: z.array(/* vehicle schema */).optional(),
});

export const statsSchema = z.object({...});
export const ctaSchema = z.object({...});
export const bottomCtaSchema = z.object({...});
export const aboutSchema = z.object({...});
export const siteGlobalsSchema = ({ image }) => z.object({
  jsonld: z.object({...}).optional(), booking_data: z.object({...}).optional(),
  vehicle_name: z.string().optional(), labels: z.record(z.string(), z.string()).optional(),
  howItWorksSteps: z.array(...).optional(), branding: z.object({...}).optional() });
```

Each site composes:
```ts
const home = defineCollection({
  loader: glob({ pattern: "home.yaml", base: "./src/content/home" }),
  schema: ({ image }) => z.object({
    hero: heroSchema({ image }),
    services: z.object({ offerings: z.array(offeringSummarySchema) }),
    stats: statsSchema.optional(), cta: ctaSchema.optional(),
    bottomcta: bottomCtaSchema.optional(), about: aboutSchema.optional(),
    seo: z.object({...}).optional(), map_embed_url: z.string().regex(...).optional(),
  }),
});
```

The DBC `serviceDetailSchema.fleet[]` keeps the `preprocess("" → undefined)` casting
the DBC config uses today (number fields from CMS). VIPER's `fleet` collection keeps
its own standalone vehicle schema.

---

## 5. File Migration (mechanical, per site)

### VIPER
1. `hero/hero.md` → merge into `src/content/home/home.yaml` under `hero:`.
2. `how-it-works/steps.md` → `site/content.yaml` under `howItWorksSteps:`.
3. `services/services.md` →
   - summary cards → `home/content.yaml` `services.offerings`.
   - rich per-offering detail → `src/content/services/<slug>.yaml` per offering.
4. `page-content/content.md` →
   - `jsonld/booking_data/vehicle_name/labels` → `site/content.yaml`.
   - `seo/stats/cta/bottomcta/about/map_embed_url` → `home/content.yaml`.
5. `pricing/hourly.md` → `pricing/hourly.yaml`.
6. `membership/tiers.md` → `membership/tiers.yaml`.
7. `fleet/mercedes-s-class.md` → `fleet/mercedes-s-class.yaml`.
8. `privacy/content.md` → stays `.md` (body rendered via `render()`).

### DBC
1. `hero/hero.md` → `home/home.yaml` `hero:`.
2. `how-it-works/garage-steps.md` → `site/content.yaml` `howItWorksSteps:`.
3. `services/services.md` → summary cards to `home/content.yaml`; per-offering detail
   (including `fleet[]`) to `src/content/services/<slug>.yaml`.
4. `page-content/content.md` → split into `site/content.yaml` + `home/content.yaml`.
5. `gallery/*.md` → `gallery/*.yaml` (54 files; data fields only).
6. `privacy/content.md` → stays `.md`.

### Template rewrites
- `sites/*/src/pages/index.astro` → `getEntry('home','content')` + `getEntry('site','content')` + `assembleHome`.
- `sites/*/src/pages/services/[slug].astro` → `getStaticPaths` over `service` collection; `assembleService`.
- `sites/*/src/pages/privacy-policy.astro` → `getEntry('privacy','content')` + `render()`; `pageContent` composed from `site` globals.
- `sites/dbc/src/pages/gallery.astro` → `getCollection('gallery')`.

### Documentation updates
- `CLAUDE.md` gotcha: pricing collection key is `pricing`, entry id `hourly`
  (`getEntry('pricing','hourly')`) — still true, keep. Remove the
  `getCollection('page-content')` destructured-as-`[pageContentEntry]` note (gone).
- `AGENTS.md` / README: update content-collection description.

---

## 6. Verification

Per site, in order:
1. `astro check` → 0 TypeScript errors (matches CLAUDE.md pre-handoff rule; the
   Astro TS plugin is installed, so CLI matches the editor).
2. `npm run build` → confirms Zod schemas validate all migrated YAML and entry ids
   resolve (`home`/`content`, `service`/`<slug>`, `site`/`content`).
3. Visual smoke: load `/`, `/services/<slug>`, `/privacy-policy`, (DBC `/gallery`);
   confirm sections render identically to pre-change (assembler preserves data).
4. Confirm `resolveTemplates` output matches prior behavior (location merge in
   subtitles/CTAs unchanged).

### Risk & mitigation
- **YAML indentation errors across 60+ files** → `astro check` + `build` catch
  malformed nesting via Zod; migrate field-by-field and build early.
- **Two homepages drifting** → `assembleHome` is shared; site differences are data
  (DBC omits Pricing/Membership, pulls gallery carousel), not logic.
- **`file()` misuse** → explicitly use `glob()` for singletons (see §1 research).

### Rollback
- Work on a git branch. Netlify CMS authors edit YAML fields (same key names);
  no author-facing schema change beyond nesting.

---

## 7. Out of Scope
- Rewriting shared section internals to consume a page object directly (rejected:
  high risk, couples shared pkg to content schema).
- Migrating `fleet`/`gallery` into page entries (rejected: they are item lists).
- Any visual/design changes to sections.
