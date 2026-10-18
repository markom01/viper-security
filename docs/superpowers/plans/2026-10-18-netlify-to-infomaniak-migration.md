# Netlify → Infomaniak Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the live VIPER Security site from Netlify (`viper-security.netlify.app`) to Infomaniak Web Hosting at `https://vipersecurity.ch` with zero behavior change, automated GitHub Actions deploys, Infomaniak email, and a 60-day 301-redirect window on the old domain.

**Architecture:** Astro 7 static build (unchanged) gets an Apache `.htaccess` that ports every Netlify-specific behavior (CSP, cache, redirects, MIME). Deploys become a GitHub Actions workflow that builds with the pinned Node and rsyncs `sites/viper/dist` over SSH into the hosting's web root. Canonical URLs flip to `vipersecurity.ch` in four code/content places. Netlify keeps serving the old domain as a pure 301 for ~60 days, then dies; CMS auth off Netlify happens at teardown.

**Tech Stack:** Astro 7, Apache 2.4 `.htaccess` (Infomaniak shared hosting), GitHub Actions, rsync/SSH, Infomaniak Manager (DNS, SSL, mail), Netlify dashboard (old site).

**Spec:** `docs/superpowers/specs/2026-10-18-netlify-to-infomaniak-migration-design.md` — decisions 1–13 there are law; this plan only sequences them.

## Global Constraints

- Node `22.12.0` exactly (`.nvmrc`; build runs `astro check && astro build` via `npm run build --workspace=@garage/viper`).
- CSP strings are copied **verbatim** from `sites/viper/netlify.toml:48` (strict, for `/*`) and `sites/viper/netlify.toml:57` (lax, for `/admin/*`). No relaxation, no added origins.
- `sites/dbc/**` and `sites/dbc/netlify.toml` are never edited. DBC's Netlify project keeps auto-deploying.
- No edits to `packages/shared/**` except `packages/shared/src/components/sections/BookingForm.astro:58-63` (Netlify Forms removal).
- One domain string everywhere: `vipersecurity.ch`. Canonical is the **apex**; `www` → apex 301.
- Old Netlify URL `viper-security.netlify.app` keeps serving until teardown; deletion ~60 days post-cutover. Before deletion, CMS login moves off Netlify.
- Never delete off the Infomaniak docroot (`--delete`) before Task 2 has verified web-root isolation.
- Exactly one SPF record exists on `vipersecurity.ch` at any time.
- Pushes go to `main` (that IS the trigger for both Netlify projects and the new workflow).
- `sites/viper/public/_headers` stays present until the teardown task (eliminated then, together with `netlify.toml`).

## Review Focus

Failure modes the tasks' checks don't naturally exercise; first is lethal, pinned by Task 2's probe stop-rule:

