# Viper Security — Full Audit Report

**Date**: 2026-07-14
**Tool**: Lighthouse 12.8.2 + axe-core 4.10.0 + Playwright
**URL**: http://localhost:4173/
**Device**: Mobile (emulated)

---

## 1. Lighthouse Scores

| Category | Score | Threshold | Verdict |
|---|---|---|---|
| Performance | **88%** | ≥ 90 | ❌ FAIL |
| Accessibility | **94%** | ≥ 90 | ✅ PASS |
| Best Practices | **100%** | ≥ 90 | ✅ PASS |
| SEO | **92%** | ≥ 90 | ✅ PASS |

### Performance Breakdown (88%)

| Metric | Value | Score | Issue |
|---|---|---|---|
| First Contentful Paint | 2.88s | 0.53 | Google Fonts render-blocking |
| Largest Contentful Paint | 3.03s | 0.77 | LCP is logo text; 85% render delay |
| Time to Interactive | 3.05s | 0.95 | OK |
| Speed Index | 3.56s | 0.87 | Render-blocking resources |
| Total Blocking Time | 0ms | 1.00 | ✅ |
| Cumulative Layout Shift | 0 | 1.00 | ✅ |

**Key performance issues:**
- Google Fonts CSS (Playfair Display + Manrope) is render-blocking
- CSS bundle is render-blocking (~21KB)
- 34KB wasted JS in client bundle

### SEO (92%)
- **robots.txt not valid** (missing or incorrect)
- Otherwise all on-page meta is correct

---

## 2. axe-core Accessibility

| Check | Result |
|---|---|
| Violations (critical/serious) | **1 serious** (color-contrast) |
| Violations (moderate) | **1 moderate** (region) |
| Passing checks | 39 |
| Inapplicable | 50 |

### Violation: color-contrast (serious) — 27 nodes
WCAG AA requires 4.5:1 contrast ratio. Multiple opacity-based text tokens on dark backgrounds fail.

### Violation: region (moderate) — 1 node
Mobile nav link outside landmark containment.

---

## 3. Color Contrast — WCAG AA

**Verdict: ❌ FAIL** — 27 instances across 7 patterns

| Pattern | Ratio | Required |
|---|---|---|
| `text-gold/80` (#91743b) on `bg-charcoal/50` (#131212) | 4.24:1 | 4.5:1 |
| `text-ash/60` (#555555) on `bg-dark-iron` (#181818) | 2.38:1 | 4.5:1 |
| `text-ash/50` (#4b4a4a) on `bg-dark-iron` (#181818) | 2.01:1 | 4.5:1 |
| `text-ash/50` (#444444) on `bg-black` (#0b0b0b) | 2.02:1 | 4.5:1 |
| `text-white/40` (#6d6d6d) on `bg-black` | 3.80:1 | 4.5:1 |
| `text-white/40` (#767676) on `bg-charcoal` (#1a1a1a) | 3.83:1 | 4.5:1 |
| `text-ash` (#7d7d7d) on `bg-charcoal` (#1a1a1a) | 4.22:1 | 4.5:1 |

All issues are **text with opacity/alpha modifiers** (`/60`, `/50`, `/40`) on dark backgrounds — these reduce contrast below threshold.

---

## 4. Keyboard Navigation

**Verdict: ✅ PASS**

- 41 focusable elements, all reachable via Tab
- Logical tab order: Logo → Menu toggle → Nav links → CTAs → Phones → Form → Submit
- Menu toggle has `aria-label="Toggle navigation menu"`
- All form inputs have accessible label associations
- No focus traps detected

---

## 5. Semantic HTML

**Verdict: ✅ PASS (with minor issues)**

| Check | Status |
|---|---|
| Heading hierarchy (h1→h2→h3→h4) | ✅ Correct |
| Single h1 ("VIPER SECURITY") | ✅ |
| Landmarks (header, nav, main, footer) | ✅ |
| Form labels (label for="") | ✅ |
| Alt text on images | ✅ (1 image, has alt) |
| ARIA attributes | ✅ 57 instances |
| Skip link | ❌ Missing |
| robots.txt | ❌ Invalid |

---

## 6. Acceptance Criteria

| # | Criterion | Status |
|---|---|---|
| 1 | Lighthouse Performance ≥ 90 | ❌ 88% |
| 2 | Lighthouse Accessibility ≥ 90 | ✅ 94% |
| 3 | Lighthouse Best Practices ≥ 90 | ✅ 100% |
| 4 | Lighthouse SEO ≥ 90 | ✅ 92% |
| 5 | axe-core zero critical/serious violations | ❌ 1 serious (color-contrast) |
| 6 | Keyboard navigation reaches all elements | ✅ |
| 7 | Color contrast meets WCAG AA | ❌ 27 failures |

---

## Verdict: ❌ **REJECT**

3 of 7 criteria failed. Primary blockers:
1. **Performance 88%** — below 90 threshold due to render-blocking Google Fonts
2. **Color contrast** — 27 WCAG AA violations (serious axe-core finding)
3. **No skip link** — keyboard users cannot bypass navigation

### Recommended Fix Commands
- `/optimize` — inline/preload Google Fonts, defer non-critical CSS, lazy-load JS
- `/normalize` — replace opacity-based text tokens (`text-*/60`, `text-*/50`, `text-white/40`) with solid hex values meeting 4.5:1
- `/harden` — add skip link, add aria-describedby to form fields
