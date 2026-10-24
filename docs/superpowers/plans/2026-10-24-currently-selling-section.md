# "Currently Selling" Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CMS-driven "Currently Selling" vehicle section (fleet-card design, carousel, description, WhatsApp button) to DBC `services/auction` and VIPER `services/luxury-cars-sale`, plus a reusable NHTSA-powered Sveltia CMS field for make/model/year.

**Architecture:** Reuse the shared `Fleet.astro` card component and `ServicePage` fleet slot. DBC gets a new `currently-selling` collection; VIPER gets a `fleet[]` list inside its `luxury-cars-sale` service entry. Cards render `ImageCarousel` (new `id`/`group` props) when a vehicle has an `images[]` list. A shared `lib/nhtsa.js` module backs both the booking forms (existing behavior) and a new `nhtsa_vehicle` Sveltia custom field type, bundled into a static `/admin/vehicle-lookup.js` per site.

**Tech Stack:** Astro 7 static (npm workspaces), Zod content collections, Sveltia CMS (github backend, v0.193.0 CDN), vPic NHTSA API, esbuild (already in tree via Vite) for the admin bundle.

**Spec:** `docs/superpowers/specs/2026-10-24-currently-selling-section-design.md` (read it first — user decisions + builder-check calls are normative).

## Global Constraints

- Static Astro — no SSR, no adapters. All data from CMS YAML entries; components never hardcode vehicles.
- Page templates must NOT call `resolveTemplates` — the assembler owns it.
- Sveltia CMS config must never use dotted field names (labels use `fleet_waButton` style; code normalizes `_`→`.` at render).
- Sveltia writes `null` for untouched optional objects: every new optional object field goes through the existing `nullToUndefined` preprocess helper. Nested `vehicle` object is no exception.
- CSP lives per the current carrier set (VIPER: `netlify.toml`, `deploy/cloudflare/_headers`, `public/.htaccess`; DBC: `netlify.toml`, check `public/_headers`). Add `https://vpic.nhtsa.dot.gov` to `connect-src` wherever an `/admin/*` CSP block exists.
- Commits: Conventional Commits (`feat:`, `refactor:`, `chore:`), one commit per task.
- No unit-test infra exists (Playwright a11y is VIPER-home-only). Verification = `npx astro check`, site builds, `node scripts/validate-cms.mjs`, dist greps, a11y suite, and documented manual dev checks.
- Work in the current checkout (no worktree) — the user works in-place on this repo.

## Review Focus

1. **CMS round-trip nulls**: a freshly CMS-saved entry writes `vehicle: null`; the Zod preprocess must swallow it or the build breaks. → pinned by `nullToUndefined` in Task 1 (schema) + the CMS save round-trip in Tasks 6/9 manual smoke tests.
2. **Duplicate carousel ids/anchors**: N carousels on one page must not share slide ids, dot anchor targets, or PhotoSwipe groups. → scrolled-page manual check in Task 5; `id`/`group` uniqueness asserted by the markup in Task 5.
3. **NHTSA offline / API unavailable**: the CMS field must degrade to manual text entry, never block saving a vehicle. → manual CMS check in Task 9.
4. **WhatsApp link formatting**: number must be digits-only before `wa.me/`; empty phone ⇒ no button rendered. → build + grep in Task 5.
5. **VIPER home regression**: legacy stats rows and single-image cards must render exactly as today (no empty "Seats:" rows on cards without chauffeur fields). → VIPER build + home grep + a11y suite in Task 5/10.

---

### Task 1: Shared schema + types for richer vehicle entries

**Files:**
- Modify: `packages/shared/src/content/schemas.ts` (fleetVehicleSchema ~L350; serviceDetailSchema fleet[] ~L136)
- Modify: `packages/shared/src/types.ts` (FleetVehicleData ~L5-25)

