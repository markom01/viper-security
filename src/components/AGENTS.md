# COMPONENTS — VIPER SECURITY

**10 Astro `.astro` components (9 section + 1 reusable card) + 1 React `ContactForm.jsx` island.**

## WHERE TO LOOK

| Component | File | Key Patterns |
|-----------|------|--------------|
| Navigation | `Nav.astro` | Scroll-triggered header bg, hamburger menu overlay, client-side `IntersectionObserver`-free mobile toggle, `aria-current="section"` tracking on hash-based links |
| Hero | `Hero.astro` | Full-viewport, staggered CSS `@keyframes` fade-in-up, gold radial glow, nth-child animation delays |
| Services | `Services.astro` | Two-column grid (Marbella/Milano), imports `ServiceCard.astro` (used 10x) |
| Service Card | `ServiceCard.astro` | Slot-based reusable card: `icon` + `title` props, `backdrop-blur-sm` glassmorphism, gold accent on hover, accepts children via `<slot />` |
| Fleet | `Fleet.astro` | Horizontal split (image/details), `IntersectionObserver` scroll-reveal, image hover scale |
| Pricing | `Pricing.astro` | 5-column hourly grid, two-column airport routes, dark-iron cards with hover gold border |
| Membership | `Membership.astro` | 3-tier cards, conditional "BEST VALUE" badge, outline vs. filled CTA variants |
| Contact | `Contact.astro` | Two-column layout (info + form), phone/WhatsApp section, imports React island |
| Form (React) | `ContactForm.jsx` | React 19, `useState` validation, Netlify Forms POST, GDPR consent, success/error states, `aria-invalid` + `aria-describedby` on validation, `aria-live="polite"` on success screen, `role="alert"` on error banner |
| Footer | `Footer.astro` | Gold accent top border (CSS shimmer animation), nav links, service badges, copyright — **no frontmatter block** |

## CONVENTIONS

- **Every `.astro` component** follows the same structure: frontmatter `---` → template → `<style>` → `<script>`. *Exception: `Footer.astro` has no frontmatter (no dynamic data needed — pure markup).*
- **All components** are single-file — no extracted CSS modules or separate JS files.
- **Tailwind classes** everywhere — no inline `style` attributes except for dynamic values (e.g., SVG data URIs in selects).
- **Aria labels** on all interactive sections and `aria-hidden="true"` on decorative elements.
- **Components are stateless** — no `.astro` frontmatter logic beyond data iteration. React form owns all state.
- **`<script>` tags** use plain IIFE closures (no `type="module"` client scripts) with DOM `document.getElementById`.
- **`<style>` tags** use `is:global` only when targeting externally generated elements (animations), scoped otherwise.

## ANTI-PATTERNS

- **Do NOT** add React to any component except `ContactForm.jsx` — use `.astro` files.
- **Do NOT** use `client:load` on anything other than the contact form — all `.astro` sections are fully static.
- **Do NOT** use external CSS-in-JS — Tailwind utilities + `<style>` tags only.
- **Do NOT** use `any` types or `@ts-ignore` in `ContactForm.jsx`.