1. **`.htaccess` directives rejected by Infomaniak Apache** (`Header`/`<If>`/`RewriteRule` under their `AllowOverride`) → 500s across the site. Test: Task 2's probe curl list; STOP rule at first 500/missing header.
2. **Shared docroot + `rsync --delete`** wiping non-site content. Test: Task 2 step 5 (`ls -la` docroot empty or stub-only before any sync).
3. **CMS login fails from the new origin** (Netlify OAuth gateway can't map the site). Test: Task 3's `site_domain` config line + Task 5 step 8 live login check with the GitHub button.
4. **Old-site redirect catches DBC** (wrong base-dir assumption). Test: Task 6 step 4 — `https://dbcustomgarage.com` still 200 after the redirect deploy.
5. **Two SPF records after mail setup** → all `@vipersecurity.ch` mail rejected by receivers. Test: Task 5's `dig TXT` — exactly one `v=spf1 include:spf.infomaniak.ch -all`.

---

### Task 1: Repo changes (URL flips, Netlify Forms removal, CMS `site_domain`)

**Files:**

- Modify: `sites/viper/src/config/site.ts:11`
- Modify: `sites/viper/public/robots.txt:4`
- Modify: `sites/viper/src/content/site/content.yaml:3,4,7,10`
- Modify: `sites/viper/.env.example:1-2`
- Modify: `packages/shared/src/components/sections/BookingForm.astro:58-59,62-63`
- Modify: `sites/viper/public/admin/config.yml` (backend block)

**Interfaces:**

- Produces: every later task assumes canonical `https://vipersecurity.ch` and zero Netlify Forms markup in VIPER's build output.

- [ ] **Step 1: Flip canonical URLs**

`site.ts` line 11: `url: "https://vipersecurity.ch"`.
`robots.txt` line 4: `Sitemap: https://vipersecurity.ch/sitemap-index.xml`.
`content.yaml`: lines 3, 4, 7, 10 — replace every `https://viper-security.netlify.app` with `https://vipersecurity.ch` (org_url, org_logo, webSiteUrl, privacy_policy).
`.env.example` lines 1-2:

```
PUBLIC_SITE_URL=https://vipersecurity.ch
PUBLIC_ADMIN_EMAIL=admin@vipersecurity.ch
```

- [ ] **Step 2: Remove Netlify Forms markup from `BookingForm.astro`**

In the `<form ...>` tag (lines 58-59) delete the two lines `data-netlify="true"` and `netlify-honeypot="bot-field"`. Delete the honeypot input on line 63: `<input type="text" name="bot-field" aria-hidden="true" tabindex="-1" autocomplete="off" class="honeypot-hidden" />`. `name="booking-form"` and `method="POST"` stay.

- [ ] **Step 3: Add `site_domain` to the CMS config**

In `sites/viper/public/admin/config.yml`, backend block becomes exactly:

```yaml
backend:
  name: github
  repo: markom01/viper-security
  branch: main
  site_domain: viper-security.netlify.app
```

(This is deliberately the old Netlify domain — Netlify's OAuth gateway identifies the CMS client by the _Netlify_ project's domain, per Sveltia docs. Removed again at teardown.)

- [ ] **Step 4: Build and check output**

Run: `npm ci && rm -rf sites/viper/.astro node_modules/.astro && npm run build --workspace=@garage/viper`
Expected: `astro check` passes, build OK.

- [ ] **Step 5: Verify output invariants**

Run:

```bash
grep -rn "viper-security.netlify.app" sites/viper/dist | grep -v "admin/config.yml"   # expect: no output
grep -rn "data-netlify\|netlify-honeypot\|bot-field" sites/viper/dist                 # expect: no output
grep -c "vipersecurity.ch" sites/viper/dist/robots.txt sites/viper/dist/sitemap-0.xml # expect: 1, >0
```

- [ ] **Step 6: A11y smoke (build already exists)**

Run: `npm run test:a11y -w @garage/viper`
Expected: Playwright passes.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore(viper): flip canonical domain to vipersecurity.ch; drop Netlify Forms; CMS site_domain"
```

(Do not push yet — a push also rebuilds both Netlify sites; push at Task 4 step 6.)

### Task 2: `.htaccess` (the whole Netlify port) + Infomaniak pre-flight probe

**Files:**

- Create: `sites/viper/public/.htaccess`

**Interfaces:**

- Consumes: design decisions 1 (CSP verbatim), headers set, redirect parity list.
- Produces: the single file the workflow copies into `dist/` (Task 3) and deploys (Task 4); the golden header checklist below is reused in Tasks 4, 5 and teardown.

- [ ] **Step 1: Write `sites/viper/public/.htaccess`**

```apache
# VIPER Security — Apache port of sites/viper/netlify.toml + public/_headers (2026-10-18).
# Origin: https://vipersecurity.ch — Infomaniak shared hosting. CSP strings copied verbatim.

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css image/svg+xml text/xml application/xml application/rss+xml application/json application/manifest+json application/javascript text/javascript
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  # Canonical: http -> https (upstream TLS included) — exact target, host dropped.
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://vipersecurity.ch%{REQUEST_URI} [R=301,L]
  # Canonical: www -> apex.
  RewriteCond %{HTTP_HOST} ^www\.
  RewriteRule ^ https://vipersecurity.ch%{REQUEST_URI} [R=301,L]
  # favicon.ico -> favicon.svg (Netlify parity, 301)
  RewriteRule ^favicon\.ico$ /favicon.svg [R=301,L]
  # Sveltia admin SPA: /admin/<anything> -> /admin/index.html (internal, status 200)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^admin/(.*)$ admin/index.html [L]
</IfModule>

ErrorDocument 404 /404.html

<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
</IfModule>

<IfModule mod_headers.c>
  # Default cache parity (everything revalidates)…
  Header always set Cache-Control "public, max-age=0, must-revalidate"
  # Security headers, strict CSP for all paths…
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://photon.komoot.io https://vpic.nhtsa.dot.gov; frame-src https://www.google.com https://maps.google.com; object-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests"
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
  # …long cache for fingerprinted + site assets.
  <FilesMatch "\.(css|js|webp|png|jpe?g|gif|svg|avif|ico|woff2?)$">
    Header always set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <Files "sw.js">
    Header always set Cache-Control "no-cache, must-revalidate"
  </Files>
  <Files "favicon.svg">
    Header always set Cache-Control "public, max-age=86400"
  </Files>
</IfModule>
```

- [ ] **Step 2: Relax-override for the admin path — second file**

Create `sites/viper/public/admin/.htaccess` (lax CSP only; the rest inherits):

```apache
# Lax CSP for the CMS admin (Sveltia, GitHub backend) — replaces the strict CSP of the parent.
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self' data: blob: https://unpkg.com https://github.com https://*.github.com https://*.githubusercontent.com https://api.github.com https://www.githubstatus.com; manifest-src 'self' blob:; frame-src 'none'; object-src 'none'"
  Header always set Cache-Control "public, max-age=0, must-revalidate"
</IfModule>
```

- [ ] **Step 3: Build again, confirm dist shape**

Run: `npm run build --workspace=@garage/viper && ls sites/viper/dist/admin/index.html sites/viper/dist/404.html sites/viper/dist/manifest.webmanifest sites/viper/dist/sw.js`
Expected: all four paths exist. (`.htaccess` reaching the server is the workflow's `cp` step, Task 3 — do not rely on Vite copying dotfiles.)

- [ ] **Step 4: Commit**

```bash
git add sites/viper/public/.htaccess sites/viper/public/admin/.htaccess && git commit -m "feat(viper): port netlify headers/redirects to Apache .htaccess for Infomaniak"
```

- [ ] **Step 5: **USER COOPERATION — Infomaniak pre-flight (get values + isolate docroot)**
  1.  Ask the user for: SSH host (`ssh.cluster0XX.hosting.infomaniak.com`), SSH username, and the site's web-root path (Manager tips: Web Hosting → ⋮ → FTP/SSH credentials; SSH can be activated in Manager → Web Hosting → SSH access).
  2.  If SSH is password-only so far: generate an ed25519 deploy key (`ssh-keygen -t ed25519 -f /tmp/opencode/viper-deploy-key -N ""`), have the user add the public key to Infomaniak (Manager → hosting → SSH keys / authorized_keys), then continue key-based. Password path is allowed via `sshpass` for probes but never stored in the repo.
  3.  Connect: `ssh -o StrictHostKeyChecking=accept-new <user>@<host> 'which rsync; echo ---; ls -la <WEB_ROOT>'`
      Expected: an rsync binary path AND a web root that is empty or contains only Infomaniak default stubs. **If the web root is not isolated or rsync is absent, STOP and decide with the user (lftp/SFTP fallback or support ticket) before any sync.**
- [ ] **Step 6: Deploy probe — run the real content first time via SSH**

Run the full workflow-equivalent by hand (same commands Task 3 will encode): build locally, `cp sites/viper/public/.htaccess sites/viper/dist/.htaccess` and `cp sites/viper/public/admin/.htaccess sites/viper/dist/admin/.htaccess`, then:

```bash
rsync -av --delete --exclude '.git/' \
  -e "ssh -o StrictHostKeyChecking=accept-new" \
  sites/viper/dist/ <user>@<host>:"<WEB_ROOT>/"
```

- [ ] **Step 7: Probe parity with curl (golden list) against the hosting's temporary HTTPS URL `<TEMP>` (read it from the Manager)**

```bash
curl -sSI --http1.1 https://<TEMP>/ | grep -iE "^HTTP|content-security-policy|x-frame|x-content-type|strict-transport|referrer-policy|permissions-policy|cache-control|content-type"
curl -sSI https://<TEMP>/admin/          | grep -i "content-security-policy"   # lax variant
curl -sSI https://<TEMP>/manifest.webmanifest | grep -i "content-type"          # application/manifest+json
curl -sSI https://<TEMP>/<some-_astro-js-path> | grep -i cache-control          # immutable
curl -sSI https://<TEMP>/sw.js           | grep -i cache-control               # no-cache, must-revalidate
curl -sSI https://<TEMP>/favicon.svg     | grep -i cache-control               # max-age=86400
curl -sSI https://<TEMP>/favicon.ico     | head -3                             # 301 -> /favicon.svg
curl -sSI https://<TEMP>/does-not-exist  | head -3                             # 404 with /404.html body
```

Expected: every header matches the golden list above (values verbatim from `.htaccess`). **STOP RULE: any 500, any missing/incorrect header → don't touch DNS; report to the user (Infomaniak support / plan upgrade path) before proceeding.** Failure verdict options: `<If>`-less caches via `FilesMatch`-only variant, or dropping `X-Forwarded-Proto` line if the probe showed a direct-TLS Apache (`%{HTTPS}=on` on a real https request).

- [ ] **Step 8: Clean probe residue**

Re-run Step 6's exact same rsync — `--delete` guarantees the tree converges to dist-only. (No probe files were added beyond dist content.)

### Task 3: GitHub Actions deploy workflow

**Files:**

- Create: `.github/workflows/deploy-viper.yml`

**Interfaces:**

- Consumes: build command verbatim from `sites/viper/netlify.toml:2`; repo secrets `INFOMANIAK_SSH_HOST`, `INFOMANIAK_SSH_USER`, `INFOMANIAK_SSH_KEY`, `INFOMANIAK_WEB_ROOT` (created in Task 4 with the user).
- Produces: pipeline the CMS saves and DBC-side pushes coexist with (per-push concurrency).

- [ ] **Step 1: Write `.github/workflows/deploy-viper.yml`**

```yaml
name: deploy-viper
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
          node-version-file: .nvmrc # 22.12.0
          cache: npm
      - run: npm ci
      - name: Build (same as Netlify)
        run: rm -rf sites/viper/.astro node_modules/.astro && npm run build --workspace=@garage/viper
      - name: Stage deploy tree
        run: |
          cp sites/viper/public/.htaccess sites/viper/dist/.htaccess
          cp sites/viper/public/admin/.htaccess sites/viper/dist/admin/.htaccess
      - name: Deploy to Infomaniak
        env:
          SSH_HOST: ${{ secrets.INFOMANIAK_SSH_HOST }}
          SSH_USER: ${{ secrets.INFOMANIAK_SSH_USER }}
          SSH_KEY: ${{ secrets.INFOMANIAK_SSH_KEY }}
          WEB_ROOT: ${{ secrets.INFOMANIAK_WEB_ROOT }}
        run: |
          printf '%s\n' "$SSH_KEY" > deploy_key
          chmod 600 deploy_key
          rsync -av --delete \
            -e "ssh -i deploy_key -o StrictHostKeyChecking=accept-new" \
            sites/viper/dist/ "$SSH_USER@$SSH_HOST:$WEB_ROOT/"
```

(Depends on remote `rsync` verified in Task 2 step 5; else switch this step to an `lftp` SFTP mirror and say so in the PR comment.)

- [ ] **Step 2: Validate YAML parses**

Run: `node -e "const YAML=require((require('module').builtinModules.includes? 'yaml':'yaml')); YAML.parse(require('fs').readFileSync('.github/workflows/deploy-viper.yml','utf8'))" 2>/dev/null || npx --yes js-yaml .github/workflows/deploy-viper.yml > /dev/null`
Expected: exit 0.

- [ ] **Step 3: Commit** (push happens after secrets — Task 4)

```bash
git add .github/workflows/deploy-viper.yml && git commit -m "ci: deploy viper to Infomaniak on push to main"
```

### Task 4: Secrets + first pipeline deploy

- [ ] **Step 1: **USER COOPERATION — collect the four values** from Task 2 step 5 (SSH host, SSH user, deploy **private** key content, web root).**
- [ ] **Step 2: Set GitHub secrets on `markom01/viper-security`**

```bash
gh secret set INFOMANIAK_SSH_HOST -b "<host>" \
  && gh secret set INFOMANIAK_SSH_USER -b "<user>" \
  && gh secret set INFOMANIAK_SSH_KEY -R markom01/viper-security -b "$(cat /tmp/opencode/viper-deploy-key)" \
  && gh secret set INFOMANIAK_WEB_ROOT -b "<web-root>"
```

(or the same in the web UI if `gh` is unauthenticated).

- [ ] **Step 3: Push main to fire the workflow**

```bash
git push origin main
```

- [ ] **Step 4: Watch the run to green**

Run: `gh run watch --repo markom01/viper-security` (or the Actions web UI).
Expected: `deploy-viper` green; DBC's Netlify project also rebuilds harmlessly (shared-form change only removes inert attributes; its Forms feature is off).

- [ ] **Step 5: Re-verify the golden list on `<TEMP>`** (Task 2 step 7 commands) — now deployed by the pipeline, not by hand. All green expected.

### Task 5: SSL certificate + DNS cutover + live validation (go/no-go gate with user)

- [ ] **Step 1: **USER COOPERATION — DNS strategy briefing.** In the Infomaniak Manager: Domains → `vipersecurity.ch` → DNS zone; note current records (often default parking). Infomaniak's "connect domain to hosting" flow supplies the exact A/AAAA/CNAME targets.
- [ ] **Step 2: **USER ACTION — Let's Encrypt cert** for the site (Manager → Web Hosting → ⋮ → Install a certificate → free → domains checked: `vipersecurity.ch` + `www.vipersecurity.ch`). If issuance refuses pre-DNS, reverse: do Step 3 first, then pull this step forward.
- [ ] **Step 3: **USER ACTION — point DNS** apex + `www` at the hosting per the Manager's connection flow. Reduce TTL on the old records before switching, if the panel allows.
- [ ] **Step 4: Verify resolution + cert**

```bash
dig +short vipersecurity.ch A; dig +short www.vipersecurity.ch
curl -sSI https://vipersecurity.ch/ | head -20
```

Expected: records resolve to the hosting; TLS cert CN/SAN `vipersecurity.ch` (or www); HTTP 200.

- [ ] **Step 5: Golden header list on production, apex + www + admin + 404 + favicon + sw** (the Task 2 step 7 command set, host `https://vipersecurity.ch`), plus:

```bash
curl -sSI https://www.vipersecurity.ch/ | head -3      # 301 -> https://vipersecurity.ch/
curl -sSI http://vipersecurity.ch/ | head -3           # 301 -> https://vipersecurity.ch/
```

- [ ] **Step 6: Content smoke**

```bash
curl -sSo /dev/null -w "%{http_code} " https://vipersecurity.ch/ https://vipersecurity.ch/contact/ https://vipersecurity.ch/services/<known-slug>/ https://vipersecurity.ch/robots.txt https://vipersecurity.ch/sitemap-index.xml https://vipersecurity.ch/manifest.webmanifest https://vipersecurity.ch/sw.js https://vipersecurity.ch/images/cms/hero-image_upscaled.webp
```

Expected: `200` on all (URLs sampled from the CMS content, not invented).

- [ ] **Step 7: Browser session** (Playwright): open `https://vipersecurity.ch`, click through nav to fleet + a service page; confirm hero map iframe and WhatsApp button still open; `/admin/` loads with no console CSP violations (the CSP connect-src covers Sveltia's GitHub API).
- [ ] **Step 8: CMS auth live test — login with the GitHub button** on `https://vipersecurity.ch/admin/`.
      Expected: GitHub authorize → back → dashboard in. **If it fails: STOP; retry after 60s (Netlify gateway may cache the mapping); if still failing, set `site_domain` to the site's custom domain spelling shown in the error and debug the flow before proceeding.**
- [ ] **Step 9: Rollback checkpoint** — until Task 6 completes, rollback = revert DNS to the default parking/old records (nothing else moved).

### Task 6: Infomaniak email + old-site redirect + Netlify pause

**Files:**

- Modify: `sites/viper/public/admin/config.yml` (NO change — site_domain was already here from Task 1)
- Modify: `sites/viper/netlify.toml` (catch-all 301, first redirects entry)
- Modify: none in DBC.

- [ ] **Step 1: **USER ACTION — mail product** (my kSuite / Service Mail) on `vipersecurity.ch` + create the user's chosen mailboxes (e.g. `info@vipersecurity.ch`, `admin@vipersecurity.ch`). The Manager's mail wizard inserts MX/SPF/DKIM/DMARC into the zone for Infomaniak-registered domains.
- [ ] **Step 2: Verify records — one SPF, mail resolves**

```bash
dig +short MX vipersecurity.ch && dig +short TXT vipersecurity.ch | grep -c "^\"v=spf1"   # count of SPF records
grep -m1 "spf.infomaniak.ch" <(dig +short TXT vipersecurity.ch)                            # include:spf.infomaniak.ch present
dig +short TXT _dmarc.vipersecurity.ch                                                     # DMARC policy record
```

Expected: MX to Infomaniak mail hosts; **SPF count exactly 1**; DMARC present. (DKIM CNAMEs' names/values are shown by the mail wizard — verify the diagnostic rather than hardcoding.)

- [ ] **Step 3: **USER ACTION Manager DNS Diagnostic** run for the domain → all mail checks green; one real send/receive round-trip from the new mailbox.
- [ ] **Step 4: Old-site 301 redirect** — in `sites/viper/netlify.toml`, insert **above the first existing `[[redirects]]` entry** (the favicon one):

```toml
# Whole-site 301 to the new domain (first entry so its force-precedence beats the rules below).
[[redirects]]
  from = "/*"
  to = "https://vipersecurity.ch/:splat"
  status = 301
  force = true
```

Commit + push (Netlify rebuilds the old site from the same push):

```bash
git add sites/viper/netlify.toml && git commit -m "chore(viper): 301 old netlify domain to vipersecurity.ch" && git push origin main
```

- [ ] **Step 5: Verify redirect + DBC untouched**

```bash
curl -sSI https://viper-security.netlify.app/ | head -3            # 301 -> https://vipersecurity.ch/
curl -sSI https://viper-security.netlify.app/admin/ | head -3      # 301 -> https://vipersecurity.ch/admin/
curl -sSI "https://viper-security.netlify.app/?utm=x" | head -3    # 301 (query optional)
curl -sSo /dev/null -w "%{http_code}\n" https://dbcustomgarage.com/ # 200 — DBC untouched
```

- [ ] **Step 6: **USER ACTION — pause the viper project's auto-publish** (Netlify dashboard → `viper-security` → Site configuration → Build & deploy → Pause/stop builds; wording varies by UI. DBC stays unpaused.) Netlify-side deploys from this point are possible only unpause or manual retrigger (needed for rollback).
- [ ] **Step 7: Search Console (user):** add + verify the `vipersecurity.ch` domain property, submit `https://vipersecurity.ch/sitemap-index.xml`.
- [ ] **Step 8: **USER ACTION — calendar:** teardown day = cutover date + 60 days (reminds: Task 7, CMS auth switch first!).

### Task 7: Teardown day (D+60, separate session — run when the calendar fires)

**Files (at that time):**

- Modify: revert the Task 6 redirect commit in `sites/viper/netlify.toml`
- Delete: `sites/viper/public/_headers`
- Delete: `sites/viper/netlify.toml`
- Modify: `sites/viper/public/admin/config.yml` — remove `site_domain` line; per chosen auth:
  - Token login (default): no config change beyond removing `site_domain`; user creates a fine-grained PAT (repo `markom01/viper-security`, Contents: read/write) and logs in via "Sign In Using Access Token".
  - Sveltia Authenticator: deploy the Cloudflare Worker + own GitHub OAuth App (callback `<worker>/callback`), then `base_url: /auth` + `auth_endpoint: <worker URL>` per upstream docs.

- [ ] **Step 1: CMS auth off Netlify (FIRST — the GitHub-button flow dies with the site):** implement chosen option; verify a fresh `https://vipersecurity.ch/admin/` login.
- [ ] **Step 2: Redirect revert + build-config cleanup commit** (netlify.toml delete, _headers delete), push. The old site's last serving state is now its Task 1-era build.
- [ ] **Step 3: Netlify greps:** `grep -rn "site_domain\|data-netlify" sites/viper` → empty.
- [ ] **Step 4: **USER ACTION — unpause + delete the `viper-security` Netlify project** (after a last redirect-era sanity check that nothing legitimately bypasses the redirect). DBC project survives.
- [ ] **Step 5: Post-teardown sanity:** `curl -sSI https://viper-security.netlify.app/` → dead/404-level (expected); `https://dbcustomgarage.com` → 200; `https://vipersecurity.ch` headers → golden list unchanged.
- [ ] **Step 6: Commit `docs/` note + update `CLAUDE.md`/README host references** (`sites/viper — VIPER Security (live: https://vipersecurity.ch)`; the netlify badges/paths listed in README.md:8,89).

### Task 8: Optional — Lighthouse CI replaces the Netlify plugin (non-blocking)

- [ ] **Step 1: Create `.github/workflows/lighthouse-viper.yml`** — `workflow_dispatch` + weekly cron; `pnpm`-less simple job: `actions/checkout`, build resize, `treosh/lighthouse-ci-action` with `--collect.url=https://vipersecurity.ch` + lhci assertions from `packages/shared` budgets if defined; run once against the live origin.
- [ ] **Step 2: Verify one run posts scores ≥ current Netlify plugin's baseline.** If infra budget time runs out, skip freely (design call 7: must not block).

---

## Self-Review

- Spec coverage: decisions 1–13 map to Tasks 1–8 — 1→T1.2/T7.1, 2→global constraints, 3→T1.1, 4→T7.2, 5→T5 captions, 6→T7.1, 7→T8, 8→T1.3+T5.8+T7.1, 9→T6.4, 10→T6.6, 11→T7.2, 12→T1.1 (.env), 13→accepted (no task). DNS/email/cutover order → T5/T6; rollback → T5.9.
- Step scan: each step = one action + checkable result; no "TBD" lines; bodies only where the file content is spec-pinned (`.htaccess`, workflow YAML, config diffs).
- Type/name consistency: secret names identical across Tasks 3/4; URL constants identical; `.htaccess` paths (`public/.htaccess`, `public/admin/.htaccess`) referenced identically in Task 2/3/4/7.
- Review Focus: five failure modes each have a test step (T2.7 stop-rule, T2.5 docroot, T5.8 login, T6.5 DBC 200, T6.2 SPF count-1).
- Proportion: plan ≈ spec length; the long blocks are verbatim-copy artifacts (`.htaccess`, workflow), not reDESCRIPTION bodies.
