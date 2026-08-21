# Copy Review — VIPER Security + DB Custom Garage

Reviewed 2026-08-19. Scope: all public pages and sections on both sites (homes,
service detail pages, fleet, pricing, membership, about, how-it-works, CTA
banners, privacy, 404, nav, footer), sourced from the CMS markdown collections
(sole copy source of truth) plus the shared renderers. Ranked by impact.

---

## 0. Priority map

| # | Finding | Site | Impact | Effort | Status |
|---|---------|------|--------|--------|--------|
| 1 | Nav dead-ends: "Luxury Cars" + "Armoured Vehicles" → "Coming soon" placeholders | VIPER | High (live nav = live promise) | Low | SAVED |
| 2 | Footer socials link to generic `x.com/`, `tiktok.com/`, `instagram.com/` homepages, not profiles | Both | Medium (dead ends, wasted trust signals) | Low | DONE — real IG/WA |
| 3 | Hero CTAs are empty superlatives ("BEST LUXURY SERVICE") instead of credence/action | VIPER | Medium | Low | DONE — "Book Your Transfer" |
| 4 | Stats contradict each other: "World-Class" + "1 Dedicated Chauffeur" + one-car fleet | VIPER | High (credibility) | Medium | DONE — "one trusted hand" |
| 5 | Route pricing hollow: several routes carry no price → "instant price estimate" promise breaks; €280 Malaga→Marbella vs €120/hr hourly card feels off | VIPER | High (conversion integrity) | Medium | SAVED |
| 6 | Membership value story never stated (Gold 40h/€3,500 ≈ 27% off hourly; the math is the sell) | VIPER | Medium | Low | DONE — math note |
| 7 | SEO targets generic "luxury chauffeur", misses the high-intent geo queries competitors rank on ("malaga airport transfer marbella", "vip transfer costa del sol") | VIPER | Medium | Medium | DONE — geo titles/desc |
| 8 | DBC home "How It Works" steps are all customizing-oriented; home is transport-first → mismatch | DBC | Medium | Medium | DONE — neutral steps |
| 9 | Reach claims inconsistent per page ("across Europe" home vs "Europe and USA" / "worldwide" services) | DBC | Medium | Low | DONE — Europe & USA |
| 10 | "team that never gives up" reads as ES-English, not native EN luxury | DBC | Low–Med | Low | DONE |
| 11 | Copy grammar/register polish pass across both sites (below, ready to paste) | Both | Low | Low | SAVED |
| 12 | DBC stats "3 Locations — Europe & USA" | DBC | Med | Low | DONE — bases |
| 13 | "in the EU and other continents" | DBC | Low | Low | DONE |
| 14 | Fixed-price framing missing | Both | Med | Low | DONE |
| 15 | ogLocale es_ES with EN copy | Both | Low | Low | DONE — en_US |
| 16 | Membership value must stay in sync with pricing (not hardcoded) | VIPER | Med | Med | DONE — computed |
| 17 | Service pages reuse site-global how-it-works steps | Both | Med | Med | DONE — per-service steps |
| 18 | Privacy policies hardcoded in .astro | Both | Med | Med | DONE — CMS markdown |
| 19 | Gallery headings hardcoded | DBC | Low | Low | DONE — CMS labels |
| 20 | VIPER service pages lacked most per-offering CMS fields | VIPER | Med | Med | DONE — full field set |
| 21 | VIPER UI labels not CMS-editable | VIPER | Low | Med | DONE — labels block |

---

## 1. VIPER Security

### 1.1 Hero — subtitle is a salad, CTA empty

Current subtitle:

> Travel in comfort, style and complete privacy in our Mercedes-Benz S-Class.
> Available for airport transfers, business travel, private events, VIP
> transportation, yacht transfers, villa transfers and exclusive experiences
> across Costa del Sol — Marbella, Northern Italy & Alps — Milano, and beyond.

