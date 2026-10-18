# Netlify → Infomaniak Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve `sites/viper` (VIPER Security) at `https://vipersecurity.ch` from Infomaniak Web Hosting with strict Netlify-parity headers, GitHub Actions auto-deploy, Infomaniak email, and a 60-day 301 redirect from the old Netlify URL.

**Architecture:** The site is a static Astro 7 build; the only Netlify-specific behavior lives in `netlify.toml` (headers/redirects) and one form attribute, all of which are ported to Apache `.htaccess` and repo edits. Deploys move from Netlify CI to a GitHub Actions workflow that mirrors `sites/viper/dist` to the hosting over FTP (lftp). Canonical URLs flip in four files; the CMS keeps working via Sveltia's `site_domain` option; the old Netlify site becomes a 301 redirect then is deleted.

**Tech Stack:** Astro 7 static (Node 22.12.0, npm workspaces), Apache + mod_headers/mod_rewrite/mod_mime (.htaccess), GitHub Actions, lftp over FTP (port 21, passive), Infomaniak Manager (DNS/mail/SSL). No SSH/SFTP/FTPS/PHP on this hosting (verified 2026-10-18) — irrelevant for a 100% static site, but it defines the deploy transport.

**Spec:** `docs/superpowers/specs/2026-10-18-netlify-to-infomaniak-migration-design.md` — the plan implements that spec; executors read both.

## Global Constraints

