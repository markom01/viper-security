# Pricing Cards Flowchart (F5)

Happy path: booking_data services + hourly rates → 2 regional pricing cards.

```mermaid
flowchart TD
    A[booking_data from page-content<br/>Pricing.astro:7] --> B[buildRegionCard spain<br/>Pricing.astro:48]
    A --> C[buildRegionCard italy<br/>Pricing.astro:49]
    B --> D[services.forEach → sections[]<br/>Pricing.astro:20-31]
    C --> D
    D --> E[hourly rates appended as section<br/>Pricing.astro:33-38]
    E --> F[filter null cards<br/>Pricing.astro:51]
    F --> G[render pricing-grid<br/>Pricing.astro:61-81]
```

**Section shape:** each service name → `PricingCardSection` `{title, routes[{label, price}]}` (Pricing.astro:23-31). Routes without price get `'?'` (Pricing.astro:27). Hourly from `src/content/pricing/hourly.md` via `getEntry('pricing','hourly')` (index.astro:38) → prop `hourly`.

**Fallbacks:** `spainLabel = bd?.spain?.short_label || 'Marbella'` (Pricing.astro:45), same for Milano. Card skipped entirely if no sections (Pricing.astro:39-42).

**External deps:** F1 (booking_data), `pricing` collection. Same booking_data drives booking form (F3) — no divergence.
