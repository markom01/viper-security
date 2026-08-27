# CMS Per-Page Collections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize both sites' Astro CMS so each page owns one collection + one entry with sections nested, with a shared `@garage/shared` schema module + assembler, eliminating duplicated schemas and duplicated `resolveTemplates` logic.

**Architecture:** Each page (home, service-detail, privacy) becomes a collection whose single YAML entry nests its sections as sub-objects/arrays. Site-global fields (jsonld, booking_data, vehicle_name, labels, how-it-works steps, branding) move to a `site` collection consumed by `BaseLayout`/site layouts. A new `assembleHome`/`assembleService` helper in `@garage/shared` maps the nested entry to the existing section prop interfaces and centralizes `resolveTemplates`, so shared sections are NOT rewritten. `fleet` (viper) and `gallery` (dbc) stay standalone item-list collections.

**Tech Stack:** Astro 5.18.2 content collections (`defineCollection` + `glob` loader + `astro/zod`), YAML data files, `@garage/shared` workspace package.

**Spec:** `docs/superpowers/specs/2026-08-27-cms-per-page-collections-design.md`

## Global Constraints

- Astro 5.18.2. Use the **`glob()` loader** for all singleton page collections (id = filename slug); `file()` loader is NOT used because a single nested object under `file()` creates one entry per top-level key (verified in `node_modules/astro/dist/content/loaders/file.js`).
- Singleton page entries are named `content.yaml` (so `getEntry('home','content')`, `getEntry('site','content')`, `getEntry('privacy','content')`).
- `privacy` stays `.md` (long-form body rendered via `render()`).
- `fleet` (viper) + `gallery` (dbc) stay standalone list collections (items, not page copy).
- DBC keeps NO standalone `fleet` collection — per-service vehicles live inside `service.<slug>.yaml` as `fleet[]`.
- `resolveTemplates` (signature `resolveTemplates(str, bd, siteName?, vehicleName?)` from `@garage/shared/config/templates`) moves INTO the assembler; page templates must not call it directly anymore.
- Shared section components (`@garage/shared/sections/*`) keep their current prop interfaces — do NOT rewrite them.
- `PageContent` type (`packages/shared/src/types.ts`) is unchanged in shape and keeps being the type passed to `BaseLayout`/`SiteLayout`.
- `astro check` must report 0 errors per site (matches CLAUDE.md pre-handoff rule). The Astro TS plugin is installed, so CLI matches the editor.

---

## File Structure

New files:
- `packages/shared/src/content/schemas.ts` — reusable Zod schema fragments (one per section) + shared `siteGlobalsSchema`.
- `packages/shared/src/content/types.ts` — TS helper types for the nested home/service/site entry shapes (mirrors schemas).
- `packages/shared/src/lib/assemble.ts` — `assembleHome`, `assembleService`.

Modified files:
- `sites/viper/src/content.config.ts`, `sites/dbc/src/content.config.ts` — new collections using shared fragments.
- `sites/viper/src/content/**` — data files restructured (see tasks).
- `sites/dbc/src/content/**` — data files restructured.
- `sites/viper/src/pages/index.astro`, `services/[slug].astro`, `privacy-policy.astro`.
- `sites/dbc/src/pages/index.astro`, `services/[slug].astro`, `privacy-policy.astro`, `gallery.astro`.
- `CLAUDE.md`, `sites/dbc/src/components/AGENTS.md` (if present) — update gotcha notes.

---

### Task 1: Shared schema fragments module

**Files:**
- Create: `packages/shared/src/content/schemas.ts`
- Create: `packages/shared/src/content/types.ts`

**Interfaces:**
- Consumes: `z` from `astro/zod`; `SchemaContext` from `astro:content`.
- Produces: exported `heroSchema`, `offeringSummarySchema`, `serviceDetailSchema`, `statsSchema`, `ctaSchema`, `bottomCtaSchema`, `aboutSchema`, `siteGlobalsSchema`, `fleetVehicleSchema`, `galleryItemSchema`, `pricingSchema`, `membershipSchema`, `homeSchema(ctx)`, `serviceSchema(ctx)`, `privacySchema()`. Also TS types `HomeData`, `ServiceDetailData`, `SiteGlobalsData`.

- [ ] **Step 1: Write the schema module**

