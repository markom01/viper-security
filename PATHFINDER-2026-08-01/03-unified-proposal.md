# Unified Proposal — VIPER Security (2026-08-01)

For each duplication from `02-duplication-report.md`. Anti-patterns rejected: no abstraction layer for flexibility, no feature flags, no registry/factory.

---

## U1. Phone sanitizer → shared helper

**Consolidate into:** `src/config/phones.js` — `export const cleanPhone = (phone) => phone?.replace(/[\s+]/g, '') || ''`

**Old call sites:**
- `Footer.astro:9` local `cleanPhone` → import from config
- `Hero.astro:261` inline `cn=pn.replace(/[\s+]/g,'')` → use helper inside the script (via `define:vars` or a pre-computed field)

**Capability loss:** none — identical behavior, Footer's guard wins.

---

## U2. Region defaults → single constant

**Consolidate into:** `src/config/strings.js` — add
```js
regionDefaults: { spain: 'Marbella', italy: 'Milano' }
```

**Old call sites:**
- `BaseLayout.astro:21-22` → `jd.spainLocality = bd?.spain?.short_label || s.regionDefaults.spain` (and italy)
- `Pricing.astro:45-46` → same via `s.regionDefaults`

**Capability loss:** none. One place to change if default region names change.

---

## U3. Gold-bright token → single definition in global.css

**Consolidate into:** `public/styles/global.css` `:root` block (line ~219 where other `--colors--*` live)
```css
--colors--gold-bright: #c8a04c;
```

**Old call sites:** remove the `:root{--colors--gold-bright:#c8a04c}` override from:
- `BaseLayout.astro:74`
- `StatsSection.astro:43`
- `HowItWorks.astro:43`
- `Pricing.astro:85`
- `Membership.astro:40`
- `Footer.astro:59`

**Capability loss:** none. Token defined once, all `var(--colors--gold-bright)` references keep working (CSS vars cascade from document root).

---

## U4. Services dual-prop → single prop

**Consolidate into:** `Services.astro` accepts single `services` prop.

**Old call sites:**
- `index.astro:83` → `<Services services={universalServices.services} .../>`
- `Services.astro:8` → `const { services } = Astro.props` (drop `marbella`/`milano`)

**Capability loss:** loses the theoretical two-region services split. **Acceptable** — content.md marks all offerings `region: Universal`; there is no second dataset anywhere. Reintroduce regional split only when a real second region dataset exists (YAGNI).

---

## Combined unified system flowchart

```mermaid
flowchart TD
    A[config/strings.js<br/>regionDefaults + SITE_NAME] --> B[BaseLayout.astro<br/>jd.spainLocality via regionDefaults<br/>BaseLayout.astro:21]
    A --> C[Pricing.astro<br/>labels via regionDefaults<br/>Pricing.astro:45]
    D[config/phones.js<br/>cleanPhone] --> E[Footer.astro:21]
    D --> F[Hero.astro booking script<br/>Hero.astro:261]
    G[global.css :root<br/>--colors--gold-bright] --> H[All section <style> blocks]
    I[Services.astro<br/>single services prop] --> J[index.astro:83<br/>services={universalServices.services}]
```

No runtime behavior change — all four are mechanical consolidations of duplicated constants/helpers/tokens. Deployment: same build pipeline, no new deps.

**Explicitly NOT unified:** WhatsApp link builders (D5) — legitimate UX specialization; subheadline markup repetition — cosmetic HTML, abstracting buys nothing at 13 sections.
