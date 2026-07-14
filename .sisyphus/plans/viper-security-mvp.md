# Viper Security MVP Website

## TL;DR

> **Quick Summary**: Build a single-page scrolling MVP website for Viper Security, a VIP chauffeur & luxury transport service operating in Marbella (Costa del Sol) and Milano (Northern Italy/Alps). Uses Astro + Decap CMS + Tailwind CSS with a dark luxury theme inspired by the Lamborghini DESIGN.md reference (true black + gold accents) and competitor reference sites (Blacklane, Carey, Addison Lee). Content is editable via Decap CMS admin panel.

> **Deliverables**:
> - Single-page scrolling website at `viper-security.netlify.app`
> - Decap CMS admin panel at `/admin` for editing content
> - Contact/quote form via Netlify Forms
> - All content from `viper-security.md` displayed: services, pricing, fleet, VIP membership
> - Lighthouse 90+ score (all categories)

> **Estimated Effort**: Medium (5-8 days)
> **Parallel Execution**: YES — 4 waves, up to 6 concurrent agents
> **Critical Path**: T1 (scaffolding) → T5 (design system) → T6-T11 (sections) → T12/T13 (interactive) → F1-F4 (verification)
> **Parallel Speedup**: ~65% faster than sequential
> **File Ownership**: Zero shared files between parallel agents

---

## Context

### Original Request
Build a minimal MVP website for Viper Security that displays VIP chauffeur/luxury transport service data covering Marbella & Milano. Needs CMS editing capability, free tech stack, free hosting, free UI template. Based on content from `viper-security.md`.

### Interview Summary
**Tech Stack**: Astro 5 + Decap CMS + Tailwind CSS v4
**Template**: Cruip Open as base template (layout + structure), edit design tokens to match Lamborghini-inspired dark luxury (black+gold, dramatic typography). DESIGN.md at project root provides the visual target.
**Modifications**: Dark luxury aesthetic (black+gold palette, serif headings, glassmorphism, fleet showcase, hero booking section) matching competitor sites
**Brand**: Viper Security (Elite Adventure is the service name/experience)
**MVP Format**: Single-page scrolling, contact form only (no booking engine)
**Hosting**: Netlify free tier (Decap CMS + Netlify Identity + Git Gateway)
**Testing**: TDD + agent-executed QA + Lighthouse accessibility audits

### Metis Review
**Critical Discovery**: Brand asset (insta post.jpg) showed "Elite Adventure" with EA monogram — clarified: Viper Security IS the brand, Elite Adventure is the service offering. Phone numbers +39 3496638171 and +34 670038541 identified from brand asset.

**Grilling Session Outcomes** (see `.sisyphus/adr/` for full ADRs):
- ADR 001: Viper Security only — no Elite Adventure on site
- ADR 002: Single contact form with Service Location dropdown; email subject routes by location
- ADR 003: GitHub repo setup included in scaffolding tasks
- ADR 004: Simple flat CMS content model (one entry per section)
- ADR 005: Unsplash/Pexels stock images for fleet section placeholder

**Key Guardrails**:
- Cruip Open = base template (layout + structure); Lamborghini DESIGN.md = visual target (colors + typography + spacing)
- React ONLY for contact form interactive island; everything else in Astro components
- Decap CMS included in MVP as requested
- Contact form via Netlify Forms (no custom backend)
- GDPR minimal consent banner required (EU operation)

---

## Work Objectives

### Core Objective
Deploy a production-quality single-page website for Viper Security that showcases luxury chauffeur services and enables quote requests via contact form.

### Concrete Deliverables
- Astro 5 + Tailwind CSS v4 project at `/Users/projects/web/viper security/`
- Decap CMS admin at `/admin` with Git Gateway auth
- Netlify deployment at `viper-security.netlify.app`
- 6-page sections: Hero, Services (Marbella + Milano), Fleet, Pricing (Hourly + Airport), VIP Membership, Contact
- Contact form with Netlify Forms, email notifications
- Lighthouse scores ≥ 90 across all categories

### Definition of Done
- [ ] `npm run build` exits with 0, no errors
- [ ] Site renders all sections from viper-security.md
- [ ] Contact form submits → appears in Netlify Forms dashboard
- [ ] Decap CMS login → edit content → save → deploys
- [ ] Lighthouse ≥ 90 Performance, Accessibility, Best Practices, SEO
- [ ] Mobile responsive (375px, 768px, 1440px tested)
- [ ] Phone numbers clickable (tel: protocol)
- [ ] Netlify auto-deploy from Git push

### Must Have
- All content sections from viper-security.md displayed
- Contact form working end-to-end
- Decap CMS content editing functional
- Dark luxury design matching competitor aesthetic
- Clickable phone numbers (+39 3496638171, +34 670038541)
- Mobile responsive

