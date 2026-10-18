# Netlify → Infomaniak Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve `sites/viper` (VIPER Security) at `https://vipersecurity.ch` from Infomaniak Web Hosting with strict Netlify-parity headers, GitHub Actions auto-deploy, Infomaniak email, and a 60-day 301 redirect from the old Netlify URL.

**Architecture:** The site is a static Astro 7 build; the only Netlify-specific behavior lives in `netlify.toml` (headers/redirects) and one form attribute, all of which are ported to Apache `.htaccess` and repo edits. Deploys move from Netlify CI to a GitHub Actions workflow that rsyncs `sites/viper/dist` over SSH. Canonical URLs flip in four files; the CMS keeps working via Sveltia's `site_domain` option; the old Netlify site becomes a 301 redirect then is deleted.

**Tech Stack:** Astro 7 static (Node 22.12.0, npm workspaces), Apache 2.4 + mod_headers/mod_rewrite/mod_mime (.htaccess), GitHub Actions, Infomaniak Manager (DNS/mail/SSL/SSH), rsync over SSH.

**Spec:** `docs/superpowers/specs/2026-10-18-netlify-to-infomaniak-migration-design.md` — the plan implements that spec; executors read both.

## Global Constraints

- Site stays 100% static: no SSR, no PHP runtime, no Netlify Forms replacement. The booking form's only live path is the WhatsApp opener.
- Build command (verbatim, from repo root): `rm -rf sites/viper/.astro node_modules/.astro && npm run build --workspace=@garage/viper`. Node: `22.12.0` (`.nvmrc`).
- `sites/dbc` behavior must not change: no edits under `sites/dbc/`, no shared-code changes beyond Task 1's attribute deletion. Its next Netlify rebuild is expected (same repo) and must remain healthy.
- CSP strings are copied byte-exact from today's `sites/viper/netlify.toml` (strict `/*` at line 48, lax `/admin/*` at line 57). Never broaden origins. Edit CSP in `.htaccess` only (the toml becomes redirect-only).
- Canonical host: `https://vipersecurity.ch` apex; `www` → apex; HTTP → HTTPS. The HTTPS-force variant is decided at the Task 5 scheme probe and ships IN the first deploy (the A record already points at the hosting — first deploy = go-live; the stub backup is the rollback).
- GitHub secrets names (exact): `INFOMANIAK_SSH_HOST`, `INFOMANIAK_SSH_USER`, `INFOMANIAK_SSH_KEY`, `INFOMANIAK_WEB_ROOT`.
- One push to `main` rebuilds BOTH Netlify sites (viper + dbc). Verify dbc health on every push that lands code (Task 1's check; cheap).
- Do not touch any other Netlify project in the team (the account has ~20 other projects).
- User-action steps are marked **(user)**; the executor stops for user input where marked.
- `public/_headers` and `sites/viper/netlify.toml` stay until Task 9 (teardown) — the old site needs its headers while it redirects.

## Review Focus

Failure modes the tasks' checks don't pin down locally; each line's test lives in the named task.

1. **DBC regression via shared form edit** (Netlify discovers forms by scanning built HTML for `data-netlify`): expectation — deletion is inert because the dbc project has Forms "not enabled" (verified via Netlify API). Test: Task 1 Step 4 greps both `dist` trees — zero `data-netlify` in either; dbc deploy on Netlify remains healthy (Task 1 Step 5).
2. **HTTPS redirect loop** (TLS may terminate at Apache or at Infomaniak's proxy): expectation — exactly one 301 hop for http→https, zero redirect for https. Test: Task 5 Step 7 (scheme probe: dump `HTTPS` and `X-Forwarded-Proto` server-side, then pick the matching variant), Task 5 Step 10 (curl loop test).
3. **CSP drift between Netlify baseline and Apache**: expectation — `curl -sI` header values from new host byte-match the recorded Netlify baseline per path (`/`, `/admin/`). Test: Task 5 Step 8 + Task 6 Step 7 comparison table.
4. **CMS editor lockout after hosting flip** (Sveltia's GitHub login binds to a Netlify-identified site): expectation — GitHub-button login works from `https://vipersecurity.ch/admin/` immediately after cutover. Test: Task 6 Step 9 (live login; `site_domain` added in Task 2).
5. **Missing/stale assets after `--delete` rsync** (fingerprinted `/_astro/*` must match emitted HTML): expectation — every asset referenced by `index.html` and `sw.js` loads 200 with immutable cache. Test: Task 6 Step 8 (asset smoke).

---

## File Structure

- `packages/shared/src/components/sections/BookingForm.astro` — Task 1 deletes the three Netlify Forms artifacts (lines 58–59, 63).
- `sites/viper/src/config/site.ts:11`, `sites/viper/public/robots.txt:4`, `sites/viper/src/content/site/content.yaml:3,4,7,10`, `sites/viper/.env.example:1,2` — Task 2 flips canonical URLs.
- `sites/viper/public/admin/config.yml` — Task 2 adds `site_domain` (CMS auth on the new origin).
- `sites/viper/public/.htaccess` (create) and `sites/viper/public/admin/.htaccess` (create) — Task 3 ports all headers/redirects to Apache. Verified: Astro **copies dotfiles from `public/` into `dist/`** (tested 2026-10-18 with a probe dotfile), so no CI copy step is needed.
- `sites/viper/netlify.toml` — Task 3 appends a rule hiding `/.htaccess` from Netlify serving; Task 7 makes the whole old site 301; Task 9 reverts/deletes.
- `.github/workflows/deploy-viper.yml` (create, new dir) — Task 4.
- Everything else is user-facing Manager actions inside Tasks 5/6/8/9, guided by steps.

---

### Task 1: Remove Netlify Forms markup from the shared BookingForm

**Files:**

- Modify: `packages/shared/src/components/sections/BookingForm.astro` (lines 58, 59, 63)

**Interfaces:**

- Produces: form markup without `data-netlify="true"`, `netlify-honeypot="bot-field"`, and the `bot-field` honeypot input on BOTH sites' future builds. No exported signature changes; client JS (WhatsApp opener) untouched.

- [ ] **Step 1: Delete lines 58–59 (`data-netlify="true"` and `netlify-honeypot="bot-field"`) and line 63 (the hidden `bot-field` input).** The `<form ... name="booking-form" method="POST">`, `honeypot-hidden` CSS class, and all other markup stay exactly as-is.

- [ ] **Step 2: Build both sites and verify the artifacts are gone**

Run: `npm run build --workspace=@garage/viper && npm run build --workspace=@garage/dbc`
Expected: both exit 0.

- [ ] **Step 3: Grep both dist trees for the Netlify artifacts**

Run: `grep -rl "data-netlify\|netlify-honeypot\|bot-field" sites/viper/dist sites/dbc/dist-dbc || echo "clean"`
Expected output: `clean` (zero matches).

- [ ] **Step 4: Run the a11y suite against the rebuilt viper dist**

Run: `npm run test:a11y -w @garage/viper`
Expected: PASS (the removed input was `aria-hidden`; no test asserts it).

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/components/sections/BookingForm.astro
git commit -m "shared: remove inert Netlify Forms artifacts from BookingForm"
```

### Task 2: Flip canonical URLs to vipersecurity.ch + CMS `site_domain`

**Files:**

- Modify: `sites/viper/src/config/site.ts:11` — `url: "https://vipersecurity.ch"`
- Modify: `sites/viper/public/robots.txt:4` — `Sitemap: https://vipersecurity.ch/sitemap-index.xml`
- Modify: `sites/viper/src/content/site/content.yaml:3,4,7,10` — `org_url`, `org_logo` (→ `https://vipersecurity.ch/images/logo.svg`), `webSiteUrl`, `privacy_policy` (→ `https://vipersecurity.ch/privacy-policy`)
- Modify: `sites/viper/.env.example:1,2` — `PUBLIC_SITE_URL=https://vipersecurity.ch`, `PUBLIC_ADMIN_EMAIL=admin@vipersecurity.ch`
- Modify: `sites/viper/public/admin/config.yml` — add root-level `site_domain: viper-security.netlify.app` (Sveltia docs: Netlify's OAuth gateway identifies the site by domain; the CMS page on vipersecurity.ch must name the Netlify site domain)

**Interfaces:**

- Produces: `astro.config` `site` (→ sitemap + PWA baseline), robots.txt, JSON-LD values all pointing at `https://vipersecurity.ch`. No component APIs change.

- [ ] **Step 1: Make the five edits exactly as listed.** In the CMS yaml, place `site_domain` at the top level, just above `backend:`. Do NOT change `repo`/`branch`.

- [ ] **Step 2: Build + grep the whole dist tree for the old origin**

Run: `npm run build --workspace=@garage/viper && grep -rl "viper-security.netlify.app" sites/viper/dist || echo clean`
Expected: `clean` — zero matches in HTML, sitemap XML, manifest, robots, SW.

- [ ] **Step 3: Type-check + commit**

```bash
cd sites/viper && npx astro check && cd ../..
git add sites/viper/src/config/site.ts sites/viper/public/robots.txt sites/viper/src/content/site/content.yaml sites/viper/.env.example sites/viper/public/admin/config.yml
git commit -m "viper: canonical domain -> vipersecurity.ch; CMS site_domain for OAuth on new origin"
```

Expected: `astro check` passes. Note: this push triggers Netlify rebuilds of both sites (viper content now points at the future domain — bounded harmless window until Task 6's DNS switch; dbc rebuild is a no-op except Task 1's change).

### Task 3: Create the Apache `.htaccess` pair (Netlify header/redirect port)

**Files:**

- Create: `sites/viper/public/.htaccess`
- Create: `sites/viper/public/admin/.htaccess`
- Modify: `sites/viper/netlify.toml` — append a serving-hide rule for `/.htaccess` (Netlify would otherwise serve the file as plain text; Apache doesn't)

**Interfaces:**

- Consumes: Task 2's canonical domain. Produces: header parity on the future host; `.htaccess` arrives inside `dist/` via Astro's public-copy (verified). The HTTPS-force rewrite block is deliberately NOT in this file yet — Task 5 adds it after the scheme probe (red flag 2).

- [ ] **Step 1: Create `sites/viper/public/.htaccess` with exactly:**

```apache
# VIPER Security — Apache config (Infomaniak web hosting).
# Ported 1:1 from netlify.toml [[headers]]/[[redirects]] + public/_headers
# (migration spec: docs/superpowers/specs/2026-10-18-netlify-to-infomaniak-migration-design.md).
# CSP source of truth now lives here (was netlify.toml only).

Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://photon.komoot.io https://vpic.nhtsa.dot.gov; frame-src https://www.google.com https://maps.google.com; object-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests"
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"

# PWA manifest MIME (netlify.toml /manifest.webmanifest rule)
AddType application/manifest+json .webmanifest

# Cache: Netlify-parity default for everything, overrides for asset paths
Header set Cache-Control "public,max-age=0,must-revalidate"
<If "%{REQUEST_URI} =~ m#^/_astro/#">
  Header set Cache-Control "public,max-age=31536000,immutable"
</If>
<If "%{REQUEST_URI} =~ m#^/images/#">
  Header set Cache-Control "public,max-age=31536000,immutable"
</If>
<If "%{REQUEST_URI} =~ m#^/sw\.js$#">
  Header set Cache-Control "no-cache,must-revalidate"
</If>
<If "%{REQUEST_URI} =~ m#^/favicon\.svg$#">
  Header set Cache-Control "public,max-age=86400"
</If>

# Redirects + rewrites (netlify.toml [[redirects]]) + canonical host
# NOTE: in .htaccess, patterns are matched WITHOUT the leading slash.
<IfModule mod_rewrite.c>
  RewriteEngine On
  # www -> apex (scheme-safe even before SSL exists; no loop risk, redirects off-host)
  RewriteCond %{HTTP_HOST} ^www\. [NC]
  RewriteRule ^ https://vipersecurity.ch%{REQUEST_URI} [R=301,L]
  # NOTE: no /favicon.ico rewrite. Verified baseline 2026-10-18: Netlify serves
  # favicon.ico as the physical file (HTTP 200) — the toml's non-force redirect
  # never fires when the file exists. Serving the file natively IS parity.
  # /admin/* -> /admin/index.html (Sveltia SPA, Netlify's 200-rewrite)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^admin(/.*)?$ admin/index.html [L]
</IfModule>

# Astro emits /404.html
ErrorDocument 404 /404.html
```

- [ ] **Step 2: Create `sites/viper/public/admin/.htaccess` with exactly:**

```apache
# /admin CMS (Sveltia, GitHub backend): laxer CSP only.
# Everything else (XFO, HSTS, cache defaults...) inherits from the root .htaccess,
# mirroring Netlify's netlify.toml per-path override.
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self' data: blob: https://unpkg.com https://github.com https://*.github.com https://*.githubusercontent.com https://api.github.com https://www.githubstatus.com; manifest-src 'self' blob:; frame-src 'none'; object-src 'none'"
```

- [ ] **Step 3: Append to `sites/viper/netlify.toml` (end of file):**

```toml
# .htaccess is an Apache artifact (Infomaniak); don't expose it as a static file here.
[[redirects]]
  from = "/.htaccess"
  to = "/404.html"
  status = 200
  force = true
```

- [ ] **Step 4: Build and verify artifacts**

Run: `npm run build --workspace=@garage/viper && test -f sites/viper/dist/.htaccess && test -f sites/viper/dist/admin/.htaccess && echo OK`
Expected: `OK`. Local header behavior is NOT testable with `astro preview` (Apache directives need Apache) — live verification is Task 5.

- [ ] **Step 5: Commit + push (rebuilt sites go live on Netlify; db site must stay healthy)**

```bash
git add sites/viper/public/.htaccess sites/viper/public/admin/.htaccess sites/viper/netlify.toml
git commit -m "viper: port Netlify headers/redirects to Apache .htaccess; hide .htaccess on Netlify"
git push origin main
```

### Task 4: GitHub Actions deploy workflow

**Files:**

- Create: `.github/workflows/deploy-viper.yml` (new directory)

**Interfaces:**

- Consumes: `.nvmrc` (22.12.0). Produces: on-push deploys of `sites/viper/dist` to `${INFOMANIAK_WEB_ROOT}` — the mechanism Tasks 5–9 rely on. Runs after every push (CMS saves commit to `main`, preserving the publish-on-save loop).

- [ ] **Step 1: Create `.github/workflows/deploy-viper.yml` with exactly:**

```yaml
name: Deploy VIPER

on:
  push:
    branches: [main]

concurrency:
  group: deploy-viper
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        # Mirrors the netlify.toml build command (verbatim) + artifact guards.
        run: |
          rm -rf sites/viper/.astro node_modules/.astro
          npm run build --workspace=@garage/viper
          test -f sites/viper/dist/.htaccess
          test -f sites/viper/dist/admin/.htaccess
          test -f sites/viper/dist/index.html
          test -f sites/viper/dist/sw.js

      - name: Deploy to Infomaniak over SSH
        env:
          SSH_HOST: ${{ secrets.INFOMANIAK_SSH_HOST }}
          SSH_USER: ${{ secrets.INFOMANIAK_SSH_USER }}
          SSH_KEY: ${{ secrets.INFOMANIAK_SSH_KEY }}
          WEB_ROOT: ${{ secrets.INFOMANIAK_WEB_ROOT }}
        run: |
          install -m 600 /dev/null deploy_key
          printf '%s\n' "$SSH_KEY" > deploy_key
          rsync -az --delete --stats \
            -e "ssh -i deploy_key -o BatchMode=yes -o StrictHostKeyChecking=accept-new" \
            sites/viper/dist/ "$SSH_USER@$SSH_HOST:$WEB_ROOT/"
          rm -f deploy_key
```

- [ ] **Step 2: Validate YAML parses**

Run: `npx --yes yaml-lint .github/workflows/deploy-viper.yml`
Expected: no output, exit 0.

- [ ] **Step 3: Commit (don't push yet if Task 5's secrets aren't wired; a push just fails the deploy step harmlessly)**

```bash
git add .github/workflows/deploy-viper.yml
git commit -m "ci: deploy viper to Infomaniak over SSH on push"
```

### Task 5: Infomaniak pre-flight, first deploy, header parity + scheme probe

**Files:** modifies `sites/viper/public/.htaccess` (one rewrite block, Step 4). **Gates: red flag 2 (scheme), STOP-rule on `.htaccess` capability.**

**⚠ Go-live reality (verified live 2026-10-18):** the A records for `vipersecurity.ch` AND `www` already point at this hosting (`128.65.195.180`) — the planned DNS-cutover gate in Task 6 is gone. The first root deploy publishes the real site to the world immediately, with parity checks minutes behind. Accepted risk (mitigated): if the STOP-rule fires, restore the stub backup (Step 1) while fixing. Nothing announces the domain yet (no Search Console, no inbound links), and the old Netlify site stays live, so exposure harm is low.

**Destination state verified live 2026-10-18 (DNS-over-HTTPS + curl):** NS = `nsany1/nsany2.infomaniak.com`; A apex+www → `128.65.195.180`; MX `5 mta-gw.infomaniak.ch.`; SPF `v=spf1 include:spf.infomaniak.ch -all`; DMARC `v=DMARC1; p=reject;`. No AAAA record (IPv4-only — acceptable, note in report). Hosting serves an Apache "site under construction" stub at `https://vipersecurity.ch/` with a valid Let's Encrypt cert (CN=vipersecurity.ch, issued 2026-10-18, expires 2027-01-16) and a bare server-default HSTS (`max-age=31536000`).

**Requires from user (stop and ask):**

1. **(user)** Infomaniak Manager → Web Hosting (plan) → SSH access: confirm SSH is enabled; read the SSH hostname (`ssh.cluster0XX.hosting.infomaniak.com`), username, and the site's **web root path** (the directory that must contain `index.html` for vipersecurity.ch). Paste the values here; we store them as GitHub secrets (Step 2).
2. **(user)** Generate an SSH keypair for CI (or accept ours: `ssh-keygen -t ed25519 -C "ci-deploy-viper"`, no passphrase) and register the **public** key on the hosting; keep the private key as the secret value.

- [ ] **Step 1: Probe SSH + tools + BACK UP the stub web root**

Run: `ssh -o BatchMode=yes "$INFOMANIAK_SSH_USER@$INFOMANIAK_SSH_HOST" 'which rsync; cd '"$INFOMANIAK_WEB_ROOT"' && tar czf "$HOME/viper-stub-backup-$(date +%F).tgz" . && ls -la "$HOME" | grep viper-stub'`
Expected: rsync path + the backup archive listed. **If rsync is missing:** switch Step 4's rsync to the `lftp` SFTP mirror (fallback in Execution notes). **If the web root shows unrelated content (beyond the stub page files):** STOP — docroot isolation unproven (anti-goal: `--delete` on shared content). The stub backup is the rollback for the go-live window.

- [ ] **Step 2: Wire secrets**

```bash
gh secret set INFOMANIAK_SSH_HOST   # paste at prompt
gh secret set INFOMANIAK_SSH_USER
gh secret set INFOMANIAK_SSH_KEY    # private key PEM
gh secret set INFOMANIAK_WEB_ROOT   # absolute path, no trailing slash
```

(No `gh` auth? Run via https://github.com/markom01/viper-security → Settings → Secrets and variables → Actions; **(user)** approval needed.)

- [ ] **Step 3: Scheme-topology probe (BEFORE any deploy — decides the HTTPS-force variant)**

Upload `probe.php` (`<?php echo "HTTPS=".$_SERVER['HTTPS']."|XFP=".(isset($_SERVER['HTTP_X_FORWARDED_PROTO'])?$_SERVER['HTTP_X_FORWARDED_PROTO']:"unset");`) to the web root (SFTP or ssh one-liner), then `curl -s "https://vipersecurity.ch/probe.php"` and `curl -s "http://vipersecurity.ch/probe.php"` — the domain is already DNS-live, no temp URL needed. Record both. **DELETE probe.php immediately** (it leaks server topology). Interpretation over HTTPS: `HTTPS=on` + `XFP=unset` → Variant A; `HTTPS=off` + `XFP=https` → Variant B.

- [ ] **Step 4: Add the HTTPS-force rule + FIRST DEPLOY (single push)**

Edit `sites/viper/public/.htaccess` — insert directly after `RewriteEngine On`, inside the existing `<IfModule>` block, with the Step 3 variant:

Variant A (Apache terminates TLS):

```apache
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://vipersecurity.ch%{REQUEST_URI} [R=301,L]
```

Variant B (TLS terminates upstream):

```apache
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://vipersecurity.ch%{REQUEST_URI} [R=301,L]
```

Commit: `git commit -am "viper: enable https force per Infomaniak topology probe"` then `git push origin main` — this push carries ALL pending commits (Tasks 1–4 + this edit). Watch: `gh run watch` (or Actions tab). Expected: run green; the four `test -f` guards pass; rsync completes. **From this moment the real site is live at vipersecurity.ch — go to Step 5 immediately.**

- [ ] **Step 5: Header parity — compare against the captured Netlify baseline**

Baseline: already captured (2026-10-18 session): `/tmp/opencode/base-*.txt` (home, admin, sw.js, manifest, favicon.ico, robots, an `/_astro/*.js` asset). Regenerate if absent: `curl -sI https://viper-security.netlify.app/` + `/admin/`.
New host: compare byte-for-byte on `https://vipersecurity.ch/` (strict set) and `/admin/` (lax set): `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (preload), `Permissions-Policy`, plus caches: `/_astro/*.js` → `immutable`, `/sw.js` → `no-cache`, `/favicon.svg` → `86400`, `/manifest.webmanifest` → `application/manifest+json`, and `/favicon.ico` → `200` with the ICO file (baseline reality: the 301 redirect never fires — the file wins).
**Expected:** same values. HSTS specifically: EXACTLY ONE `Strict-Transport-Security` header with the full `max-age=31536000; includeSubDomains; preload` value — the hosting's server-level default (`max-age=31536000` seen live) must be REPLACED by ours, not stacked (two STS headers = drift; fix before proceeding).
**STOP RULE:** if `Header` directives produce a 500 or the CSP is missing/relaxed, do NOT continue to Task 6 — restore the stub backup (`ssh` + `rm -rf "$WEB_ROOT"/* && tar xzf ~/viper-stub-backup-*.tgz` — confirm the wildcard path first), fix, redeploy (fallback: Infomaniak support / panel-level header injection per the spec's stop rule).

- [ ] **Step 6: Loop sanity**

`curl -sIL http://vipersecurity.ch/ | grep -c '^HTTP/[12].* 301'` → exactly 1 (http→https); `curl -sIL https://vipersecurity.ch/ | grep -c '^HTTP/[12].* 200'` with zero 301s on the HTTPS GET; `curl -sI https://www.vipersecurity.ch/ | grep -i location` → 301 to `https://vipersecurity.ch/`.

- [ ] **Step 7: Commit nothing (verification task) — report findings before Task 6.**

### Task 6: DNS + email cutover, cert, full verification

**Files:** none. **(user)-light: the "cutover" largely happened in the Manager BEFORE this plan was written (verified live 2026-10-18: DNS already at Infomaniak pointing at the hosting, Let's Encrypt cert already issued, MX/SPF/DMARC live) — every step verifies first; a user click is only needed where a check fails.**

- [ ] **Step 1: Baseline snapshot** — already captured (2026-10-18): `/tmp/opencode/base-*.txt`. If absent, regenerate: `curl -sI https://viper-security.netlify.app/` (+ `/admin/`) for the parity table.
- [ ] **Step 2: (verify) DNS — website:** DoH/`resolve` check `vipersecurity.ch` A + `www` A → the hosting IP (today `128.65.195.180`). Cross-check in the Manager (domain → DNS zone) that both records match the hosting's current stated IP (Infomaniak may renumber on hosting config changes). Touch the zone ONLY on a mismatch. Note: no AAAA record — acceptable (IPv4-only); include in the task report.
- [ ] **Step 3: (verify) SSL:** `echo | openssl s_client -connect www.vipersecurity.ch:443 -servername www.vipersecurity.ch 2>/dev/null | openssl x509 -noout -subject -ext subjectAltName` — the SAN MUST include `www.vipersecurity.ch` in addition to the apex (apex cert verified 2026-10-18, valid → 2027-01-16; `www` SAN unconfirmed). If `www` is missing from the SAN: **(user)** reinstall the free LE cert selecting BOTH hostnames. The validity window comfortably covers the 60-day redirect phase (renewal is Infomaniak-managed).
- [ ] **Step 4: (user) Email:** the mail service is live (MX `5 mta-gw.infomaniak.ch.`, SPF `include:spf.infomaniak.ch`, DMARC `p=reject` confirmed — the exactly-one-SPF gate is already satisfied). **(user)** In the Manager's email view: confirm the DKIM records exist (selector names are Manager-visible only — `s1`/`default._domainkey` probed empty from outside on 2026-10-18) and run the DNS Diagnostic until green; then send/receive one real round-trip.
- [ ] **Step 5: (user) Mailbox naming** — the addresses they want (they said "email at Infomaniak"; exact mailbox names are their call).
- [ ] **Step 6: Header parity** — repeat Task 5 Step 5's curl table against `https://vipersecurity.ch` (`/` strict, `/admin/` lax). Expected: matches the Netlify baseline recorded in Step 1.
- [ ] **Step 7: Loop sanity** — Task 5 Step 6 must now pass for real (exactly one 301 http→https; `www` → apex 301; 200 on apex https).
- [ ] **Step 8: Asset & PWA smoke**
  - `URL=$(curl -s https://vipersecurity.ch/ | grep -o '/_astro/[a-zA-Z0-9._-]*\.js' | head -1); curl -sI "https://vipersecurity.ch$URL"` → 200 + `Cache-Control: immutable`.
  - `curl -s https://vipersecurity.ch/manifest.webmanifest | head -c 400` is JSON containing `"start_url":"/"`; icons resolve.
  - Visit in a real browser once, confirm the "no pending updates" service-worker state (the SW auto-registers domain-local).
  - `curl -s https://vipersecurity.ch/sitemap-index.xml` lists `https://vipersecurity.ch/sitemap-0.xml`; `curl -s https://vipersecurity.ch/sitemap-0.xml | grep -c 'vipersecurity.ch'` ≥ page count.
- [ ] **Step 9: CMS login (red flag 4)** — open `https://vipersecurity.ch/admin/` in a browser; click "Sign In with GitHub"; expect the same authorize flow that works on Netlify (site_domain wired in Task 2), landing in the dashboard. Report immediately if the authorize screen errors (fallback: token login path exists, wired at Task 9).
- [ ] **Step 10: Booking form** — submit one real test booking on the live new domain; expect the WhatsApp window with prefilled text (the only live form path).

### Task 7: Old-site 301 redirect + freeze the old origin

**Files:**

- Modify: `sites/viper/netlify.toml` — prepend (as FIRST `[[redirects]]` array entry, order matters) the catch-all:

```toml
# Migration: everything must go to the new domain (60-day window; revert at teardown)
[[redirects]]
  from = "/:splat"
  to = "https://vipersecurity.ch/:splat"
  status = 301
  force = true
```

Hmm — actually TOML array-of-tables: to make it FIRST, it must appear before the existing `from = "/favicon.ico"` entry. Executor: insert at the top of the redirects section (above the `# PWA web manifest` line's first redirect).

- [ ] **Step 1: (verify note) Confirm the viper Netlify project builds from base dir `sites/viper`** — Netlify Dashboard → viper-security project → Build & deploy (this is why the catch-all cannot leak to DBC). If base dir is different, STOP and report.
- [ ] **Step 2: Edit + commit + push** (`git commit -m "viper: netlify site serves 301 to vipersecurity.ch"`).
- [ ] **Step 3: Verify the redirect** — wait for the Netlify deploy, then:
      `curl -sIL https://viper-security.netlify.app/deep/path?keep | grep -i '^HTTP\|^location'` → `301` + `location: https://vipersecurity.ch/deep/path?keep` (also check `/`, `/admin/`).
- [ ] **Step 4: (user) Freeze the old origin:** Netlify Dashboard → viper-security → Site settings → Build & deploy → disable automatic publishing (Deploys → pause/auto-publish off). DBC's publishing stays ON. (No API op in our tooling exposes this; 2 clicks, user-owned.)

### Task 8: Search Console + index handover

- [ ] **Step 1: (user)** search.google.com/search-console → add property `https://vipersecurity.ch`, verify (HTML tag method optional; the tag file would rebuild via CI — simplest: DNS `TXT` verification in the Infomaniak zone), submit `https://vipersecurity.ch/sitemap-index.xml`.
- [ ] **Step 2: Record the old-domain status:** the 301 (Task 7) carries signal; no removal requests are filed (Netlify deletion at teardown ends it).

### Task 9: Teardown day (T+60 days — calendar-gated, separate session)

**Precondition:** verification mode; all of Task 6 green; user confirms. **(user) CMS-auth decision first (design decision 8):**

- [ ] **Step 1: (user)** Choose the post-Netlify CMS login: **(recommended)** Sveltia "Sign In Using Access Token" with a GitHub personal access token (repo scope, no infra), or deploy Sveltia CMS Authenticator + own GitHub OAuth app and set `auth_endpoint` in the CMS config.
- [ ] **Step 2: Revert the old-site redirect:** `git revert <Task 7 commit>` (or re-enable publishing) + push → verify `viper-security.netlify.app/` serves 200 again.
- [ ] **Step 3: Repo cleanup commit:** delete `sites/viper/netlify.toml` and `sites/viper/public/_headers`; remove `site_domain: viper-security.netlify.app` from `sites/viper/public/admin/config.yml` (auth switched in Step 1); remove the `/.htaccess`-hide redirect (gone with netlify.toml). Update `README.md`/`CLAUDE.md` deploy badges/notes to Infomaniak + GitHub Actions.
- [ ] **Step 4: (user)** Delete the `viper-security` project in the Netlify Dashboard (only that project). Verify Forms' three registered forms + 4 test submissions vanish with it (all were the user's own tests — exported in session log).
- [ ] **Step 5: Final verification:** `https://vipersecurity.ch` still serves + headers unchanged; CMS login works from the new origin with the chosen method; `https://viper-security.netlify.app` no longer serves (or redirects are dead — expected).

---

## Execution notes for the implementer

- Commits go straight to `main` (solo-author repo); each Task's commit is one unit. The Task 5 Step 4 push is the first that changes live content (Netlify rebuilds AND the Infomaniak first deploy publishes `vipersecurity.ch`); Tasks 1–4 + the https-variant edit ride on that single push.
- The probe files (`probe.php`) are throwaways — delete immediately (they leak server topology).
- If Infomaniak's SSH lacks rsync (Task 5 Step 1 fallback), replace the `rsync` line in Task 4 with:
  `lftp -e 'set sftp:auto-confirm yes; mirror -R --delete sites/viper/dist/ '"${WEB_ROOT}"' ; bye' -u "$SSH_USER", sftp://$SSH_HOST`
  and drop the BatchMode flag.
- No temp-HTTPS-URL dance needed: `https://vipersecurity.ch` already serves the hosting (verified 2026-10-18), so Task 5's probe and parity checks run against the production URL directly.