```ts
// packages/shared/src/content/schemas.ts
import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

const imagePath = z.string().optional();

export const heroSchema = ({ image: _image }: SchemaContext) =>
  z.object({
    brand_name: z.string().optional(),
    tagline: z.string().optional(),
    subtitle: z.string().optional(),
    cta_text: z.string().optional(),
    hero_image: z.string().optional(),
    phone_italy: z.string().optional(),
    phone_spain: z.string().optional(),
  });

export const offeringSummarySchema = z.object({
  region: z.string(),
  title: z.string(),
  description: z.string(),
  image: imagePath,
  slug: z.string().optional(),
});

export const serviceDetailSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  marquee: z.string().optional(),
  about_text: z.string().optional(),
  about_image: z.string().optional(),
  hero: z.object({
    subtitle: z.string().optional(),
    cta_text: z.string().optional(),
    tagline: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
  steps: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
  include: z.array(z.object({
    title: z.string(), text: z.string(), image: z.string().optional(),
  })).optional(),
  stats: z.object({
    subheading: z.string().optional(),
    items: z.array(z.object({ label: z.string(), title: z.string() })).optional(),
  }).optional(),
  cta: z.object({ heading: z.string().optional(), text: z.string().optional() }).optional(),
  form_fields: z.array(z.object({
    label: z.string(), placeholder: z.string().optional(), name: z.string(),
    type: z.enum(["text", "location", "country", "vehicle"]).optional(),
    side: z.enum(["left", "right"]).optional(),
  })).optional(),
  bottomcta: z.object({
    heading: z.string().optional(),
    values: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
  }).optional(),
  // DBC per-service sale fleet (import/export, haulers) — mirrors FleetVehicleData
  fleet: z.array(z.object({
    name: z.string(), type: z.string().optional(), year: z.string().optional(),
    seats: z.string().optional(), baggage: z.string().optional(),
    capacity_passengers: z.number().optional(), capacity_suitcases: z.number().optional(),
    capacity_carryon: z.number().optional(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    features: z.array(z.string()).optional(), image: z.string().optional(),
  })).optional(),
});

export const statsSchema = z.object({
  subheading: z.string().optional(),
  image: z.string(),
  items: z.array(z.object({ label: z.string(), title: z.string() })).optional(),
}).optional();

export const ctaSchema = z.object({
  heading: z.string().optional(), text: z.string().optional(), image: z.string().optional(),
}).optional();

export const bottomCtaSchema = z.object({
  heading: z.string().optional(),
  values: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
}).optional();

export const aboutSchema = z.object({
  heading: z.string().optional(), text: z.string().optional(),
  image: z.string().optional(), images: z.array(z.string()).optional(),
}).optional();

export const siteGlobalsSchema = z.object({
  jsonld: z.object({
    org_name: z.string().optional(), org_url: z.string().optional(),
    org_logo: z.string().optional(), org_description: z.string().optional(),
    phoneSpain: z.string().optional(), phoneItaly: z.string().optional(),
    webSiteName: z.string().optional(), webSiteUrl: z.string().optional(),
    privacy_policy: z.string().optional(),
  }).optional(),
  booking_data: z.object({
    spain: z.object({
      label: z.string().optional(), short_label: z.string().optional(), region: z.string().optional(),
      services: z.array(z.object({
        name: z.string(), routes: z.array(z.object({ route: z.string(), price: z.string().optional() })),
      })),
    }),
    italy: z.object({
      label: z.string().optional(), short_label: z.string().optional(), region: z.string().optional(),
      services: z.array(z.object({
        name: z.string(), routes: z.array(z.object({ route: z.string(), price: z.string().optional() })),
      })),
    }),
  }).optional(),
  vehicle_name: z.string().optional(),
  labels: z.record(z.string(), z.string()).optional(),
  howItWorksSteps: z.array(z.object({
    title: z.string(), description: z.string(), image: z.string().optional(),
  })).optional(),
  branding: z.object({
    luxury_without_limits: z.string().optional(),
    professional_discreet_reliable: z.string().optional(),
  }).optional(),
  // --- Site-global page copy (consumed by BOTH home + service-detail pages) ---
  // These were in `page-content` originally; service pages read them as the BASE
  // for the shared sections (ServicePage spreads per-offering overrides on top),
  // so they must be site-global, not home-only.
  stats: statsSchema,
  cta: ctaSchema,
  bottomcta: bottomCtaSchema,
  about: aboutSchema,
  seo: z.object({
    title: z.string().optional(), description: z.string().optional(),
    theme_color: z.string().optional(), image: z.string().optional(),
  }).optional(),
  map_embed_url: z.string().regex(/^https:\/\/(www\.)?google\.[a-z]{2,}(\/\S*)?$/i).optional(),
  // Headings the shared Fleet / HowItWorks sections read from pageContent.
  fleetHeading: z.string().optional(),
  howItWorksHeading: z.string().optional(),
});

export const fleetVehicleSchema = z.object({
  name: z.string(), type: z.string().optional(), year: z.string().optional(),
  seats: z.string().optional(), baggage: z.string().optional(),
  capacity_passengers: z.number().optional(), capacity_suitcases: z.number().optional(),
  capacity_carryon: z.number().optional(),
  specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  features: z.array(z.string()).optional(), image: z.string().optional(),
});

export const galleryItemSchema = z.object({
  name: z.string(), alt: z.string().optional(),
  category: z.enum(["brand", "supercar", "customizing", "auction", "import-export", "all-builds"]).default("all-builds"),
  image: z.string(),
});

export const pricingSchema = z.object({
  type: z.string().optional(),
  rates: z.array(z.object({ name: z.string(), price: z.string() })).optional(),
  routes: z.array(z.object({ route: z.string(), price: z.string() })).optional(),
});

export const membershipSchema = z.object({
  tiers: z.array(z.object({
    name: z.string(), price: z.string(), hours: z.number().optional(),
    is_featured: z.boolean().optional(), benefits: z.array(z.string()),
  })),
});

/** Compose the VIPER/DBC home entry schema.
 * ONLY home-only fields live here: `hero` + `services.offerings` (home cards).
 * `stats/cta/bottomcta/about/seo/fleetHeading/howItWorksHeading` are consumed by
 * service-detail pages via the shared ServicePage/BaseLayout (they read
 * pageContent.* as the BASE, spreading per-offering overrides on top), so those
 * belong in `site` (see siteGlobalsSchema), not here. */
export const homeSchema = ({ image: _image }: SchemaContext) =>
  z.object({
    hero: heroSchema({ image: _image }),
    services: z.object({ offerings: z.array(offeringSummarySchema) }),
  });

/** Compose the per-service detail entry schema (one file per slug). */
export const serviceSchema = ({ image: _image }: SchemaContext) => serviceDetailSchema;

export const privacySchema = z.object({ heading: z.string().optional() });
```

- [ ] **Step 2: Write the TS helper types**