### Grilling Decisions (incorporated from ADRs)
- Brand: **Viper Security only** — no "Elite Adventure" text on the site
- Contact form: "Service Location" dropdown (Marbella vs Milano), email subject includes location for routing
- GitHub repo setup included in scaffolding (user doesn't have one yet)
- GDPR: minimal consent banner added (EU compliance)
- Fleet images: Unsplash/Pexels stock photos as placeholder
- CMS model: flat/simple — one editable entry per section
- v2 Note: brief pointer to free OSS booking widget options

### Must NOT Have (Guardrails)
- No online booking/reservation system (v2)
- No payment processing
- No multi-language support (English only for MVP)
- No blog/news section
- No image gallery/lightbox
- No JS animation libraries (CSS transitions only)
- No social media embeds
- No user accounts/login
- No custom API endpoints
- No third-party analytics (privacy-friendly only if any)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (project from scratch)
- **Automated tests**: TDD (Vitest for component tests)
- **Framework**: Vitest (lightweight, Astro-compatible)
- **Additional QA**: Lighthouse CI, Playwright E2E, axe-core accessibility

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

All browser-based verification MUST use **Playwright MCP** (`skill("playwright")`):
- **Frontend/UI**: Playwright MCP — Navigate, take snapshot, assert DOM, screenshot
- **Form Testing**: Playwright MCP — Fill fields, submit, verify success/error states
- **CMS Testing**: Playwright MCP — Login to /admin, navigate collections, edit, verify save
- **Build/CLI**: Bash — `npm run build`, check exit code, `npm run test`
- **Accessibility**: Lighthouse CLI + axe-core (run via Playwright MCP `run_code_unsafe`)
- **Responsive**: Playwright MCP — Set viewports 375px/768px/1440px, screenshot, check overflow

### Relevant Skills for Execution

The following installed skills should be loaded for specific tasks:

| Skill | When to Use |
|-------|-------------|
| `playwright` | ALL QA verification (browser interaction, snapshots, screenshots, assertions) — load via `skill("playwright")` |
| `frontend-design` | Wave 1 Design System + Wave 2 visual sections — for production-grade luxury design |
| `ui-ux-pro-max` | T5 Design System, T6 Hero, T9 Pricing — for UX patterns, color palette selection, luxury typography pairing |
| `typeset` | T5 Design System — for luxury font hierarchy, sizing, letter-spacing, typography refinement |
| `arrange` | T7 Services — for two-column responsive layout, service card arrangement, visual rhythm |
| `colorize` | T10 Membership — for Platinum tier gold accent highlighting, strategic color distribution |
| `harden` | T12 Contact Form — for form validation, error states, edge case handling |
| `adapt` | F3 Responsive — for systematic cross-device adaptation testing |
| `seo-audit` | F1 Audit — for structured SEO review beyond Lighthouse basics |
| `web-accessibility` | F1 Audit — axe-core auditing, contrast checks, ARIA compliance |
| `webapp-testing` | T12 Contact Form — Playwright-based form fill + submit + validation |
| `polish` | F2 E2E — final quality pass on alignment, spacing, consistency before sign-off |
| `audit` | F1 Audit — comprehensive Lighthouse + quality audit |
| `normalize` | Evaluated but omitted — design system tokens are custom luxury, not matching an existing design system |

### Recommended MCP Servers for Verification

The following MCP servers should be available to the executing agent for verifying Astro/Decap CMS integration and overall quality:

| MCP Server | Tasks | What It Verifies |
|------------|-------|------------------|
| **Astro Docs MCP** ([withastro/docs-mcp](https://github.com/withastro/docs-mcp)) | T2, T3, T5, T6-T11, T13, F4 | Correct Astro Content Collections API usage, `getCollection()` queries, `client:load` directives, ViewTransitions, config schema validation |
| **GitHub MCP** ([github/github-mcp-server](https://github.com/github/github-mcp-server)) | T1, T4, T13, F4 | Create repo, manage branches, verify commits from Decap CMS edits, manage PRs |
| **Playwright MCP** (built-in) | ALL QA scenarios | Browser interaction, DOM assertions, form fill/submit, screenshots |

### Design Reference File

A **Lamborghini-inspired DESIGN.md** has been installed at `DESIGN.md` (project root). This serves as the **visual target** — the design aesthetic we want to achieve.

**Approach**: Start with **Cruip Open** as the base template (HTML/CSS/structure/layout), then **edit the design system tokens** to match our luxury dark theme. The Cruip Open template provides the scaffolding; the Lamborghini DESIGN.md provides the visual direction. We're not building from scratch — we're reskinning Cruip Open with our custom tokens.

| Source | Role |
|--------|------|
| **Cruip Open** (github.com/cruip/open-react-template) | Base template — layout, component structure, responsive grid, navigation pattern |
| **Lamborghini DESIGN.md** (`DESIGN.md`) | Visual target — colors, typography, spacing, button styles, card surfaces |
| **Competitor sites** (Blacklane, Carey, Addison Lee) | UX patterns — hero booking, fleet showcase, pricing layout, membership tiers |

**Customization plan**: Take Cruip Open's existing components and replace:
- Colors → Absolute Black `#000000`, Gold `#B08D45`, Charcoal `#202020`
- Typography → Playfair Display (headings), Manrope (body)
- Content → Elite Adventure services, pricing, fleet, membership data
- Images → Mercedes S-Class stock photography
- CTA buttons → Gold on black, sharp edges

The Astro Docs MCP is particularly important for the Astro + Decap CMS integration pipeline:
1. **Content Architecture (T2)** — verifies `src/content/config.ts` schema syntax matches Astro docs
2. **CMS Admin (T3)** — verifies `public/admin/` serves correctly and collections match content schemas  
3. **Sections (T6-T11)** — verifies `getCollection()` queries match actual collection names
4. **CMS Workflow (T13)** — verifies Decap CMS output is readable by Astro Content Collections
5. **F4** — verifies end-to-end pipeline: Decap CMS writes → Git commit → Astro build → deploy

## Execution Strategy

### Agent Dispatch Model

Tasks execute via **Sisyphus-Junior** agents. Within each wave, tasks can run in parallel (multiple agents simultaneously) or sequentially (single agent). File ownership boundaries ensure zero merge conflicts:

- **Wave 1**: 5 agents in parallel — each owns distinct config/structural files
- **Wave 2**: 6 agents in parallel — each owns one distinct `src/components/*.astro` file. No file sharing between agents.
- **Wave 3**: 2 agents in parallel — form component vs CMS config, distinct file boundaries
- **Wave FINAL**: 4 review agents in parallel — read-only, no file mutations

### File Ownership Per Wave

```
Wave 1 (Foundation — 5 parallel agents):
  Agent A (T1): package.json, astro.config.mjs, tsconfig.json, .git/
  Agent B (T2): src/content/**/* (all content directories and markdown files)
  Agent C (T3): public/admin/** (Decap CMS HTML, YAML config)
  Agent D (T4): netlify.toml, _headers, _redirects, .env.example
  Agent E (T5): src/styles/*, src/layouts/*, tailwind.config.mjs, src/components/Nav.astro

Wave 2 (Content sections — 6 parallel agents, blocked on Wave 1):
  Agent F (T6): src/components/Hero.astro  ONLY
  Agent G (T7): src/components/Services.astro  ONLY
  Agent H (T8): src/components/Fleet.astro  ONLY
  Agent I (T9): src/components/Pricing.astro  ONLY
  Agent J (T10): src/components/Membership.astro  ONLY
  Agent K (T11): src/components/Footer.astro  ONLY

Wave 3 (Interactive — 2 parallel agents, blocked on Wave 2):
  Agent L (T12): src/components/Contact.astro, src/components/ContactForm.jsx
  Agent M (T13): public/admin/config.yml (edit), .sisyphus/admin-guide.md

Wave FINAL (Verification — 4 parallel agents, read-only):
  Agent N (F1): Read-only audit (Lighthouse, axe, SEO)
  Agent O (F2): Read-only E2E testing (Playwright)
  Agent P (F3): Read-only responsive testing (Playwright)
  Agent Q (F4): Read-only content verification (Playwright + Bash)
```

### Critical Path

The actual critical path (minimum time to completion):
```
T1 (scaffolding + git repo)
  → T5 (design system — blocked by T1)
    → T6-T11 (content sections — blocked by T1+T5, run in parallel)
      → T12 (contact form — blocked by T1+T5+T6, runs parallel with T13)
      → T13 (CMS — blocked by T1+T3+T4, runs parallel with T12)
        → F1-F4 (verification — all blocked by T12+T13, run in parallel)
```

True minimum waves to completion: **4 waves** (foundation → content → interactive → verify)
Theoretical minimum time: dominated by the slowest task in each wave.

### Parallel Execution Waves

```
Wave 1 (Foundation — 5 parallel tasks):
├── Task 1: Project scaffolding + Astro + Tailwind setup [quick]
├── Task 2: Content architecture (split MD → content collections) [quick]
├── Task 3: Decap CMS admin panel setup [quick]
├── Task 4: Netlify deployment config + CI/CD [quick]
├── Task 5: Design system (CSS variables, typography, colors) [quick]

Wave 2 (Core content sections — 6 parallel, blocked on Wave 1):
├── Task 6: Hero section (brand, tagline, CTA, phone numbers) [visual-engineering]
├── Task 7: Services section (Marbella + Milano destinations) [visual-engineering]
├── Task 8: Fleet section (Mercedes S-Class showcase) [visual-engineering]
├── Task 9: Pricing section (Hourly + Airport transfers) [visual-engineering]
├── Task 10: VIP Membership section (Silver/Gold/Platinum) [visual-engineering]
├── Task 11: Footer (contact info, social, legal) [quick]

Wave 3 (Interactive features — 2 parallel, blocked on Wave 2):
├── Task 12: Contact/Quote form with Netlify Forms integration [visual-engineering]
├── Task 13: Decap CMS content model + testing [unspecified-high]

Wave FINAL (Verification — 4 parallel reviews):
├── Task F1: Full Lighthouse audit + accessibility compliance [oracle]
├── Task F2: Playwright E2E test suite [unspecified-high]
├── Task F3: Cross-device responsive verification [unspecified-high]
├── Task F4: Content fidelity + Decap CMS workflow test [deep]
```

---

## Workflow Protocol

### Per-Task Execution Order
Each task MUST follow this sequence:
1. **Read** the task description, references, and acceptance criteria
2. **Load** required skills (from the Skills array) via `skill("skill-name")`
3. **Implement** following RED-GREEN-REFACTOR (TDD):
   - Write failing test first (RED)
   - Write minimal implementation to pass (GREEN)
   - Refactor if needed (REFACTOR)
4. **Run** QA scenarios (Playwright MCP for browser, Bash for build)
5. **Capture** evidence screenshots/output to `.sisyphus/evidence/`
6. **Commit** with the specified commit message
7. **Update** plan.md checklist — mark the task `[x]` and note any deviations

### Post-Completion Protocol
- After each wave completes, verify all checkboxes in that wave are checked
- If a task encounters a blocker, note it in the plan and surface to orchestrator
- Do NOT proceed to next wave if any task in current wave is incomplete

- [x] 1. Project Scaffolding — Astro + Tailwind + Dependencies

  **What to do**:
  - Initialize Astro 5 project with `create astro` (minimal template)
  - Add Tailwind CSS v4 integration (`npx astro add tailwind`)
  - Add React for interactive islands (`npx astro add react`)
  - Install dev dependencies: Vitest, Playwright, Lighthouse CI
  - Create folder structure: `src/pages/`, `src/components/`, `src/content/`, `src/layouts/`, `src/styles/`, `public/admin/`
  - Create initial `astro.config.mjs` with site URL and integrations
  - Create initial `tsconfig.json`
  - Initialize Git repo: `git init`
  - Create GitHub repo via `gh repo create viper-security --private` or web UI
  - Make initial commit and push to GitHub
  - Verify `npm run dev` starts without errors
  - Verify `npm run build` exits with 0

  **Must NOT do**:
  - No starter template with pre-built content
  - No additional UI libraries beyond React + Tailwind

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward project initialization with well-documented tools
  - **Skills**: []
    - No special skills needed — standard Astro setup

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 6-13 (all depend on scaffolding existing)
  - **Blocked By**: None (can start immediately)

  **Acceptance Criteria**:
  - [ ] `npm run dev` starts dev server on localhost
  - [ ] `npm run build` exits with 0, outputs to `dist/`
  - [ ] Folder structure created with all directories
  - [ ] Tailwind CSS processing works (test with a utility class)

  **QA Scenarios**:
  ```
  Scenario: Project builds successfully
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Exit code 0, `dist/` directory created with index.html
    Evidence: .sisyphus/evidence/task-1-build-success.txt

  Scenario: Dev server starts
    Tool: Bash
    Steps:
      1. Run `npm run dev &` and wait 5 seconds
      2. curl http://localhost:4321
    Expected Result: HTTP 200, HTML returned
    Evidence: .sisyphus/evidence/task-1-dev-server.txt
  ```

  **Commit**: YES
  - Message: `chore(project): scaffold Astro 5 + Tailwind + React setup`
  - Files: `package.json, astro.config.mjs, tsconfig.json, src/*`

- [x] 2. Content Architecture — Split MD into Astro Content Collections

  **What to do**:
  - Read `viper-security.md` and identify all content sections
  - Create Astro Content Collections config in `src/content/config.ts`
  - Define collections: `hero`, `services`, `fleet`, `pricing`, `membership`, `site-settings`
  - Split the markdown into individual content entry files with proper frontmatter:
    - `src/content/site-settings/hero.md` — brand name, tagline, phone numbers, CTA text
    - `src/content/services/marbella.md` — Marbella services, airport transfers, yacht, business, nightlife
    - `src/content/services/milano.md` — Milano services, airport transfers, yacht, business, nightlife
    - `src/content/fleet/mercedes-s-class.md` — vehicle features, capacity, image placeholders
    - `src/content/pricing/hourly.md` — hourly rates (1h-12h)
    - `src/content/pricing/airport-transfers.md` — airport transfer prices for both locations
    - `src/content/membership/tiers.md` — Silver/Gold/Platinum tiers
  - Use `schema` in `config.ts` to validate frontmatter fields
  - Write a quick validation script that reads all content and verifies completeness

  **Must NOT do**:
  - Don't delete the original combined file (keep as source of truth)
  - Don't create content for sections not in the original file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward content structuring, no complex logic
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Tasks 6-11 (content feeds every section)
  - **Blocked By**: None (can start immediately, content is known)

  **References**:
  - `viper-security.md` — THE source of truth for all content
  - `https://docs.astro.build/en/guides/content-collections/` — Astro Content Collections docs

  **Acceptance Criteria**:
  - [ ] Content collections defined with schemas in `src/content/config.ts`
  - [ ] All sections from original file represented in content entries
  - [ ] Frontmatter validation works (invalid entries fail build)
  - [ ] Content can be queried with `Astro.glob()` or `getCollection()`

  **QA Scenarios**:
  ```
  Scenario: Content collections are valid
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds, no content validation errors
    Evidence: .sisyphus/evidence/task-2-content-valid.txt

  Scenario: All original content mapped
    Tool: Bash (script)
    Steps:
      1. Count sections in original MD vs content entries
    Expected Result: All 6 sections (Hero, Services×2, Fleet, Pricing×2, Membership) represented
    Evidence: .sisyphus/evidence/task-2-content-coverage.txt
  ```

  **Commit**: YES (with Task 1)
  - Message: `chore(project): initial scaffolding and config setup`
  - Files: `src/content/**/*`

- [x] 3. Decap CMS Admin Panel Setup

  **What to do**:
  - Create `public/admin/index.html` — HTML entry point loading Decap CMS from CDN
  - Create `public/admin/config.yml` with:
    - Backend: GitHub repo + branch configuration
    - Media folder: `public/images/`
    - Collections matching the content architecture (hero, services, fleet, pricing, membership, site-settings)
    - Each collection's fields mapped to frontmatter properties
    - Preview paths for each collection
  - Create `public/admin/index.js` (optional — for custom previews or widgets)
  - Set up Netlify Identity widget in the site layout
  - Create initial `public/images/` directory
  - Configure Git Gateway in Netlify dashboard notes (task dependency for Task 4)

  **Must NOT do**:
  - Don't create custom preview components (beyond scope for MVP)
  - Don't add authentication before Netlify setup is ready

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Decap CMS setup, well-documented
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Task 13 (CMS testing)
  - **Blocked By**: None (can start immediately, just config files)

  **References**:
  - `https://decapcms.org/docs/configure-structural-fields/` — Decap CMS config reference

  **Acceptance Criteria**:
  - [ ] `public/admin/index.html` loads Decap CMS UI
  - [ ] `public/admin/config.yml` defines all content collections
  - [ ] Collections match the content architecture from Task 2

  **QA Scenarios**:
  ```
  Scenario: Decap CMS loads at /admin
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:4321/admin
    Expected Result: Decap CMS login/UI renders (Netlify Identity or GitHub login)
    Evidence: .sisyphus/evidence/task-3-cms-loads.png
  ```

  **Commit**: YES (with Task 1)
  - Message: `chore(project): initial scaffolding and config setup`
  - Files: `public/admin/**`

- [x] 4. Netlify Deployment Config + CI/CD

  **What to do**:
  - Create `netlify.toml` with build settings:
    - Build command: `npm run build`
    - Publish directory: `dist/`
    - Redirect rules (for SPA/admin)
    - Headers (security headers, CORS)
  - Configure Netlify Identity (note: enable via Netlify dashboard post-deploy)
  - Configure Git Gateway for Decap CMS auth (note: enable post-deploy)
  - Add `_headers` file for security headers
  - Add `_redirects` file for admin route
  - Create `.env.example` with placeholder variables
  - Add `node_version = "20"` to netlify.toml

  **Must NOT do**:
  - Don't deploy yet (will deploy after Wave 2)
  - Don't configure custom domain for MVP

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Netlify config, well-documented
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Tasks F1-F4 (final verification needs deployment)
  - **Blocked By**: None (can start immediately, config only)

  **Acceptance Criteria**:
  - [ ] `netlify.toml` configured with correct build + publish settings
  - [ ] `_headers` and `_redirects` files created
  - [ ] Netlify Identity + Git Gateway setup documented

  **QA Scenarios**:
  ```
  Scenario: Build outputs correct for Netlify
    Tool: Bash
    Steps:
      1. Run `npm run build`
      2. Check dist/ exists with index.html
    Expected Result: Clean build output
    Evidence: .sisyphus/evidence/task-4-build-output.txt
  ```

  **Commit**: YES (with Task 1)
  - Message: `chore(project): initial scaffolding and config setup`
  - Files: `netlify.toml, _headers, _redirects`

- [x] 5. Design System — CSS Variables + Typography + Colors

  **What to do**:
  - Create `src/styles/global.css` with Tailwind directives and custom properties
  - Define CSS custom properties for the luxury dark theme:
    - `--color-black: #0B0B0B` (near-black background)
    - `--color-gold: #B08D45` (primary accent)
    - `--color-gold-light: #C6A45C` (lighter gold)
    - `--color-white: #FFFFFF` (text)
    - `--color-cream: #F5F0E8` (secondary text)
    - `--color-charcoal: #1A1A1A` (card/section backgrounds)
    - `--color-navy: #0F1A2E` (alternative section bg)
  - Set up typography:
    - Import Playfair Display (serif headings — luxury feel)
    - Import Manrope or Outfit (sans-serif body — clean, modern)
    - Define heading styles: H1-H6 with tracking, weights
  - Define Tailwind theme extensions in `tailwind.config.mjs`:
    - Extended colors matching CSS vars
    - Font families
    - Custom spacing / container widths
    - Border radius tokens
  - Create base layout component `src/layouts/BaseLayout.astro`:
    - HTML5 doctype, meta tags, viewport
    - Preconnect to Google Fonts
    - Global CSS import
    - Shared `<head>` with SEO meta
  - Create navigation component `src/components/Nav.astro`:
    - Sticky header with transparent-to-solid scroll
    - Nav items: Services, Fleet, Pricing, Membership, Contact
    - Mobile hamburger menu
    - Text-only logo "VIPER SECURITY" in gold
  - Document design tokens in a comment block

  **Must NOT do**:
  - No font loading from external sources beyond Google Fonts
  - No animation library (CSS transitions only)
  - No icon library yet (add if needed in later tasks)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Design system requires aesthetic judgment, typography pairing, and visual hierarchy decisions
  - **Skills**: [`frontend-design`, `ui-ux-pro-max`, `typeset`]
    - `frontend-design`: For CSS custom properties architecture, dark luxury color palette creation
    - `ui-ux-pro-max`: For luxury color palette selection (black+gold+cream), typography pairing (Playfair Display + Manrope), design token creation
    - `typeset`: For font hierarchy, sizing, letter-spacing, and luxury typography refinement
  - **Skills Evaluated but Omitted**:
    - `normalize`: Design tokens are custom luxury, not matching an existing design system to normalize against

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Tasks 6-11 (all sections depend on design system)
  - **Blocked By**: Task 1 (project scaffolding must exist)

  **References**:
  - Lamborghini DESIGN.md (project root `DESIGN.md`) — true black + gold design tokens, typography scale, surface colors, button styles
  - `https://tailwindcss.com/docs/theme` — Tailwind configuration reference

  **Acceptance Criteria**:
  - [ ] Global CSS with custom properties for all design tokens
  - [ ] Tailwind config extended with brand colors and fonts
  - [ ] BaseLayout.astro renders HTML5 structure
  - [ ] Nav.astro renders with all nav items, mobile responsive
  - [ ] Fonts load correctly (Playfair Display, Manrope)

  **QA Scenarios**:
  ```
  Scenario: Design system renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:4321
      2. Check body background is dark (--color-black)
      3. Check heading uses serif font (Playfair Display)
      4. Check nav items visible with gold accent
      5. Resize to 375px, verify hamburger menu appears
    Expected Result: Dark luxury aesthetic, proper typography, responsive nav
    Evidence: .sisyphus/evidence/task-5-design-system.png

  Scenario: CSS custom properties work
    Tool: Bash (script)
    Steps:
      1. Run `npm run build`
      2. Check built CSS contains the custom property values
    Expected Result: Build succeeds, tokens compiled
    Evidence: .sisyphus/evidence/task-5-tokens.txt
  ```

  **Commit**: YES (with Task 1)
  - Message: `chore(project): initial scaffolding and config setup`
  - Files: `src/styles/**`, `src/layouts/**`, `tailwind.config.mjs`, `src/components/Nav.astro`

- [x] 6. Hero Section — Brand, Tagline, CTA, Phone Numbers

  **What to do**:
  - Create `src/components/Hero.astro` component
  - Full-screen hero with deep black background and subtle gradient overlay
  - Text-only brand "VIPER SECURITY" in gold (#B08D45), Playfair Display serif
  - Tagline: "TRAVEL IN STYLE. ARRIVE IN COMFORT."
  - Subheading: "VIP Chauffeur & Luxury Transport — Marbella & Milano"
  - Gold "BOOK YOUR RIDE" CTA button (scrolls to contact section)
  - Display both phone numbers prominently with clickable tel: links:
    - Italy: +39 349 663 8171
    - Spain: +34 670 038 541
  - 5-star rating display with "LUXURY COMFORT PRIVACY"
  - Service icons row: Professional Drivers, Punctual & Reliable, Premium Vehicles, Discreet & Private, 24/7 Service
  - Subtle CSS fade-in animation on load
  - Use Astro ViewTransitions for smooth page transitions
  - Content pulled from `src/content/site-settings/hero.md` via Content Collections

  **Must NOT do**:
  - No background video (CSS gradient + image only for MVP)
  - No GSAP/Framer Motion animations (CSS transitions only)
  - No booking widget in hero (just CTA linking to contact form)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Hero is the most visually critical section — needs strong design sense for luxury aesthetic
  - **Skills**: [`frontend-design`, `ui-ux-pro-max`]
    - `frontend-design`: For production-grade luxury design quality, typography choices, and visual hierarchy matching competitor standards
    - `ui-ux-pro-max`: For hero section UX patterns, layout composition, CTA placement, visual hierarchy
  - **Skills Evaluated but Omitted**:
    - `animate`: CSS transitions only for MVP, no animation library needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 11)
  - **Blocks**: None (leaf task)
  - **Blocked By**: Tasks 1, 2, 5 (project + content + design system)

  **Acceptance Criteria**:
  - [ ] Hero section renders at full viewport height
  - [ ] Brand name "VIPER SECURITY" in gold serif
  - [ ] Both phone numbers displayed and clickable (tel: protocol)
  - [ ] "BOOK YOUR RIDE" CTA button visible
  - [ ] 5-star rating and service icons row present
  - [ ] Content matches hero.md from content collection

  **QA Scenarios**:
  ```
  Scenario: Hero renders with all elements
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:4321
      2. Take full-page screenshot
      3. Check text: "VIPER SECURITY" is visible
      4. Check text: "TRAVEL IN STYLE. ARRIVE IN COMFORT." is visible
      5. Check "BOOK YOUR RIDE" button exists and is clickable
      6. Check both phone numbers rendered: +39 349 663 8171 and +34 670 038 541
      7. Check 5-star rating element visible
    Expected Result: Hero section complete with all elements, luxury aesthetic
    Evidence: .sisyphus/evidence/task-6-hero.png

  Scenario: Phone numbers are clickable
    Tool: Playwright
    Steps:
      1. Check tel: links exist for both phone numbers
      2. Check href attributes: tel:+393496638171 and tel:+34670038541
    Expected Result: Both numbers have proper tel: protocol links
    Evidence: .sisyphus/evidence/task-6-phone-links.txt

  Scenario: Mobile responsive
    Tool: Playwright
    Steps:
      1. Set viewport to 375px width
      2. Verify all hero content visible without horizontal scroll
      3. Verify CTA button is tappable (not overlapping)
    Expected Result: Hero adapts to mobile
    Evidence: .sisyphus/evidence/task-6-hero-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(hero): add hero section with brand and CTA`
  - Files: `src/components/Hero.astro`

- [x] 7. Services Section — Marbella + Milano Destinations

  **What to do**:
  - Create `src/components/Services.astro` component
  - Section title: "OUR SERVICES" in gold serif
  - Two-column or tabbed layout for locations:
    - **Costa del Sol — Marbella**
    - **Northern Italy & Alps — Milano**
  - For each location, display service categories:
    - Airport Transfers (routes list)
    - VIP Villa Transfers (description)
    - Yacht Transfers (marinas list)
    - Business & Corporate Travel (bullet points)
    - Nightlife & VIP Club Transfers (venues list)
  - Content pulled from `src/content/services/marbella.md` and `src/content/services/milano.md`
  - Responsive: stacks vertically on mobile, side-by-side on desktop
  - Glassmorphism card backgrounds for each service category
  - Gold accent borders/highlights on service cards
  - Subtle CSS hover effects on cards

  **Must NOT do**:
  - No tab JavaScript (show both sections stacked or side-by-side via CSS)
  - No interactive map
  - No icons for services if not available

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout decisions, glassmorphism styling, responsive two-column design
  - **Skills**: [`frontend-design`, `arrange`]
    - `frontend-design`: For production-grade glassmorphism cards, two-column responsive layout, luxury service presentation
    - `arrange`: For two-column responsive layout structure, service card arrangement, visual rhythm, and spacing consistency
  - **Skills Evaluated but Omitted**:
    - `ui-ux-pro-max`: Layout is straightforward card grid, doesn't need full UX pattern guidance

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8, 9, 10, 11)
  - **Blocks**: None (leaf task)
  - **Blocked By**: Tasks 1, 2, 5

  **Acceptance Criteria**:
  - [ ] Both locations displayed with correct service categories
  - [ ] All airport routes from viper-security.md listed
  - [ ] Yacht transfer marinas listed for Marbella (Puerto Banús, Marbella Marina, Estepona Marina, Sotogrande Marina)
  - [ ] Business/Nightlife sections present for both locations
  - [ ] Glassmorphism card styling applied
  - [ ] Responsive layout works on mobile

  **QA Scenarios**:
  ```
  Scenario: All services displayed
    Tool: Playwright
    Steps:
      1. Scroll to Services section
      2. Take screenshot
      3. Verify "Marbella" and "Milano" sections present
      4. Verify all 5 airport routes for Marbella listed
      5. Verify all 5 airport routes for Milano listed
      6. Verify "Yacht Transfers" with 4 marinas
      7. Verify Business/Nightlife sections
    Expected Result: All services from content file displayed
    Evidence: .sisyphus/evidence/task-7-services.png

  Scenario: Mobile responsive
    Tool: Playwright
    Steps:
      1. Set viewport to 375px
      2. Verify sections stack vertically
      3. Verify all text still readable
    Expected Result: Services section adapts to mobile
    Evidence: .sisyphus/evidence/task-7-services-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(services): add services section for both locations`
  - Files: `src/components/Services.astro`

- [x] 8. Fleet Section — Mercedes S-Class Showcase

  **What to do**:
  - Create `src/components/Fleet.astro` component
  - Section title: "OUR FLEET" in gold serif
  - Hero image area with placeholder for Mercedes S-Class photo (use Unsplash premium auto image link as placeholder)
  - Vehicle name: "Mercedes-Benz S-Class 4MATIC AMG"
  - Features list displayed in a clean grid:
    - Luxury leather interior
    - Rear executive seating
    - Climate control
    - Privacy glass
    - Wi-Fi available upon request
    - Complimentary bottled water
    - Phone charging facilities
    - Professional English-speaking driver
  - Capacity display: "Up to 3 passengers • 3 large suitcases • 2 carry-on bags"
  - Content pulled from `src/content/fleet/mercedes-s-class.md`
  - Dark card layout with image on one side, details on the other (alternates on mobile)
  - Subtle gold border accent on the card

  **Must NOT do**:
  - No image gallery/lightbox
  - No multiple vehicle cards (single vehicle for MVP)
  - No 3D/model viewers

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Product showcase layout needs visual polish
  - **Skills**: [`frontend-design`]
    - `frontend-design`: For luxury product presentation layout, image + details composition, feature grid

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 9, 10, 11)
  - **Blocks**: None (leaf task)
  - **Blocked By**: Tasks 1, 2, 5

  **Acceptance Criteria**:
  - [ ] Fleet section renders with vehicle image placeholder
  - [ ] Vehicle name "Mercedes-Benz S-Class 4MATIC AMG" displayed
  - [ ] All 8 features listed with icons
  - [ ] Capacity info displayed correctly
  - [ ] Responsive layout

  **QA Scenarios**:
  ```
  Scenario: Fleet section renders
    Tool: Playwright
    Steps:
      1. Scroll to Fleet section
      2. Take screenshot
      3. Verify vehicle name displayed
      4. Verify all 8 features rendered
      5. Verify capacity text: "Up to 3 passengers • 3 large suitcases • 2 carry-on bags"
    Expected Result: Complete fleet showcase
    Evidence: .sisyphus/evidence/task-8-fleet.png
  ```

  **Commit**: YES
  - Message: `feat(fleet): add fleet vehicle showcase section`
  - Files: `src/components/Fleet.astro`

- [x] 9. Pricing Section — Hourly + Airport Transfer Rates

  **What to do**:
  - Create `src/components/Pricing.astro` component
  - Section title: "PRICING" in gold serif
  - **Hourly Chauffeur Service** sub-section:
    - 1 Hour: €120
    - 2 Hours: €220
    - 4 Hours: €400
    - 8 Hours: €700
    - Full Day (12 Hours): €950
    - Note: "Driver included."
  - **Airport Transfer Prices** sub-section with two sub-groups:
    - "Costa del Sol — Marbella" routes:
      - Málaga Airport → Marbella: From €280
      - Málaga Airport → Puerto Banús: From €300
      - Málaga Airport → Estepona: From €350
      - Málaga Airport → Sotogrande: From €380
      - Gibraltar Airport → Marbella: From €400
    - "Northern Italy & Alps — Milano" routes:
      - Malpensa Airport → Milano: From €200
      - Milano Airport → Lugano: From €300
      - Bergamo Airport → St. Moritz: From €350
      - Malpensa Airport → Monaco: From €500
      - Milano Airport → Zurich: From €600
  - Content pulled from `src/content/pricing/hourly.md` and `src/content/pricing/airport-transfers.md`
  - Dark cards with gold accent for each pricing tier
  - "From" prefix styled subtly for airport prices
  - Responsive grid layout

  **Must NOT do**:
  - No dynamic price calculator
  - No currency converter (€ only)
  - No booking integration

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Pricing table layout needs clear visual hierarchy
  - **Skills**: [`frontend-design`, `ui-ux-pro-max`]
    - `frontend-design`: For pricing card layout, "From €" styling, responsive pricing grid
    - `ui-ux-pro-max`: For pricing table UX patterns, comparison layout, visual hierarchy of tiers
  - **Skills Evaluated but Omitted**:
    - `arrange`: Pricing grid layout is handled by Tailwind grid, doesn't need separate arrange pass

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 10, 11)
  - **Blocks**: None (leaf task)
  - **Blocked By**: Tasks 1, 2, 5

  **Acceptance Criteria**:
  - [ ] All 5 hourly rates displayed with correct prices
  - [ ] All 5 Marbella airport routes with correct "From €" prices
  - [ ] All 5 Milano airport routes with correct "From €" prices
  - [ ] "Driver included." note present for hourly section
  - [ ] Responsive pricing grid on mobile

  **QA Scenarios**:
  ```
  Scenario: All pricing data correct
    Tool: Playwright
    Steps:
      1. Scroll to Pricing section
      2. Take screenshot
      3. Verify hourly: €120, €220, €400, €700, €950
      4. Verify Marbella routes: €280, €300, €350, €380, €400
      5. Verify Milano routes: €200, €300, €350, €500, €600
      6. Verify "Driver included." text
    Expected Result: All prices match viper-security.md
    Evidence: .sisyphus/evidence/task-9-pricing.png
  ```

  **Commit**: YES
  - Message: `feat(pricing): add hourly and airport transfer pricing`
  - Files: `src/components/Pricing.astro`

- [x] 10. VIP Membership Section — Silver/Gold/Platinum Tiers

  **What to do**:
  - Create `src/components/Membership.astro` component
  - Section title: "VIP MEMBERSHIP" in gold serif
  - Three-tier card layout (Silver, Gold, Platinum):
    - **SILVER VIP** — €1,500/year
      - 15 chauffeur hours annually
      - Priority booking
      - Preferred member rates
    - **GOLD VIP** — €3,500/year
      - 40 chauffeur hours annually
      - Priority booking
      - 10% discount on additional services
      - Complimentary airport transfers (2 per year)
    - **PLATINUM VIP** — €5,900/year
      - 80 chauffeur hours annually
      - Highest booking priority
      - 15% discount on additional services
      - Complimentary airport transfers (6 per year)
      - VIP concierge assistance
  - Content pulled from `src/content/membership/tiers.md`
  - Platinum card visually distinct (highlighted/gold border)
  - "INQUIRE" or "JOIN" CTA button on each tier
  - Three-column on desktop, stacked on mobile
  - Glassmorphism card styling

  **Must NOT do**:
  - No payment/checkout integration
  - No signup form (just inquiry CTA linking to contact section)
  - No annual/monthly toggle

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Tier comparison layout needs visual hierarchy and polish
  - **Skills**: [`frontend-design`, `colorize`]
    - `frontend-design`: For tiered pricing cards, platinum highlight styling, comparison layout
    - `colorize`: For Platinum tier gold accent highlighting, strategic color distribution across tiers, visual emphasis
  - **Skills Evaluated but Omitted**:
    - `ui-ux-pro-max`: Simple 3-tier layout, doesn't need advanced UX pattern guidance

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9, 11)
  - **Blocks**: None (leaf task)
  - **Blocked By**: Tasks 1, 2, 5

  **Acceptance Criteria**:
  - [ ] All 3 VIP tiers displayed with correct names and prices
  - [ ] Silver tier benefits (3 items) listed
  - [ ] Gold tier benefits (4 items) listed
  - [ ] Platinum tier benefits (5 items) listed, visually highlighted
  - [ ] "INQUIRE" or "JOIN" CTA on each tier
  - [ ] Responsive layout

  **QA Scenarios**:
  ```
  Scenario: All membership tiers displayed
    Tool: Playwright
    Steps:
      1. Scroll to VIP Membership section
      2. Take screenshot
      3. Verify "SILVER VIP" with €1,500/year and 3 benefits
      4. Verify "GOLD VIP" with €3,500/year and 4 benefits
      5. Verify "PLATINUM VIP" with €5,900/year and 5 benefits
      6. Verify Platinum card has visual distinction (gold border/glow)
    Expected Result: All tiers displayed with correct pricing and benefits
    Evidence: .sisyphus/evidence/task-10-membership.png
  ```

  **Commit**: YES
  - Message: `feat(membership): add VIP membership tiers section`
  - Files: `src/components/Membership.astro`

- [x] 11. Footer — Contact Info, Social, Legal

  **What to do**:
  - Create `src/components/Footer.astro` component
  - Dark background (#0B0B0B) with gold top border
  - Brand name "VIPER SECURITY" in gold
  - Tagline: "Professional • Discreet • Reliable"
  - Contact info section:
    - Phone Italy: +39 349 663 8171 (clickable)
    - Phone Spain: +34 670 038 541 (clickable)
    - Email placeholder (add if available)
  - Quick nav links: Services, Fleet, Pricing, Membership, Contact
  - Service badges row: Private Chauffeur, Airport Transfers, Yacht Transfers, Business Travel, VIP Events
  - Copyright line: "© 2026 Viper Security. All rights reserved."

  **Must NOT do**:
  - No newsletter signup
  - No social media feed embeds
  - No heavy footer with unnecessary links

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard footer component, straightforward implementation
  - **Skills**: [`frontend-design`]
    - `frontend-design`: For luxury footer styling — gold border, dark background, service badges layout

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9, 10)
  - **Blocks**: None (leaf task)
  - **Blocked By**: Tasks 1, 5

  **Acceptance Criteria**:
  - [ ] Footer renders at bottom of page
  - [ ] Both phone numbers displayed and clickable
  - [ ] Copyright line present with 2026
  - [ ] Quick nav links functional
  - [ ] "Professional • Discreet • Reliable" tagline displayed

  **QA Scenarios**:
  ```
  Scenario: Footer renders completely
    Tool: Playwright
    Steps:
      1. Scroll to bottom of page
      2. Take screenshot
      3. Verify "VIPER SECURITY" brand in footer
      4. Verify "Professional • Discreet • Reliable" tagline
      5. Verify both phone numbers present
      6. Verify copyright "© 2026 Viper Security"
    Expected Result: Complete footer with all elements
    Evidence: .sisyphus/evidence/task-11-footer.png
  ```

  **Commit**: YES
  - Message: `feat(footer): add footer with contact info`
  - Files: `src/components/Footer.astro`

- [x] 12. Contact/Quote Form with Netlify Forms

  **What to do**:
  - Create `src/components/Contact.astro` component (and React island for form interactivity)
  - Create `src/components/ContactForm.jsx` (React interactive island)
  - Section title: "BOOK YOUR RIDE" or "CONTACT US" in gold serif
  - Form fields:
    - Full Name (required)
    - Email (required)
    - Phone (required)
    - **Service Location** (dropdown, required): Costa del Sol — Marbella / Northern Italy — Milano
    - Service Interest (dropdown: Airport Transfer, Hourly Chauffeur, Yacht Transfer, Business Travel, VIP Membership, Other)
    - Pick-up Location (text, optional)
    - Drop-off Location (text, optional)
    - Date (date picker, optional)
    - Message (textarea, optional)
  - **GDPR consent checkbox** (required): "I consent to being contacted about my inquiry"
  - Email subject includes selected location for routing to the right regional operator
  - Netlify Forms integration:
    - Add `netlify` attribute to form tag
    - Add `data-netlify="true"` and `data-netlify-honeypot="bot-field"`
    - Hidden honeypot field for spam protection
    - Form name attribute: "contact"
  - Client-side validation (required fields highlighted)
  - Success message displayed after submission (no redirect)
  - Error state if submission fails
  - Phone numbers displayed prominently near the form:
    - Italy: +39 349 663 8171
    - Spain: +34 670 038 541
  - Also include WhatsApp click-to-chat links as an alternative
  - `client:load` directive on the React form component
  - Styled with dark background, gold accent inputs on focus
  - Responsive layout

  **Must NOT do**:
  - No backend API endpoint (Netlify Forms handles it)
  - No database storage
  - No email automation beyond Netlify's built-in notifications
  - No CAPTCHA beyond Netlify's built-in honeypot

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form design + React interactivity + Netlify Forms integration
  - **Skills**: [`webapp-testing`, `harden`]
    - `webapp-testing`: For Playwright-based form testing (fill, submit, validate success/error)
    - `harden`: For form validation logic, error states handling, edge case coverage, spam protection
  - **Skills Evaluated but Omitted**:
    - `frontend-design`: Form styling is straightforward dark theme inputs, follows design system tokens

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13)
  - **Blocks**: None (leaf task)
  - **Blocked By**: Tasks 1, 5, 6 (project must exist, design system needed, and page structure ready)

  **Acceptance Criteria**:
  - [ ] Contact form renders with all 8 fields
  - [ ] Netlify Forms attributes present (netlify, data-netlify, honeypot)
  - [ ] Client-side validation works (required fields)
  - [ ] Form submission succeeds → success message displayed
  - [ ] Phone numbers with tel: links displayed near form
  - [ ] WhatsApp click-to-chat links present
  - [ ] Mobile responsive

  **QA Scenarios**:
  ```
  Scenario: Contact form submits successfully
    Tool: Playwright MCP — use skill("playwright")
    Steps:
      1. Navigate to contact section via browser_navigate
      2. Use browser_snapshot to capture form state
      3. Fill form via browser_fill_form: Name="Test User", Email="test@example.com", Phone="+393496638171"
      4. Select "Airport Transfer" from dropdown via browser_select_option
      5. Type message via browser_type
      6. Click submit button via browser_click
      7. Wait for success message text via browser_wait_for
      8. Take screenshot via browser_take_screenshot
    Expected Result: Success message visible, no console errors, screenshot captured
    Evidence: .sisyphus/evidence/task-12-form-submit.png

  Scenario: Form validation works
    Tool: Playwright MCP — use skill("playwright")
    Steps:
      1. Click submit with empty required fields via browser_click
      2. Use browser_snapshot to capture validation state
    Expected Result: Validation errors shown on required fields, form not submitted
    Evidence: .sisyphus/evidence/task-12-form-validation.png

  Scenario: Phone numbers clickable
    Tool: Playwright MCP — use skill("playwright")
    Steps:
      1. Use browser_find to search for tel: links
    Expected Result: href="tel:+393496638171" and href="tel:+34670038541" present in DOM
    Evidence: .sisyphus/evidence/task-12-phone-links.txt
  ```

  **Commit**: YES
  - Message: `feat(contact): add contact form with Netlify Forms`
  - Files: `src/components/Contact.astro`, `src/components/ContactForm.jsx`

