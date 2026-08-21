# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue — resolved statuses always carry their resolution date

---

## 2026-08-18

### Observation 1: Astro dev-server CSS staleness vs built-dist authority

**Status:** OPEN
**Date:** 2026-08-18
**Session context:** DBC/VIPER shared Services.astro scroll-sheet work — verifying a `flex-basis: calc(...)` item rule landed.
**Skill:** investigate / always-verify-in-browser (memory)
**Type:** open-source
**Phase/Area:** verification workflow

**Issue:** Astro dev HMR (user's :4322) served a stale rule (`flex: 0 0 30%; min-width: 300px`) long after the file on disk had the `calc((100% - 60px) * 0.3)` version. Even a query-string reload didn't evict the cached per-module CSS. The dev-server computed layout therefore read as wrong when the built `dist` was actually correct.

**Suggested improvement:** When verifying CSS-landing changes, treat the built `dist` served on a throwaway port as authoritative — not the dev server the user keeps warm. Rule of thumb: the moment a change is CSS-only, verify against `npm run build && serve dist`, and contra-check the dev server only when dev-specific behavior is in question.

**Principle:** Know which artifact you're verifying. A warm dev server can serve a stale module; the built output is the ground truth. (Generalizes to HMR/Tailwind/vite caches across frameworks.)

**Status:** resolved-but-logged

### Observation 2: DBC offerings lack top-level `image` — hero.image is the card-bg fallback

**Status:** OPEN
**Date:** 2026-08-18
**Session context:** Adding card background images to DBC home services (existing `{svc.image && ...}` guard skipped ZoomImage because DBC offerings carry `hero.image`, not `image`).
**Skill:** New skill candidate: shared-section-image-fallback
**Type:** internal
**Phase/Area:** section renderer / data modeling

**Issue:** DBC home passed whole `offerings` objects to Services.astro; each had `hero.image` but no `image`, so `svc.image` was undefined and cards stayed plain dark. Detail pages passed `includes` that *do* have `image` — hence the asymmetry (DBC home dark, DBC /services/x cards imaged).

**Suggested improvement:** In shared Services.astro (and any shared section that renders offering cards), fall back `svc.image || svc.hero?.image` for the card background. Single renderer fix covers every offering in all sites without per-service data edits. (README/skill doc: DBC card bg = hero.image; VIPER = top-level image.)

**Principle:** In a shared renderer, the lazy root fix is at the data-access point, not per-call; a fallback at the one `{svc.image && ...}` site fixes the whole family. (Generalizes to any shared-section image sourcing.)

### Observation 3: Overflow sheet gates on card count, not a media query

**Status:** OPEN
**Date:** 2026-08-18
**Session context:** DBC home: 5 offerings wrap to a 2nd row in a 4-col grid; turned it into a horizontal scroll-sheet. VIPER home has 4 → must stay grid. DBC detail pages pass 4 includes → stay grid too.
**Skill:** New skill candidate: data-driven-overflow-sheet
**Type:** open-source
**Phase/Area:** layout / responsive

**Issue:** Choosing to scroll based on a `@media (min-width: 992px)` would also scroll 4-card pages the moment card width changed. The correct delimiter is data, not media query.

**Suggested improvement:** Gate the sheet on `services.length > 4` (or "active card count > columns") in the component, and set `tabindex={scrollSheet ? 0 : undefined}` + `overflow-x:auto` + `scroll-snap-type:x` on the same conditional. Pattern: a flex sheet with `flex: 0 0 calc((100% - gaps) * 0.3)` yields exactly 3-full + ⅓-peek at any width (`peek = W − 3R − 3gap = R/3`), which matched the user's "⅓ of card 4 visible" spec.

**Principle:** Choose scroll-on-overflow by the data that causes overflow, not by viewport width. A count-gated flex sheet generalizes to any N-card collection and keeps 4-card layouts on a static grid.
### Observation 4: DBC dist bloat ships CMS media-library originals verbatim

**Status:** OPEN
**Date:** 2026-08-18
**Session context:** Pre-production re-audit (ultrathink) of both sites before production ship. Fresh `npm run build -w @garage/dbc` → `dist-dbc` = 34M (audit baseline 8.2M, 4x regression). Du found 33M under `dist-dbc/images` — `images/cms/gallery` 122 full-res originals (up to 620KB each) + `images/from-wix/gallery` 3.7M dead (zero content refs, git-tracked, 18 files) + gallery lightbox `getImage(width:dims.width,height:dims.height)` re-encoding at original size (no downscale).
**Skill:** New skill candidate: cms-media-library-size-governance / always-verify-in-browser
**Type:** internal
**Phase/Area:** build output / CMS media pipeline

**Issue:** Sveltia CMS `media_folder: sites/dbc/public/images/cms` + `public_folder: /images/cms` copies editors' uploads verbatim into `public/` → Astro copies them to `dist/` untouched. None are `_astro/`-optimized; gallery lightbox calls `getImage` at `dims.width` (native size) so astro's optimizer produces a duplicate at ~original size. 122 gallery entries → dist 24M+ just for CMS images. Still not precached in SW (globPatterns excludes webp) but served large on gallery page (perf total-byte-weight 22441KB "very heavy").

**Suggested improvement:** (1) Delete git-tracked dead `images/from-wix/gallery` (3.7M, 18 files, no refs). (2) Downscale gallery lightbox render — width cap (e.g. 1600) so `getImage` output lands under ~200KB instead of original-size copies. (3) Long-term: CMS uploads are full-res by design; consider an astro image pipeline/CMS-derivatives floor or serving gallery originals via Netlify Image CDN at request time instead of pushing bytes to dist. (4) Re-check `du` against audit baseline after fixes — dist should return near 8M.
**Principle:** CMS media in `public/` sails through the build unoptimized — dist size is a direct function of what editors upload; the renderer must cap output size, and dead `public/` trees drift in density until someone sweeps refs. (Generalizes to any CMS-backed static site.)

### Observation 5: git stash pop can silently revert site edits + conflict phantom paths

**Status:** OPEN
**Date:** 2026-08-18
**Session context:** Mid-reapply I stashed my full edit batch to test a pristine-HEAD a11y baseline. `git stash pop` hit 2 phantom modify/delete conflicts (`.astro/content.d.ts`, `src/pages/index.astro` — generated/artifact paths recorded relative to a stale cwd), left them staged as `DU`, and the working tree silently rolled back MOST tracked site edits (services.md, nav.ts, schema, astro.config) while keeping packages/shared + deletions. 30+ min lost re-applying a known edit set from memory.
**Skill:** investigate / care (CI-safe git)
**Type:** open-source
**Phase/Area:** VCS hygiene

**Issue:** A stash created two commits (WIP + clean tree). Pop conflict on artifact paths blocks both tree-merge AND the stash ref itself (`rev-parse refs/stash` → dangling). The real danger: no visible error on unrelated files — disabled cur, edits vanish under a "stash popped" message.

**Suggested improvement:** 
- Before `git stash pop`, `git diff --diff-filter=U` to pre-clear unmerged. If conflict appears, `git checkout --theirs <path>` for generated files, never hard-reset.
- Treat `git stash pop` of a many-file batch as NOT atomic — verify `git status` after; `git diff HEAD --stat` vs expected.
- Prefer `git stash push --keep-index` + `git stash apply` (non-destructive; keeps stash) when needing a pristine baseline mid-batch.
- Generated artifact paths (`.astro/*`, `dist`) should be gitignored to never enter stash.

**Principle:** Stash pop is a merge; a conflict on ANY path makes it non-atomic. Verify counts, not messages. (Generalizes to rebase/apply.)

### Observation 6: Static-site image "optimization" must stay portable — CDN-only paths break local/preview

**Status:** OPEN
**Date:** 2026-08-19
**Session context:** DBC gallery images broke after a pre-prod batch swapped astro `getImage` for Netlify Image CDN URLs (`/.netlify/images/?url=...&w=480`). User reported "gallery don't load images, see errors in console". Repro: fetch to `/.netlify/images` returned 404 on local serve; browser console showed `Failed to load resource: 404`; after revert to astro getImage, 122/122 images load.
**Skill:** systematic-debugging / always-verify-in-browser (memory)
**Type:** open-source
**Phase/Area:** image pipeline / portability

**Issue:** `/.netlify/images` is a Netlify-infrastructure endpoint. It 200-tests fine against the live prod origin but **404s everywhere else** — local dev server, Playwright `serve dist`, Netlify preview, CI. Swapping a portable build-time pipeline (`astro:assets getImage`) for an infra-only URL silently breaks every non-prod environment and ships a "works in prod" bug. Local verif passes because the page itself 200s; only browser image decode / console errors reveal it.

**Suggested improvement:** Treat CDN/edge-only URLs as a **deploy-layer concern, never a build-time `src`**. If slimming gallery weights: use astro's own queue (`<Image>` → `_astro/*` optimized variants) which works on every origin, or accept original bytes. If a CDN is truly required, gate it behind a base-url/env flag with a portable fallback, and verify images in the built `dist` served locally (not just live). Static sites must render identically from a plain file server.

**Principle:** An image URL that doesn't resolve from `dist/` on a bare server is a broken image, regardless of live-origin test success. Optimization must not fork before/after deploy. (Generalizes to any infra-only resource: `/.netlify/*`, CDN keys, service workers.)

### Observation 7: Absolute-positioned `height:100%` image forks at the wrapper anchor — one extra height:100% fixes fill across all pages

**Status:** OPEN
**Date:** 2026-08-19
**Session context:** CtaBanner marketing image not filling its container on any page. Measured `.marketing-image-wrapper` (absolute, height:100%) = 446px, `.marketing-image` = 480px (attr-forced), anchor `.zoomable` = 480. Adding `.marketing-image-wrapper .zoomable { height:100% }` made image = anchor = wrapper = 446 exactly on DBC home/service + VIPER home/service (512 for VIPER's taller text). Same class of bug as observation 4's lightbox-overlay (absolute sibling chain).
**Skill:** frontend-design / always-verify-in-browser
**Type:** open-source
**Phase/Area:** layout / image sizing

**Issue:** `height:100%` chains resolve against DIFFERENT ancestors. The image's 100% hits `.zoomable` (the `<a>`), which sizes to the image's intrinsic width/height attrs — not to the absolute wrapper. Two independent percentage chains diverge → image overflows/underfills its container silently. Only browser measurement (getBoundingClientRect) reveals it.

**Suggested improvement:** When an absolutely-positioned image container has `height:100%`, also pin the intermediate wrapper (`<a>`/`<figure>`) to `height:100%` so the whole chain (container → wrapper → img) collapses to one height. Verify with computed rects, not dev-tools intuition. (Same pattern for any `object-fit` image in a percentage-height container with a wrapper element.)

**Principle:** `height:100%` is not "inherit container" — it's "resolve against nearest positioned ancestor via the direct parent's height." Any wrapper between container and img forks the chain. Pin every level. (Generalizes to nested `height:100%` anywhere.)
