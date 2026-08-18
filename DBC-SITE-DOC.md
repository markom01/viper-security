# DB Custom Garage — Site Document (DBC-SITE-DOC)

Single authoritative reference for the DB Custom Garage site (`sites/dbc`).
Merges three prior documents — **client requirement**, **expansion plan**, **research** —
into one site-driving document. Verified against the actual repo state on **2026-08-15**.

Sources folded in:
- `final-decisions_message-sent-to-client.md` → §2 (client requirement)
- `DBC-EXPANSION-PLAN.md` → §6 (planned expansion)
- `RESEARCH-DBC-DB-CUSTOM-GARAGE.md` → §3–§5 (business identity, live state, images)

Scope rule: **everything that drives the DBC site**. VIPER Security (`sites/viper`) content,
third-party registry/dealership/personal research, and company-history detail are excluded —
see §7 for what was cut and why.

---

## 1. What this is

| Item | Value |
|---|---|
| Site | DB Custom Garage |
| Repo dir | `sites/dbc` |
| Live URL | https://dbcustomgarage.netlify.app |
| Old site (Wix, still up) | https://dbcustomgarage.com |
| Stack | Astro 7 static, Tailwind v4, shared `@garage/shared` package |
| Deploy | Netlify, push `main` → auto-build (`npm run build --workspace=@garage/dbc` → `dist-dbc`) |

---

## 2. Client requirement (final decisions)

> Original instruction from client (Serbian, preserved). The build spec.

Pages wanted: **Home, Supercar transport, Car & motorcycle auction and sale, Import/export
of cars, Customizing & design projects.**

> **No standalone `/services` page.** "Services" in the client's list is the **Services
> section that appears on every page** ("Services info — what falls under that service"),
> not a separate route. (Clarified by client 2026-08-15.)

Every page uses the same section structure as VIPER Security **except** pricing and
membership. Each page carries:

- A **lead form with service-specific fields**, wired to **WhatsApp** — the client's submitted
  fields arrive via WhatsApp.
- An **About** section about that service.
- **Services** info — what falls under that service.
- **Why Choose Us**, **How It Works**, and a **Footer** with extra information.
  (`Why Choose Us` is a section on **every** page — client confirmed 2026-08-15.)

Plus:

- A **Gallery** page with all images **categorised by service**.
- An **Admin** page to edit text and images (as on VIPER Security).

### Client clarifications (2026-08-15) — motorcycles, repair, armored

- **Motorcycles** are in scope across **three** pages:
  - *Car & Motorcycle Auction and Sale* (as named)
  - *Import & Export of Cars* → **include motorcycles** ("Import/Export of Cars & Motorcycles")
  - *Customizing & Design Projects*
- **Repair** is mentioned **only** on the *Customizing & Design Projects* page.
- **Armored vehicles** (up to B7) are **VIPER Security's** future page — **not** a DBC service.

---

## 3. Business identity (verified)

| Field | Value | Source |
|---|---|---|
| Name | DB Custom Garage | Wix + Netlify |
| Legal entity | **DB Custom Garage Design S.L.U.** | Wix footer / `/contacts` title / `/request-a-quote` title |
| Founder / principal | **Dragan Meseldzija** | Wix /about-1, /services-4 |
| Email | **dbcustomgarage@gmail.com** | Wix footer (sitewide) |
| Active since | **2010** (auctions) | Wix /classic |
| Experience claim | ⛔ **drop "25+ years"** — it was Dragan's personal industry experience, not the company's. Use "Since 2010" only (decision 2026-08-15). | — |
| Entity-alias note | "…Garage **Design** S.L.U." (Wix) vs "…Garage **Desing** SL." (Spanish registry) — same Dragan-led business | §8 research |

### Contact numbers + locations

| Location | Number | Type |
|---|---|---|
| Marbella, Spain | `+34 637 137 730` | **phone — sitewide footer today (live, universal)** |
| Marbella, Spain | `+34 670 038 541` | phone (old header / auction page; Spain) |
| Marbella, Spain | `+34 675 281 675` | phone (old header) |
| Milan, Italy | `+39 349 663 8171` | phone (old header / auction page; Italy) |
| Westfield, NJ, USA | `+1 954 914 1268` | phone (old header) |
| — | `+34 617 201 441` | **WhatsApp** (sitewide footer link + old product page) |