**Interfaces:**
- Consumes: existing `nullToUndefined` helper, `fleetVehicleSchema`.
- Produces (used by Tasks 5–9): `fleetVehicleSchema` extended with `description?`, `images? (string[])`, `order? (number)`, `vehicle? ({category?, make?, model?, year?} strings)`; `FleetVehicleData` mirrors them exactly. `serviceDetailSchema.fleet` reuses `fleetVehicleSchema` (identical shape today; declaration order matters — `fleetVehicleSchema` is a `const`, so it must be defined ABOVE `serviceDetailSchema` after the refactor).

- [ ] **Step 1: Extend `fleetVehicleSchema`**

```ts
export const vehicleSpecSchema = z.object({
  category: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
});

// inside fleetVehicleSchema, after image:
order: z.number().optional(),
description: z.string().optional(),
images: z.array(z.string()).optional(),
vehicle: nullToUndefined(vehicleSpecSchema),
```
Note: use the file's existing pattern for optional nested objects — `nullToUndefined(vehicleSpecSchema)` wraps it optional + null-tolerant, exactly how `stats`/`cta` are declared in the same file. Do NOT invent `.two_optional()` — the note exists to guard against it.

- [ ] **Step 2: Replace the inline `fleet[]` item in `serviceDetailSchema` with `fleetVehicleSchema`** (move or hoist declarations so order-of-`const` resolves). Keep `fleet` itself `.optional()`.

- [ ] **Step 3: Mirror the fields in `FleetVehicleData`** (`description?: string; images?: string[]; order?: number; vehicle?: { category?: string; make?: string; model?: string; year?: string }`).

- [ ] **Step 4: Verify**

Run: `cd sites/viper && npx astro check && cd ../../sites/viper` then also `cd sites/dbc && npx astro check` (run from repo root per command block below).
Run: `npm run build -w @garage/viper && npm run build -w @garage/dbc`
Expected: `astro check` 0 errors on both; builds succeed (no YAML regression — existing fleet/service YAML unchanged).

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/content/schemas.ts packages/shared/src/types.ts
git commit -m "feat: extend vehicle entries with description, images, order, make/model/year object"
```

### Task 2: `cleanPhone` lib + `fleet.waButton` string

**Files:**
- Create: `packages/shared/src/lib/phone.ts`
- Modify: `packages/shared/src/components/sections/Footer.astro:46` (delete local `cleanPhone`, import from lib)
- Modify: `packages/shared/src/config/strings.ts` (fleet block ~L97)

**Interfaces:**
- Produces: `cleanPhone(phone?: string): string` (digits only); `STRINGS.fleet.waButton` default label `"Ask About This Car"` (CMS-overridable later via `fleet_waButton` label key — no more work needed, resolveLabels handles keys).

- [ ] **Step 1: Create lib** with exactly `export const cleanPhone = (phone?: string) => (phone || "").replace(/\D/g, "");` (copy the Footer line verbatim).

- [ ] **Step 2: Footer imports it** — remove the local `const cleanPhone`, add `import { cleanPhone } from "../../lib/phone";` keeping behavior identical.

- [ ] **Step 3: strings.ts** — `fleet: { ..., waButton: "Ask About This Car" }` (add last key of the `fleet` block; keep existing keys untouched).

- [ ] **Step 4: Verify**

Run: `npx astro check` in each site (see Task 1 commands) + `npm run build -w @garage/viper`.
Expected: builds pass; footers render with no diff in dist HTML.

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/lib/phone.ts packages/shared/src/components/sections/Footer.astro packages/shared/src/config/strings.ts
git commit -m "refactor: extract cleanPhone, add fleet.waButton label"
```

### Task 3: Extract shared NHTSA lookup (`lib/nhtsa.js`)

**Files:**
- Create: `packages/shared/src/lib/nhtsa.js`
- Modify: `packages/shared/src/components/sections/BookingForm.astro` (NHTSA block ~L671)
- Modify: `packages/shared/src/components/sections/DropdownInput.astro` (NHTSA block ~L146)

**Interfaces:**
- Produces (used by this task's two scripts and Task 9's admin field):

