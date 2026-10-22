# Cloudflare Workers Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve `vipersecurity.ch` from Cloudflare Workers static assets, deployed by GitHub Actions, with header/redirect parity and a safe DNS/email cutover.

**Architecture:** A static-only Worker (`[assets] directory = "./dist"`, no `main` script) is deployed by `wrangler deploy`. Cloudflare-specific `_headers`, `_redirects`, and `.assetsignore` live in `sites/viper/deploy/cloudflare/` and are copied into `dist/` by a Node script that also validates limits and header merging. The existing Netlify and Infomaniak configs stay untouched; the Netlify project still owns the old-domain 301, and the FTP workflow becomes a manual fallback.

**Tech Stack:** Astro 7, Node 22.12, `wrangler` 4.151.3, GitHub Actions, Cloudflare DNS.

**Spec:** `docs/superpowers/specs/2026-10-22-cloudflare-workers-hosting-design.md`

## Global Constraints

- Do not modify `sites/dbc/**`, page content, components, or design.
- Do not modify `sites/viper/netlify.toml` or `sites/viper/public/_headers`; the Netlify origin still uses them.
- Cloudflare files are copied at deploy time, never committed into `dist/`.
- CSP strings must be byte-identical to `sites/viper/netlify.toml` (strict site, lax admin).
- Response scopes must each produce exactly one `Content-Security-Policy` and at most one `Cache-Control`.
- `.htaccess` files must never be uploaded.
- DNS/email console steps are user-executed; the repo work must be complete before the user starts them.
- No size guard below any Cloudflare limit; Cloudflare limits are 20,000 files, 25 MiB per file, 100 header rules, 2,000 characters per header.

## Review Focus

- `/admin/*` inheriting the strict CSP would break Sveltia CMS; the detach line is load-bearing.
- `/_astro/*` and `/images/*` inheriting the global `must-revalidate` cache rule would silently disable immutable caching.
- A request for `/.htaccess` must return 404, not the Apache config text.
- A missing `_redirects` copy drops the `/favicon.ico` → `/favicon.svg` 301.
- A 200 rewrite whose destination matches its own source is rejected by Cloudflare (`/admin/* → /admin/index.html` loops).
- A missing `_headers` copy would ship the site with no CSP at all.

---

### Task 1: Dist preparation and validation script

**Files:**

- Create: `sites/viper/scripts/prepare-cloudflare-dist.mjs`
- Test: run the script against an unprepared `dist/` (must fail), then after Task 2 files exist (must pass).

**Interfaces:**

- Consumes: `sites/viper/deploy/cloudflare/{_headers,_redirects,.assetsignore}` from Task 2; `sites/viper/dist/` from `npm run build`.
- Produces: copied files in `dist/` and exit code 0 only when all assertions hold. CI calls it with no arguments from the repo root.

- [ ] **Step 1: Write the failing test**

Create `sites/viper/scripts/prepare-cloudflare-dist.mjs` that:

1. Resolves `siteDir = sites/viper` relative to the script location.
2. Copies `deploy/cloudflare/_headers`, `_redirects`, `.assetsignore` into `dist/` (overwrite).
3. Parses `_headers` into ordered rules (`/*`, `/_astro/*`, `/images/*`, `/sw.js`, `/favicon.svg`, `/manifest.webmanifest`, `/admin/*`), tracking detach lines (`! Header-Name`).
4. For five probe paths — `/`, `/admin/index.html`, `/_astro/app.js`, `/images/x.webp`, `/sw.js` — computes the final headers by applying every matching rule in file order, where a detach removes that header and a set replaces it.
5. Exits non-zero with a concrete message when any assertion fails:
   - each probe has exactly one `Content-Security-Policy`;
   - `/` and `/images/x.webp` carry the strict CSP; `/admin/index.html` carries the lax CSP;
   - each probe has at most one `Cache-Control`;
   - `/_astro/*` and `/images/*` resolve to `public, max-age=31536000, immutable`;
   - `/sw.js` resolves to `no-cache, must-revalidate`;
   - every header line is ≤ 2,000 characters;
   - `dist` has ≤ 20,000 files and no file > 25 MiB;
   - `.assetsignore` contains `**/.htaccess`;
   - `_redirects` contains `/favicon.ico` → `/favicon.svg` with code `301`, and no 200 rule rewrites into its own source prefix.