- Site stays 100% static: no SSR, no PHP runtime (none available on the host — verified), no Netlify Forms replacement. The booking form's only live path is the WhatsApp opener.
- Build command (verbatim, from repo root): `rm -rf sites/viper/.astro node_modules/.astro && npm run build --workspace=@garage/viper`. Node: `22.12.0` (`.nvmrc`).
- `sites/dbc` behavior must not change: no edits under `sites/dbc/`, no shared-code changes beyond Task 1's attribute deletion. Its next Netlify rebuild is expected (same repo) and must remain healthy.
- CSP strings are copied byte-exact from `sites/viper/netlify.toml` (the `/*` and `/admin/*` header blocks). Never broaden origins. Edit CSP in `.htaccess` only (the toml becomes redirect-only).
- Canonical host: `https://vipersecurity.ch` apex; `www` → apex; HTTP → HTTPS. **The HTTPS-force rule is Variant B (`%{HTTP:X-Forwarded-Proto}`)** — decided by live probe 2026-10-18: variant A (`%{HTTPS}`) loops infinitely (TLS terminates upstream), variant B gives 200/0-redirects. It ships in the first deploy. The A record already points at the hosting → **first deploy = go-live**; the stub backup is the rollback.
- GitHub secrets names (exact): `INFOMANIAK_FTP_HOST`, `INFOMANIAK_FTP_USER`, `INFOMANIAK_FTP_PASSWORD`. The `gh` CLI on this machine is authenticated as `markom01` (verified) → the executor sets secrets directly. The FTP password appeared in the 2026-10-18 session log → rotate at teardown (Task 9) and update the secret.
- Hosting facts (all verified live 2026-10-18): FTP root **is** the site docroot (upload → `https://vipersecurity.ch/…` 200 roundtrip); plain FTP port 21 only; PHP not executable (`.php` served as source); `.htaccess` mechanics proven on the real host — `Header always set`, `<If "%{REQUEST_URI} =~ m#…#">` blocks, `ErrorDocument`, and mod_rewrite redirects all work; nested-dir uploads (as `/admin/` needs) work; probe cleanup left zero residue.
- Deploy transport = plain FTP (no TLS offered by host). Password lives only in the GitHub secret; this is the hosting's constraint, accepted for a static site. Keep `.ftpquota` excluded from remote deletes (`-x '.ftpquota'`).
- One push to `main` rebuilds BOTH Netlify sites (viper + dbc) AND (once Task 4 lands) triggers the Infomaniak FTP deploy. Verify dbc health on every push that lands code (Task 1's check; cheap).
- Do not touch any other Netlify project in the team (the account has ~20 other projects).
- User-action steps are marked **(user)**; the executor stops for user input where marked.
- `public/_headers` and `sites/viper/netlify.toml` stay until Task 9 (teardown) — the old site needs its headers while it redirects.

## Review Focus

Failure modes the tasks' checks don't pin down locally; each line's test lives in the named task.

1. **DBC regression via shared form edit** (Netlify discovers forms by scanning built HTML for `data-netlify`): expectation — deletion is inert because the dbc project has Forms "not enabled" (verified via Netlify API). Test: Task 1 Step 4 greps both `dist` trees — zero `data-netlify` in either; dbc deploy on Netlify remains healthy (Task 1 Step 5).
2. **HTTPS redirect loop**: expectation — exactly one 301 hop for http→https, zero redirect for https. RESOLVED by probe: Variant B is the shipped rule (variant A loops on this host). Test: Task 5 Step 4 re-checks the shipped config with `curl -L --max-redirs`.
3. **CSP drift between Netlify baseline and Apache**: expectation — `curl -sI` header values from new host byte-match the recorded Netlify baseline per path (`/`, `/admin/`), exactly ONE CSP and ONE HSTS header per response. Test: Task 5 Step 3 + Task 6 Step 6 comparison table.
4. **CMS editor lockout after hosting flip** (Sveltia's GitHub login binds to a Netlify-identified site): expectation — GitHub-button login works from `https://vipersecurity.ch/admin/` immediately after cutover. Test: Task 6 Step 9 (live login; `site_domain` added in Task 2).
5. **Missing/stale assets after `--delete` mirror** (fingerprinted `/_astro/*` must match emitted HTML): expectation — every asset referenced by `index.html` and `sw.js` loads 200 with immutable cache. Test: Task 6 Step 8 (asset smoke).
6. **Old-site redirect leaking to DBC**: expectation — it cannot. Proof (2026-10-18): viper's live `/admin/` serves the LAX CSP which exists ONLY in `sites/viper/netlify.toml` → Netlify demonstrably reads that file for the viper project, so Task 7's catch-all is site-scoped. Test: Task 7 Step 3 checks viper 301s AND `https://dbcustomgarage.netlify.app/` still 200s without redirect.

---

## File Structure

- `packages/shared/src/components/sections/BookingForm.astro` — Task 1 deletes the three Netlify Forms artifacts (lines 58–59, 63).
- `sites/viper/src/config/site.ts:11`, `sites/viper/public/robots.txt:4`, `sites/viper/src/content/site/content.yaml:3,4,7,10`, `sites/viper/.env.example:1,2` — Task 2 flips canonical URLs.
- `sites/viper/public/admin/config.yml` — Task 2 adds `site_domain` (CMS auth on the new origin).
- `sites/viper/public/.htaccess` (create) and `sites/viper/public/admin/.htaccess` (create) — Task 3 ports all headers/redirects to Apache. Verified: Astro **copies dotfiles from `public/` into `dist/`** (tested 2026-10-18 with a probe dotfile), so no CI copy step is needed.
- `sites/viper/netlify.toml` — Task 3 appends a rule hiding `/.htaccess` from Netlify serving; Task 7 makes the whole old site 301; Task 9 reverts/deletes.
- `.github/workflows/deploy-viper.yml` (create, new dir) — Task 4; mirrors `sites/viper/dist` to the FTP account root (= the docroot — verified) via lftp.
- Everything else is user-facing Manager actions inside Tasks 6/8/9, guided by steps.

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

Run: `npm run build --workspace=@garage/viper && grep -rl "viper-security.netlify.app" sites/viper/dist | grep -v '/admin/' || echo clean`
Expected: `clean` — zero matches in HTML, sitemap XML, manifest, robots, SW. The single expected hit under `/admin/` is `config.yml`'s `site_domain` (excluded by design — the CMS keeps using the Netlify OAuth gateway until teardown).

- [ ] **Step 3: Type-check + commit**

```bash
cd sites/viper && npx astro check && cd ../..
git add sites/viper/src/config/site.ts sites/viper/public/robots.txt sites/viper/src/content/site/content.yaml sites/viper/.env.example sites/viper/public/admin/config.yml
git commit -m "viper: canonical domain -> vipersecurity.ch; CMS site_domain for OAuth on new origin"
```

Expected: `astro check` passes. Note: this commit (once pushed) triggers Netlify rebuilds of both sites — viper content will point at the future domain during a bounded harmless window until the first Infomaniak deploy publishes (Task 5).

### Task 3: Create the Apache `.htaccess` pair (Netlify header/redirect port)

**Files:**

- Create: `sites/viper/public/.htaccess`
- Create: `sites/viper/public/admin/.htaccess`
- Modify: `sites/viper/netlify.toml` — append a serving-hide rule for `/.htaccess` (Netlify would otherwise serve the file as plain text; Apache doesn't)

**Interfaces:**

- Consumes: Task 2's canonical domain. Produces: header parity on the live host; `.htaccess` arrives inside `dist/` via Astro's public-copy (verified). The HTTPS-force rule (Variant B — empirically decided 2026-10-18) is INCLUDED directly in this first version; every directive class in this file was proven live over FTP before writing it.

- [ ] **Step 1: Create `sites/viper/public/.htaccess` with exactly:**

```apache
# VIPER Security — Apache config (Infomaniak web hosting).
# Ported from netlify.toml [[headers]]/[[redirects]] + public/_headers, extended with
# canonical-host redirects (topology verified live 2026-10-18 over FTP).
# (migration spec: docs/superpowers/specs/2026-10-18-netlify-to-infomaniak-migration-design.md)
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
  # http -> https. Variant B (X-Forwarded-Proto): TLS terminates upstream at the
  # Infomaniak proxy — live probe proved %{HTTPS}-based variant A loops forever here.
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://vipersecurity.ch%{REQUEST_URI} [R=301,L]
  # www -> apex
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
# mirroring Netlify's netlify.toml per-path override. Child-dir Header set replaces
# the parent's value for the same response (single CSP header expected — Task 5 Step 3).
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
Expected: `OK`. Local header behavior is NOT testable with `astro preview` (Apache directives need Apache) — but every directive class this file uses was separately proven on the live host 2026-10-18; the full-file check is Task 5 Step 3.

- [ ] **Step 5: Commit + push (rebuilt sites go live on Netlify; db site must stay healthy)**

```bash
git add sites/viper/public/.htaccess sites/viper/public/admin/.htaccess sites/viper/netlify.toml
git commit -m "viper: port Netlify headers/redirects to Apache .htaccess; hide .htaccess on Netlify"
git push origin main
```

### Task 4: GitHub Actions deploy workflow (FTP via lftp)

**Files:**

- Create: `.github/workflows/deploy-viper.yml` (new directory)

**Interfaces:**

- Consumes: `.nvmrc` (22.12.0). Produces: on-push deploys of `sites/viper/dist` to the FTP account root — which IS the site docroot (verified by upload roundtrip), so no remote path configuration exists. Runs after every push (CMS saves commit to `main`, preserving the publish-on-save loop).

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
        # Mirrors the netlify.toml build command + artifact guards.
        run: |
          rm -rf sites/viper/.astro node_modules/.astro
          npm run build --workspace=@garage/viper
          test -f sites/viper/dist/.htaccess
          test -f sites/viper/dist/admin/.htaccess
          test -f sites/viper/dist/index.html
          test -f sites/viper/dist/sw.js

      - name: Deploy to Infomaniak over FTP
        # This hosting offers FTP only (no SSH/SFTP/FTPS — verified 2026-10-18).
        # lftp mirror --delete = the rsync-equivalent; .ftpquota stays untouched.
        env:
          FTP_HOST: ${{ secrets.INFOMANIAK_FTP_HOST }}
          FTP_USER: ${{ secrets.INFOMANIAK_FTP_USER }}
          FTP_PASSWORD: ${{ secrets.INFOMANIAK_FTP_PASSWORD }}
        run: |
          sudo apt-get update -qq && sudo apt-get install -y -qq lftp
          lftp -u "$FTP_USER","$FTP_PASSWORD" "ftp://$FTP_HOST" -e "
            set ftp:ssl-allow false;
            set ftp:passive-mode true;
            set net:max-retries 3;
            set net:timeout 20;
            set mirror:parallel-transfer-count 4;
            mirror -R --delete --verbose -x '.ftpquota' sites/viper/dist/ /;
            bye"
```

- [ ] **Step 2: Validate YAML parses**

Run: `npx --yes yaml-lint .github/workflows/deploy-viper.yml`
Expected: no output, exit 0.

- [ ] **Step 3: Commit (the push happens in Task 5 — one first-deploy push)**

```bash
git add .github/workflows/deploy-viper.yml
git commit -m "ci: deploy viper to Infomaniak over FTP on push"
```

### Task 5: First deploy + header parity + canonical-host verification

**Files:** none (verification task). **Gate: STOP rule on live header output.**

**⚠ Go-live reality (verified live 2026-10-18):** the A records for `vipersecurity.ch` AND `www` already point at this hosting (`128.65.195.180`) — there is no DNS-cutover moment left. The first root deploy publishes the real site to the world immediately, with parity checks minutes behind. Accepted risk (mitigated): if the STOP-rule fires, roll back to the stub (Step 5). Nothing announces the domain yet (no Search Console, no inbound links), and the old Netlify site stays live.

**Already done 2026-10-18 (no steps below — recorded as evidence):**

- FTP credentials verified against `h2park-8d750cc5.infomaniak.ch`; FTP root == docroot (upload → live 200 roundtrip); nested-dir uploads work; passive mode fine.
- `.htaccess` capability probe over FTP: `Header always set` ✅, `<If "%{REQUEST_URI} =~ …">` ✅, `ErrorDocument` ✅, mod_rewrite redirects ✅, cleanup ✅ zero residue.
- Scheme-topology probe: **Variant B** confirmed (variant A loops; B gives 200/0-redirects) — baked into Task 3's file.
- `www` 301 rule tested live ✅. `www` SAN on the LE cert verified ✅ (apex + www present).
- Stub backup captured: `/tmp/opencode/infomaniak-probe/stub-index.html` + `stub-background.jpg` (re-downloadable from FTP anytime: `index.html`, `index_background_tmp.jpg`).
- Netlify baselines captured: `/tmp/opencode/base-*.txt` (home, admin, sw.js, manifest, favicon.ico, robots, one `/_astro/*.js`).

- [ ] **Step 1: Wire the three FTP secrets** (values from the 2026-10-18 session; `gh` CLI verified authenticated as `markom01`):

```bash
gh secret set INFOMANIAK_FTP_HOST --body "h2park-8d750cc5.infomaniak.ch"
gh secret set INFOMANIAK_FTP_USER --body "pa5c67_opencode"
gh secret set INFOMANIAK_FTP_PASSWORD --body "<from the 2026-10-18 session log — rotate at teardown>"
```

(No `gh` auth? GitHub → repo → Settings → Secrets and variables → Actions; **(user)** approval needed.)

- [ ] **Step 2: First deploy.** `git push origin main` (carries ALL pending commits: Tasks 1–4). Watch: `gh run watch` (or the Actions tab). Expected: run green; the four `test -f` guards pass; lftp mirror lists uploads. **From this moment the real site is live at vipersecurity.ch — go to Step 3 immediately.**

- [ ] **Step 3: Header parity — compare against the captured Netlify baseline**

Baseline: `/tmp/opencode/base-*.txt` (2026-10-18). Regenerate if absent: `curl -sI https://viper-security.netlify.app/` + `/admin/`.
New host: compare byte-for-byte on `https://vipersecurity.ch/` (strict set) and `/admin/` (lax set): `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (preload), `Permissions-Policy`, plus caches: `/_astro/*.js` → `immutable`, `/sw.js` → `no-cache`, `/favicon.svg` → `86400`, `/manifest.webmanifest` → `application/manifest+json`, and `/favicon.ico` → `200` with the ICO file.
**Expected:** same values; exactly ONE `Content-Security-Policy` and ONE `Strict-Transport-Security` header per response (the hosting's bare server-default HSTS `max-age=31536000` must be REPLACED by ours, not stacked; the admin child `.htaccess` must REPLACE the root CSP, not stack).
**STOP RULE:** if `Header` directives produce a 500 or the CSP is missing/relaxed/duplicated, do NOT continue to Task 6 — roll back per Step 5, fix, redeploy (fallback: Infomaniak support / panel-level header injection per the spec's stop rule).

- [ ] **Step 4: Canonical-host + loop checks**

`curl -sIL http://vipersecurity.ch/ | grep -c '^HTTP/[12].* 301'` → exactly 1 (http→https). `curl -s -o /dev/null -w '%{http_code}/%{num_redirects}' -L --max-redirs 5 https://vipersecurity.ch/` → `200/0`. `curl -sI https://www.vipersecurity.ch/ | grep -i location` → 301 to `https://vipersecurity.ch/`.

- [ ] **Step 5: Rollback (only if the STOP rule fired).** Wipe the deployed tree and restore the captured stub:

```bash
mkdir -p /tmp/opencode/empty-dir
lftp -u "<user>","<pass>" "ftp://h2park-8d750cc5.infomaniak.ch" -e "
  set ftp:ssl-allow false;
  mirror -R --delete -x '.ftpquota' /tmp/opencode/empty-dir/ /;
  put /tmp/opencode/infomaniak-probe/stub-index.html -o index.html;
  put /tmp/opencode/infomaniak-probe/stub-background.jpg -o index_background_tmp.jpg;
  bye"
```

- [ ] **Step 6: Report findings (verification task) — before Task 6.**

### Task 6: Email, cert, DNS re-verification, full live verification

**Files:** none. **(user)-light: most of the "cutover" happened in the Manager BEFORE this plan (verified live 2026-10-18) — steps verify first; a user click is needed only where a check fails.**

- [ ] **Step 1: Baseline snapshot** — already captured (2026-10-18): `/tmp/opencode/base-*.txt`. If absent, regenerate: `curl -sI https://viper-security.netlify.app/` (+ `/admin/`).
- [ ] **Step 2: (verify) DNS — website:** `vipersecurity.ch` A + `www` A → the hosting IP (today `128.65.195.180`). Cross-check in the Manager (domain → DNS zone) that both records match the hosting's stated IP (Infomaniak may renumber on config changes). Touch the zone ONLY on a mismatch. No AAAA record — acceptable (IPv4-only); note in the report.
- [ ] **Step 3: (verify) SSL:** apex cert verified 2026-10-18 (LE, valid → 2027-01-16, SAN includes `www`). Cheap re-check: `echo | openssl s_client -connect www.vipersecurity.ch:443 -servername www.vipersecurity.ch 2>/dev/null | openssl x509 -noout -subject -ext subjectAltName`. Renewal is Infomaniak-managed; the window covers the 60-day redirect phase.
- [ ] **Step 4: Email** — state verified 2026-10-18: MX `5 mta-gw.infomaniak.ch.`, SPF `v=spf1 include:spf.infomaniak.ch -all` (exactly one — gate already satisfied), DMARC `v=DMARC1; p=reject;`. **DKIM is missing** (11 selector names probed externally, all absent) — most likely because no Mail Service/mailboxes exist on the domain yet. **(user)** In the Manager: check the Mail section; if no service exists, create the mailbox(es) — Infomaniak's assistant then publishes DKIM automatically. Verify via Mail Service → Global Security (SPF/DKIM/DMARC indicators must be green; FAQ 2692). If mail is hosted elsewhere, add DKIM manually in DNS Zone → Add record → DKIM (FAQ 841). Not a cutover blocker (p=reject already passes via aligned SPF for mail sent through Infomaniak), but strongly recommended. Then one real round-trip message.
- [ ] **Step 5: (user) Mailbox naming** — the addresses they want (exact mailbox names are their call).
- [ ] **Step 6: Header parity** — repeat Task 5 Step 3's curl table against `https://vipersecurity.ch` (`/` strict, `/admin/` lax). Expected: matches the Netlify baseline.
- [ ] **Step 7: Canonical-host + loop checks** — Task 5 Step 4 must now pass on the real deployed site (exactly one 301 http→https; `www` → apex 301; 200/0 on apex https).
- [ ] **Step 8: Asset & PWA smoke**
  - `URL=$(curl -s https://vipersecurity.ch/ | grep -o '/_astro/[a-zA-Z0-9._-]*\.js' | head -1); curl -sI "https://vipersecurity.ch$URL"` → 200 + `Cache-Control: immutable`.
  - `curl -s https://vipersecurity.ch/manifest.webmanifest | head -c 400` is JSON containing `"start_url":"/"`; icons resolve.
  - Visit in a real browser once, confirm the "no pending updates" service-worker state (the SW auto-registers domain-local).
  - `curl -s https://vipersecurity.ch/sitemap-index.xml` lists `https://vipersecurity.ch/sitemap-0.xml`; `curl -s https://vipersecurity.ch/sitemap-0.xml | grep -c 'vipersecurity.ch'` ≥ page count.
- [ ] **Step 9: CMS login (red flag 4)** — open `https://vipersecurity.ch/admin/` in a browser; click "Sign In with GitHub"; expect the same authorize flow that works on Netlify (site_domain wired in Task 2), landing in the dashboard. Report immediately if the authorize screen errors (fallback: token login path exists, wired at Task 9).
- [ ] **Step 10: Booking form** — submit one real test booking on the live new domain; expect the WhatsApp window with prefilled text (the only live form path).

### Task 7: Old-site 301 redirect + freeze the old origin

**Files:**

- Modify: `sites/viper/netlify.toml` — insert as the FIRST `[[redirects]]` entry (above `from = "/favicon.ico"`; order matters):

```toml
# Migration: everything must go to the new domain (60-day window; revert at teardown)
[[redirects]]
  from = "/:splat"
  to = "https://vipersecurity.ch/:splat"
  status = 301
  force = true
```

- [ ] **Step 1: (already resolved) The catch-all is site-scoped.** Proof (2026-10-18): viper's live `/admin/` serves the lax CSP that exists ONLY in `sites/viper/netlify.toml` → Netlify reads that file for the viper project; inserting the catch-all there cannot affect DBC. Optional 10-second confirmation: Netlify dashboard → viper-security → Build & deploy → inspect the base directory.
- [ ] **Step 2: Edit + commit + push** (`git commit -m "viper: netlify site serves 301 to vipersecurity.ch"`). Note: this push also triggers the Infomaniak FTP deploy (workflow from Task 4) — expected, no-op content-wise.
- [ ] **Step 3: Verify the redirect + DBC isolation** — wait for the Netlify deploy, then:
      `curl -sIL https://viper-security.netlify.app/deep/path?keep | grep -i '^HTTP\|^location'` → `301` + `location: https://vipersecurity.ch/deep/path?keep` (also check `/`, `/admin/`); AND `curl -sI https://dbcustomgarage.netlify.app/ | head -1` → `200`, no redirect (DBC untouched).
- [ ] **Step 4: (user) Freeze the old origin:** Netlify Dashboard → viper-security → Site settings → Build & deploy → disable automatic publishing (Deploys → pause/auto-publish off). DBC's publishing stays ON. (No API op in our tooling exposes this; 2 clicks, user-owned.)

### Task 8: Search Console + index handover

- [ ] **Step 1: (user)** search.google.com/search-console → add property `https://vipersecurity.ch`, verify (HTML tag method optional; the tag file would rebuild via CI — simplest: DNS `TXT` verification in the Infomaniak zone), submit `https://vipersecurity.ch/sitemap-index.xml`.
- [ ] **Step 2: Record the old-domain status:** the 301 (Task 7) carries signal; no removal requests are filed (Netlify deletion at teardown ends it).

### Task 9: Teardown day (T+60 days — calendar-gated, separate session)

**Precondition:** all of Task 6 green; user confirms. **(user) CMS-auth decision first (design decision 8):**

- [ ] **Step 1: (user)** Choose the post-Netlify CMS login: **(recommended)** Sveltia "Sign In Using Access Token" with a GitHub personal access token (repo scope, no infra), or deploy Sveltia CMS Authenticator + own GitHub OAuth app and set `auth_endpoint` in the CMS config.
- [ ] **Step 2: Revert the old-site redirect:** `git revert <Task 7 commit>` (or re-enable publishing) + push → verify `viper-security.netlify.app/` serves 200 again.
- [ ] **Step 3: Repo cleanup commit:** delete `sites/viper/netlify.toml` (this also removes the `@netlify/plugin-lighthouse` config — currently all-100 scores; optionally replace with Lighthouse CI later, not required) and `sites/viper/public/_headers`; remove `site_domain: viper-security.netlify.app` from `sites/viper/public/admin/config.yml` (auth switched in Step 1). Update `README.md`/`CLAUDE.md` deploy badges/notes to Infomaniak + GitHub Actions.
- [ ] **Step 4: (user)** Delete the `viper-security` project in the Netlify Dashboard (only that project). Its 4 historical form submissions were the user's own tests (exported in the session log) — nothing real is lost.
- [ ] **Step 5: Credential hygiene:** **(user)** rotate the FTP password in the Manager (it appeared in the 2026-10-18 session log), then update `INFOMANIAK_FTP_PASSWORD` (`gh secret set INFOMANIAK_FTP_PASSWORD`) and trigger one deploy to confirm the green path.
- [ ] **Step 6: Final verification:** `https://vipersecurity.ch` still serves + headers unchanged; CMS login works from the new origin with the chosen method; `https://viper-security.netlify.app` no longer serves.

---

## Execution notes for the implementer

- Commits go straight to `main` (solo-author repo); each Task's commit is one unit. The Task 5 Step 2 push is the first that publishes the real site (Netlify rebuilds AND the Infomaniak first deploy); Tasks 1–4 ride on that single push.
- Probes are already done and recorded (see Task 5's evidence block). If any probe needs a redo, the mechanics are: `curl -T <file> -u "<user>:<pass>" "ftp://h2park-8d750cc5.infomaniak.ch/<name>"` (upload), `-Q "-DELE /<name>"` (delete), then `curl` the live URL. Delete every probe file immediately — `probe.php`, `.htaccess` probes, test files.
- Deploy = lftp mirror over plain FTP (no SSH/SFTP/FTPS exists on this hosting — verified). If lftp misbehaves in CI (e.g., passive-mode issues), fallback is `SamKirkland/FTP-Deploy-Action` with `dangerous-clean-slate: true` (rsync-equivalent semantics) — same secrets.
- `--delete` scope is safe: the FTP account is chrooted to the vipersecurity.ch docroot (verified; only stub files + `.ftpquota` present). The stub backup lives at `/tmp/opencode/infomaniak-probe/` (rollback recipe = Task 5 Step 5).
- The FTP password is the only long-lived credential this pipeline adds (plain FTP is the hosting's constraint — accepted for a static site; rotate at teardown per Task 9 Step 5).

## Self-Review

- Spec coverage: design decisions 1–13 map to Tasks 1–9 (forms removal → T1; canonical flips → T2; CMS site_domain → T2; .htaccess port → T3; CI deploy → T4; first deploy + parity → T5; email/DKIM → T6; old-site 301 + freeze → T7; Search Console → T8; teardown + CMS-auth switch → T9). Deviations from the spec are all probe-driven and documented: FTP replaces SSH/rsync (hosting reality), Variant B replaces the undecided scheme probe, DKIM guidance updated to the verified absence.
- Step scan: each step = one action + checkable result; no TBDs; long blocks are verbatim artifacts (`.htaccess`, workflow YAML, redirect TOML).
- Type/name consistency: secret names identical across T5/T4; hostname/username identical; `.htaccess` paths referenced identically in T2/T3/T4/T9; task cross-references re-checked after renumbering (T6→T5 Step 3/4 confirmed).
- Review Focus: six failure modes, each with a live-test step (T1.3, T5.4, T5.3/T6.6, T6.9, T6.8, T7.3).
- Proportion: plan ≈ spec length; verbatim content blocks are the artifacts themselves, not re-description.