```ts
// packages/shared/src/content/types.ts
import type { ImageMetadata } from "astro";

export interface HomeData {
  hero: {
    brand_name?: string; tagline?: string; subtitle?: string;
    cta_text?: string; hero_image?: string; phone_italy?: string; phone_spain?: string;
  };
  services: { offerings: {
    region: string; title: string; description: string;
    image?: string; slug?: string;
  }[] };
}

export interface ServiceDetailData {
  title: string; slug?: string; description?: string; marquee?: string;
  about_text?: string; about_image?: string;
  hero?: { subtitle?: string; cta_text?: string; tagline?: string; image?: string };
  steps?: { title: string; description: string }[];
  include?: { title: string; text: string; image?: string }[];
  stats?: { subheading?: string; items?: { label: string; title: string }[] };
  cta?: { heading?: string; text?: string };
  form_fields?: { label: string; placeholder?: string; name: string;
    type?: "text" | "location" | "country" | "vehicle"; side?: "left" | "right" }[];
  bottomcta?: { heading?: string; values?: { title: string; text: string }[] };
  fleet?: {
    name: string; type?: string; year?: string; seats?: string; baggage?: string;
    capacity_passengers?: number; capacity_suitcases?: number; capacity_carryon?: number;
    specs?: { label: string; value: string }[]; features?: string[]; image?: string;
  }[];
}

export interface SiteGlobalsData {
  jsonld?: {
    org_name?: string; org_url?: string; org_logo?: string; org_description?: string;
    phoneSpain?: string; phoneItaly?: string; webSiteName?: string; webSiteUrl?: string;
    privacy_policy?: string;
  };
  booking_data?: {
    spain?: { label?: string; short_label?: string; region?: string;
      services?: { name: string; routes: { route: string; price?: string }[] }[] };
    italy?: { label?: string; short_label?: string; region?: string;
      services?: { name: string; routes: { route: string; price?: string }[] }[] };
  };
  vehicle_name?: string;
  labels?: Record<string, string>;
  howItWorksSteps?: { title: string; description: string; image?: string }[];
  branding?: { luxury_without_limits?: string; professional_discreet_reliable?: string };
  // Site-global page copy (home + service pages)
  stats?: { subheading?: string; image: string; items?: { label: string; title: string }[] };
  cta?: { heading?: string; text?: string; image?: string };
  bottomcta?: { heading?: string; values?: { title: string; text: string }[] };
  about?: { heading?: string; text?: string; image?: string; images?: string[] };
  seo?: { title?: string; description?: string; theme_color?: string; image?: string };
  map_embed_url?: string;
  fleetHeading?: string;
  howItWorksHeading?: string;
}
```

- [ ] **Step 3: Typecheck the shared package**

Run: `cd packages/shared && npx tsc --noEmit` (if a tsconfig exists) or `npx astro check` from a site that imports it after Task 2 wires it.
Expected: no type errors in the new files.

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/content/schemas.ts packages/shared/src/content/types.ts
git commit -m "feat(shared): add reusable content schema fragments + nested entry types"
```

---

### Task 2: Shared assembler helper

**Files:**
- Create: `packages/shared/src/lib/assemble.ts`

**Interfaces:**
- Consumes: `HomeData`, `ServiceDetailData`, `SiteGlobalsData` (Task 1); `resolveTemplates` from `../config/templates`; `PageContent`, `FleetEntry`, `MembershipTier`, `PricingRate` from `../types`.
- Produces: `assembleHome(args): { hero, services, stats, cta, bottomcta, about, pageContent, fleetFeaturesText?, fleetVehicles? }` and `assembleService(args): { offering, pageContent, hero, fleetVehicles, fleetFeaturesText, hasFleet, howItWorksSteps, ... }`. Page templates (Tasks 6–9) import these exact names.

- [ ] **Step 1: Write the assembler**

```ts
// packages/shared/src/lib/assemble.ts
import { resolveTemplates } from "../config/templates";
import type { PageContent, FleetEntry, MembershipTier } from "../types";
import type { HomeData, ServiceDetailData, SiteGlobalsData } from "../content/types";

export interface AssembleHomeArgs {
  home: HomeData;
  siteGlobals: SiteGlobalsData;
  siteName: string;
  /** VIPER only: fleet collection entries for the home Fleet section. */
  fleetEntries?: FleetEntry[];
  /** DBC only: gallery images for the home carousel (5 urls). */
  homeCarousel?: string[];
}

export interface AssembleHomeResult {
  hero: HomeData["hero"];
  services: { offerings: HomeData["services"]["offerings"] };
  stats?: HomeData["stats"];
  cta?: HomeData["cta"];
  bottomcta?: HomeData["bottomcta"];
  about?: HomeData["about"];
  pageContent: PageContent;
  fleetFeaturesText?: string;
  fleetVehicles?: FleetEntry[];
}

function fleetFeaturesTextFrom(vehicles: { data?: { features?: string[] } }[]): string {
  const all = [...new Set(vehicles.flatMap((v) => v.data?.features || []))];
  if (!all.length) return "";
  return all.length === 1 ? all[0] + "." : all.slice(0, -1).join(", ") + ", and " + all.slice(-1)[0] + ".";
}

