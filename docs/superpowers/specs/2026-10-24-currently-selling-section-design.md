# "Currently Selling" Section — Design

Date: 2026-10-24
Sites: `@garage/viper` + `@garage/dbc` (monorepo, shared `@garage/shared`)

## Intent

Both sale-facing service pages — DBC `services/auction` and VIPER `services/luxury-cars-sale` — should show the vehicles currently for sale, sourced from the CMS. The section reuses the design of the shared `#fleet` section (`packages/shared/src/components/sections/Fleet.astro`) and sits in the same slot that `ServicePage.astro` already gives Fleet (between About/Services and Stats). Each vehicle card gets a photo carousel (instead of one photo), a free-text description, and a WhatsApp inquiry button that pre-fills a message with the vehicle's data.

CMS editors get a smarter make/model/year input: a live dropdown sourced from the NHTSA vPIC API, implemented as a reusable Sveltia CMS **custom field type**. The lookup logic is shared, not duplicated, with the site booking forms that already do this.

## User decisions (fixed)

1. **VIPER data source — Option A**: the for-sale list lives _inside_ the `luxury-cars-sale` service entry in the CMS (`fleet[]` — schema already allows it, config doesn't expose it yet). The VIPER chauffeur `fleet` collection is a different car set and is NOT reused for selling.
2. **DBC data source — new collection**: a standalone `currently-selling` folder collection (one YAML file per vehicle), used only by the auction page.
3. **Make/model/year in CMS — custom NHTSA field**, built so the lookup logic is reusable (one shared module consumed by booking forms AND the CMS admin script).
4. **WhatsApp button**: one button under each card's data column, sending to the site's main number (DBC: `site.whatsappNumber`; VIPER: the Spain number), message carries vehicle name/year/type + description + current page URL.
5. Section heading: "Currently Selling", overridable per page in the CMS via the existing `fleet_section.heading` mechanism.

## Builder-check calls (settled here; veto anything)

1. **One combined CMS field, not three.** A single `nhtsa_vehicle` field type whose control is three selects (category → make → model → year) storing one object `{category, make, model, year}`. Rationale: Sveltia controls own their value; independent sibling fields can't reliably cross-see each other inside list items (viper Option-A stores vehicles in `fleet[]` list items — sibling reads there are unreliable). One self-contained widget works identically in collection fields (DBC) and list items (VIPER).
2. **Category select lives inside the widget** (Car/Motorcycle/All types) so motorcycles on the auction page get motorcycle makes; it is stored in the object and does not drive the card's `type` display (that stays the free-text `type` field).
3. **`name` stays the display title.** The widget's make/model/year feed the WhatsApp message (and display only as fallback data), so editors are not typing name from dropdown data.
4. **`fleet_section.subheadline` gets wired**: both `[slug].astro` monkeypatch heading AND subheadline; `Fleet.astro` reads `pageContent.fleet.subheadline` with the current strings default as fallback. No dead CMS field.
5. **Empty chauffeur rows are suppressed.** The legacy year/seats/baggage/capacity block renders only when at least one of those fields is set; sale entries carrying `specs` are unaffected. VIPER home cards (which set those fields) render exactly as today.
6. **`order` numeric field** (optional) on both collections; page sorts by order then entry id; list silhouettes in CMS unchanged. Viper per-service vehicles keep array order.
7. **DBC auction fallback**: `currently-selling` collection drives the section when non-empty; if empty, fall back to `offering.fleet[]` (so a stray fleet entry in auction.yaml still renders while the collection is being filled).

## Non-goals

- No price field, no per-country availability, no sold/archive history, no drag-ordering UI.
- No change to how the booking forms _behave_ — their NHTSA logic is extracted but results unchanged.
- VIPER home Fleet keeps working exactly as today (it gains nothing required; if someone later adds `images[]` to a fleet vehicle, it gets a carousel automatically).

## Repo facts this design leans on (verified)

- `ServicePage.astro` renders `<Fleet>` iff `hasFleet` — this is the slot both new sections occupy, same position Fleet occupies on the home page flow.
- DBC `services/[slug].astro` maps `offering.fleet[]` → `FleetEntry[]` and monkeypatches `pageContent.fleet.heading` from `fleet_section.heading` (assembler deliberately leaves it to templates — CLAUDE.md gotcha). VIPER `[slug].astro` passes no fleet today (~line 46–62 of the file).
- `fleetVehicleSchema` (`packages/shared/src/content/schemas.ts:350`) already holds name/type/year/seats/baggage/capacities/specs/features/image. `serviceDetailSchema.fleet[]` (same file, ~line 136) duplicates that shape inline.
- `ImageCarousel.astro` is self-contained (.carousel-track etc.) but hardcodes `baseId = "about-carousel"` (slide ids + dot anchors) and PhotoSwipe `group="about-carousel"`. Multiple instances on one page collide on ids/anchors; the script itself loops `querySelectorAll("[data-carousel-root]")`, so N instances work once ids are unique.
- The card layout lives in `Fleet.astro` styles (`car-card`, `car-listing-image-wrapper`, `_3-column-collection[data-count]` rules for 1/2/3+ cards).
- NHTSA fetch blocks live inline in `BookingForm.astro` (~line 671) and `DropdownInput.astro` (~line 146) as bundled `<script>` modules — they can import from `@garage/shared`.
- Sveltia CMS supports custom field types: `CMS.registerFieldType(name, control, preview?, schema?)`, React components via `CMS.React` hooks (`https://sveltiacms.app/en/docs/api/field-types`). Built-in `select` is static; `relation` only reads other CMS collections. Custom fields are loaded by scripts included on the admin page after the CMS bundle (`sites/*/src/pages/admin.astro` loads `https://unpkg.com/@sveltia/cms@0.193.0/dist/sveltia-cms.js`).
- CSP: admin page CSP is lax (`sites/viper/netlify.toml`, mirrored in `public/_headers`-style duplicates: Cloudflare `_headers`, `public/.htaccess`). `connect-src` already hosts exceptions for `vpic.nhtsa.dot.gov` on the main CSP; the `/admin/*` lax block must also whitelist vpic for the CMS field to fetch. Bookings already fetch vpic (see REVIEW notes).
- Phone sources: DBC `sites/dbc/src/config/site.ts` `whatsappNumber: "34670038541"`; VIPER site globals `jsonld.phoneSpain` (`sites/viper/src/content/site/content.yaml`) and Footer already uses `cleanPhone` to strip digits before `wa.me`.

## Implementation plan

### 1. Shared vehicle schema (one change, three consumers)

In `packages/shared/src/content/schemas.ts`:

- Extend `fleetVehicleSchema` with: `description` (string, optional), `images` (string array, optional), `order` (number, optional), and `vehicle` (optional object: `{category, make, model, year}` from the combined NHTSA widget — plain strings inside).
- Replace the inline `fleet[]` item object inside `serviceDetailSchema` with `fleetVehicleSchema` (identical shape today, so nothing YAML-visible changes; kills the duplication).
- Export a `sellingVehicleSchema` = `fleetVehicleSchema` (or just reuse it) for the DBC collection.
- Update `FleetVehicleData` type with the new fields.

### 2. DBC: new `currently-selling` collection

- `sites/dbc/src/content.config.ts`: new collection, `glob({ pattern: "*.yaml", base: "./src/content/currently-selling" })`, schema `fleetVehicleSchema`.
- `sites/dbc/public/admin/config.yml`: new collection (folder `sites/dbc/src/content/currently-selling`, `create: true`, slug `{{fields.name}}`), fields: name, vehicle (`nhtsa_vehicle` combined widget), type (string), description (text, required false), images (list of image widget — upload several, order defines carousel order), image (single image, fallback when no list), specs list, features list, order (number, optional). Keep every field non-required except `name`, so an entry can be published half-filled.
- Entry list on the page: sort by `order` asc, then entry id (builder call #6).
- `sites/dbc/src/pages/services/[slug].astro`: when slug is `auction` (compare `offering.slug ?? slugify(offering.title)`), load `getCollection("currently-selling")` and map entries to `FleetEntry[]` (id = entry.id, collection "fleet") when non-empty; fall back to `offering.fleet` mapping when the collection is empty (builder call #7). `hasFleet` follows the winner. Other service pages unchanged.
- Heading comes from `fleet_section.heading` in auction.yaml (set to "Currently Selling"); subheadline wired per builder call #4. Subheadline label key stays `fleet_subheadline`.
- Per-service `fleet` widget stays in the DBC service CMS config (other services use it); on auction it's only the fallback path.

### 3. VIPER: list inside the service entry

- `sites/viper/src/content/services/luxury-cars-sale.yaml`: add `fleet_section.heading: Currently Selling` and a `fleet:` list with 1–2 seeded vehicles to verify.
- `sites/viper/public/admin/config.yml` → service collection: add the same fleet list widget as DBC's per-service fleet (fields incl. the combined `nhtsa_vehicle` widget, description, images list, specs, features), plus `fleet_section` object (heading, subheadline). Fleet list items carry their own array order (no `order` field needed there).
- `sites/viper/src/pages/services/[slug].astro`: build `fleetVehicles` from `offering.fleet` (same mapping as DBC), gate `hasFleet`, patch `pageContent.fleet.heading` AND `.subheadline` from `fleet_section` (mirror DBC's approach — same code shape, so the two `[slug].astro` files stay symmetric), pass `whatsappPhone`.

### 4. Fleet card: carousel + description + WhatsApp

`packages/shared/src/components/sections/Fleet.astro`:

- Where the single image renders now (ZoomImage in `car-listing-image-wrapper`), render `ImageCarousel` when `d.images?.length` (alt = d.name), else keep the ZoomImage fallback on `d.image`.
- When `d.description`, render it after the name/type block (simple `<p>`, card data column).
- New optional prop `whatsappPhone?: string`. When set, render one button under `car-card-data`:
  `href = https://wa.me/<cleanPhone>?text=<encoded>`; message text (built at build time, no runtime JS): vehicle name, year (`d.vehicle?.year ?? d.year`), type, description, and the page path (`Astro.url.pathname` at build). Label from `s.fleet.waButton` (new strings key, default "Ask About This Car"), overridable via CMS labels (`fleet_waButton`).
- Legacy chauffeur stats block (year/seats/baggage/capacities) renders only when any of those fields is set (builder check #5); existing `specs` behavior unchanged.
- `ImageCarousel.astro`: add optional `id` and `group` props (defaults keep "about-carousel" behavior for about sections). Fleet passes a per-card unique `id` and a per-card unique lightbox group so PhotoSwipe arrow nav stays scoped to that card. Carousel viewport aspect stays 4/3; verify card height doesn't clip inside the card grid (`car-listing-image-wrapper` sizing tweaks scoped to `.fleet` only if needed).

### 5. Reusable NHTSA lookup + Sveltia custom field

- Extract the fetch logic shared by `BookingForm.astro` and `DropdownInput.astro` into `packages/shared/src/lib/nhtsa.js` (e.g. `getMakes(type)`, `getModels(make, year)`, `getVehicleTypes()`; in-memory cache; vpic base URL constant; tolerant of API failure). Both scripts import it; their rendered behavior stays identical (this is a refactor with a build as the test).
- New field type `nhtsa_vehicle` — one combined control (builder call #1):
  - Shared source: `packages/shared/src/admin/nhtsa-field.js` (React control via `CMS.React`; selects: category (Car/Motorcycle/All types) → make → model → year; make list from NHTSA `GetMakesForVehicleType/{car|motorcycle|other}`-style lookup reusing booking-form semantics; model options via `GetModelsForMake` (+year filter); typing filters; plain-text fallback inputs on fetch failure or blocked API).
  - Value written to YAML: plain object `{category, make, model, year}` (strings; empty parts omitted). The widget never writes asset links or blob URLs, so CMS round-trips stay editor-agnostic.
  - Loading without duplicating code: Astro endpoints `sites/viper/src/pages/admin/vehicle-lookup.js.ts` and the DBC twin build the field script with the shared module bundled (module endpoint returns JS with proper content-type). `admin.astro` on both sites gains `<script is:inline defer src="/admin/vehicle-lookup.js"></script>` after the Sveltia bundle.
  - Registration: `CMS.registerFieldType('nhtsa_vehicle', control)`; config files reference `widget: nhtsa_vehicle` for the combined vehicle field.

### 6. Labels/strings

- `packages/shared/src/config/strings.ts`: `fleet.waButton` default label (+ any new a11y labels for the carousel inside cards? none expected — carousel is reusable as-is).
- CMS labels keys (`fleet_waButton`, `fleet_subheadline`, `fleet_heading`) overridable per site as today.

### 7. CSP / headers

- Wherever the admin CSP block exists (DBC + VIPER `netlify.toml`, Cloudflare `_headers`, VIPER `public/.htaccess`), ensure `connect-src` includes `https://vpic.nhtsa.dot.gov` for `/admin/*`-scoped blocks; the main-page CSP already has it (needed by booking forms).

### 8. Verification

- `npm run build -w @garage/viper` + `npm run build -w @garage/dbc`: zero errors; `npx astro check` both.
- `npm run test:a11y -w @garage/viper` (build first).
- Manual dev: auction + luxury-cars-sale pages show the section only when entries exist; DBC other service pages unchanged (no section); VIPER armored-vehicles unchanged (no section); home Fleet unchanged; multiple cards scroll correctly with per-card carousels; WA href contains the vehicle data.
- CMS: load both admin UIs, confirm custom field loads, dropdowns populate, media library used by images list.
- Keep the CLAUDE.md film: sections render only from CMS entries; content-validation preprocessor quirks (`""/null → omit`) respected when seeding YAML.

## Left to the builder

- Exact React component technique for the admin field per Sveltia docs (HTM/JSX patterns), and the debounce/cache details of `nhtsa.js` — mirror the existing booking-form logic, don't redesign it.
- Admin endpoint implementation details (Astro static file endpoint returning JS, content-type, caching) and respect `sites/*/playwright` a11y expectations for the new section (duplicated carousels must not produce duplicate heading-order or landmark noise).
- Card style adjustments scoped to Fleet only; do not touch AboutSection carousel defaults.

## Open questions for the human partner

None outstanding — see "Builder-check calls (settled here; veto anything)" and "Left to the builder".