- [x] 13. Decap CMS Content Model + Workflow Test

  **What to do**:
  - Verify Decap CMS `config.yml` collections match the content architecture:
    - Hero collection (brand_name, tagline, subtitle, cta_text, phone_italy, phone_spain)
    - Services collection (location, service_categories, routes, descriptions)
    - Fleet collection (vehicle_name, features[], capacity_passengers, capacity_suitcases, capacity_carryon)
    - Pricing collection (hourly_rates[], airport_routes[], prices)
    - Membership collection (tier_name, price, benefits[], is_featured)
    - Site settings (brand_name, tagline, footer_text)
  - Set up proper preview paths for each collection
  - Configure media library settings
  - Test the full workflow:
    1. Deploy site to Netlify
    2. Enable Netlify Identity (enable registration)
    3. Enable Git Gateway
    4. Invite an admin user
    5. Login to /admin
    6. Edit the hero headline text
    7. Save/Publish (creates git commit)
    8. Verify Netlify detects change and triggers rebuild
    9. Verify updated content appears on live site
  - Create a quick-start guide in `.sisyphus/admin-guide.md` with steps for the admin to use Decap CMS

  **Must NOT do**:
  - No custom preview components (CDN defaults are sufficient)
  - No complex widget customizations

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: CMS configuration requires careful attention to field types, file paths, and auth flow
  - **Skills**: [`playwright`]
    - `playwright`: For Playwright MCP-based CMS workflow testing (login, navigate collections, edit, verify save + deploy)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12)
  - **Blocks**: None (leaf task)
  - **Blocked By**: Tasks 1, 3, 4 (scaffolding + admin setup + deployment config)

  **Acceptance Criteria**:
  - [ ] All content collections defined in config.yml with correct fields
  - [ ] Preview paths configured for each collection
  - [ ] Admin login works via Netlify Identity
  - [ ] Content edit → save → git commit chain verified
  - [ ] Edited content appears live after deploy
  - [ ] Admin quick-start guide created

  **QA Scenarios**:
  ```
  Scenario: Decap CMS login and edit
    Tool: Playwright
    Preconditions: Site deployed to Netlify, Identity + Git Gateway enabled
    Steps:
      1. Navigate to https://viper-security.netlify.app/admin
      2. Login via Netlify Identity (email + magic link or password)
      3. Navigate to Hero collection
      4. Edit headline tagline
      5. Click Publish/Save
      6. Verify git commit created (check GitHub)
      7. Trigger deploy or wait for auto-deploy
      8. Verify live site shows updated headline
    Expected Result: Full CMS content workflow works end-to-end
    Evidence: .sisyphus/evidence/task-13-cms-workflow.png

  Scenario: CMS collections match content
    Tool: Bash (script)
    Steps:
      1. Parse config.yml collections
      2. Compare against src/content/ directory structure
    Expected Result: Every content collection has matching content files
    Evidence: .sisyphus/evidence/task-13-collections-match.txt
  ```

  **Commit**: YES
  - Message: `feat(cms): configure Decap CMS content models`
  - Files: `public/admin/config.yml`, `public/admin/index.html`, `.sisyphus/admin-guide.md`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [x] F1. **Full Lighthouse Audit + Accessibility Compliance**

  **What to do**:
  - Run Lighthouse CI on deployed site. Verify Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
  - Run axe-core via Playwright MCP on every section. Check color contrast ratios meet WCAG AA.
  - Test keyboard navigation through all interactive elements.
  - Verify semantic HTML structure (headings hierarchy, landmarks, ARIA).
  - Use `skill("playwright")` for browser-based axe-core testing.

  **Recommended Agent Profile**:
  - **Category**: `oracle`
    - Reason: Comprehensive auditing requires analytical rigor and attention to detail
  - **Skills**: [`audit`, `web-accessibility`, `playwright`, `seo-audit`]
    - `audit`: For structured quality audit methodology across Lighthouse dimensions
    - `web-accessibility`: For WCAG compliance checking, axe-core integration, contrast analysis
    - `playwright`: For browser-based axe-core execution and interactive element testing
    - `seo-audit`: For structured SEO review — meta tags, heading hierarchy, semantic structure beyond Lighthouse basics

  **Acceptance Criteria**:
  - [ ] Lighthouse Performance ≥ 90
  - [ ] Lighthouse Accessibility ≥ 90
  - [ ] Lighthouse Best Practices ≥ 90
  - [ ] Lighthouse SEO ≥ 90
  - [ ] axe-core finds zero critical/serious violations
  - [ ] Keyboard navigation reaches all interactive elements
  - [ ] Color contrast ratios meet WCAG AA

  Output: `Lighthouse [P/A] | axe [P/A] | Contrast [P/A] | Keyboard [P/A] | VERDICT: APPROVE/REJECT`

