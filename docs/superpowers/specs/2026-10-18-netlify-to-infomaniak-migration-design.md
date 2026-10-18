# Design: Migrate VIPER Security from Netlify to Infomaniak (vipersecurity.ch)

Date: 2026-10-18
Status: Approved in conversation; pending builder check
Scope: `sites/viper` only. `sites/dbc` (DB Custom Garage, `dbcustomgarage.netlify.app`) explicitly stays on Netlify, untouched.

## Intent and why

Move the live hosting of the VIPER Security site from Netlify (`https://viper-security.netlify.app`) to an already-purchased Infomaniak Web Hosting package, behind the domain `vipersecurity.ch` (registered at Infomaniak), with email addresses on that domain powered by Infomaniak. The user wants to keep the Netlify-style workflow: editing content in the CMS or merging code triggers an automatic deploy. The site itself must keep working exactly as it does today — content, visuals, PWA, CMS editing flow, and security posture.

## Goals

1. Viper site served at `https://vipersecurity.ch` (apex is canonical; `www.vipersecurity.ch` 301s to apex) from Infomaniak Web Hosting.
2. Behavior parity on the new host:
   - Same pages, content, assets, sitemap, robots, PWA (manifest, service worker).
   - Sveltia CMS at `/admin/` keeps working (GitHub backend, repo `markom01/viper-security`, branch `main`) — CMS saves commit to GitHub and land live.
   - Security-header parity: the CSP defined in `sites/viper/netlify.toml` (strict `/*`, lax `/admin/*`), `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` (incl. `preload`, currently from `public/_headers`), `Referrer-Policy`, `Permissions-Policy`.
   - Cache parity: `immutable` long-cache for `/images/*` and `/_astro/*`; `no-cache` for `/sw.js`; `Content-Type: application/manifest+json` for `/manifest.webmanifest`; daily-wiggle cache for `/favicon.svg`.
   - Redirect parity: `301` `/favicon.ico → /favicon.svg`; `200` rewrite `/admin/* → /admin/index.html` (Sveltia SPA routes); Apache `404` → `/404.html`.
3. Automated deploys: GitHub Actions builds on every push to `main` (including CMS-initiated commits) and syncs the built `sites/viper/dist` to Infomaniak over SSH.
4. Email live at `@vipersecurity.ch` (Infomaniak mail): MX/SPF/DKIM/DMARC records set in the Infomaniak DNS zone, send/receive verified.
5. Old domain handling: `viper-security.netlify.app` stays up after cutover and `301`s everything to the new domain (site-scoped redirect config on Netlify, NOT a repo edit that could affect DBC). Deleted after ~60 days.
6. Search Engine basics: submit `https://vipersecurity.ch/sitemap-index.xml` to Search Console; verify old domain redirect passes through.

## Non-goals

- No changes to the DBC site, its Netlify deploy, or shared code behavior (see the BookingForm decision).
- No changes to how the site looks, reads, or works; no new CMS features.
- No server-side runtime — the site stays 100% static (Apache serves files; no PHP, no SSR, no Netlify Functions replacement needed).
- Not fixing pre-existing content bugs (e.g. the og:image path flagged in `PRE-PRODUCTION-AUDIT.md`) unless they are trivially adjacent to URL flips.

## Anti-goals (a failure even if the site "technically" works)

- Any relaxation or regression of the CSP/security headers on the new host.
- DBC's Netlify Forms backup breaking because the shared `BookingForm.astro` was edited.
- Broken share previews (og:image/JSON-LD) or broken service-worker updates after the flip.
- Netlify left running (and billing) indefinitely after the 60-day redirect window.
- The Sveltia CMS auth breaking on the new origin (see Builder checks).

## Constraints

- Build: Node `22.12.0` (`.nvmrc`, mirrored in `netlify.toml` `build.environment`). Astro 7 static, no adapter.
- Build command today: `rm -rf .astro node_modules/.astro && npm run build --workspace=@garage/viper` (run from repo root), publish `sites/viper/dist`. Reuse it verbatim in CI.
- Repo: `markom01/viper-security`, branch `main`.
- Infomaniak hosting facts (verified Oct 2026 from their KB):
  - Shared Web Hosting = Apache + `.htaccess` at the site root (rewrites, redirects, access restrictions, error pages); SSH `ssh.cluster0XX.hosting.infomaniak.com` + SFTP/WebFTP (SSH may need activation in the Manager).
  - Free Let's Encrypt certificates: one-click install in the Manager for the site's domains, issued in minutes, auto-renewed.
  - Email on the domain: mail records (MX, SPF `v=spf1 include:spf.infomaniak.ch -all`, 3 DKIM CNAMEs, `_dmarc`) go into the domain's DNS zone; DNS diagnostics available in the Manager; propagation can take up to 48h.