6. Prints a one-line summary: file count, total bytes, largest file, probes checked.

- [ ] **Step 2: Run it to verify it fails**

Run: `node sites/viper/scripts/prepare-cloudflare-dist.mjs`
Expected: FAIL because `sites/viper/deploy/cloudflare/_headers` does not exist yet.

---

### Task 2: Cloudflare deploy files and Worker config

**Files:**

- Create: `sites/viper/deploy/cloudflare/_headers`
- Create: `sites/viper/deploy/cloudflare/_redirects`
- Create: `sites/viper/deploy/cloudflare/.assetsignore`
- Create: `sites/viper/wrangler.toml`
- Modify: `sites/viper/package.json` (add `wrangler` devDependency)

**Interfaces:**

- Produces: `npx wrangler deploy` run from `sites/viper` uploads `dist/` as Worker `viper-security`.

- [ ] **Step 1: Create `sites/viper/deploy/cloudflare/_headers`**

Exact content:

```
# Cloudflare Workers static assets — copied into dist/ by scripts/prepare-cloudflare-dist.mjs.
# The Netlify origin keeps using sites/viper/public/_headers and netlify.toml.

/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://photon.komoot.io https://vpic.nhtsa.dot.gov; frame-src https://www.google.com https://maps.google.com; object-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cache-Control: public, max-age=0, must-revalidate

/_astro/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable

/images/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable

/sw.js
  ! Cache-Control
  Cache-Control: no-cache, must-revalidate

/favicon.svg
  ! Cache-Control
  Cache-Control: public, max-age=86400

/manifest.webmanifest
  Content-Type: application/manifest+json

/admin/*
  ! Content-Security-Policy
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self' data: blob: https://unpkg.com https://github.com https://*.github.com https://*.githubusercontent.com https://api.github.com https://www.githubstatus.com; manifest-src 'self' blob:; frame-src 'none'; object-src 'none'
```

- [ ] **Step 2: Create `sites/viper/deploy/cloudflare/_redirects`**

```
# Cloudflare Workers static assets — copied into dist/ by scripts/prepare-cloudflare-dist.mjs.
# No /admin/* rewrite: Cloudflare rejects a 200 rule whose destination normalizes back
# into its own source, and static assets serve admin/index.html for /admin/ already.
/favicon.ico  /favicon.svg  301
```

- [ ] **Step 3: Create `sites/viper/deploy/cloudflare/.assetsignore`**

```
# Apache artifacts from sites/viper/public must never be uploaded.
**/.htaccess
**/.ftpquota
```

- [ ] **Step 4: Create `sites/viper/wrangler.toml`**

```toml
name = "viper-security"
compatibility_date = "2026-10-22"

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

- [ ] **Step 5: Add the pinned CLI**

In `sites/viper/package.json` `devDependencies`, add `"wrangler": "4.151.3"`. Run `npm install` from the repo root so the lockfile updates.

- [ ] **Step 6: Run the validator to verify it passes**

Run: `npm run build -w @garage/viper && node sites/viper/scripts/prepare-cloudflare-dist.mjs`
Expected: PASS with the summary line and no assertion message.

- [ ] **Step 7: Commit**

```bash
git add sites/viper/scripts/prepare-cloudflare-dist.mjs sites/viper/deploy/cloudflare sites/viper/wrangler.toml sites/viper/package.json package-lock.json
git commit -m "feat(viper): add Cloudflare Workers static asset config"
```

---

### Task 3: Deploy workflow

**Files:**

- Modify: `.github/workflows/deploy-viper.yml`

**Interfaces:**

- Consumes: validator from Task 1, config from Task 2.
- Produces: green workflow that uploads on push to `main` using `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.

- [ ] **Step 1: Replace the build-and-FTP job**

Keep checkout, `setup-node` with `.nvmrc`, `npm ci`, and the clean build. Delete the 9.5 MiB quota guard and the `lftp` step. Add, after the build:

```yaml
- name: Prepare and validate Cloudflare assets
  run: node sites/viper/scripts/prepare-cloudflare-dist.mjs

- name: Deploy to Cloudflare Workers
  working-directory: sites/viper
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  run: npx --no-install wrangler deploy
```