- [x] F2. **Playwright E2E Test Suite**

  **What to do**:
  - Write and run comprehensive Playwright tests via Playwright MCP (`skill("playwright")`)
  - Test: Homepage loads all sections, contact form fill + submit + success, phone number clickable (tel:)
  - Test: Navigation scrolls to correct section, all pricing figures display correctly
  - Test: Services sections for both locations render, mobile viewport (375px) responsive
  - Take screenshots as evidence

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires writing structured test code + visual verification
  - **Skills**: [`playwright`, `webapp-testing`, `polish`]
    - `playwright`: For Playwright MCP browser automation (navigate, snapshot, fill, click, assert)
    - `webapp-testing`: For form testing patterns, submission validation, success/error state verification
    - `polish`: For final quality pass — alignment, spacing, consistency check across all sections before sign-off

  **Acceptance Criteria**:
  - [ ] All 6 sections render on homepage
  - [ ] Contact form submit → success message
  - [ ] Phone numbers have tel: links
  - [ ] Pricing matches viper-security.md
  - [ ] Mobile responsive at 375px

  Output: `Tests [N pass/N fail] | Coverage [N sections] | VERDICT`

- [x] F3. **Cross-Device Responsive Verification**

  **What to do**:
  - Use Playwright MCP to test on 3 viewports: 375px (mobile), 768px (tablet), 1440px (desktop)
  - Full-page screenshot at each viewport
  - Verify: no horizontal scroll, text readable, CTAs tappable, navigation functional
  - Verify images not broken, pricing tables stack correctly on mobile
  - Assert no layout overflow

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Cross-device testing requires systematic viewport comparison
  - **Skills**: [`playwright`, `adapt`]
    - `playwright`: For viewport manipulation via Playwright MCP, screenshot comparison, overflow detection
    - `adapt`: For systematic cross-device adaptation testing — identifying responsive breakpoint issues, touch target sizing, text readability across viewports

  **Acceptance Criteria**:
  - [ ] 375px: no horizontal scroll, CTAs tappable, text readable
  - [ ] 768px: sections display correctly, navigation works
  - [ ] 1440px: full desktop layout renders without issues
  - [ ] All screenshots captured as evidence

  Output: `375px [P/A] | 768px [P/A] | 1440px [P/A] | Issues [N] | VERDICT`