```ts
export const nhtsaApi = "https://vpic.nhtsa.dot.gov/api/vehicles";
export type NhtsaMake = { name: string; id: number };
export async function fetchMakes(type: "car" | "motorcycle" | "other"): Promise<NhtsaMake[]>
  // GET `${nhtsaApi}/GetMakesForVehicleType/${type}?format=json` → Results → {name: MakeName, id: MakeId}; [] on error
export async function fetchMakeId(makes: NhtsaMake[], name: string): Promise<number | null>
export async function fetchModels(makeId: number, year?: number): Promise<{ name: string; years: number[] }[]>
  // GET `${nhtsaApi}/GetModelsForMakeId/${makeId}${year ? "/" + year : ""}?format=json` → Results; [] on error
```

- Both components keep their LOCAL caches and sorting exactly as today (`makesByType`, `modelNames`, `modelYears`); only the raw `fetch` calls move behind the shared functions. Rendered DOM and behavior must be identical (refactor, no redesign).

- [ ] **Step 1: Read both current NHTSA blocks** (`BookingForm.astro` L660–740, `DropdownInput.astro` L130–210) and catalog every fetch URL/param used.

- [ ] **Step 2: Write `packages/shared/src/lib/nhtsa.js`** exporting `nhtsaApi`, `fetchMakes`, `fetchMakeId`, `fetchModels` bodies forwarded verbatim from the components' logic (including the `catch {} → return []` tolerance).

- [ ] **Step 3: Rewire both components** to import and call the shared functions; delete duplicated inline fetch code; keep caches local.

- [ ] **Step 4: Verify**

Run: `npm run build -w @garage/dbc && npm run build -w @garage/viper`.
Expected: builds pass; grep `vpic.nhtsa.dot.gov` in `packages/shared/src` resolves only to `lib/nhtsa.js`.

- [ ] **Step 5: Manual dev check (booking form unchanged)** — `npm run dev -w @garage/dbc`, open a service page with a `vehicle` field (auction page), pick Car → make list loads → typing filters → model/year cascade still works. Record result in the task comment.

- [ ] **Step 6: Commit**

```bash
git add packages/shared/src/lib/nhtsa.js packages/shared/src/components/sections/BookingForm.astro packages/shared/src/components/sections/DropdownInput.astro
git commit -m "refactor: share NHTSA vPic lookup between booking forms"
```

### Task 4: `ImageCarousel` id/group props (multi-instance safe)

**Files:**
- Modify: `packages/shared/src/components/sections/ImageCarousel.astro`

**Interfaces:**
- Produces (Task 5 consumes): optional `id?: string` and `group?: string` props. Defaults `"about-carousel"` for both, so AboutSection Great behavior is unchanged-by-definition. Slide ids become `${baseId}-slide-N` and the PhotoSwipe lightbox group becomes `group`.

- [ ] **Step 1: Add props** — `interface Props { images: (ImageMetadata | string)[]; alt: string; id?: string; group?: string }`, destructure, then `const baseId = id ?? "about-carousel"` (note: the prop itself is renamed to `id`; only the internal const keeps the legacy name), and `const lbGroup = group ?? "about-carousel"`; use `lbGroup` for the ZoomImage `group` attribute (L48).

- [ ] **Step 2: Verify** — `npm run build -w @garage/viper && npm run build -w @garage/dbc`; both pass; about carousels render identical ids as before (grep dist for `about-carousel-slide-1`).

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/components/sections/ImageCarousel.astro
git commit -m "feat: parameterize ImageCarousel ids and lightbox group"
```

### Task 5: Fleet card — carousel, description, WhatsApp button

**Files:**
- Modify: `packages/shared/src/components/sections/Fleet.astro`
- Modify: `packages/shared/src/components/sections/ServicePage.astro` (Props + `<Fleet>` call L185-187)

**Interfaces:**
- Consumes: `ImageCarousel` `id`/`group` (Task 4), `cleanPhone` (Task 2), `FleetVehicleData` new fields (Task 1).
- Produces: `ServicePage` prop `whatsappPhone?: string` forwarded to `<Fleet>`; `Fleet` props also gain `whatsappPhone?: string`. Card markup: `.car-card-description` paragraph after name/type; `.car-card-wa primary-button` anchor after `car-card-data`.

- [ ] **Step 1: Card image swap** — inside the `vehicles?.map`, per card:

```astro
<div class="car-listing-image-wrapper">
  {d.images?.length ? (
    <ImageCarousel images={d.images} alt={d.name} id={`fleet-${v.id}-carousel`} group={`fleet-${v.id}`} />
  ) : (
    d.image && <ZoomImage ... /* unchanged existing call */ />
  )}