export function assembleHome(args: AssembleHomeArgs): AssembleHomeResult {
  const { home, siteGlobals, siteName, fleetEntries, homeCarousel } = args;
  const bd = siteGlobals.booking_data;
  const vehicleName = siteGlobals.vehicle_name;

  const hero: HomeData["hero"] = { ...home.hero };
  if (hero.subtitle) hero.subtitle = resolveTemplates(hero.subtitle, bd, siteName, vehicleName);

  const services = {
    offerings: (home.services?.offerings || []).map((o) => ({
      ...o,
      description: resolveTemplates(o.description, bd, siteName, vehicleName),
    })),
  };

  // Site-global page copy (stats/cta/bottomcta/about/seo) carries {placeholders}
  // and lives in siteGlobals (consumed by home AND service pages). Resolve here.
  const seo = siteGlobals.seo ? { ...siteGlobals.seo } : undefined;
  if (seo?.title) seo.title = resolveTemplates(seo.title, bd, siteName, vehicleName);
  if (seo?.description) seo.description = resolveTemplates(seo.description, bd, siteName, vehicleName);

  const about = siteGlobals.about ? { ...siteGlobals.about } : undefined;
  if (about?.text) about.text = resolveTemplates(about.text, bd, siteName, vehicleName);

  const cta = siteGlobals.cta ? { ...siteGlobals.cta } : undefined;
  if (cta?.text) cta.text = resolveTemplates(cta.text, bd, siteName, vehicleName);

  const bottomcta = siteGlobals.bottomcta ? { ...siteGlobals.bottomcta } : undefined;
  if (bottomcta?.values) bottomcta.values = bottomcta.values.map((v) => ({ ...v, text: resolveTemplates(v.text, bd, siteName, vehicleName) }));

  // Compose PageContent for BaseLayout from site globals (home adds nothing page-specific
  // beyond hero + services cards, which sections receive as direct props).
  const pageContent: PageContent = {
    jsonld: siteGlobals.jsonld,
    booking_data: siteGlobals.booking_data,
    vehicle_name: siteGlobals.vehicle_name,
    labels: siteGlobals.labels,
    branding: siteGlobals.branding,
    seo, about, cta, bottomcta,
    stats: siteGlobals.stats,
    fleet: siteGlobals.fleetHeading ? { heading: siteGlobals.fleetHeading } : undefined,
    howitworks: siteGlobals.howItWorksHeading ? { heading: siteGlobals.howItWorksHeading } : undefined,
    map_embed_url: siteGlobals.map_embed_url,
  };

  const fleetFeaturesText = fleetEntries ? fleetFeaturesTextFrom(fleetEntries) : undefined;

  return { hero, services, stats: siteGlobals.stats, cta, bottomcta, about, pageContent, fleetFeaturesText, fleetVehicles: fleetEntries };
}

export interface AssembleServiceArgs {
  offering: ServiceDetailData;
  siteGlobals: SiteGlobalsData;
  siteName: string;
  /** VIPER: full fleet collection entries. DBC: per-offering fleet mapped to FleetEntry[]. */
  fleetVehicles?: FleetEntry[];
  hasFleet?: boolean;
  howItWorksSteps?: { title: string; description: string; image?: string }[];
  hourly?: { rates?: { name: string; price: string }[] };
  membershipTiers?: MembershipTier[];
  /** DBC: 5 gallery images for the service's category. */
  aboutCarouselImages?: string[];
  /** DBC: service slug → category for fleet_section label override. */
  fleetSection?: { heading?: string; subheadline?: string };
}

export interface AssembleServiceResult {
  offering: ServiceDetailData;
  pageContent: PageContent;
  hero: { subtitle?: string; cta_text?: string; tagline?: string; image?: string; phoneItaly?: string; phoneSpain?: string; fleetHref?: string; presetService?: string };
  fleetVehicles?: FleetEntry[];
  fleetFeaturesText: string;
  hasFleet: boolean;
  howItWorksSteps?: { title: string; description: string; image?: string }[];
  hourly?: { rates?: { name: string; price: string }[] };
  membershipTiers?: MembershipTier[];
  aboutCarouselImages?: string[];
}