- [x] F4. **Content Fidelity + Decap CMS Workflow Test**

  **What to do**:
  - Read `viper-security.md`. Compare against live site sections via Playwright MCP
  - Every service, price, membership tier, phone number must match
  - Navigate to /admin → login via Netlify Identity → edit Hero headline
  - Save → verify git commit on GitHub → wait for Netlify deploy → verify new headline appears live

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: End-to-end content verification across source, CMS, and live site
  - **Skills**: [`playwright`]
    - `playwright`: For CMS login flow, content editing via /admin, deploy verification

  **Acceptance Criteria**:
  - [ ] 100% content match between source file and live site
  - [ ] Decap CMS login works
  - [ ] Content edit → save → git commit chain verified
  - [ ] Edited content appears live after deploy

  Output: `Content match [N/N] | CMS login [P/A] | CMS edit [P/A] | Deploy [P/A] | VERDICT`

---

## Commit Strategy

- **T1-T5**: `chore(project): initial scaffolding and config setup`
- **T6**: `feat(hero): add hero section with brand and CTA`
- **T7**: `feat(services): add services section for both locations`
- **T8**: `feat(fleet): add fleet vehicle showcase section`
- **T9**: `feat(pricing): add hourly and airport transfer pricing`
- **T10**: `feat(membership): add VIP membership tiers section`
- **T11**: `feat(footer): add footer with contact info`
- **T12**: `feat(contact): add contact form with Netlify Forms`
- **T13**: `feat(cms): configure Decap CMS content models`
- **F1-F4**: `chore(qa): accessibility and testing improvements`

