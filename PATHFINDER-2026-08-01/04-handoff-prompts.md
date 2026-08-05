# Handoff Prompts — VIPER Security (2026-08-01)

Copy any block into `/make-plan` to plan that system. Evidence in `02-duplication-report.md`; flowcharts in `01-flowcharts/`.

---

## Prompt 1: Shared phone sanitizer + region defaults (U1 + U2)

```text
Plan: consolidate duplicated constants in the VIPER Security Astro site.

Targets:
1. Create src/config/phones.js exporting `cleanPhone(phone)` = `phone?.replace(/[\s+]/g, '') || ''`.
2. Update Footer.astro (currently local `cleanPhone` at line 9) to import it.
3. Update Hero.astro booking script (line 261, inline `cn=pn.replace(/[\s+]/g,'')`) to use the shared helper.
4. Add `regionDefaults: { spain: 'Marbella', italy: 'Milano' }` to src/config/strings.js STRINGS.
5. BaseLayout.astro lines 21-22: replace `|| 'Marbella'` / `|| 'Milano'` with `|| s.regionDefaults.spain` / `.italy`.
6. Pricing.astro lines 45-46: same replacement.

Anti-patterns to reject: adding an abstraction layer beyond a single exported function; introducing config for values that never change; feature flags.

Evidence: 02-duplication-report.md D1 (phone) + D2 (region defaults). Flowcharts: 01-flowcharts/booking-form.md, 01-flowcharts/sections.md.
```

---

## Prompt 2: Single gold-bright token (U3)

```text
Plan: move the duplicated `--colors--gold-bright:#c8a04c` token into global.css.

Targets:
1. Add `--colors--gold-bright: #c8a04c;` to the :root block in public/styles/global.css (where other --colors--* tokens live, ~line 219).
2. Remove the inline `<style>:root{--colors--gold-bright:#c8a04c}</style>` / `:root{--colors--gold-bright:#c8a04c}` override from: BaseLayout.astro:74, StatsSection.astro:43, HowItWorks.astro:43, Pricing.astro:85, Membership.astro:40, Footer.astro:59.
3. Verify no section depends on the token being locally scoped (it's identical value everywhere, so document-root cascade is safe).

Anti-patterns to reject: renaming the token or introducing a new one; converting to a CSS module just for this.

Evidence: 02-duplication-report.md D3.
```

---

## Prompt 3: Single services prop (U4)

```text
Plan: collapse the unused dual-region services plumbing.

Targets:
1. Services.astro: change prop signature from `{ marbella, milano }` to single `services`; `const services = marbella || milano || []` (line 8) becomes `const { services } = Astro.props`.
2. index.astro:83: `<Services services={universalServices.services} .../>` (drop marbella/milano).

Anti-patterns to reject: keeping both props behind a fallback "just in case" a second region appears; introducing a region enum/factory. This is a deletion, not a refactor.

Evidence: 02-duplication-report.md D4. Flowchart: 01-flowcharts/sections.md.
```

---

## Not planned (deliberately)

- WhatsApp link builders (D5) — legitimate UX specialization, keep separate.
- Subheadline markup repetition — cosmetic HTML at 13 sections, abstracting adds complexity with no behavioral payoff.