export function assembleService(args: AssembleServiceArgs): AssembleServiceResult {
  const { offering, siteGlobals, siteName, fleetVehicles, hasFleet, howItWorksSteps, hourly, membershipTiers, aboutCarouselImages, fleetSection } = args;
  const bd = siteGlobals.booking_data;
  const vehicleName = siteGlobals.vehicle_name;

  // Per-offering SEO/JSON-LD merges over site globals (clone, never mutate).
  const pageContent: PageContent = {
    jsonld: siteGlobals.jsonld, booking_data: siteGlobals.booking_data,
    vehicle_name: siteGlobals.vehicle_name, labels: siteGlobals.labels, branding: siteGlobals.branding,
  };
  if (offering.seo) pageContent.seo = { ...(siteGlobals as { seo?: PageContent["seo"] }).seo, ...offering.seo } as PageContent["seo"];
  if (siteGlobals.labels && (fleetSection?.heading || fleetSection?.subheadline)) {
    pageContent.labels = {
      ...siteGlobals.labels,
      ...(fleetSection.heading ? { fleet: { heading: fleetSection.heading } } : {}),
      ...(fleetSection.subheadline ? { "fleet.subheadline": fleetSection.subheadline } : {}),
    } as Record<string, string>;
  }

  const heroFields: NonNullable<typeof offering.hero> & Record<string, unknown> = { ...(offering.hero || {}) } as never;
  if (heroFields.subtitle) heroFields.subtitle = resolveTemplates(heroFields.subtitle, bd, siteName, vehicleName);

  const offeringResolved: ServiceDetailData = offering.description
    ? { ...offering, description: resolveTemplates(offering.description, bd, siteName, vehicleName) }
    : offering;

  const fleetFeaturesText = fleetVehicles ? fleetFeaturesTextFrom(fleetVehicles) : "";

  return {
    offering: offeringResolved,
    pageContent,
    hero: {
      subtitle: heroFields.subtitle as string | undefined,
      cta_text: heroFields.cta_text as string | undefined,
      tagline: offering.title || (heroFields.tagline as string | undefined),
      image: heroFields.image as string | undefined,
    },
    fleetVehicles,
    fleetFeaturesText,
    hasFleet: hasFleet ?? !!fleetVehicles?.length,
    howItWorksSteps,
    hourly,
    membershipTiers,
    aboutCarouselImages,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/lib/assemble.ts
git commit -m "feat(shared): add assembleHome/assembleService, centralize resolveTemplates"
```

---

### Task 3: VIPER — new content.config.ts

**Files:**
- Modify: `sites/viper/src/content.config.ts`

**Interfaces:**
- Consumes: schema fragments from `@garage/shared/content/schemas` (Task 1).
- Produces: `collections` object with `home, service, fleet, pricing, membership, privacy, site`.

- [ ] **Step 1: Replace content.config.ts**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  homeSchema, serviceSchema, fleetVehicleSchema, pricingSchema,
  membershipSchema, privacySchema, siteGlobalsSchema,
} from "@garage/shared/content/schemas";

const home = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/home" }),
  schema: homeSchema,
});

const service = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/services" }),
  schema: serviceSchema,
});

const fleet = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/fleet" }),
  schema: fleetVehicleSchema,
});

const pricing = defineCollection({
  loader: glob({ pattern: "hourly.yaml", base: "./src/content/pricing" }),
  schema: pricingSchema,
});

const membership = defineCollection({
  loader: glob({ pattern: "tiers.yaml", base: "./src/content/membership" }),
  schema: membershipSchema,
});

const privacy = defineCollection({
  loader: glob({ pattern: "content.md", base: "./src/content/privacy" }),
  schema: privacySchema,
});

const site = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/site" }),
  schema: siteGlobalsSchema,
});

export const collections = { home, service, fleet, pricing, membership, privacy, site };
```

- [ ] **Step 2: Commit**

```bash
git add sites/viper/src/content.config.ts
git commit -m "feat(viper): define per-page collections using shared schema fragments"
```

---

### Task 4: VIPER — migrate data files

**Files:**
- Create: `sites/viper/src/content/home/content.yaml`
- Create: `sites/viper/src/content/site/content.yaml`
- Create: `sites/viper/src/content/pricing/hourly.yaml`
- Create: `sites/viper/src/content/membership/tiers.yaml`
- Create: `sites/viper/src/content/fleet/mercedes-s-class.yaml`
- Create: `sites/viper/src/content/services/<slug>.yaml` per offering (see mapping)
- Delete: `sites/viper/src/content/hero/hero.md`, `how-it-works/steps.md`, `services/services.md`, `page-content/content.md`, `pricing/hourly.md`, `membership/tiers.md`, `fleet/mercedes-s-class.md`

**Interfaces:**
- Consumes: nothing (data only).
- Produces: the YAML files the config (Task 3) loads. Field names must match `homeSchema`/`siteGlobalsSchema`/`serviceDetailSchema`.

**Field mapping (verified from current files):**

`hero/hero.md` → `home/content.yaml` `hero:` block (copy `brand_name, tagline, subtitle, cta_text, hero_image, phone_italy, phone_spain` — viper hero.md has these keys; carry them verbatim, dropping the `---` delimiters and converting to YAML).

`how-it-works/steps.md` (frontmatter `steps: [...]`) → `site/content.yaml` `howItWorksSteps:` (rename `steps` → `howItWorksSteps`; same array shape).

`page-content/content.md` SPLIT (all of these are site-global — consumed by home AND
service-detail pages via shared sections/BaseLayout, so they go to `site`, NOT `home`):
- `jsonld`, `booking_data`, `vehicle_name`, `labels`, `branding` → `site/content.yaml` (top-level).
- `seo`, `about` (heading/text/image), `stats` (subheading/image/items), `cta` (heading/text/image),
  `bottomcta` (heading/values), `map_embed_url` → `site/content.yaml` (top-level; resolved in assembler).
- `fleet.heading` (VIPER "Ride Luxury, Every Time") → `site/content.yaml` `fleetHeading:` (Fleet section reads `pageContent.fleet.heading`; assembler maps `siteGlobals.fleetHeading` → `pageContent.fleet`).
- `howitworks.heading` (VIPER "How We Simplify Your Experience") → `site/content.yaml` `howItWorksHeading:` (HowItWorks section reads `pageContent.howitworks.heading`; assembler maps it).
- `how-it-works/steps.md` `steps` array → `site/content.yaml` `howItWorksSteps:` (renamed; same shape).

`services/services.md`:
- Summary cards (each offering's `region, title, description, image, slug`) → `home/content.yaml` `services.offerings:` array.
- Rich per-offering detail (`hero, steps, include, about_text, about_image, marquee, stats, cta, form_fields, bottomcta, seo`) → one `services/<slug>.yaml` per offering. Each file top-level is the `serviceDetailSchema` shape (NOT wrapped in `offerings`).

`pricing/hourly.md` → `pricing/hourly.yaml` (frontmatter `type, rates` → YAML, same keys).
`membership/tiers.md` → `membership/tiers.yaml` (frontmatter `tiers` array → YAML).
`fleet/mercedes-s-class.md` → `fleet/mercedes-s-class.yaml` (frontmatter → YAML).

- [ ] **Step 1: Write `home/content.yaml`** (merge `hero` from hero.md + `services.offerings` (summary cards) from services.md). NO stats/cta/bottomcta/about/seo — those are site-global (Task 4 mapping).

- [ ] **Step 2: Write `site/content.yaml`** (jsonld/booking_data/vehicle_name/labels/branding + seo/about/stats/cta/bottomcta/map_embed_url/fleetHeading/howItWorksHeading/howItWorksSteps from page-content + how-it-works).

- [ ] **Step 3: Write `pricing/hourly.yaml`, `membership/tiers.yaml`, `fleet/mercedes-s-class.yaml`** (1:1 frontmatter→YAML conversion).

- [ ] **Step 4: Write one `services/<slug>.yaml` per offering** from services.md per-offering rich fields.

- [ ] **Step 5: Delete the old section-based files** listed above.

- [ ] **Step 6: Validate**

Run: `cd sites/viper && npx astro check`
Expected: 0 errors (config + YAML validate). If Zod reports a field mismatch, fix the YAML to match the schema.

- [ ] **Step 7: Commit**

```bash
git add sites/viper/src/content
git commit -m "feat(viper): migrate CMS data to per-page YAML collections"
```

---

### Task 5: VIPER — rewrite page templates

**Files:**
- Modify: `sites/viper/src/pages/index.astro`, `services/[slug].astro`, `privacy-policy.astro`

**Interfaces:**
- Consumes: `assembleHome`/`assembleService` (Task 2), `HomeData`/`SiteGlobalsData` (Task 1).
- Produces: pages that render via existing shared sections.

- [ ] **Step 1: Rewrite `index.astro`**

```astro
---
import BaseLayout from "@garage/shared/layouts/BaseLayout.astro";
import Hero from "@garage/shared/sections/Hero.astro";
import Marquee from "@garage/shared/sections/Marquee.astro";
import AboutSection from "@garage/shared/sections/AboutSection.astro";
import Services from "@garage/shared/sections/Services.astro";
import Fleet from "@garage/shared/sections/Fleet.astro";
import StatsSection from "@garage/shared/sections/StatsSection.astro";
import HowItWorks from "@garage/shared/sections/HowItWorks.astro";
import Pricing from "@garage/shared/sections/Pricing.astro";
import Membership from "@garage/shared/sections/Membership.astro";
import CtaBanner from "@garage/shared/sections/CtaBanner.astro";
import BottomCta from "@garage/shared/sections/BottomCta.astro";

import { getEntry, getCollection } from "astro:content";
import { assembleHome } from "@garage/shared/lib/assemble";
import { SITE_NAME } from "@garage/shared/config/strings";
import { membershipValueNote } from "@garage/shared/config/membership";

const home = (await getEntry("home", "content"))!.data;
const siteGlobals = (await getEntry("site", "content"))!.data;
const fleetEntries = await getCollection("fleet");

const a = assembleHome({ home, siteGlobals, siteName: SITE_NAME, fleetEntries });
const hourlyEntry = await getEntry("pricing", "hourly");
const hourly = hourlyEntry?.data || {};
const membershipEntry = await getEntry("membership", "tiers");
const membership = membershipEntry?.data || {};
const membershipNote = membershipValueNote(membership.tiers, hourly.rates);
---
<BaseLayout pageContent={a.pageContent} brandName={a.hero.brand_name} ogLocale="en_US" preloadImage={a.hero.hero_image}>
  <Hero subtitle={a.hero.subtitle} cta_text={a.hero.cta_text} tagline={a.hero.tagline}
    hero_image={a.hero.hero_image} phoneItaly={a.hero.phone_italy} phoneSpain={a.hero.phone_spain} pageContent={a.pageContent} />
  <Marquee pageContent={a.pageContent} />
  <AboutSection pageContent={a.pageContent} />
  <Services marbella={a.services.offerings} milano={a.services.offerings} pageContent={a.pageContent} />
  <Fleet vehicles={a.fleetVehicles!} pageContent={a.pageContent} fleetFeatures={a.fleetFeaturesText!} />
  <StatsSection pageContent={a.pageContent} />
  <HowItWorks steps={siteGlobals.howItWorksSteps} pageContent={a.pageContent} />
  <Pricing hourly={hourly} pageContent={a.pageContent} />
  <Membership tiers={membership.tiers} pageContent={a.pageContent} note={membershipNote} />
  <CtaBanner pageContent={a.pageContent} />
  <BottomCta pageContent={a.pageContent} />
</BaseLayout>
```

- [ ] **Step 2: Rewrite `services/[slug].astro`**

```astro
---
import BaseLayout from "@garage/shared/layouts/BaseLayout.astro";
import ServicePage from "@garage/shared/sections/ServicePage.astro";
import { getCollection, getEntry } from "astro:content";
import { assembleService } from "@garage/shared/lib/assemble";
import { SITE_NAME } from "@garage/shared/config/strings";

export async function getStaticPaths() {
  const entries = await getCollection("service");
  return entries.map((e) => ({
    params: { slug: e.data.slug ?? e.id },
    props: { offering: e.data },
  }));
}

const { offering } = Astro.props as { offering: import("@garage/shared/content/types").ServiceDetailData };
const siteGlobals = (await getEntry("site", "content"))!.data;
const fleetEntries = await getCollection("fleet");
const hourlyEntry = await getEntry("pricing", "hourly");
const membershipEntry = await getEntry("membership", "tiers");

const a = assembleService({
  offering, siteGlobals, siteName: SITE_NAME,
  fleetVehicles: fleetEntries, hasFleet: true,
  howItWorksSteps: siteGlobals.howItWorksSteps,
  hourly: hourlyEntry?.data, membershipTiers: membershipEntry?.data.tiers,
  hero: { phoneItaly: siteGlobals.jsonld?.phoneItaly, phoneSpain: siteGlobals.jsonld?.phoneSpain },
});
---
<BaseLayout pageContent={a.pageContent} brandName={SITE_NAME} ogLocale="en_US" preloadImage={a.hero.image}>
  <ServicePage
    offering={a.offering} pageContent={a.pageContent} region="VIPER"
    hero={{ ...a.hero, phoneItaly: siteGlobals.jsonld?.phoneItaly, phoneSpain: siteGlobals.jsonld?.phoneSpain }}
    fleetVehicles={a.fleetVehicles!} fleetFeaturesText={a.fleetFeaturesText} hasFleet
    howItWorksSteps={a.howItWorksSteps} showPricing hourly={a.hourly}
    showMembership membershipTiers={a.membershipTiers} />
</BaseLayout>
```

- [ ] **Step 3: Rewrite `privacy-policy.astro`**

```astro
---
import BaseLayout from "@garage/shared/layouts/BaseLayout.astro";
import { SITE_NAME } from "@garage/shared/config/strings";
import { site } from "../config/site";
import { getEntry, render } from "astro:content";

const policy = await getEntry("privacy", "content");
const { Content } = policy ? await render(policy) : { Content: undefined };
const siteGlobals = (await getEntry("site", "content"))!.data;
const pageContent = {
  jsonld: siteGlobals.jsonld,
  seo: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "How VIPER Security collects, uses, and protects your personal data when you use our website or book our chauffeur service.",
    theme_color: site.themeColor, image: "/images/og-viper.webp",
  },
};
---
<BaseLayout pageContent={pageContent} brandName={SITE_NAME} ogLocale="en_US">
  <!-- body markup unchanged from current privacy-policy.astro -->
</BaseLayout>
```

- [ ] **Step 4: Validate + build**

Run: `cd sites/viper && npx astro check && npm run build`
Expected: 0 TS errors; build succeeds; `/`, `/services/<slug>`, `/privacy-policy` render.

- [ ] **Step 5: Commit**

```bash
git add sites/viper/src/pages
git commit -m "feat(viper): rewrite page templates to use assembler + per-page collections"
```

---

### Task 6: DBC — new content.config.ts

**Files:**
- Modify: `sites/dbc/src/content.config.ts`

**Interfaces:**
- Consumes: shared schema fragments (Task 1).
- Produces: `collections` with `home, service, gallery, privacy, site`.

- [ ] **Step 1: Replace content.config.ts**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  homeSchema, serviceSchema, galleryItemSchema, privacySchema, siteGlobalsSchema,
} from "@garage/shared/content/schemas";

const home = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/home" }),
  schema: homeSchema,
});