---

## Future Scope (v2)

### Domain: vipersecurity.ch — Registration Guide

The domain **vipersecurity.ch** is **available** ✅ (confirmed via NXDOMAIN DNS + SWITCH RDAP HTTP 404 — the registry's way of saying "not registered"). Note: `viper.ch` is already taken, so register `vipersecurity.ch` promptly.

> ⚠ **No rush for MVP** — the site will launch on `viper-security.netlify.app` free subdomain first. Add the custom domain later.

#### Step-by-Step Process

1. **Choose a registrar** — pricing comparison (July 2026):

   | Registrar | 1st Year | Renewal/yr | WHOIS Privacy | Notes |
   |-----------|----------|------------|:-------------:|-------|
   | **CrazyDomains** 🏆 Cheapest | **$5.95** | **$6.89** | $7.00 | Lowest price overall |
   | **OVHcloud** 🏆 EU value | **€4.99** | **€6.49** | Free | Great for EU residents |
   | **Infomaniak** 🏆 Swiss | **$6.84** | **$11.35** | $2.75 | Swiss-based, data sovereignty |
   | **Dynadot** 🏆 Stable renewal | **$8.47** | **$8.47** | Free | Flat renewal, no price jump |
   | **IONOS** | **$6.00** | **$10.00** | Free | Consistent pricing |
   | **GoDaddy** | **$14.99** | **$14.99** | Free | Most recognizable brand |
   | **Namecheap** | **$18.98** | **$19.98** | Free | Free WHOIS privacy for life |

2. **Requirements**:
   - No Swiss residency required (anyone can register .ch)
   - Valid postal address and email
   - 1-year minimum registration
   - SWITCH may request a Swiss correspondence address within 30 days (rare for standard domains)

3. **Register the domain**:
   - Pick a registrar → Add to cart → Create account → Pay
   - Registration: 1 year at a time
   - DNSSEC recommended (SWITCH resilience program)

4. **Point to Netlify** (delegate DNS to Netlify — recommended):
   - In Netlify: Site settings → Domain management → Add custom domain
   - Netlify shows nameservers to set at your registrar
   - Update nameservers → wait for propagation (~1h typically, up to 48h)
   - Netlify auto-provisions free SSL (Let's Encrypt)

5. **Update site config**:
   - Change `site` in `astro.config.mjs` to `https://vipersecurity.ch`
   - Update Netlify deploy settings
   - Redeploy

#### Key Details
- **MVP subdomain**: `viper-security.netlify.app` (free, included)
- **Custom domain cost**: $5.95-$18.98/yr depending on registrar
- **SSL**: Free auto-provisioned by Netlify
- **WHOIS**: .ch hides personal data by default since 2021 (SWITCH policy)
- **Cloudflare**: Does NOT support .ch — not an option

### Free OSS Booking Widget Options
When ready to add online booking (v2), consider these free open-source options:

| Option | Description | Integration |
|--------|-------------|-------------|
| **Easy!Appointments** | Self-hosted appointment/booking calendar. PHP-based, MIT license. | Embed via iframe or API |
| **Booking Calendar** (WordPress plugin) | If migrating to WordPress later, this is the most mature free option | Requires WordPress |
| **Custom form → CRM** | Build a custom React booking form that writes to Airtable/Google Sheets as a lightweight CRM | Most flexible, more dev work |
| **Cal.com** | Open-source scheduling platform (like Calendly). Self-hostable or cloud. | Embed widget via script tag |

Recommendation for v2: Start with **Cal.com** (embed widget) for simple time slot booking, then migrate to a custom solution if booking volume grows.


### Verification Commands
```bash
npm run build            # Expected: Exit 0, no errors
npm run test             # Expected: All tests pass
npx lighthouse https://viper-security.netlify.app --view  # Expected: All ≥ 90
npx playwright test      # Expected: All E2E tests pass
```

### Final Checklist
- [ ] All "Must Have" present on live site
- [ ] All "Must NOT Have" absent from codebase
- [ ] All tasks complete with evidence in `.sisyphus/evidence/`
- [ ] All F1-F4 tests pass
- [ ] User can edit content via Decap CMS and see changes deploy
