# SEO / JSON-LD / Shell Flowchart (F6)

Happy path: page-content jsonld + seo → head meta + JSON-LD scripts.

```mermaid
flowchart TD
    A[pageContent.jsonld + booking_data<br/>BaseLayout.astro:5-22] --> B[jsonLdOrg script<br/>BaseLayout.astro:24-39]
    A --> C[jsonLdWebSite script<br/>BaseLayout.astro:40-47]
    B --> D[<head> meta/OG/Twitter<br/>BaseLayout.astro:56-84]
    C --> D
    D --> E[skip-link + <main> shell<br/>BaseLayout.astro:86-89]
    E --> F[IntersectionObserver scroll-reveal<br/>BaseLayout.astro:90-104]
```

**Key data:** Org JSON-LD uses `org_name/org_url/org_logo/org_description/phoneSpain/phoneItaly/privacy_policy` from `page-content.jsonld` (content.md:2-9), with `spainLocality`/`italyLocality` fallbacks from booking_data short_labels (BaseLayout.astro:21-22). Phones fall back to `s.jsonld.phone*` (empty in strings.js:33-34).

**Notable:** `ogImageUrl` hardcodes `/images/hero-image.webp` (BaseLayout.astro:8) — **this file doesn't exist** (images dir has `hero-image_upscaled.webp`). Stale reference. Same for `<meta content={seo?.title} property="og:title">` — uses pageContent seo, correct.

**External deps:** Google Fonts (Work Sans, Noto Serif, Playfair Display), `/styles/global.css`.