- Zero-downtime-ish cutover: deploy and verify at Infomaniak first, then flip DNS. Old Netlify site continues serving until the redirect is enabled.

## Parts the user decided

| Decision                          | Value                                                          |
| --------------------------------- | -------------------------------------------------------------- |
| Infomaniak state                  | Domain `vipersecurity.ch` + Web Hosting package already bought |
| Deploy workflow                   | Auto-deploy on push via GitHub Actions (SSH-based)             |
| Email                             | Powered by Infomaniak on this domain                           |
| Old Netlify site                  | Keep as 301 redirect for ~2 months, then delete                |
| Booking-form Netlify Forms backup | Dropped on the new host (WhatsApp opener is the real channel)  |

## Parts I decided (builder: treat as settled; note if implementation suggests otherwise)

1. **Shared `BookingForm.astro` is NOT edited.** It (`packages/shared/src/components/sections/BookingForm.astro`, via `Hero.astro`) also powers DBC's hero form on Netlify, where `data-netlify="true"` / `netlify-honeypot` matter. On Infomaniak those attributes are inert HTML: the WhatsApp submit flow works, the Netlify Forms endpoint simply doesn't exist, and flagged-form-submission spam surface disappears. Achieves the user's "drop the backup" decision with zero cross-site risk. (A prop-mediated opt-out can be a DBC-side improvement later; out of scope here.)
2. **No edits to `sites/dbc/*` or to shared DBC-affecting config.** Viper's `netlify.toml` stays in the repo as-is until teardown; the old-site redirect is configured on the Netlify site (Dashboard/API), never via repo-wide config.
3. **Canonical = apex `https://vipersecurity.ch`.** Flip the four known hardcoded-URL places:
   - `sites/viper/src/config/site.ts` `url` (drives `astro.config` `site`, sitemap, PWA baseline),
   - `sites/viper/public/robots.txt` `Sitemap:` line,
   - `sites/viper/src/content/site/content.yaml` JSON-LD fields (`org_url`, `org_logo`, `webSiteUrl`, `privacy_policy`),
   - `sites/viper/.env.example` `PUBLIC_SITE_URL`.
     Grep afterwards for any other `viper-security.netlify.app` reference under `sites/viper`/`packages/shared` (excluding DBC, docs, tests fixtures).
4. **`public/_headers` is removed from `sites/viper/public` as part of this migration** (its directives move into the `.htaccess`; per checklist order below, removal happens after the Netlify redirect phase is live so the old site keeps its headers while serving its last normal deploy). Harmless to keep until then; it must not be deployed to Infomaniak.
5. **`.htaccess` lives in `sites/viper/public/.htaccess`** so it rides the normal build into `dist/`.
6. **HSTS `preload` flag is kept** (already present today on the old origin); no new preload submission for the new domain is needed out of scope — flag stays as safety posture parity. HTTP→HTTPS redirect is a plain 301 before TLS.
7. **Lighthouse checks: the Netlify Lighthouse plugin dies with the Netlify site.** Replacing it with a nightly Lighthouse CI GitHub Action is optional-good; builder may include it but it must not block the migration path.

## What the builder decides / verifies (not user questions)