Footer contact block (identical on every Wix page): Phone `tel:+34637137730` · Email
`dbcustomgarage@gmail.com` · WhatsApp `api.whatsapp.com/send?phone=34617201441` · Instagram
(links back to dbcustomgarage.com root — no real handle).

Physical address (old Wix booking page): **Camino de Campanales 6, 29651 Las Lagunas de
Mijas, Málaga, Spain**. Two spellings on the same page ("Campanales"/"Campanalas"),
"Mijas 29651". Booking: "Only with appointment." Full addresses not published elsewhere
`[unverified]`.

### Instagram

Main handle confirmed: **[@dbcustomgarage](https://www.instagram.com/dbcustomgarage/)** —
profile "Design, automotive design, industrial design. Supercars and Classic cars scout.
Supercars and Luxury cars transport." Active into 2026. (Activity timeline + personal
founder account removed — not DBC-site content.)

---

## 4. Current site state (live, verified 2026-08-15)

### Pages

| Route | File | Notes |
|---|---|---|
| `/` | `index.astro` | home — all sections on one page |
| `/gallery` | `gallery.astro` | image grid grouped by category + PhotoSwipe lightbox |
| `/admin` | `admin.astro` | Decap CMS shell |
| `/404` | `404.astro` | branded 404 |
| `/services/[slug]` | `services/[slug].astro` | **5 service pages** (supercar-transport, auction, off-market-sourcing, import-export, customizing) — shared section stack, per-service copy/images |
| `/privacy-policy` | — | still 404 (open) |

**No standalone `/services` listing** — Services is a section on each page. **Service pages are LIVE** (built 2026-08-15).

### Content collections (5)

| Collection | Files | Contents |
|---|---|---|
| `hero` | `hero/hero.md` | `brand_name="DB Custom Garage"`, `tagline="Supercars & Classics, No Limits"`, subtitle, `cta_text="View Our Fleet"`. **No hero_image set** (H5). |
| `how-it-works` | `how-it-works/garage-steps.md` | 3 steps: "Share Your Vision", "We Build", "Drive It Home" |
| `services` | `services/services.md` | 5 offerings — region/title/description only |
| `gallery` | `gallery/gallery-01..18.md` | 18 curated images, all with `category` |
| `page-content` | `page-content/content.md` | jsonld, seo, stats, cta, bottomcta, branding, about, labels |

**Stats (copy decisions):** removed `25+ Years of Industry Experience` (founder's experience,
not company age) and `500+ Vehicles Moved` (unverified — no old-site source). Remaining
`3 Locations — Europe & USA`. **Add a "Since 2010" stat** to replace them (decision 2026-08-15).

### The 5 services (as-wired titles)

1. Enclosed Supercar Transport
2. Classic Cars & Motorcycles Sale & Auction
3. Off-Market Sourcing & Consulting
4. Import & Export Logistics
5. Automotive Customizing & Design Projects

### Site identity config (`src/config/site.ts`)

```
name: "DB Custom Garage"
shortName: "DB Garage"        ← ⚠️ brand is "DB Custom Garage"; "DB Garage" invented by current site (research has no such short name)
description: "DB Custom Garage — supercar and classic car transport, sale & auction, import/export logistics, and bespoke customizing and design."
                              ← research-aligned (2026-08-15): removed unsupported "restorations / performance tuning".
url: "https://dbcustomgarage.netlify.app"
themeColor: "#ea580c"
bgColor: "#000000"
whatsappNumber: "34617201441"   ← wired (RESEARCH §1): wa.me path active (B2 fixed)
```

`content.md` jsonld: `org_name` / `org_url` / `org_logo` / `webSiteName` / `webSiteUrl`
populated; **`phoneSpain: "+34 637 137 730"`, `phoneItaly: "+39 349 663 8171"`** — wired
2026-08-15 (footer + JSON-LD render both).

### Sections in use

`index.astro` passes props to the 7 shared section components: **Hero, StatsSection,
AboutSection, Services, HowItWorks, CtaBanner, BottomCta**. Marquee / Fleet / Pricing /
Membership / ImageCarousel exist in `packages/shared` but are **not** used by DBC.
`<Services marbella={services} milano={services} />` — no per-service overrides.

### Gallery

- Key field is **`category`** (enum: `brand | supercar | customizing | auction | import-export |
  all-builds`), **not** `service_group` as the old plan assumed. Every one of the 18 files has it.
