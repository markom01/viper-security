# Booking Form Flowchart (F3)

Happy path: user fills form → WhatsApp message opens.

```mermaid
flowchart TD
    A[Booking form rendered<br/>Hero.astro:59] --> B[User selects Location<br/>#form-location change<br/>Hero.astro:253]
    B --> C[uS fills Service dropdown from booking_data.spain/italy.services<br/>Hero.astro:230]
    C --> D[User selects Service<br/>Hero.astro:254]
    D --> E[uD fills Destination dropdown from service.routes<br/>Hero.astro:232]
    E --> F[User picks route<br/>Hero.astro:255]
    F --> G[upP shows price from route.price<br/>Hero.astro:235]
    G --> H[updateBtn enables submit when all valid<br/>Hero.astro:239]
    H --> I[submit → build wa.me URL<br/>Hero.astro:261]
    I --> J[window.open whatsapp deep-link]
```

**Side effects:** `window.open` to `wa.me/<phone>?text=<urlencoded booking>`. Also has `data-netlify="true"` (Hero.astro:59) — Netlify Forms POST backup.

**Validation (Hero.astro:209-210):** `validName` Unicode letters/space/hyphen/apostrophe ≥2 chars; `validPhone` strips `[\s\-+()]`, 7-15 digits, `+`/digits/space/`-`/`()` charset. Errors injected as `.field-error` divs, `data-invalid` attr.

**Data dependency:** `booking_data` from `page-content` collection (F1), passed via `SCRIPT_DATA` `define:vars` (Hero.astro:9-21, 196).