- Exact `.htaccess` port: mod_headers conditionals for per-path CSP (`.htaccess` context means `<If "%{REQUEST_URI} =~ ...">` knobs, since `<Location>` doesn't work there), `Header always/unset` handling, `RedirectMatch` for favicon, `RewriteRule` for `/admin/*`, `ErrorDocument 404 /404.html` (confirm Astro emits `404.html`), `AddType application/manifest+json .webmanifest` (or the exact emitted manifest filename), Cache-Control via `<If>`/`<FilesMatch>`, HTTP→HTTPS and `www`→apex `301`s, `DirectoryIndex` behavior for Astro's directory URLs.
- Verify live header parity with `curl -sI` against the Infomaniak deployment before DNS cutover (temporary URL or hosts-file override), comparing against Netlify's current response set.
- GitHub Actions workflow (`.github/workflows/deploy-viper.yml` or similar): Node 22.12.0 (`actions/setup-node` with `.nvmrc`), run the exact build command, `rsync`/scp the `dist` tree into the hosting's web root; `--delete` for stale files but protect `.htaccess` (it ships inside `dist/`). Concurrency group so pushes don't race. Secrets: SSH host, user, key/path, web root (user provides from the Manager — see below).
- Confirm the PWA setup carries no hardcoded old-origin strings: audit `packages/shared/pwa` (`pwaPluginOptions`), service-worker generation, manifest `start_url`/`scope`, and any `define:vars`/script constants. Fix anything pinned to `viper-security.netlify.app`.
- **Sveltia CMS auth on the new origin (do early):** Sveltia's `github` backend authenticates via a GitHub OAuth App whose callback URL is bound to the admin page origin. Read `sites/viper/src/pages/admin.astro` and related setup; if an OAuth app callback exists, add/replace it for `https://vipersecurity.ch/admin/` BEFORE cutover so editors aren't locked out. If it uses Sveltia's own hosted auth flow, still verify a login at the new origin pre-cutover (can't — new origin isn't public yet — then verify immediately post-cutover as the first live check).
- Netlify old-site redirect: use the Netlify Dashboard/API for the viper site only (this environment has Netlify MCP access; or CLI). Rule shape: every path 301 → `https://vipersecurity.ch/<path>` (preserve admin paths too). Do not commit a repo redirect that could touch DBC's build.
- Deployment smoke test checklist (during each phase, documented in the plan): headers, page 200s, images, `/admin` login write-round-trip is optional but a login is mandatory, SW update ("No pending updates" vs stale), sitemap/robots/JSON-LD `og:url` is the new domain, `curl` CSP both on `/` and `/admin/`.

## DNS / cutover order (runbook skeleton for the plan)

1. Pre-flight on Infomaniak: confirm SSH access works (activate if needed), note SSH hostname/user/web root, set up the deploy key, run a first GitHub Actions deploy, browse the hosting's temporary/test URL.
2. Request the Let's Encrypt cert in the Manager for `vipersecurity.ch` (+www); if issuance needs DNS first, flip DNS and request immediately after (minutes for issuance, brief unencrypted window acceptable; sites already send `Strict-Transport-Security` only over TLS).
3. Point DNS in the Infomaniak zone: A records (apex) / CNAME for `www` → the hosting per the Manager's "connect domain to hosting" instructions; keep TTL small ahead of the change.
4. Email: enable the Mail service / kSuite on the domain; verify MX/SPF/DKIM/DMARC records appear in the zone (auto-inserted for Infomaniak-registered domains — confirm, else add manually); create the user's mailbox(es); user does a send/receive round-trip; run the Manager's DNS diagnostic.
5. Global URL flip in the repo (site.ts, robots.txt, content.yaml, env example, .htaccess canonicalization) goes live via the pipeline.
6. Post-flip verification against the checklist; fix forward.
7. Enable the Netlify 301 redirect on the old site (site-scoped), confirm `viper-security.netlify.app/some-path` → `https://vipersecurity.ch/some-path` with all methods/paths.
8. Search Console: add + verify the new domain, submit the sitemap; note redirect does the rest.
9. Calendar: teardown of the Netlify viper site at cutover + 60 days (user confirms; repo cleanup commit then removes `sites/viper/netlify.toml` + `public/_headers` if still present).

## Rollback

Until the Netlify site is deleted, rollback = point the DNS records back at Netlify (or temporarily disable the Infomaniak DNS records). The Netlify site remains fully deployed the whole redirect window. This is the reason for not deleting it early.

## What only the user can supply

1. Infomaniak Manager values for CI: SSH hostname (`ssh.cluster0XX…`), SSH username, the web-root path for the viper site on the hosting, and whether SSH is active (they may need to activate it: Manager → Web Hosting → SSH access). They paste these on request (or activate SSH and generate the key first); the builder then wires them as GitHub secrets with proposed names `INFOMANIAK_SSH_HOST`, `INFOMANIAK_SSH_USER`, `INFOMANIAK_SSH_KEY`, `INFOMANIAK_WEB_ROOT`.
2. Their mailbox choice (which addresses to create at Infomaniak, e.g. `info@vipersecurity.ch`).
3. Final go/no-go for DNS switch and for the eventual Netlify deletion (60 days later).