- `gallery.astro` groups by `category` (sections ordered brand/supercar/customizing/auction/
  import-export/all-builds) and opens a PhotoSwipe lightbox per group.

### Security / headers

- CSP lives solely in `netlify.toml` (strict `/*` + lax `/admin/*` for Sveltia/Decap CDN;
  no `unsafe-eval`). `_headers` carries non-CSP headers only (HSTS, nosniff, DENY, Referrer,
  Permissions-Policy).

---

## 5. Gallery & image inventory

### Curated gallery (18, in repo `gallery-01..18.md`)

Car builds, transport shots, and project photos extracted from the old Wix homepage, shop,
product pages, and content sections. Category distribution across all curated files:
`all-builds` 62 · `supercar` 29 · `customizing` 24 · `brand` 7 (per category labels; the 18
curated entries are the live gallery).

### Downloaded images (`sites/dbc/public/images/from-wix/`)

All from old Wix `static.wixstatic.com/media/`, converted to WebP.

| File | Size | Use |
|---|---|---|
| `logo.webp` | 108 KB | site logo / favicon source |
| `hero.webp` | 96 KB | main hero background |
| `about-hero.webp` | 96 KB | about section hero |
| `classic-hero.webp` | 217 KB | classic/auction hero |
| `about.webp` | 416 KB | about section image |
| `auction-hero.webp` | 645 KB | auction hero |
| `stats-bg.webp` | 1.0 MB | stats background |
| `hummer-project.webp` | 227 KB | Hummer resto project |
| `armored-vehicles.webp` | 189 KB | armored vehicles showcase |
| `concept-design.webp` | 61 KB | concept design service |
| `import-export.webp` | 240 KB | import/export logistics |

Original ~110 raw downloads (5 MB+ PNG/JPG originals deleted after WebP conversion to avoid
PWA precache bloat).

---

## 6. Expansion plan (mostly shipped 2026-08-15)

The service-page architecture below was **implemented** on 2026-08-15. What remains is
content/CMS polish, not build work.

### Target pages

| Page | Route | Purpose | Status |
|---|---|---|---|
| Home | `/` | overview | live |
| Supercar Transport | `/services/supercar-transport` | detail | **built** |
| Car & Motorcycle Auction & Sale | `/services/auction` | detail | **built** |
| Off-Market Sourcing & Consulting | `/services/off-market-sourcing` | detail | **built** |
| Import & Export of Cars | `/services/import-export` | detail | **built** |
| Customizing & Design Projects | `/services/customizing` | detail | **built** |
| Gallery | `/gallery` | build photos grouped by service + lightbox | live |
| Admin | `/admin` | edit content | live |

Built as **one `services/[slug].astro`** with `getStaticPaths()` over the `services.md`
offerings array → 5 static routes. Same shared section stack on every page; only per-service
copy/images differ. **Why Choose Us = the `bottomcta` section** (heading + checkmark
`values[]` band) — confirmed, not a new component.

All pages use the VIPER section structure (Hero → About → Services → Stats → **Why Choose
Us** → How It Works → CTA → Bottom CTA) except **Gallery**. **Why Choose Us is required as a
section on every page** (client spec, confirmed). Pricing/Membership excluded — DBC does
custom builds, not fixed rates or tiers. Each page carries a WhatsApp-connected lead form
with service-specific fields.

**Page scoping (client confirmed):** *Import & Export* covers **cars & motorcycles**;
*Customizing* also mentions **repair**; *Auction* is **cars & motorcycles**. See §2
clarifications.

### Key structural decision — service-specific content (Option 3)

Blocking issue: `page-content/content.md` is a **single** entry (DBC destructures
`[pageContentEntry]` — only one file allowed), so service pages can't override generic
Hero/About text via page-content.

