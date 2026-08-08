# Duplication Report — VIPER Security (2026-08-01)

Verified from full source read. Each claim cites ≥2 locations. Divergence classified legitimate vs accidental.

---

## D1. Phone sanitization regex — ACCIDENTAL

**Concern:** WhatsApp phone normalization strips spaces/`+` from E.164 numbers.

| Location                  | Code                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `Footer.astro:9`          | `const cleanPhone = (phone) => phone?.replace(/[\s+]/g, '') \|\| ''` |
| `Hero.astro:261` (inline) | `cn=pn.replace(/[\s+]/g,'')`                                         |

**Divergence:** Footer has `?.` + `\|\| ''` guard, Hero doesn't (relies on phone being non-empty). Same regex otherwise.

**Verdict:** Accidental — identical sanitization, split across components. Footer's guard is the safer form.

---

## D2. Region short-label fallback — ACCIDENTAL

**Concern:** Default region name when `booking_data` lacks a region.

| Location              | Code                                                        |
| --------------------- | ----------------------------------------------------------- |
| `BaseLayout.astro:21` | `spainLocality: bd?.spain?.short_label \|\| 'Marbella'`     |
| `BaseLayout.astro:22` | `italyLocality: bd?.italy?.short_label \|\| 'Milano'`       |
| `Pricing.astro:45`    | `const spainLabel = bd?.spain?.short_label \|\| 'Marbella'` |
| `Pricing.astro:46`    | `const italyLabel = bd?.italy?.short_label \|\| 'Milano'`   |

**Divergence:** identical fallback values, duplicated in 2 components.

**Verdict:** Accidental — same business rule ("regions default to Marbella/Milano") expressed twice.

---

## D3. `--colors--gold-bright` inline `:root` override — ACCIDENTAL

**Concern:** Section-local bright-gold token override. Same literal value, 6 places.

| Location                | Code                                                   |
| ----------------------- | ------------------------------------------------------ |
| `BaseLayout.astro:74`   | `<style>:root{--colors--gold-bright:#c8a04c;}</style>` |
| `StatsSection.astro:43` | `:root{--colors--gold-bright:#c8a04c}`                 |
| `HowItWorks.astro:43`   | `:root{--colors--gold-bright:#c8a04c}`                 |
| `Pricing.astro:85`      | `:root{--colors--gold-bright:#c8a04c}`                 |
| `Membership.astro:40`   | `:root{--colors--gold-bright:#c8a04c}`                 |
| `Footer.astro:59`       | `:root{--colors--gold-bright:#c8a04c}`                 |

**Divergence:** none — byte-identical. `global.css` already defines base tokens (`--colors--gold:#917148`, `--colors--amber:#c1a176`) at `public/styles/global.css:219-267` but lacks `gold-bright`.

**Verdict:** Accidental — token belongs once in `global.css :root`. Six inline copies = six future edit sites when brand color shifts.

---

## D4. Dual regional `services` prop — ACCIDENTAL (obsolete plumbing)

**Concern:** `Services.astro` receives `marbella` + `milano` props, but data is universal.

| Location                  | Code                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `index.astro:83`          | `<Services marbella={universalServices.services} milano={universalServices.services} .../>` |
| `index.astro:49`          | `const universalServices = { services: allOfferings }`                                      |
| `Services.astro:8`        | `const services = marbella \|\| milano \|\| []`                                             |
| `content.md:2` (services) | `region: Universal` for all 4 offerings                                                     |

**Divergence:** `services.md` marks every offering `region: Universal`; both props carry identical array; component picks one and ignores the other. Dual-prop is dead weight — a leftover from the pre-universal two-region design.

**Verdict:** Accidental — component only ever renders one set. Prop duality adds plumbing with no behavior.

---

## D5. WhatsApp deep-link construction — PARTIAL / borderline

**Concern:** Both build `wa.me` URLs, different shapes.

| Location             | Code                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| `Footer.astro:21-23` | `https://wa.me/${cleanPhone(phoneItaly)}` (plain link, `target=_blank`)   |
| `Hero.astro:261`     | `https://wa.me/${cn}?text=${msg}` (popup with pre-filled booking message) |

**Divergence:** Footer = bare contact link; Hero = prefilled booking text. Different purpose.

**Verdict:** Legitimate specialization — different UX (contact vs book). Only share the phone-sanitizer (D1), not the link builder.

---

## Non-duplications checked and cleared

- **Scroll-reveal** — single IntersectionObserver in `BaseLayout.astro:90-104`; sections only emit `data-scroll-reveal` attr. Correct centralization, not dup.
- **`ICONS` via `set:html`** — shared from `config/icons.js`, proper reuse.
- **Subheadline wrapper markup** (7 sections) — structural HTML repetition, cosmetic, low value to abstract (see proposal: deliberately left alone).
- **Pricing routes** — F3 (Hero form) and F5 (Pricing cards) both read `booking_data` but from one source; no divergent copy.
