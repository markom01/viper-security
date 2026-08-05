# Content Data Layer Flowchart (F1 + F2)

Happy path: markdown → Zod validation → index.astro → template resolution → section props.

```mermaid
flowchart TD
    A[7 markdown collections<br/>src/content/*/*.md] --> B[astro:content glob loaders<br/>content.config.ts:5-162]
    B --> C[Zod schema validation<br/>content.config.ts:7-161]
    C --> D[getCollection calls<br/>index.astro:22-28]
    D --> E[page-content entry<br/>index.astro:29]
    E --> F[booking_data + siteName + vehicleName<br/>index.astro:30-32]
    F --> G[resolveTemplates on offerings/steps/seo/about/cta/bottomcta<br/>index.astro:33-63]
    G --> H[Section props<br/>index.astro:78-91]
```

**Placeholder map (templates.js:28-37):**
- `{location1}` → spain.short_label, `{location2}` → italy.short_label
- `{location1_full}` → spain.label, `{location2_full}` → italy.label
- `{location1_name}` → spain.region, `{location2_name}` → italy.region
- `{site_name}` → `VIPER Security`, `{vehicle}` → `Mercedes-Benz S-Class` (vehicle_name)

**Resolution order:** `replaceAll` per key; keys with empty value skipped (templates.js:39-43). Applied to both collection data AND page-content prose fields (index.astro:52-63) — two separate resolution passes.

**Side effects:** none at runtime — pure build-time. Content validated at build; invalid data fails `astro build`.

**External deps:** none (astro:content). CMS (F7) is the write path; this is read path.