</div>
```
(`image` prop order/images list empty ⇒ old single-image path.)

- [ ] **Step 2: Description paragraph** — after name/type block in `car-card-left`: `{d.description && <p class="car-card-description">{d.description}</p>}` plus a modest scoped style (inherit card typography; no new CSS variables).

- [ ] **Step 3: WhatsApp button** — after the `car-card-data` div:

```astro
{whatsappPhone && (
  <a class="primary-button car-card-wa" target="_blank" rel="noopener noreferrer"
     href={`https://wa.me/${cleanPhone(whatsappPhone)}?text=${encodeURIComponent(waMessage(d, Astro.url.pathname))}`}>
    <div class="button-text">{s.fleet.waButton}</div>
  </a>
)}
```
Frontmatter helper (deterministic, build-time):

```ts
const waMessage = (d: FleetVehicleData, pagePath: string) =>
  [d.name, d.vehicle?.year ?? d.year, d.type, d.description, pagePath ? `Details: ${pagePath}` : ""].filter(Boolean).join("\n");
```
Sources: `whatsappPhone` is a NEW top-level prop consumed from ServicePage; no phone → no button.

- [ ] **Step 4: Legacy chauffeur rows suppressed when empty** (builder-check call #5) — in the `:other specs` fallback branch, wrap the two `car-listing-details-wrapper` rows in:

```ts
const legacyCaps = [d.year, d.seats, d.baggage, d.capacity_passengers, d.capacity_suitcases, d.capacity_carryon].some((x) => x !== undefined && x !== null);
```
(defined per card inside the map). VIPER home cars set these fields ⇒ unchanged output; sale cars with none ⇒ block hidden.

- [ ] **Step 5: ServicePage plumbing** — add `whatsappPhone?: string` to `Props`, destructure, pass to the `<Fleet ... />` at L186.

- [ ] **Step 6: Verify**

Run: `npm run build -w @garage/viper && npm run build -w @garage/dbc && npm run test:a11y -w @garage/viper`.
Expected: builds + astro check clean; a11y suite passes (fleet `.car-listing-image` dimension test still hits the home ZoomImage path). Dist home HTML identical for existing fleet cars (`diff` grep for `car-listing-name` rows). No `wa.me/` links appear on home (no phones passed there).

- [ ] **Step 7: Manual dev check** — run a temporary local test page or dev-route by seeding one VIPER fleet entry with `images:` + `description:` + `vehicle:`… (tree is fine with `fleet` collection yaml edit; revert after). Confirm per-card carousel steps, unique api-slide ids, per-card PhotoSwipe scoping, WA link opens with correct digits + text. Revert the seed.

- [ ] **Step 8: Commit**

```bash
git add packages/shared/src/components/sections/Fleet.astro packages/shared/src/components/sections/ServicePage.astro
git commit -m "feat: fleet cards support image carousel, description, WhatsApp inquiry button"
```

### Task 6: DBC `currently-selling` collection (config + seeds + validation)

**Files:**
- Modify: `sites/dbc/src/content.config.ts`
- Create: `sites/dbc/src/content/currently-selling/*.yaml` (2 seed entries)
- Modify: `sites/dbc/public/admin/config.yml` (new collection + extend per-service `fleet` item fields)
- Create: `sites/dbc/src/content/json-schemas/currently-selling.json`
- Modify: `sites/dbc/src/content/json-schemas/services.json` (fleet item gains `description`, `images`, `order`, `vehicle`)
- Modify: `scripts/validate-cms.mjs` (dbcSchemas map gains `currently-selling`)
- Modify: `.vscode/settings.json` (yaml.schemas glob for the new dir)

**Interfaces:**
- Consumes: `fleetVehicleSchema` (Task 1).
- Produces: collection key `selling` (`sites/dbc/src/content/currently-selling/*.yaml` globbed); entries have optional `order`, `description`, `images[]`, `vehicle{category,make,model,year}`, `type`, `specs`, `features`, `image`; `name` required. Admin collection `currently-selling` with `create: true`, slug `{{fields.name}}`.
- Config note: the `vehicle` field uses `widget: nhtsa_vehicle` (created in Task 9). Between Task 6 and Task 9 the CMS admin UI will show a registry warning for the unknown widget name — acceptable in-branch, never merges to main without Task 9.

- [ ] **Step 1: content.config.ts** — add:

```ts
const selling = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/currently-selling" }),
  schema: fleetVehicleSchema,
});
```
and add `selling` to exported `collections`.

- [ ] **Step 2: Seed 2 entries** — e.g. `currently-selling/1992-ferrari-f40.yaml` and `../currently-selling/1969-mustang-mach-1.yaml`, each with `name`, `type`, `vehicle: {make: Ferrari, model: F40, year: "1992", category: car}`, `description`, `images: [<two existing /images/cms/... paths>]`, `specs: [{label: "...", value: "..."}]`, `order: 1|2`. Copy image paths from existing dbc YAML content so no 404s (list available paths first with `ls sites/dbc/public/images/cms`).

- [ ] **Step 3: admin/config.yml** — add the `currently-selling` folder collection mirroring VIPER fleet conventions (fields: name-string required, vehicle `widget: nhtsa_vehicle` + `required: false`, type string, description text required:false, images list-of-image (several), image singular image required:false, specs list, features list, order number value_type int required:false). ALSO extend the per-service `fleet` list item fields (config.yml ~L397-458) with `vehicle`, `description`, `images`, `order` widgets so VIPER-style lists (None used by DBC today beyond auction fallback) stay editable. Keep `widget` names exactly `nhtsa_vehicle`.

- [ ] **Step 4: JSON schemas + validator + vscode glob** — new `currently-selling.json` (draft-07, `name` required, others optional, `vehicle` typed object, `images` string arrays, `order` ["number","null"]); update `services.json` fleet item properties; add `"currently-selling": join(DBC, "json-schemas", "currently-selling.json")` in `scripts/validate-cms.mjs`; add `.vscode` yaml.schemas entry `"/sites/dbc/src/content/currently-selling/*.yaml"`.

- [ ] **Step 5: Verify**

Run: `node scripts/validate-cms.mjs && npm run build -w @garage/dbc && cd sites/dbc && npx astro check`.
Expected: validator passes (2 seeds valid); build emits no new pages yet (sections not wired until Task 7); astro check clean.

- [ ] **Step 6: Commit**

```bash
git add sites/dbc/src/content.config.ts sites/dbc/src/content/currently-selling sites/dbc/public/admin/config.yml sites/dbc/src/content/json-schemas scripts/validate-cms.mjs .vscode/settings.json
git commit -m "feat: DBC currently-selling vehicle collection with CMS wiring"
```

### Task 7: DBC auction page wiring (vehicles from collection + fallback + order)

**Files:**
- Modify: `sites/dbc/src/pages/services/[slug].astro`

**Interfaces:**
- Consumes: collection `selling` (Task 6), `ServicePage` `whatsappPhone` (Task 5), `site.whatsappNumber` from `../../config/site`.
- Produces: auction page renders the fleet section from `currently-selling` when non-empty, else from `offering.fleet` (builder call #7); sorted by `order` asc then id. Fleet heading/subheadline from `offering.fleet_section` — subheadline injected as label key `fleet_subheadline` BEFORE the existing `_`→`.` label normalization.

- [ ] **Step 1: Slug + collection decision**

```ts
const slug = offering.slug ?? slugify(offering.title);
const isAuction = slug === "auction";
const sellingEntries = isAuction ? await getCollection("selling") : [];
const sourceFleet = sellingEntries.length
  ? sellingEntries.map((e) => ({ id: e.id, collection: "fleet" as const, data: e.data }))
  : (offering.fleet || []).map((f) => ({ id: `${offering.slug ?? offering.title}-${f.name}`, collection: "fleet" as const, data: f }));
const fleetVehicles = sourceFleet.sort((a, z) => (a.data.order ?? Infinity) - (z.data.order ?? Infinity) || a.id.localeCompare(z.id));
const hasFleet = fleetVehicles.length > 0;
```
Replace the existing `fleetVehicles` mapping block (keep the comment lines adjusted — the assembler call below is unchanged).

- [ ] **Step 2: fleet_section subheadline wiring** — in the `fleet_section` patch block (before labels normalization at L41-53):

```ts
if (offering.fleet_section?.subheadline) {
  a.pageContent.labels = { ...(a.pageContent.labels || {}), fleet_subheadline: offering.fleet_section.subheadline };
}
```
(The existing heading patch stays; label normalization converts `fleet_subheadline` → `fleet.subheadline` for `resolveLabels`.)

- [ ] **Step 3: Pass `whatsappPhone`** — add `whatsappPhone={site.whatsappNumber}` to the `<ServicePage … />` call.

- [ ] **Step 4: auction.yaml gets `fleet_section.heading: Currently Selling`**

Run: edit `sites/dbc/src/content/services/auction.yaml` (add `fleet_section.heading`; leave subheadline unset so STRINGS default "Our Fleet" shows until CMS sets it — document this choice in the commit message).

- [ ] **Step 5: Verify**

Run: `node scripts/validate-cms.mjs && npm run build -w @garage/dbc && cd sites/dbc && npx astro check`.
Run: `grep -c 'id="fleet"' sites/dbc/dist-dbc/services/auction/index.html` — expect `1`.
Expected: builds pass; `/services/auction/index.html` contains the fleet section + 2 `car-card` entries + `wa.me` links; `/services/customizing/` and other service pages have NO `id="fleet"` section (no regression); `astro check` clean.

- [ ] **Step 6: Manual dev check** — `npm run dev -w @garage/dbc` → auction page: carousels scroll, dots/arrows work per card, WhatsApp link contains vehicle name/year/type/description + `/services/auction` path.

- [ ] **Step 7: Commit**

```bash
git add sites/dbc/src/pages/services/[slug].astro sites/dbc/src/content/services/auction.yaml
git commit -m "feat: auction page shows Currently Selling from CMS collection with fallback"
```

### Task 8: VIPER luxury-cars-sale wiring (service fleet list + seeds + CMS fields)

**Files:**
- Modify: `sites/viper/src/content/services/luxury-cars-sale.yaml` (add `fleet_section` + seeded `fleet` list)
- Modify: `sites/viper/src/pages/services/[slug].astro`
- Modify: `sites/viper/public/admin/config.yml` (service collection: fleet list + fleet_section widgets)

**Interfaces:**
- Consumes: `serviceDetailSchema.fleet` (Task 1), `ServicePage` `whatsappPhone` (Task 5), `siteGlobals.jsonld.phoneSpain` for the number.
- Produces: `services/luxury-cars-sale` renders the fleet section from its own `fleet[]` list; heading/subheadline from `fleet_section` (heading monkeypatch like DBC; subheadline into `labels["fleet.subheadline"]` AFTER label normalization since VIPER normalizes first).

- [ ] **Step 1: Seed yaml** — in `luxury-cars-sale.yaml` add:

```yaml
fleet_section:
  heading: Currently Selling
fleet:
  - name: Ferrari F40
    type: Classic Supercar
    vehicle: {category: car, make: Ferrari, model: F40, year: "1992"}
    description: ...
    order: 1
    specs: [...]
    images:
      - /images/cms/<existing paths — ls sites/viper/public/images/cms first>
  - ...second vehicle, order 2
```

- [ ] **Step 2: [slug].astro wiring** — after `assembleService`:

```ts
const slug = offering.slug ?? slugify(offering.title);
const fleetVehicles = (offering.fleet || []).map((f) => ({
  id: `${slug}-${f.name}`,
  collection: "fleet" as const,
  data: f,
})).sort((a, z) => (a.data.order ?? Infinity) - (z.data.order ?? Infinity) || a.id.localeCompare(z.id));
const hasFleet = fleetVehicles.length > 0;
```
Heading + subheadline + label patch (VIPER order: build `labels` map first — L35 — then patch INTO the normalized map):

```ts
if (offering.fleet_section?.heading || offering.fleet_section?.subheadline) {
  a.pageContent.fleet = { ...(a.pageContent.fleet || {}), heading: offering.fleet_section?.heading };
  if (offering.fleet_section?.subheadline) labels["fleet.subheadline"] = offering.fleet_section.subheadline;
}
```
Pass `fleetVehicles`, `fleetFeaturesText` (derive via `a.fleetFeaturesText` pattern — assembler computes from features; pass `fleetVehicles` into the assembler call like DBC does so the text derives), `hasFleet`, and `whatsappPhone={siteGlobals.jsonld?.phoneSpain}` to `ServicePage`.

- [ ] **Step 3: admin/config.yml service collection** — add after `about_images`: a `fleet_section` object widget (heading, subheadline) and a `fleet` list widget with the same item fields as DBC's per-service fleet (`name`, `nhtsa_vehicle` vehicle, type, description, images list-of-image, image singular, specs, features, order number). Underscore keys only, no dotted names.

- [ ] **Step 4: Verify**

Run: `npm run build -w @garage/viper && cd sites/viper && npx astro check && npm run test:a11y -w`.
Run: `grep -c 'id="fleet"' sites/viper/dist/services/luxury-cars-sale/index.html` — expect ≥1; also confirm armored-vehicles page has no fleet section; home Fleet section unchanged (same card rows as before — no description/WA because home fleet entries have no images/description unless seeded; VIPER home passes NO whatsappPhone → no buttons).

- [ ] **Step 5: Commit**

```bash
git add sites/viper/src/content/services/luxury-cars-sale.yaml sites/viper/src/pages/services/[slug].astro sites/viper/public/admin/config.yml
git commit -m "feat: VIPER luxury-cars-sale shows Currently Selling from per-service fleet list"
```

### Task 9: Sveltia `nhtsa_vehicle` custom field + admin bundling + CSP

**Files:**
- Create: `packages/shared/src/admin/nhtsa-field.js`
- Create: `scripts/build-cms-field.mjs` (esbuild → both sites' `public/admin/vehicle-lookup.js`)
- Create (generated, committed): `sites/viper/public/admin/vehicle-lookup.js`, `sites/dbc/public/admin/vehicle-lookup.js`
- Modify: `sites/viper/src/pages/admin.astro`, `sites/dbc/src/pages/admin.astro` (script tag after the Sveltia CDN tag)
- Modify: `sites/viper/package.json`, `sites/dbc/package.json` (prebuild hook) ; `package.json` root (`cms:field` script)
- Modify: CSP carriers with `/admin/*` blocks (grep first): `sites/viper/netlify.toml`, `sites/viper/public/.htaccess`, `sites/viper/deploy/cloudflare/_headers`, `sites/dbc/netlify.toml`, `sites/dbc/public/_headers`

**Interfaces:**
- Consumes: `lib/nhtsa.js` exports (Task 3).
- Produces: global function registered on CMS load — `CMS.registerFieldType("nhtsa_vehicle", control)`; control renders category → make → model → year selects, falls back to text inputs; `onChange` emits object `{category, make, model, year}` (strings, year string); widget config key in YAML: `vehicle`. Script self-check: aborts silently when `window.CMS` or `window.CMS.React` is absent.

- [ ] **Step 1: Write `packages/shared/src/admin/nhtsa-field.js`** per Sveltia docs (React components via `CMS.React` createElement; `https://sveltiacms.app/en/docs/api/field-types` is the recipe — including the value/onChange contract). Category options: `car`, `motorcycle`, `other` (matches booking-form semantics); makes via `fetchMakes(category || "car")`; models via `fetchModels(fetchMakeId(...))`; year select static `1992..new Date().getFullYear() + 2` (2-year headroom for next-model-year sales). Any select change calls `onChange` with the composite object `{category, make, model, year}` as strings (empty parts omitted). Changing category or make clears the stored model/year. When a list fetch returns empty, render a text input instead of that select so editing NEVER blocks.

- [ ] **Step 2: Write `scripts/build-cms-field.mjs`** — esbuild (`import esbuild from "esbuild"`, it's in Vite's tree; verify `node -e "require.resolve('esbuild')"`) bundles `packages/shared/src/admin/nhtsa-field.js` → `--bundle --format=iife --minify` → overwrites `sites/{viper,dbc}/public/admin/vehicle-lookup.js`.

- [ ] **Step 3: Hook builds** — root `package.json` adds `"cms:field": "node scripts/build-cms-field.mjs"`; each site's package.json adds `"prebuild": "node ../../scripts/build-cms-field.mjs"` (verify it fires during `npm run build -w @garage/viper`).

- [ ] **Step 4: admin.astro script tag** — after the existing Sveltia CDN `<script>` (plain inline tag, no Astro processing):

```html
<script is:inline src="/admin/vehicle-lookup.js" defer></script>
```
Both sites. If `is:inline` + `src` trips Astro lint, drop `is:inline` and keep the plain HTML tag inside a raw block.

- [ ] **Step 5: config.yml widget usage** — already referenced from Tasks 6/8 with the exact name `nhtsa_vehicle`; confirm the field loads by opening each admin UI.

- [ ] **Step 6: CSP updates** — grep for admin CSP blocks: `grep -rn "connect-src" sites/*/netlify.toml sites/*/public/_headers sites/*/public/.htaccess sites/*/deploy/cloudflare/_headers`. In every `/admin/*` block add `https://vpic.nhtsa.dot.gov` to `connect-src` if `vpic` missing. (Booking paths already have it.)

- [ ] **Step 7: Verify**

Run: `npm run build -w @garage/viper && npm run build -w @garage/dbc && grep -l "registerFieldType" sites/viper/dist/admin/vehicle-lookup.js sites/dbc/dist-dbc/admin/vehicle-lookup.js`.
Expected: bundles exist in both dists and contain the registration; `astro check` unchanged; manual CMS smoke test — `npm run dev -w @garage/dbc`, open `/admin`: the vehicle widget appears, dropdowns fetch and cascade; blocking `vpic.nhtsa.dot.gov` in devtools degrades the widget to text inputs and saving still works.

- [ ] **Step 8: Commit**

```bash
git add packages/shared/src/admin/nhtsa-field.js scripts/build-cms-field.mjs sites/*/package.json package.json sites/*/public/admin/vehicle-lookup.js sites/*/src/pages/admin.astro
git add -A # CSP carrier files touched
git commit -m "feat: reusable NHTSA vehicle field for Sveltia CMS (bundled admin script + CSP)"
```

### Task 10: Final verification + docs

**Files:**
- Modify: `CLAUDE.md` (add a one-line gotcha about the new collection + fleet_section subheadline wiring + the vendored CMS field)

- [ ] **Step 1: Full gates**

Run: `npm run build -w @garage/viper && npm run build -w @garage/dbc && cd sites/viper && npx astro check && npm run test:a11y -w && cd ../.. && node scripts/validate-cms.mjs`.
Expected: both builds clean, astro check 0 errors both, a11y suite green, validator green.

- [ ] **Step 2: Dist assertions** — grep `sites/dbc/dist-dbc/services/auction/index.html` and `sites/viper/dist/services/luxury-cars-sale/index.html` for `id="fleet"`, `carousel-track`, `wa.me/` with encodeURIComponent-encoded vehicle fields; grep home pages unchanged paths.

- [ ] **Step 3: CLAUDE.md** — short bullet line(s) (art: chevron — match existing gotcha list style) describing: new collection, controlled fallback, `fleet_section` subheadline label wiring, CMS field registration mechanism for changing pages future editors.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/superpowers/specs/2026-10-24-currently-selling-section-design.md docs/superpowers/plans/2026-10-24-currently-selling-section.md
git commit -m "docs: currently-selling section landed (plan/design refs + gotchas)"
```
