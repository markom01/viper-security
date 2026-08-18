# DB Custom Garage — Deep Research (2026-08-13)

Sources: live Wix site [dbcustomgarage.com](https://dbcustomgarage.com) (old site, still up),
new Netlify site [dbcustomgarage.netlify.app](https://dbcustomgarage.netlify.app) (this repo's
`sites/dbc`), Wix sitemaps, Instagram API probes,
local repo content collections. Every fact below traced to one of those; speculative items
flagged `[unverified]`.

---

## 1. Business Identity

| Field | Old site (Wix) | New site (Netlify, this repo) |
|---|---|---|
| Name | DB Custom Garage | DB Custom Garage |
| Legal entity | **DB Custom Garage Design S.L.U.** (footer: "©2021 di DB Custom Garage Design S.L.U.") | not shown |
| Founder / principal | **Dragan Meseldzija** (named on /about-1 and transport page) | not shown |
| Email | [dbcustomgarage@gmail.com](mailto:dbcustomgarage@gmail.com) | not shown (no email anywhere on new site) |
| Since | "active from 2010" (auction page); about page says "our story… 25 years" industry experience | stats: "25+ Years of Industry Experience", "500+ Vehicles Moved", "3 Locations — Europe & USA" |
| Domain | dbcustomgarage.com | dbcustomgarage.netlify.app (old domain still live, Wix) |

Instagram: **main handle [@dbcustomgarage](https://www.instagram.com/dbcustomgarage/)** (see §8). Old site's only IG link is Wix's
default `instagram.com/wix`; new site footer links `instagram.com`, `x.com`, `tiktok.com`,
`whatsapp.com` — all bare placeholder roots, no handles. All plausible DBC handles probed
via the `web_profile_info` API returned 404, but Firecrawl's real search engine found the
live account (see §8). The "Whatsapp / Instagram" items on old product pages render as empty
icons with no target URL.

### Contact numbers (old site, header on every page)

| Location | Number | Type |
|---|---|---|
| Marbella, Spain | [`+34 670 038 541`](tel:+34670038541) | phone (primary on old site; classic + Buchungs service contact) |
| Marbella, Spain | [`+34 675 281 675`](tel:+34675281675) | phone (header) |
| Marbella, Spain | [`+34 637 137 730`](tel:+34637137730) | **phone (sitewide footer "Phone" link today)** — not in earlier crawl; newer/mobile line |
| Milan, Italy | [`+39 349 663 8171`](tel:+393496638171) | phone (header; classic page "Italy") |
| Westfield, New Jersey, USA | [`+1 954 914 1268`](tel:+19549141268) | phone (header) |
| — | [`34617201441`](tel:+34617201441) | **WhatsApp** (sitewide footer link + ancient product page) |

> Update 2026-08-15: current sitewide footer shows `Phone` (tel:+34637137730), `Email`
> (dbcustomgarage@gmail.com), `WhatsApp` (api.whatsapp.com/send?phone=34617201441),
> `Instagram` (links back to dbcustomgarage.com root, not a real handle). `+34 637 137 730`
> is live and universal now.

> New site's `sites/dbc/src/config/site.ts` has `whatsappNumber: ""` — a deliberate
> "no verified WhatsApp" state. The WhatsApp number above is now known; consider wiring it in.

### Locations

Marbella (Spain), Milan (Italy), Westfield–New Jersey (USA). Footer text on the new site:
"3 Locations — Europe & USA." Full addresses not published on either site `[unverified]`.

**Physical address (old site, booking service page):** `Camino de Campanales 6, 29651 Las
Lagunas de Mijas, Málaga, Spain` (Wix Bookings contact; page renders "Camino de Campanalas 6,
Mijas 29651 (Malaga)" and "Cam. de Campanales, 6, 29651 Las Lagunas de Mijas, Málaga, Spagna" —
two spellings on same page). Booking rules: "Only with appointmant."

---

## 2. Old site (Wix) — full page map

10 pages + 13 products + 1 service page (from `pages-sitemap.xml`,
`store-products-sitemap.xml`, `booking-services-sitemap.xml`). Menu (Italian/English mix,
Wix localization):

```
Home | DB Custom Garage Auction (→ /classic) | Supercars and Classic cars transport (→ /services-4)
| Projects (link only) | About us (→ /about-1) | Shelby Cars (→ /shelby-cars) | Contacts
| Shop | Prenota online (→ /book-online) | Negozio (→ /shop) | Altro (→ more)
```

### Pages

- **/ (Home)** ([dbcustomgarage.com](https://dbcustomgarage.com)) — "DB Custom Garage is specialised to give a clients complet support and
  logistic in selling or buying Supercars, Classic cars and werry special cars like SHELBY.
  Also we can provide new concept or limited series cars like Italdesign01, Koenigsegg,
  Lamborghini, Ferrari, Bugatti, Rimac and electric or hyper cars." [sic]
- **/about-1** ([link](https://dbcustomgarage.com/about-1)) — founder story. "Dragan Meseldzija i DB Custom Garage team never gives up…
  in the field of automotive design, customizing Harley Davidson and Indian Motorcycles,
  Industrial design and advanced design in electric vehicles and power stations and
  chargers for electric vehicles. Supercar and classic car transport and logistic with
  enclosed trailers and trucks."
- **/classic** ("DB Custom Garage Auction") ([link](https://dbcustomgarage.com/classic)) — Classic/Supercar auction services since 2010.
  Auction prep + listing on **Catawiki, Proxibid, Silverstone, Heritage, Bonhams, Sothebys** ([Catawiki](https://www.catawiki.com/), [Proxibid](https://www.proxibid.com/), [Silverstone](https://www.silverstoneauctions.com/), [Heritage](https://www.ha.com/), [Bonhams](https://www.bonhams.com/), [Sothebys](https://www.sothebys.com/)).
  "more than 25 years experience… selling your vehicle without move from your garage."
- **/shelby-cars** — placeholder page (title only, no body content).
- **/services-4** ([link](https://dbcustomgarage.com/services-4)) — enclosed transport. "transporting your cars insured secure, quick, clean
  and safe. Dragan Meseldzija" + Get-a-Quote form.
- **/contacts** — contact form only.
- **/book-online** ([link](https://dbcustomgarage.com/book-online)) — Wix Bookings. One service listed: "Automobile repair and service, 3 hours,
  20 EUR/hour + material."
- **/request-a-quote** — empty form page.
- **/shop** — 13-item Wix store catalog (see products below), Italian prices.

### Products (old Wix store, prices as listed)

| Product | Price | Notes |
|---|---|---|
| [Luxury VIP private security transfer](https://dbcustomgarage.com/product-page/luxury-vip-private-security-transfer) | €120 | **Actually VIPER Security's chauffeur offer** (Mercedes S-Class VIP transfer) — lives on the sister `sites/viper` site; not part of DBC's own services |
| [Hummer H3 Alpha V8 5.3](https://dbcustomgarage.com/product-page/hummer-h3-alpha-v8-5-3) | €30,000 | "Hummer Customizing… Total restored" |
| [Armored vehicles](https://dbcustomgarage.com/product-page/armored-vehicles) | €300,000 | "armored vehicles in several configurations. Up to **B7** level protection" |
| [Mallorca Harley Davidson tour](https://dbcustomgarage.com/product-page/mallorca-harley-davidson-tour) | €250 | (no body text) |
| Car service and repair | €20/hr | "Car Repair and maintenance" |
| [Motorcycle Transport](https://dbcustomgarage.com/product-page/motorcycle-transport) | €50 | (no body text) |
| [Wood home concept](https://dbcustomgarage.com/product-page/wood-home-concept) | €10,000 | "Wood home design by DB Custom Garage" |
| [Concept design](https://dbcustomgarage.com/product-page/concept-design) | €20,000 | "…designed and projected concepts and products automotive, industrial products, constructions, architecture and interior design" |
| [Design](https://dbcustomgarage.com/product-page/design) | €100,000 | "Industrial design and innovative energy projects" |
| [Jeep Wrangler body kit](https://dbcustomgarage.com/product-page/jeep-wrangler-body-kit) | €5,000 | "Bumpers and parts… metal, painted with powder coating process" |
| [Supercars and Classic cars provider](https://dbcustomgarage.com/product-page/supercars-and-classic-cars-provider) | €2,000 | (no body text) |
| [Supercars transport](https://dbcustomgarage.com/product-page/supercars-transport) | €2 | "EU and UK with enclosed trailer and trucks. Price from 1,00 EUR each KM calculated in both directions." |
| [Tatoo studio Gamido](https://dbcustomgarage.com/product-page/tatoo-studio-gamido) | €100 | "Gamido Tatoo, Marbella" — collab listing |

### Service page

- **/service-page/automobile-repair-and-service** ([link](https://dbcustomgarage.com/service-page/automobile-repair-and-service)) — Wix Bookings service, 3h / 20 EUR/hr + material.

> Note: some product titles/descriptions are truncated on crawl (first char eaten by Wix
> text-encoding); substance above is complete. Catalog confirmed complete (13 products,
> sitemap exhaustive; "Carica altro" lazy-loads the same set).

---

## 3. New site (this repo, `sites/dbc`)

- **Home** ([`/`](https://dbcustomgarage.netlify.app/)) — single page. Sections: Hero (booking form), About, Services (5),
  Stats, How It Works, CTA, Bottom CTA, Footer. Nav: Home ▸ About/Services/How It Works,
  Gallery ▸ Our Fleet, Get A Quote. Footer links: x.com, TikTok, Instagram, WhatsApp — all
  placeholder roots.
- **Gallery** ([`/gallery`](https://dbcustomgarage.netlify.app/gallery/)) — photo gallery ("Selected builds from our garage"), 12 images
  in repo (`gallery-01..12.md`).
- **Privacy policy** — DBC site has **no** privacy policy; `privacy-policy.astro` lives only
  on the VIPER site (`sites/viper/.../privacy-policy.astro`). DBC's `/privacy-policy/` returned
  **404** at crawl time — add one if DBC needs it.
- No separate about / services / contact pages — all sections on `/`.
- 5 services in CMS (`services.md`): Enclosed Supercar Transport; Classic Cars & Motorcycles
  Sale & Auction; Off-Market Sourcing & Consulting; Import & Export Logistics; Automotive
  Customizing & Design Projects.

---

## 4. VIPER Security — not DBC content (moved to VIPER site)

The old site's "Luxury VIP private security transfer" product page was actually **VIPER
Security's** chauffeur offer (this repo's `sites/viper`): Mercedes-Benz S-Class 4MATIC AMG VIP
transfer, hourly rates €120–€950, airport transfers €280–€400, SILVER/GOLD/PLATINUM membership
(€1,500/€3,500/€5,900), tagline "Luxury Without Limits · Professional • Discreet • Reliable."
The Wix storefront merely resold VIPER's service under the "Luxury VIP" name.

This info is NOT DBC's own; full content already lives on the `sites/viper` site
(`hero`, `fleet/mercedes-s-class`, `pricing/hourly`, `membership/tiers`, `page-content`).
Removed from this file — see VIPER research/docs for details.

---

## 5. Services synthesis (both sites merged)

1. **Enclosed supercar / classic car transport** (EU, UK, USA; "from 1 EUR/km return" on old)
2. **Import / export logistics** — paperwork, customs, shipping, delivery (new site)
3. **Auction services** — prep, photo, listing, representation on Catawiki, Proxibid,
   Silverstone, Heritage, Bonhams, Sothebys (old + new)
4. **Off-market sourcing & consulting** — "find your dream car or invest off the open market"
   (new)
5. **Customizing / design / build** — restomod, widebody, interior, show-grade (new);
   Hummer H3 resto, Jeep Wrangler body kits (old)
6. **Industrial / concept / product design** — automotive + industrial + energy (old;
   not carried to new site)
7. **Harley Davidson / Indian Motorcycle customization** (old about page)
8. ~~**VIP chauffeur / security transfer** — Mercedes S-Class, Marbella~~ — this is **VIPER
   Security's** offer (sister site `sites/viper`), not a DBC service; exclude from DBC
9. **Armored vehicles** — up to B7 (old)
10. **Automobile repair & service** — 20 EUR/hr (old, Wix Bookings)
11. **Mallorca Harley Davidson tours** (old, €250)
12. **Wood home / interior design projects** (old — side venture)

---

## 6. Redesign deltas (old → new)

Carried over:
- Core positioning: supercar/classic transport + auctions + buying/selling.
- Auction platforms list (Catawiki, Proxibid, Silverstone, Heritage, Bonhams).
- 2010 founding year + "25 years" experience (new site: 25+ / 500+ / 3 locations stats).
- 3-location footprint (Marbella, Milan, New Jersey).

Dropped / narrowed from old site:
- Harley/Indian customization, industrial design, EV chargers/power stations, wood homes,
  tattoo-studio collab, Hummer/Jeep builds, armored vehicles, repair shop, tours.
- Old site's broken English cleaned into polished copy.

New on new site:
- WhatsApp booking-form flow (currently `whatsappNumber: ""` — form path disabled).
- Gallery, Import/Export service, Off-market sourcing, Privacy policy (in repo).
- No public phone/email anywhere yet — old site's full contact set (§1) is the authoritative
  source for filling this in.

---

## 7. To-dos implied for `sites/dbc` (not done — research only)

- Add real contact info (phones from §1) to CMS/seo/labels — currently none.
- Wire verified WhatsApp `34617201441` into `site.ts whatsappNumber` (or confirm which of
  the 4 numbers is the WhatsApp line).
- Point footer social icons at real handles once chosen (currently bare roots).
- Decide whether to resurrect dropped services (armored vehicles, repair, design studio).
- Do not add a chauffeur/VIP transfer service to DBC — that's VIPER's (`sites/viper`).
- Deploy so `/privacy-policy/` stops 404ing.

---

## 8. Contact verification & evidence (site-driving only)

Third-party registry, dealership, shop, timelines, and founder-personal research was
removed — it documents the company/individuals, not the DBC site. Kept only what feeds
the site (contacts, handle, entity name, cross-checks).

### Instagram — [@dbcustomgarage](https://www.instagram.com/dbcustomgarage/)

Main DBC handle confirmed: profile "Design, automitive design, idustrial design. Supercars
and Classic cars scout. Supercars and Luxury cars transport." Active into 2026. (Activity
timeline, personal founder account, and analytics removed — not DBC-site content.)

### Contact cross-check

The `+34 617 201 441` number appears as both WhatsApp (old-site product page) and
Marbella-shop phone — likely the primary Marbella business line. Feed this into §1.
(Also matches the Marbella-shop business listing phone; all third-party registry, dealership,
shop, and founder-personal details removed — not DBC-site content.)

### Entity naming note

"DB Custom Garage **Design** S.L.U." (Wix footer) vs "DB Custom Garage **Desing** SL."
(Spanish registry) — both point at the same Dragan-led business. Ties to §1 legal-entity row.

### LinkedIn (company)

Company page has an off-market supercars post (Jun 2023, "DB Custom Garage working on off
market Supercars and Rare Cars…"); content auth-walled. (Founder's personal LinkedIn removed.)

---

## 9. Downloaded Images (2026-08-15)

All images downloaded from the old Wix site (`dbcustomgarage.com`) via `static.wixstatic.com/media/`
and converted to WebP for use in the new DBC site (`sites/dbc`). Stored in:

```
sites/dbc/public/images/from-wix/
```

**Directory structure:**

| File | Size | Source (Wix media ID) | Use |
|---|---|---|---|
| `logo.webp` | 108 KB | `09baf1_3aeb69b1...` | Site logo / favicon source |
| `hero.webp` | 96 KB | `09baf1_81056b29...` (2500×1330 PNG) | Main hero section background |
| `about-hero.webp` | 96 KB | same as hero | About section hero |
| `classic-hero.webp` | 217 KB | `09baf1_81056b29...` | Classic/auction page hero |
| `transport-hero.webp` | — (removed, duplicate) | — | — |
| `about.webp` | 416 KB | `09baf1_7dcd160f...` | About section image |
| `auction-hero.webp` | 645 KB | `09baf1_1cfda3a2...` (5.1 MB PNG → 645 KB WebP) | Auction page hero |
| `stats-bg.webp` | 1.0 MB | `09baf1_4b410769...` (2.3 MB JPG → 1.0 MB WebP) | Stats section background |
| `hummer-project.webp` | 227 KB | `09baf1_f58a8b4a...` | Hummer resto project |
| `armored-vehicles.webp` | 189 KB | `09baf1_43705ff6...` | Armored vehicles showcase |
| `concept-design.webp` | 61 KB | `09baf1_a92e5f3b...` | Concept design service |
| `import-export.webp` | 240 KB | `09baf1_966bd806...` | Import/export logistics |

**Gallery (18 images, `gallery/gallery-01.webp` through `gallery-18.webp`):**

Car builds, transport shots, and project photos extracted from the old Wix homepage, shop,
product pages, and content sections. Original Wix media IDs mapped to sequential gallery
numbers. All converted to WebP at 85–90% quality.

**Original raw downloads (110 files, ~89 MB):** Full-resolution JPG/PNG originals from Wix
`static.wixstatic.com` were downloaded and then converted to WebP. The original large
files (>5 MB PNG/JPG) were deleted after WebP conversion to avoid PWA precache bloat.

---

## 10. Verbatim copy from all pages (re-scraped 2026-08-15, Firecrawl rendered JS)

Every page on `www.dbcustomgarage.com`, current live text. Category tags shown as in `/shop`
(product categories: "Car specialist", "Wood house", "Concept Design", "Jeep Wrangler body kit",
"Luxury VIP", "New"). The sitewide footer on every page is the identical contact block:

```
Phone   tel:+34637137730
Email   mailto:dbcustomgarage@gmail.com
Whatsapp api.whatsapp.com/send?phone=34617201441
Instagram http://www.dbcustomgarage.com/   (links back to site root — no real handle)
```

### / (Home)

Page title: `DB Custom Garage , Supercars,transport,Classic cars,Harley Davidson,Shelby,`
Meta description: `DB Custom Garage is specialised in supercars,classic cars and motorcycles enclosed transport and logistic in EU and other continents. Logistic and consulting in buying and selling supercars,classic cars and other vehicles`
Meta keywords: `International, car, transport, and, logistic`

Lead copy (page body, one paragraph, verbatim):

> **DB Custom Garage is specialised to give a clients complet support and logistic in
> selling or buying Supercars, Classic cars and werry special cars like SHELBY. Also we can
> provide new concept or limited series cars like Italdesign01, Koenigsegg, Lamborghini,
> Ferrari, Bugatti, Rimac and electric or hyper cars.**

Home also carries an Italian contact form ("Invia / Il tuo modulo è stato inviato!").

### /about-1 (About Us)

Page title: `Home | DB Custom Garage` (title not updated, body is the story)

> Our story is very hilarious, we live in a time of great change and difficulties, but
> Dragan Meseldzija i DB Custom Garage team never gives up becouse work and commitment
> brings results in the field of automotive design, customizing Harley Davidson and Indian
> Motorcycles, Industrial design and advanced design in electric vehicles and power
> stations and chargers for electric vehicles. Supercar and classic car transport and
> logistic with enclosed trailers and trucks. We must not stop becouse we are here for you
> dear clients and friends....DB Custom Garage continue .

### /classic (DB Custom Garage Auction)

Page title: `DB Custom Garage Auction | DB Custom Garage`
Meta description: `Classic Cars and Supercars auction on line.`

Header: **CLASSIC CARS Auction**
`DB Custom Garage is active in Classic Cars and Supercars auctions. If you need selling your car or old motorcycle , just contact us.`

**Our Story** (verbatim):

> We are active from 2010 in Classic Cars and Supercars auctions . Our service regarding
> preparation of Cars for auctions with complet description, photo and register on several
> on line auctions like Catawiki, Proxibid, Silverstone ,Heritage , Bonhams or Sothebis .
> With more than 25 years experience we can help you to partecipate on auctions and give
> opportunity for selling your vehicle without move from your garage.

**Contact**: "You looking for new and exciting opportunities for selling or buying your
Classic or Supercar . Let's connect." — email `dbcustomgarage@gmail.com` (mailto actually
`info@mysite.com`, broken), `+34 670038541` Spain, `+39 3496638171` Italy.

### /services-4 (Supercars and Classic cars transport)

Page title: `Supercars and Classic cars transport | DB Custom Garage`

> DB Custom Garage is specialized in Supercars and Classic cars enclosed transport with
> our trucks and enclosed vehicles full insured,secur, safe and clean transport all over
> Europe and USA.

Contains a "Get a Quote" form (First Name / Last Name / Email / Send).

### /contacts (Contact us)

Page title: `Contacts | DB Custom Garage Design S.L.U.` (confirms legal entity in title)
Body: Italian contact form only ("Invia / Il tuo modulo è stato inviato!").

### /request-a-quote

Page title: `Request a quote | DB Custom Garage Design S.L.U.` — empty form page (no body).

### /shelby-cars

Page title: `Shelby Cars | DB Custom Garage` — **image gallery only, no text** (placeholder).
13 images showing muscle/Shelby builds (ford-mustang-shelby-gt500-2020 confirmed present).

### /book-online (Prenota online / Wix Bookings)

Page title: `Prenota online | DB Custom Garage`. One service:

- **Automobile repair and service** — "Car Service, repair ." · 3 ore · 20 euro hour plus
  material · Prenota button.

### /service-page/automobile-repair-and-service

- "Automobile repair and service — Car Service, repair . · 3 ore / 20 euro hour plus material"
- Address: `Camino de Campanalas 6, Mijas 29651 (Malaga)`
- Service description: **"Only with appointmant ."**
- Contact: `+34670038541` · `dbcustomgarage@gmail.com` · `Cam. de Campanales, 6, 29651 Las Lagunas de Mijas, Málaga, Spagna`

### Products (old Wix store, full text)

| Product | Price | Full body copy (verbatim) | Shop category |
|---|---|---|---|
| Hummer H3 Alpha V8 5.3 | €30,000 | "Hummer Customizing — Hummer H3 Alpha Customized by DB Custom Garage . Total restored ." | Hummer |
| Armored vehicles | €300,000 | "We can provide armored veicles in several configurations. Up to B7 level protection." | New |
| Mallorca Harley Davidson tour | €250 | *(no body text)* | New |
| Car service and repair | €20/hr | "Car service — Car Repair and mantainance ." | Car specialist |
| Motorcycle Transport | €50 | *(no body text)* | — |
| Wood home concept | €10,000 | "Wood home design by DB Custom Garage" | Wood house |
| Concept design | €20,000 | "DB Custom Garage Design studio projected and designed concepts and products automotive. Industrial products , constructions, architectur and interior design." | Concept Design |
| Design | €100,000 | "DB Custom Garage — Industrial design and innovative energy projects." | — |
| Jeep Wrangler body kit | €5,000 | "Body kit for Jeep Wrangler . Bumpers and parts is made with metal material , painted with powder coating process" | Jeep Wrangler body kit |
| Supercars and Classic cars provider | €2,000 | *(no body text)* | — |
| Supercars transport | €2 | "Supercars and Classic cars transport EU and UK with enclosed trailer and trucks. Price from 1,00 Euro each KM calcolated in both directions." | — |
| Tatoo studio Gamido | €100 | "Gamido Tatoo — Marbella" | New |

### VIPER Security chauffeur offer — not DBC content

The `luxury-vip-private-security-transfer` product was **VIPER Security's** chauffeur offer
(sister site `sites/viper`), which the old Wix storefront resold. Its full body copy
(vehicle features Wi-Fi/bottled water/phone charging, capacity, airport/villa/yacht/
corporate/nightlife services, hourly €120–€950, airport prices €280–€400, SILVER/GOLD/
PLATINUM membership, "Luxury Without Limits · Professional • Discreet • Reliable" tagline)
already lives on the `sites/viper` site — removed from this DBC file. See VIPER docs.

### Notes from this pass

- Product prices/body match §2 exactly (no drift); category tags on `/shop` are new info.
- Home + about meta descriptions are now filled (previously only fell back to site default);
  home `<title>` tag lists extra keywords (Harley Davidson, Shelby) not mirrored in body.
- The worldwide footer now funnels every contact to the single newer line `+34 637 137 730`
  (not the `+34 670 038 541` of the old header) — see §1 update.