**Recommended: Option 3** — extend the `services` collection `offerings` schema with optional
per-service frontmatter, so each service page fetches its offering by slug and passes
override props to Hero/AboutSection. **No new collection.** Schema additions (5 optional
fields):

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
      z.object({ label: z.string(), placeholder: z.string().optional(), name: z.string() }),
    ).optional(),
  }),
),
```

CMS `config.yml` services fields get matching optional inputs. Service pages fetch offering
by slug, pass overrides into Hero/AboutSection + form-field labels.

**Status: SHIPPED 2026-08-15** — extended `ServiceOffering` type + both sites' services
schemas with `slug / seo / hero / about_text / about_image / marquee / include / bottomcta /
form_fields`, and built `services/[slug].astro` on both sites. **No fallbacks:** per-service
sections render only from their own frontmatter — a section without data is hidden, never
home-copy fallback. `Hero.astro` renders `form_fields` as extra form inputs (appended to the
WhatsApp message); `about_image` gives the About section an image. Browser-verified all 5
DBC pages (fields, images, marquee, no home leak, zero console errors).

### New-page dev effort

| Page | Files | Effort |
|---|---|---|
| 4 service pages | 4 `.astro` + schema additions | M — service-specific Hero/About overrides |
| Gallery grouped | (done — uses `category`) | — |

> No `/services` listing page — the Services **section** lives on each page (client 2026-08-15).

### Honest naming correction

The plan calls the gallery grouping field `service_group`; **the shipped key is `category`**
(enum brand/supercar/customizing/auction/import-export/all-builds). Match against that when
building service pages, not `service_group`.

---

## 7. Audit status (DBC-relevant)

### Fixed / resolved

| ID | Issue | Status |
|---|---|---|
| H1 | JSON-LD `telephone:["",""]` | Fixed — BaseLayout filters empties |
| H4 / H3 | DBC og:image | Fixed — `/images/og-dbc.webp` live |
| H10 | `map_embed_url` unvalidated | Fixed — regex in content.schema |
| H2 | SW precaches 8MB gallery | Fixed — webp dropped from precache glob |
| M6 | Admin indexable | Fixed — noindex + robots disallow |
| M9 | npm audit vulns | Fixed — sharp override |
| B1 | CMS config.yml relative paths | Fixed — absolute paths |
| M3 | HowItWorks empty h2 | Fixed — heading in content.md |
| M5 | No DBC 404 | Fixed — `404.astro` exists |
| **B2** | Contact form dead (no phone/WhatsApp) | **Fixed 2026-08-15** — wired `site.ts whatsappNumber=34617201441`, jsonld phoneSpain `+34 637 137 730` / phoneItaly `+39 349 663 8171`. Hero form wa.me path live; footer shows both numbers. **Browser-verified.** |

### Open — needs client decision

| ID | Issue | Note |
|---|---|---|
| **H5** | Hero has no background image | **Open.** `hero.md` sets no `hero_image`. Use `from-wix/hero.webp` or confirm text-only. |
| **H11** | DBC CMS writes to shared `markom01/viper-security` repo | **Open.** Both VIPER + DBC CMS target the same repo/branch `main`. Accept or split to a DBC repo. |
| — | Footer social links | **Stale in docs** — social block is now **commented out** in `Footer.astro`; nothing renders. When re-enabled, point at real handles (@dbcustomgarage) not bare roots. |
| — | **Stats: "25+ Years" + "500+ Vehicles" removed** | Decisions: drop 25+ (founder exp, not company age) and 500+ (unverified). Keep "3 Locations"; add a "Since 2010" stat. |
| — | ~~**"Why Choose Us" section missing"**~~ | **Resolved** — Why Choose Us **is** the `bottomcta` band (heading + checkmark `values[]`); present on every page incl. service pages. |
| — | ~~**Service page copy thin**~~ | **Resolved** — per-service Hero/About/Includes/Why-Choose-Us/Marquee copy + images filled in `services.md` (2026-08-15). |
| — | `/privacy-policy` 404 | **Open.** No DBC privacy page/content; add if needed (VIPER owns the existing one). |
| — | Per-service grouping labels | services all `region: Garage` — add per-service labels if grouping by service. |

---

## 8. Excluded from this doc (deliberately)

What was cut and why (kept this doc site-driving only):

- **VIPER Security content** — "Luxury VIP private security transfer" (Mercedes S-Class
  chauffeur, hourly €120–€950, SILVER/GOLD/PLATINUM membership) is VIPER's offer, already
  on `sites/viper`. Do **not** add a chauffeur/VIP service to DBC.
- **Dropped old-site services** (not carried to new site, per §6 redesign): Harley/Indian
  customization, industrial design, EV chargers/power stations, wood homes, tattoo-studio
  collab, Hummer/Jeep builds, mallorca tours.
- **Armored vehicles (B7)** — excluded from DBC; **future VIPER page** (decision 2026-08-15,
  saved to memory `armored-vehicles-viper`). Not a DBC service.
- **Motorcycles** — NOT dropped; in scope for Auction, Import/Export (cars & motorcycles),
  and Customizing (§2 clarifications).
- **Repair** — not a standalone service; mentioned only on the *Customizing & Design
  Projects* page.
- **Third-party registry / dealership / shop / founder-personal research** — documents the
  company/individual, not the DBC site.
- **Full verbatim Wix copy dump** — the source copy bank lives in the research doc
  (`RESEARCH-DBC-DB-CUSTOM-GARAGE.md` §10) if raw old-site text is needed for copywriting.

---

## 9. To-dos for `sites/dbc` (checked against live state)

1. ~~**Wire real contact**~~ **Done 2026-08-15** — `site.ts whatsappNumber=34617201441`,
   jsonld phoneSpain `+34 637 137 730` / phoneItaly `+39 349 663 8171`. Browser-verified.
2. **H5** — add a hero background image or explicitly confirm text-only.
3. **H11** — decide CMS repo split (shared vs DBC-specific).
4. **Footer** — decide social-link handling (currently commented out).
5. **Stats copy** — "25+ Years" + "500+ Vehicles Moved" removed; add a "Since 2010" stat (§7).
6. ~~**Expansion** — build the 4 service pages~~ **Done 2026-08-15** — 5 service pages live
   via `services/[slug].astro` + per-service copy/images. Why Choose Us = `bottomcta` band on each.
7. **Privacy** — add `/privacy-policy` if the client wants one.

---

## 10. Copy matrix — every section, every page

Ready-to-use copy per page and per section. Pages: **Home + 4 service pages** (no standalone
`/services` — Services is a section on each page, §2). The **section set** is identical on
every page: Hero (+lead form) → About → **Services/Includes** → **Why Choose Us** → Stats
(Home only) → How It Works → CTA → Bottom CTA → Footer. Gallery groups images by service
(no per-service body copy).

Blocks marked **shared** are reused verbatim across pages. `[CLIENT]` = needs client input
on final wording. No "25+ years" claims (decision). Derived from
`RESEARCH-DBC-DB-CUSTOM-GARAGE.md` §10/§5, cleaned but faithful; contact block from §3.

---

### A. Home (`/`)

| Section | Copy |
|---|---|
| **Hero tagline** | Supercars & Classics, No Limits |
| **Hero subtitle** | Enclosed supercar transport, import/export logistics, and off-market buying and selling across Europe. |
| **Hero CTA** | View Our Fleet |
| **About heading** | About DB Custom Garage |
| **About text** | Founded by Dragan Meseldzija, DB Custom Garage is built on a team that never gives up — bringing results in automotive design, customising Harley Davidson and Indian motorcycles, industrial design, and enclosed supercar and classic car transport. Active since 2010 and operating from Marbella, Milan, and New Jersey, we combine precision logistics with deep automotive and design market knowledge for collectors, dealers, and enthusiasts. *(live, research-aligned)* |
| **Stats (3)** | 3 Locations — Europe & USA · *(add "Since 2010" — replace removed 25+/500+, §7)* |
| **Why Choose Us** | We move, source and sell the vehicles the rest of the industry won't touch — enclosed, insured transport, classic and supercar auctions, import/export and one-off builds. Operated since 2010 from three locations (Marbella, Milan, New Jersey) by the team doing the work. `[CLIENT]` |
| **How It Works** | Share Your Vision → We Build → Drive It Home |
| **CTA** | Ready to Move, Sell, or Build? / Tell us what you are buying, selling, or transporting and we will handle the rest. |
| **Bottom CTA** | Your Dream Car Starts Here |
| **Footer blurb** | DB Custom Garage specialises in supercar and classic car transport, sale, auction and bespoke design, operating from Marbella, Milan and New Jersey since 2010. |
| **Lead form** | Name · Phone · Service (select) · Deadline · Message |

---

### B. 1 · Enclosed Supercar Transport (`/services/supercar-transport`)

| Section | Copy |
|---|---|
| **Hero** | Fully enclosed, insured and tracked transport for supercars, exotics and one-offs — across Europe and worldwide. |
| **Hero CTA** | Get A Quote |
| **About** | Enclosed transport with our own trucks and enclosed vehicles — fully insured, secure, safe and clean — all over Europe and the USA. |
| **Includes (Services)** | Enclosed trailers/trucks (full insurance) · EU, UK & USA routes · door-to-door · pricing from €1/km both directions `[CLIENT — confirm pricing]` |
| **Why Choose Us** | Fully enclosed (never open-deck) · fully insured · tracked door-to-door · founder-led team since 2010. |
| **Lead form** | Name · Phone · **Origin** · **Destination** · Date · Message |
| **How It Works** | Quote → Collect & secure-load → Enclosed transit → Delivery |
| **CTA** | Ready to move a supercar? / Tell us the route and we'll quote it. |
| **Bottom CTA** | Your car, transported door-to-door. |
| **Footer** | (shared block, §3) |

---

### C. 2 · Car & Motorcycle Auction & Sale (`/services/auction`)

| Section | Copy |
|---|---|
| **Hero** | We sell your classic or supercar — without you leaving your garage. |
| **Hero CTA** | Get A Quote |
| **About** | Active since 2010 in classic and supercar auctions. We prepare your car for auction — complete description and photography — and register it on several online auctions: Catawiki, Proxibid, Silverstone, Heritage, Bonhams or Sotheby's. |
| **Includes (Services)** | Car **and motorcycle** auctions (§2) · full prep (description + photo) · multi-platform listing · consignment, you stay home |
| **Why Choose Us** | Active in auctions since 2010 · multi-platform reach · your car stays in your garage. |
| **Lead form** | Name · Phone · **Vehicle details** · **Target auction/price** · Message |
| **How It Works** | Contact us → We assess & prep your car → We list & represent → Sold, funds to you |
| **CTA** | Ready to sell? / Let's list your car on the right auction. |
| **Bottom CTA** | From your garage to the auction block. |
| **Footer** | (shared block, §3) |

---

### D. 3 · Import & Export of Cars & Motorcycles (`/services/import-export`)

| Section | Copy |
|---|---|
| **Hero** | Full-service vehicle import and export — cars **and motorcycles** — paperwork, customs, shipping and delivery handled end to end. |
| **Hero CTA** | Get A Quote |
| **About** | Complete support and logistics in buying and selling supercars, classic cars, other vehicles and motorcycles, in the EU and other continents. |
| **Includes (Services)** | Import/export paperwork · customs clearance · shipping (enclosed where needed) · final delivery · cars + motorcycles (§2) |
| **Why Choose Us** | End-to-end handled · EU + worldwide · own transport fleet. |
| **Lead form** | Name · Phone · **Origin country** · **Destination country** · Vehicle type · Message |
| **How It Works** | Requirement → Paperwork & customs → Shipping → Delivery |
| **CTA** | Importing or exporting? / Tell us the route and we'll handle the rest. |
| **Bottom CTA** | Cross-border, handled end to end. |
| **Footer** | (shared block, §3) |

---

### E. 4 · Customizing & Design Projects (`/services/customizing`)

| Section | Copy |
|---|---|
| **Hero** | Bespoke design and build — from restomod to show-grade. |
| **Hero CTA** | Get A Quote |
| **About** | An in-house design studio and build shop for custom cars and motorcycles — restomod, widebody, interior and show-grade finishing — plus general repair and maintenance. |
| **Includes (Services)** | Custom builds · body kits (e.g. Jeep Wrangler — metal bumpers, powder-coated) · design projects · **repair & maintenance** (client: mention here only, §2) · motorcycles (§2) |
| **Why Choose Us** | In-house studio + build shop · fabricate in metal · founder-led since 2010. |
| **Lead form** | Name · Phone · **Project type** · **Budget** · Message |
| **How It Works** | Share Your Vision → We Build → Drive It Home (per project) |
| **CTA** | Have a build in mind? / Tell us your vision and we'll scope it. |
| **Bottom CTA** | Your dream build, done. |
| **Footer** | (shared block, §3) |

---

### F. Gallery (`/gallery` — live, heading/intro only)

| Section | Copy |
|---|---|
| **Heading** | Selected Builds From Our Garage |
| **Intro** | A look at the supercars, classics and customs we've transported, sourced and created. |
| **Groups** | brand · supercar · customizing · auction · import-export · all-builds (via `category` enum, §4) |
| **Footer** | (shared block, §3) |

---

### G. Shared blocks

**Contact block (footer, every page — §3):**
> Phone `+34 637 137 730` · Email dbcustomgarage@gmail.com · WhatsApp `+34 617 201 441` · Instagram @dbcustomgarage

**Lead form defaults (when a page has no custom fields):** Name · Phone · Service · Date · Message