const service = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/services" }),
  schema: serviceSchema,
});

const gallery = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/gallery" }),
  schema: galleryItemSchema,
});

const privacy = defineCollection({
  loader: glob({ pattern: "content.md", base: "./src/content/privacy" }),
  schema: privacySchema,
});

const site = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/site" }),
  schema: siteGlobalsSchema,
});

export const collections = { home, service, gallery, privacy, site };
```

- [ ] **Step 2: Commit**

```bash
git add sites/dbc/src/content.config.ts
git commit -m "feat(dbc): define per-page collections using shared schema fragments"
```

---

### Task 7: DBC — migrate data files

**Files:**
- Create: `sites/dbc/src/content/home/content.yaml`, `site/content.yaml`, `services/<slug>.yaml` per offering, `gallery/*.yaml` (54 files)
- Delete: `sites/dbc/src/content/hero/hero.md`, `how-it-works/garage-steps.md`, `services/services.md`, `page-content/content.md`, `privacy/content.md` (stays .md, keeps body)

**Interfaces:**
- Consumes: schema fragments (Task 1).
- Produces: DBC YAML data.

**DBC-specific notes:**
- DBC `labels` use **underscore keys** (Sveltia rejects dots), normalized to dot-path at runtime in `gallery.astro`/`SiteLayout`. Preserve underscore keys in `site/content.yaml` `labels:`; normalization logic stays in the pages (Tasks 8).
- DBC `service` entries include `fleet[]` (per-offering sale vehicles) — map from services.md per-offering `fleet` array (verbatim).
- DBC `gallery` → 54 `gallery/<basename>.yaml` files: each `name, alt, category, image` from current `gallery/<basename>.md` frontmatter.

- [ ] **Step 1: Write `home/content.yaml`** (merge `hero` from hero.md + `services.offerings` summary from services.md). DBC home has NO pricing/membership sections; no stats/cta/etc here (site-global).

- [ ] **Step 2: Write `site/content.yaml`** (jsonld/booking_data/vehicle_name/labels/branding + seo/about/stats/cta/bottomcta/map_embed_url/fleetHeading/howItWorksHeading/howItWorksSteps from page-content + garage-steps).

- [ ] **Step 3: Write one `services/<slug>.yaml` per offering** (summary fields + rich detail + `fleet[]` from services.md).

- [ ] **Step 4: Convert 54 gallery `.md` → `.yaml`** (frontmatter `name, alt, category, image` → YAML). Preserve exact basenames so URLs/ids are stable.

- [ ] **Step 5: Delete old section files** (hero, how-it-works, services, page-content).

- [ ] **Step 6: Validate**

Run: `cd sites/dbc && npx astro check`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add sites/dbc/src/content
git commit -m "feat(dbc): migrate CMS data to per-page YAML collections"
```

---

### Task 8: DBC — rewrite page templates

**Files:**
- Modify: `sites/dbc/src/pages/index.astro`, `services/[slug].astro`, `privacy-policy.astro`, `gallery.astro`

**Interfaces:**
- Consumes: `assembleHome`/`assembleService` (Task 2).
- Produces: DBC pages via SiteLayout + shared sections.

- [ ] **Step 1: Rewrite `index.astro`**

```astro
---
import { getEntry, getCollection } from "astro:content";
import SiteLayout from "../layouts/SiteLayout.astro";
import { site } from "../config/site";
import Hero from "@garage/shared/sections/Hero.astro";
import StatsSection from "@garage/shared/sections/StatsSection.astro";
import AboutSection from "@garage/shared/sections/AboutSection.astro";
import Services from "@garage/shared/sections/Services.astro";
import HowItWorks from "@garage/shared/sections/HowItWorks.astro";
import CtaBanner from "@garage/shared/sections/CtaBanner.astro";
import BottomCta from "@garage/shared/sections/BottomCta.astro";
import { assembleHome } from "@garage/shared/lib/assemble";

const home = (await getEntry("home", "content"))!.data;
const siteGlobals = (await getEntry("site", "content"))!.data;
const galleryEntries = await getCollection("gallery");
const a = assembleHome({ home, siteGlobals, siteName: site.name });
const services = a.services.offerings;

const galleryImages = galleryEntries.map((e) => ({ cat: e.data.category, img: e.data.image }));
const homeCarousel = [
  ...galleryImages.filter((g) => g.cat === "all-builds").map((g) => g.img),
  ...galleryImages.filter((g) => g.cat === "supercar").map((g) => g.img),
  ...galleryImages.filter((g) => g.cat === "customizing").map((g) => g.img),
].slice(0, 5);
---
<SiteLayout pageContent={a.pageContent} ogLocale="en_US" preloadImage={a.hero.hero_image}>
  <Hero subtitle={a.hero.subtitle} cta_text={a.hero.cta_text} tagline={a.hero.tagline}
    hero_image={a.hero.hero_image} pageContent={a.pageContent} fleetHref="/gallery"
    phoneSpain={site.whatsappNumber} services={services} />
  <AboutSection pageContent={a.pageContent} images={homeCarousel} />
  <Services pageContent={a.pageContent} marbella={services} milano={services} />
  <StatsSection pageContent={a.pageContent} />
  <HowItWorks steps={siteGlobals.howItWorksSteps} pageContent={a.pageContent} />
  <CtaBanner pageContent={a.pageContent} />
  <BottomCta pageContent={a.pageContent} fleetHref="/gallery" />
</SiteLayout>
```

- [ ] **Step 2: Rewrite `services/[slug].astro`** (iterate `service` collection; map per-offering `fleet[]` to `FleetEntry[]`; keep `slugToCategory` gallery carousel; keep underscore→dot label normalization for `pageContent.labels`; per-offering `fleet_section` override passed to `assembleService`). Reuse current `slugToCategory` map and gallery-carousel logic verbatim.

- [ ] **Step 3: Rewrite `privacy-policy.astro`** (mirror VIPER Task 5 Step 3, using `site` collection for jsonld).

- [ ] **Step 4: Rewrite `gallery.astro`** — replace `getCollection("page-content")` with `getEntry("site","content")` + `normalizeKey` for labels; gallery items from `getCollection("gallery")`. Keep all masonry/lightbox markup + `imageDims`/`getImage` logic unchanged.

- [ ] **Step 5: Validate + build**

Run: `cd sites/dbc && npx astro check && npm run build`
Expected: 0 TS errors; build succeeds; `/`, `/services/<slug>`, `/gallery`, `/privacy-policy` render.

- [ ] **Step 6: Commit**

```bash
git add sites/dbc/src/pages
git commit -m "feat(dbc): rewrite page templates to use assembler + per-page collections"
```

---

### Task 9: Docs + final verification

**Files:**
- Modify: `CLAUDE.md` (gotcha note), `sites/dbc/src/components/AGENTS.md` if it references `page-content`/`services` collections.

**Interfaces:**
- Consumes: nothing.
- Produces: accurate documentation.

- [ ] **Step 1: Update `CLAUDE.md`**

Edit the gotcha block: remove the line
`**`getCollection('page-content')` is destructured as `[pageContentEntry]`** — exactly one `content.md` allowed; a second file breaks the destructure.`
Replace with:
`**Per-page collections:** each page owns one collection + one `content.yaml` entry (id `content`); `site` holds site-globals (jsonld/booking_data/vehicle_name/labels/howItWorksSteps/branding). `fleet` (viper) + `gallery` (dbc) are standalone item lists. `pricing` key is `pricing`, entry id `hourly` (`getEntry('pricing','hourly')`).`

- [ ] **Step 2: Update DBC `AGENTS.md`** if it names `page-content`/`services` collections.

- [ ] **Step 3: Final build both sites**

Run:
```
cd sites/viper && npm run build && cd ../dbc && npm run build
```
Expected: both succeed; visit `/`, `/services/<slug>`, `/privacy-policy` (and DBC `/gallery`) to confirm sections render identically to pre-change.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md sites/dbc/src/components/AGENTS.md
git commit -m "docs: update CMS collection gotchas for per-page model"
```

---

## Self-Review Notes

- **Heading/section split CORRECTION (applied inline):** `stats/cta/bottomcta/about/seo/fleetHeading/howItWorksHeading` are consumed by BOTH home and service-detail pages (ServicePage spreads them as the base; BaseLayout reads seo/jsonld). They belong in `siteGlobalsSchema` (site-global), NOT `homeSchema`. Only `home.hero` + `home.services.offerings` are home-only. `homeSchema`/`HomeData` have NO stats/cta/etc. The assembler maps `siteGlobals.fleetHeading`→`pageContent.fleet.heading` and `siteGlobals.howItWorksHeading`→`pageContent.howitworks.heading`.
- **Spec coverage:** §2 collections ✓ Tasks 3/6; §3 DRY schemas ✓ Task 1; §4 data flow ✓ Tasks 2/5/8; §5 migration ✓ Tasks 4/7; §6 verification ✓ Tasks 4/5/7/8/9; docs ✓ Task 9. No gaps.
- **Type consistency:** `assembleHome` returns `fleetVehicles?: FleetEntry[]` and `fleetFeaturesText?: string` — VIPER `index.astro` passes `a.fleetVehicles!`/`a.fleetFeaturesText!` (non-null because fleet passed). `assembleService` returns `hero` without phone fields; VIPER passes phones from `siteGlobals.jsonld` explicitly. Names match across tasks.
- **DBC `fleet`:** DBC has no standalone `fleet` collection; `assembleService` receives per-offering `fleet[]` mapped to `FleetEntry[]` in the DBC `[slug].astro` (preserve current mapping logic). VIPER passes the full `fleet` collection.