Keep `concurrency: group: deploy-viper`, `cancel-in-progress: false`, and add `workflow_dispatch` alongside the `push` trigger. Build guards keep `dist/index.html` and `dist/sw.js` checks; drop the `.htaccess` existence checks (the files are now excluded, not required).

- [ ] **Step 2: Validate the workflow syntax**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/deploy-viper.yml','utf8');if(!/wrangler deploy/.test(s))process.exit(1);console.log('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-viper.yml
git commit -m "ci(viper): deploy to Cloudflare Workers with wrangler"
```

---

### Task 4: Infomaniak FTP fallback workflow

**Files:**

- Create: `.github/workflows/deploy-viper-ftp-fallback.yml`

**Interfaces:**

- Produces: manual-only mirror of `dist/` to Infomaniak, usable while `dist` stays under 9.5 MiB. No push trigger.

- [ ] **Step 1: Copy the pre-migration job into a dispatch-only workflow**

Name it `Deploy VIPER (Infomaniak FTP fallback)`, trigger `workflow_dispatch` only, keep the 9.5 MiB guard and the existing retry loop verbatim, and add this header comment:

```yaml
# Transition-only rollback path. The Infomaniak plan allows 10 MiB total, so this
# fails once the site outgrows 9.5 MiB. Primary rollback is wrangler rollback or
# redeploying a previous commit to Cloudflare. Delete this file when the
# Cloudflare cutover is verified.
```

- [ ] **Step 2: Validate triggers**

Run: `grep -c "workflow_dispatch" .github/workflows/deploy-viper-ftp-fallback.yml`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy-viper-ftp-fallback.yml
git commit -m "ci(viper): keep FTP deploy as manual fallback"
```

---

### Task 5: Cutover runbook

**Files:**

- Create: `docs/superpowers/runbooks/2026-10-22-cloudflare-cutover.md`

**Interfaces:**

- Produces: the user-executed console sequence with gates, verification commands, and rollback.

- [ ] **Step 1: Write the runbook**

It must contain, in order:

1. Prerequisites: Cloudflare account, zone added, API token (`Workers Scripts: Edit`, `Account: Read`), account ID, GitHub secrets, BIND export of the Infomaniak zone.
2. Zone copy: every MX/SPF/DKIM/DMARC/autodiscover record; explicit warning that DMARC is `p=reject`.
3. First deploy: run the workflow manually; verify `<worker>.workers.dev` serves `/`, `/gallery/`, `/admin/`, `/.htaccess` (404), and one CSP per scope (`curl -sI`).
4. Nameserver switch at Infomaniak, then DNS verification for MX/SPF/DKIM/DMARC.
5. **Hard gate:** user sends and receives a test mail, confirms `Authentication-Results` shows `spf=pass` and `dkim=pass`; no apex swap before this.
6. Attach `www.vipersecurity.ch` to the Worker, test; then delete the apex `A 128.65.195.180` and attach the apex custom domain.
7. Enable Always Use HTTPS and the `www` → apex 301 Redirect Rule.
8. Final acceptance: the 11 checks from the spec, plus `curl -sI https://vipersecurity.ch | grep -ci content-security-policy` returning `1`.
9. Rollback: revert nameservers to `nsany1/nsany2.infomaniak.com`, or run the FTP fallback while it still fits.
10. Decommission: delete the FTP workflow, cancel the paid hosting if any, keep domain and mail.

- [ ] **Step 2: Check every spec acceptance item appears**

Run: `grep -c "Content-Security-Policy" docs/superpowers/runbooks/2026-10-22-cloudflare-cutover.md`
Expected: at least `2`.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/runbooks/2026-10-22-cloudflare-cutover.md docs/superpowers/specs/2026-10-22-cloudflare-workers-hosting-design.md docs/superpowers/plans/2026-10-22-cloudflare-workers-hosting.md
git commit -m "docs(viper): add Cloudflare cutover runbook and plan"
```

---

## Final verification

- [ ] `npm run build -w @garage/viper` succeeds.
- [ ] `node sites/viper/scripts/prepare-cloudflare-dist.mjs` passes.
- [ ] `git status` shows no DBC, content, or component changes.
- [ ] `npx wrangler deploy --dry-run` from `sites/viper` lists the expected asset count without uploading.