Problems:
- You don't "travel in privacy" — you travel *with* privacy. Product-brochure register.
- "VIP transportation" is redundant with the tagline "VIP CHAUFFEUR".
- "and beyond" is filler; competitors name the actual second market (French Riviera, Monaco, St. Moritz — all in this repo's route data).
- No Oxford comma, mixed enumerated register, passive "Available for".

Proposed:

> Private chauffeur travel in a Mercedes-Benz S-Class — across Costa del Sol, the
> French Riviera, and Northern Italy & the Alps. Airport transfers from Malaga,
> Malpensa and Bergamo, executive meetings, villa and yacht transfers, and
> exclusive evenings out. Discreet, punctual, and tailored to your schedule.

That holds: `{vehicle}` template slot exists if the car name must stay dynamic,
but the concrete second-market names (Monaco, St. Moritz — already in the route
list) convert far better than "and beyond".

**CTA: `best_cta text "BEST LUXURY SERVICE"`** — an unprovable superlative as a
button label. Market research (see Sources) shows the trust anchors that convert
in this vertical: fixed prices, flight tracking, WhatsApp booking, door-to-door.
Swap for an action with credence:

- "Book Your Transfer" (action + implicit fixed-price)
- "Get Fixed Price" (strongest for airport-transfers intent)
- "Book on WhatsApp" (matches how the market actually books)

### 1.2 Stats block — self-contradiction

Row is: `15+ Years Driving Experience` / `100+ Happy Clients` / `1 Dedicated
Chauffeur` / `24/7 Availability`.

The "1 Dedicated Chauffeur" stat is honest and reads small-time inside a
"World-Class … Meticulously Tailored to Perfection" page. It also disagrees with
the About page and pricing card which imply a team. Two coherent options:

1. **Embrace boutique**: `One Standard, One Chauffeur` → play it as exclusivity —
   "Every journey driven by the same trusted hand." Luxury buyers accept this
   framing and it converts well.
2. **De-emphasize**: drop the count, keep a capability row —
   `Bilingual Chauffeur • Flight-Tracked Pickups • 24/7 On Call`.

The current "World-Class ... Tailored to Perfection" heading also double-stacks
adverbs. Proposed goal, concrete: **"Discreet Luxury, Tailored to Every
Journey."** Four words, no claim to prove, premium register.

### 1.3 Pricing card vs route card — same ride, two prices

Hourly: `1 Hour €120 · 2 Hours €220 · 4 Hours €400`. But Malaga Airport →
Marbella is a ~45-minute drive priced **€280** in the booking data. A luxury
buyer who reads both (and they do) gets two conflicting price signals for one
journey. Either hourly includes the vehicle positioning/round-trip model and the
route card is a flat door-to-door rate (add one clarifying line — "flat rate,
door to door"), or align. At minimum **state the model**: `"Airport rate: flat
per route, driver and fuel included."`

### 1.4 Route pricing is hollow — "instant price estimate" breaks

Several routes carry no price at all (`price: ""` or the key absent):
Malaga Airport → Gibraltar, Gibraltar Airport → Marbella has €400, Milano Airport
→ Nice, Milano Airport → Lago di Garda, and every Yacht/Villa/Business/Nightlife
route. The hero form advertises an instant estimate; for those it will silently
render blank. Options, cheapest first:
- Render "Price on request" instead of blank.
- Or drop the no-price routes from the dropdown (they're a subset).
- **Strategy note**: "Malaga → Gibraltar" reads odd for a Costa del Sol operator
  (Gibraltar is west, border-heavy). Either reposition or drop.

### 1.5 Membership — the numbers are the sell, and they're not told

Gold: 40h/€3,500 = €87.5/hr effective, **≈27% cheaper** than buying hourly at
€120. Platinum: 80h/€5,900 = €73.75/hr. That math is the entire pitch and it's
nowhere on the page. Add one line under the tiers:

> Gold pays for itself at 33 hours; Platinum halves your per-hour rate.

Also define the terms the card raises: what "hours annually" means, rollover,
which vehicle, min commitment. Luxury memberships convert on clarity, not
mystery.

### 1.6 SEO — targeting the phrase you can't win instead of the one you can

Current titles: `VIPER Security — Luxury Chauffeur & VIP Transport`, services
titled generically (`Airport Transfers | VIPER Security`). Competitor landscape
researched today dominates on geo phrase-matches (Sources):
- `Marbella Chauffeur — transfersvipmalaga.com`
- `Marbella Airport Transfers — viptaxiluxury.com`
- `Luxury Chauffeur & Private Transfers Malaga Airport — transfertomarbella.com`

The repo already *owns* the geo data — 6 explicit Malaga/Costa del Sol routes
and 6 Northern-Italy routes — but no page or title exposes it. Concrete:
- Service-page H1/subtitle "Airport Transfers" → **"Airport Transfers — Malaga &
  Milano"** and include the specific route names (Malpensa → St. Moritz) in the
  hero subtitle + meta description.
- Home SEO title → lead with geography: `Luxury Chauffeur Marbella & Milano |
  VIPER Security`.
- Each service page meta description should carry one real route, not a
  paraphrase: "…Malpensa Airport to St. Moritz private transfer."

### 1.7 Nav dead-ends

`/luxury-cars` and `/armoured-vehicles` are placeholder pages ("Coming soon.")
live in the primary menu of a luxury brand. Memory confirms armored vehicles is
genuinely a later VIPER page — fine — but until it ships, **remove both from the
navbar** (armored recommended by research to be a separately-branded future
page, keeping it out of today's nav costs nothing). A "Coming soon." on a live
luxury site reads like abandonment.

### 1.8 Footer socials

All four icons link to the platform homepages (`x.com/`, `tiktok.com/`,
`instagram.com/`, `whatsapp.com/`) — generic dead ends, no profile. A real
operator has real WhatsApp + phone; the WhatsApp icon pointing at whatsapp.com
teaches nobody anything. Either wire real profile URLs or drop the three
social-platform icons and keep WhatsApp/Call.

### 1.9 About / CTA / BottomCTA polish drops

- About heading → `Discreet Luxury, Tailored to Every Journey.`
- Stats subheading drops "commitment to excellence"; replaces with a concrete:
  `Every pickup flight-tracked, every route priced upfront, 24/7.`
- BottomCTA "Reliable Service" bullet already has the strongest copy on the
  page (flight tracking!) — promote it to the hero.

### 1.10 ogLocale mismatch (flagged, not fixed here)

Both sites emit `ogLocale="es_ES"` while all copy is English. Correct `en_US`
(or marker in exports-map per site).

---

## 2. DB Custom Garage

### 2.1 Home hero — solid, one reach mismatch

> Enclosed supercar transport, import/export logistics, and off-market buying
> and selling across Europe.

Good: specific, three concrete value props, no superlatives. One fix: home says
"across Europe" but service pages say "Europe and the USA" / "worldwide"; About
says "Marbella, Milan, and New Jersey". Visitors reconcile. Use one framing on
the hero: `…across Europe and the USA.` (matches the About + stats story).

### 2.2 "How We Build Your Dream" — the wrong story on a transport-first home

The home renders garage-build steps (Share Your Vision → We Build → Drive It
Home). But the dominant home traffic and the four service cards are transport /
auction / sourcing / import-export. A visitor who wants a car transported reads
three steps about building a custom car. Two options:
- **Per-service steps** (transport: Quote → Collect → Deliver; auction: List →
  Bidders → Sold). This repo already has per-service `form_fields` — steps can
  live on the offering objects the same way.
- **Neutral home steps** that span the offer: `Share Your Goal → We Handle It →
  Delivered.`

Option 1 matches the architecture (offerings are already per-service data).

### 2.3 Stats — "Field-Proven, Industry-Wide" is empty corporate

Row: `2010 · Serving Collectors Since` / `3 · Locations — Europe & USA`.
"Locations — Europe & USA" is wrong object (3 locations aren't Europe and
USA; the About names Marbella, Milan, New Jersey — use them). And "Industry-Wide"
is a claim with no referent. Proposed stat block:

> 2010 · Serving Collectors Since
> Marbella · Milan · New Jersey — Three Bases, One Standard

### 2.4 About — ES-English polish

> …built on a team that never gives up — bringing results…

That's a Serbian construct (ekipa koja ne odustaje) rendered literally; it reads
as non-native to an EN luxury prospect. Keep the authenticity (naming Dragan,
the 2010 inception, the disciplines) but restate the line:

> Founded by Dragan Meseldzija, DB Custom Garage brings together fifteen years
> of automotive design, customizing for Harley-Davidson and Indian motorcycles,
> industrial design, and enclosed supercar and classic car transport. Based in
> Marbella, Milan, and New Jersey, we combine precision logistics with deep
> market knowledge for collectors, dealers, and enthusiasts.

(Specificity here — names, disciplines, bases — is the trust signal; keep it
all.)

### 2.5 Per-service copy drops (all in `sites/dbc/src/content/services/services.md`)

**Enclosed Supercar Transport**
- Include "EU, UK & USA Routes" text: "…across Europe and worldwide." →
  inconsistent. → `"Door-to-door across Europe, the UK, and the USA."`
- "Transparent Pricing — price from €1/km, calculated both directions" →
  `"Flat per-route quotes from €1/km — door to door, both directions."`

**Classic Cars & Motorcycles Sale & Auction**
- Good specificity (Catawiki, Proxibid, Silverstone, Heritage, Bonhams). One
  polish: "consignment without leaving your garage" + "you stay home" repeats
  twice across the include list and bottom CTA — keep one, vary the other.

**Off-Market Sourcing**
- "with deep market knowledge built since 2010" — "built since 2010" is
  redundant with the 2010 stat on the same page; drop, keep the research/legal
  framing.

**Import & Export**
- About: "…in the EU and other continents." — EU isn't a continent; → `"…
  across Europe and beyond — cars, motorcycles, classics, and supercars."`

**Customizing**
- Strong. "Restomod, widebody, interior and show-grade finishing" is exactly
  right. No changes, just a note: this services page and the home "How It Works"
  overlap in message (see 2.2).

### 2.6 DBC footer socials

Same generic platform-home links as VIPER (shared Footer component). Same fix:
real profiles or drop social icons, keep WhatsApp/Call. The garage's enquiry
drives through WhatsApp (site.whatsappNumber) — the footer should put that
number on the face of a button, not bury it behind a whatsapp.com icon.

---

## 3. Cross-site mechanics

1. **"Fixed price, no surprises" is the vertical's winning framing (research)**
   and neither site states it anywhere. One line each:
   - VIPER: `"Every transfer quoted upfront — fixed price, driver included."`
   - DBC: `"Flat per-route quotes — what you see is what you pay."`
2. **Both hero forms already open WhatsApp** — right call for the market. Keep.
   Confirm the success message matches what happens (DBC "We will get back to
   you shortly" while WhatsApp opens immediately — align the copy to the
   action).
3. **Four service-page titles repeat "Supercars & Classics, No Limits"** — the
   hero of every DBC service page uses the same tagline. Differentiation per
   page aids SEO + scannability (each page already has a `marquee` string doing
   real work — reuse it in the hero tagline).

---

## 4. Sources

- `transfersvipmalaga.com/marbella-chauffeur` — competitor geo-page structure
- `viptaxiluxury.com/marbella-airport-transfers` — fixed-price + WhatsApp booking
- `transfertomarbella.com` — Malaga airport fixed-rate transfer pricing content
- `marbellavipchauffeur.com` — WhatsApp-first booking + Maybach/V-Class framing
- `jafexecutivetravels.com/blog/impressing-clients-with-luxury-transport` —
  chauffeur-as-brand-ambassador angle

---

*All copy ships through the CMS markdown collections — every drop above is a
paste-into-frontmatter, no renderer change. Structural items (per-service
steps 2.2, geo service pages 1.6) touch config/renderers and should be planned
separately.*
---

## 5. Round 2 — computed values + CMS-editable copy (2026-08-19)

### 5.1 Membership value now computed, not hardcoded (#16)
Hardcoded "pays for itself at 33 hours" removed. New `packages/shared/src/config/membership.ts`
computes the note from live data:
- `parsePrice` strips currency → number.
- `baseHourly` = first `pricing.hourly.rates[].price`.
- `membershipValueNote(tiers, rates)` → max savings % across tiers with an `hours` field.
- Tiers gained a numeric `hours` (schema + CMS + tiers.md). Rendering: index.astro computes
  the note and passes `note` to Membership; ServicePage computes it internally from `hourly`
  + `membershipTiers`. Result: "Members save up to 39% compared to the €120/hr hourly rate."
  Change the hourly price or any tier price/hours and the line re-syncs on next build.

### 5.2 Service-specific How-It-Works steps (#17)
Offerings now carry optional `steps[]` (both sites' schema + CMS widget). ServicePage renders
`offering.steps` when present, falls back to the site-global `how-it-works` steps otherwise.
Per-service steps added to all 4 VIPER + 5 DBC services. Audited the other ServicePage
sections: hero/marquee/about/includes/fleet/stats/bottomcta were already per-offering; steps
was the only one still global.

### 5.3 Privacy policies → CMS markdown (#18)
Both sites: new `privacy` collection (`src/content/privacy/content.md`), `privacy-policy.astro`
renders via `render()` + `<Content/>`, style selectors converted to `:global`. CMS collection
added (`Policy Body` markdown widget). Same legal copy preserved, now editable in admin.

### 5.4 Gallery + VIPER UI copy → CMS (#19–21)
- DBC gallery: heading/subheadline/group titles now from `STRINGS.gallery` overridden by CMS
  labels (`gallery_heading`, `gallery_subheadline`, `gallery_group_*`). gallery.astro
  normalizes underscore CMS keys to dot-path before resolveLabels.
- VIPER services CMS: expanded from 4 fields to the full per-offering set (seo, hero,
  about_text/image, marquee, steps, include, form_fields, bottomcta).
- VIPER page-content CMS gained a `labels` block (nav/hero/form/buttons) — VIPER UI text now
  CMS-editable like DBC.
- "Coming soon." placeholder pages left as-is (noindex placeholders slated for real content).

### CMS coverage summary
- Each site's copy lives in content collections: hero, how-it-works, services, pricing,
  membership, page-content (+ privacy, gallery). Every field is exposed via the Sveltia
  config.yml. Remaining non-CMS copy: shared STRINGS tech strings (nav aria, error fallbacks,
  buttons when a site doesn't override), and the "Coming soon." placeholders.

## 6. Round 3 — every service-page section is service-specific (2026-08-19)

Audited each section rendered by the shared ServicePage against whether it pulls
per-offering or site-global data:

| Section | Before | After |
|---|---|---|
| Hero | offering.hero | ✅ unchanged |
| Marquee | offering.marquee | ✅ unchanged |
| About | offering.about_text/image | ✅ unchanged |
| Services/Includes | VIPER: **all 4 offerings on every page** | ✅ per-service `include[]` |
| Fleet | VIPER full collection / DBC per-offering | ✅ unchanged |
| Stats | **global subheading/items** | ✅ per-service `stats{}` |
| HowItWorks | offering.steps (round 2) | ✅ unchanged |
| Pricing / Membership | site-global (product) | ✅ intentional |
| CTA Banner | **global heading/text** | ✅ per-service `cta{}` |
| BottomCTA | VIPER global / DBC per-offering | ✅ unchanged |

Changes:
- Offerings gained optional `stats { subheading, items[] }` + `cta { heading, text }`.
- Shared ServicePage merges per-offering overrides over the site-global values
  (image falls back to the offering hero image), so the DBC `[slug].astro`
  image-swap hack was removed.
- Both content schemas + Sveltia CMS widgets (both sites) expose `stats`/`cta`
  per offering; DBC CMS gained the missing `steps` widget.
- All 9 offerings (4 VIPER + 5 DBC) got service-specific stats, CTA, and
  include cards; VIPER offerings now render their own include grid instead of
  the full services list. The VIPER `defaultServices` fallback was removed.
- Verified in dist: airport page shows "Fixed-price airport transfers…",
  "Fly In, Ride in Comfort", include cards, and per-service steps; corporate
  page no longer lists Airport Transfers; DBC transport shows its own stats/CTA.
- VIPER a11y 9/9; DBC service-page axe scan 0 critical/serious.
- YAML gotchas hit: (a) an edit that ends a list item must carry the next
  item's `- ` marker (duplicate-key errors, fixed twice), (b) unquoted numeric
  YAML labels (`4`, `2010`) fail the string schema — quote them.
