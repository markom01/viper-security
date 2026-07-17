# COMPONENTS — VIPER SECURITY

**14 React `.jsx` components (13 section + 1 reusable card) + 1 `contact-types.js` contract file.**

## WHERE TO LOOK

| Component | File | Key Patterns |
|-----------|------|--------------|
| Page Root | `PageRoot.jsx` | **Root component** — receives all content collection data as props from `index.astro`, composes all sections inside `BaseLayout` |
| Layout Shell | `../layouts/BaseLayout.jsx` | Full HTML shell (`<html>`, `<head>`, `<body>`), SEO meta, JSON-LD schema, Google Fonts |
| Navigation | `Nav.jsx` | `useState` for mobile menu open/close + body scroll lock, `useEffect` for scroll-based header background, `aria-current="section"` tracking on hash-based links |
| Hero | `Hero.jsx` | Accepts `data` prop (`HeroData`), staggered CSS `@keyframes` fade-in-up, nth-child animation delays |
| How It Works | `HowItWorks.jsx` | Accepts `data` prop, maps over `steps` array |
| Services | `Services.jsx` | Accepts `marbella` and `milano` props, uses `ServiceCard.jsx` (10x), two-column regional grid |
| Service Card | `ServiceCard.jsx` | Reusable card: `icon` (HTML via `dangerouslySetInnerHTML`) + `title` props, renders `children` |
| Fleet | `Fleet.jsx` | `useRef` + `useEffect` with `IntersectionObserver` scroll-reveal, `useState`-free (class toggling via ref) |
| Pricing | `Pricing.jsx` | `useRef` + `IntersectionObserver` for staggered rate card entrance, `hourly.body` from Astro content |
| Membership | `Membership.jsx` | `useRef` + `IntersectionObserver`, conditional "BEST VALUE" badge, outline vs. filled CTA |
| FAQ | `Faq.jsx` | Native `<details>` / `<summary>` elements (no React state needed) |
| Contact | `Contact.jsx` | Two-column layout (info + form), phone/WhatsApp section, renders `ContactForm.jsx` |
| Contact Form | `ContactForm.jsx` | React 19, `useState` validation, Netlify Forms POST, GDPR consent, success/error states |
| Footer | `Footer.jsx` | Gold accent top border (CSS shimmer animation), nav links, service badges, copyright |
| Mobile Action Bar | `MobileActionBar.jsx` | Fixed bottom bar visible on mobile only (`lg:hidden`) |
| 404 Page | `PageNotFound.jsx` | Full-page 404, wraps `BaseLayout` |

## DATA FLOW

```
index.astro (Astro page — document shell + data fetching)
  ├── BaseHead.astro (SEO meta, fonts, JSON-LD in <head>)
  └── PageRoot.jsx (React root — receives all data as props, client:load)
       └── BaseLayout.jsx (React — renders <body> content: skip link, Nav, <main>, Footer)
            ├── Nav.jsx
            ├── Hero.jsx ← hero prop
            ├── HowItWorks.jsx ← howItWorks prop
            ├── Services.jsx ← marbella, milano props
            ├── Fleet.jsx ← fleet prop
            ├── Pricing.jsx ← hourly, airport props
            ├── Membership.jsx ← membership prop
            ├── Faq.jsx ← faq prop
            ├── Contact.jsx
            │    └── ContactForm.jsx
            ├── Footer.jsx
            └── MobileActionBar.jsx
```

## CONVENTIONS

- **All components** are React `.jsx` — no `.astro` template files (pages remain `.astro` only for content collection data fetching).
- **Single-file components** — no extracted CSS modules. `<style>` tags co-located in JSX.
- **Tailwind classes** everywhere — no inline `style` objects except for dynamic values (SVG data URIs, transition delays).
- **Aria labels** on all interactive sections, `aria-hidden="true"` on decorative elements, `role="status"`, `role="alert"` on dynamic regions.
- **React hooks** for state/effects: `useState` for UI state, `useEffect` for DOM observers and subscriptions, `useRef` for DOM references.
- **Inline `<style>` tags** for component-scoped animations (scoped by class names, no `is:global` equivalent needed).
- **Content collection data** is fetched exclusively in `.astro` page frontmatter and passed as props to React components.

## ANTI-PATTERNS

- **Do NOT** add `.astro` components — all new sections must be `.jsx`.
- **Do NOT** use external CSS-in-JS — Tailwind utilities + `<style>` tags only.
- **Do NOT** use `any` types or `@ts-ignore` in React components.
- **Do NOT** use `dangerouslySetInnerHTML` except for HTML entity icons (ServiceCard).
- **Do NOT** add `client:*` directives to individual section components — `client:load` is set once on `PageRoot` in the Astro page.
- **Do NOT** import `global.css` in React components — import it in `.astro` pages only (ensures SSR availability).
