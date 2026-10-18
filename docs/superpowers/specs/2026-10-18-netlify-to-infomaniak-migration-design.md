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

| Decision                          | Value                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| Infomaniak state                  | Domain `vipersecurity.ch` + Web Hosting package already bought                                  |
| Deploy workflow                   | Auto-deploy on push via GitHub Actions (SSH-based)                                              |
| Email                             | Powered by Infomaniak on this domain                                                            |
| Old Netlify site                  | Keep as 301 redirect for ~2 months, then delete                                                 |
| Booking-form Netlify Forms backup | Deleted outright from shared form (unused on both sites — verified via Netlify API + repo grep) |

## Parts I decided (builder: treat as settled; note if implementation suggests otherwise)

1. **Netlify Forms markup is deleted outright from the shared `BookingForm.astro`** — `data-netlify="true"`, `netlify-honeypot="bot-field"`, and the hidden `bot-field` honeypot input. No prop machinery (verified unnecessary, 2026-10-18 via the Netlify API and repo grep):
   - `dbcustomgarage` project has the Forms feature "not enabled" — its `data-netlify` attributes are already inert there, so removal changes nothing for DBC.
   - `viper-security` project's current `booking-form` has **0 submissions**; the only submissions ever recorded (4, July 2026) are on the old `Booking`/`contact` form versions and are all the user's own tests using their own name/phone. No customer leads to preserve.
   - Nothing in the code reads the honeypot input.
   - The three registered forms and their records disappear naturally when the Netlify site is deleted at teardown; nothing needs migrating out.
2. **No edits to `sites/dbc/*` or to shared DBC-affecting config.** Viper's `netlify.toml` stays in the repo as-is until teardown; the old-site redirect is configured on the Netlify site (Dashboard/API), never via repo-wide config.
3. **Canonical = apex `https://vipersecurity.ch`.** Flip the four known hardcoded-URL places:
   - `sites/viper/src/config/site.ts` `url` (drives `astro.config` `site`, sitemap, PWA baseline),
   - `sites/viper/public/robots.txt` `Sitemap:` line,
   - `sites/viper/src/content/site/content.yaml` JSON-LD fields (`org_url`, `org_logo`, `webSiteUrl`, `privacy_policy`),
   - `sites/viper/.env.example` `PUBLIC_SITE_URL` (and the stale `PUBLIC_ADMIN_EMAIL` domain placeholder — unconsumed, hygiene only).
     Grep afterwards for any other `viper-security.netlify.app` reference under `sites/viper`/`packages/shared` (excluding DBC, docs, tests fixtures).
4. **`public/_headers` is removed from `sites/viper/public` as part of this migration** (its directives move into the `.htaccess`; per checklist order below, removal happens after the Netlify redirect phase is live so the old site keeps its headers while serving its last normal deploy). Harmless to keep until then; it must not be deployed to Infomaniak.
5. **`.htaccess` lives in `sites/viper/public/.htaccess`** so it rides the normal build into `dist/`.
6. **HSTS `preload` flag is kept** (already present today on the old origin); no new preload submission for the new domain is needed out of scope — flag stays as safety posture parity. HTTP→HTTPS redirect is a plain 301 before TLS.
7. **Lighthouse checks: the Netlify Lighthouse plugin dies with the Netlify site.** Replacing it with a nightly Lighthouse CI GitHub Action is optional-good; builder may include it but it must not block the migration path.
8. **CMS auth, verified live** (2026-10-18, Playwright against `https://viper-security.netlify.app/admin/`): the login button opens GitHub's authorize screen with `redirect_uri=https://api.netlify.com/auth/done` (client id `Ov23libfyE0sWqcxEAEn`) — i.e. Sveltia's default "Netlify as OAuth client" flow (per [Sveltia's GitHub backend docs](https://sveltiacms.app/en/docs/backends/github)). Netlify's gateway identifies the site by the domain the CMS is served from; on the new origin we therefore add `site_domain: viper-security.netlify.app` to `sites/viper/public/admin/config.yml` so GitHub-button login keeps working from `vipersecurity.ch`.
   - **Consequence:** that flow stays alive only while the Netlify viper site exists with its installed GitHub OAuth provider. On teardown day (cutover + ~60 days) the auth must move off Netlify first: (a) **preferred** — switch to Sveltia's "Sign In Using Access Token" with a personal access token (zero infrastructure; the user is the sole editor; works under the current `/admin` CSP, which already allows `https://api.github.com`), or (b) deploy the [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker + own GitHub OAuth App and set `base_url`/`auth_endpoint` in the CMS config. The user picks at teardown time; token login is the default recommendation.
   - The old-site 301 redirect does not affect this flow: the token exchange happens entirely on `api.netlify.com`.
9. **Old-site redirect is implemented as a repo edit to `sites/viper/netlify.toml`** (catch-all `[[redirects]]` `force` 301 → `https://vipersecurity.ch/:splat`), then a revert at teardown. Safe for DBC because each Netlify project deploys from its own base directory (`sites/dbc/netlify.toml` / `sites/viper/netlify.toml` — no root-level toml exists). Builder must still confirm in the Netlify UI that the viper project's base directory is `sites/viper` before relying on this. My earlier draft rule "never touch the repo for the old-site redirect" is replaced by this.
10. **After the redirect deploy is live, pause the viper project's auto-deploy on Netlify** (site settings, or equivalent via API) so later repo pushes can't rebuild the old origin with new-canonical content — while DBC's auto-deploy stays on.
11. **Teardown-day repo cleanup commit:** remove the `sites/viper` `netlify.toml` and `public/_headers`, flip the CMS off `site_domain` in favor of the chosen auth option.
12. **The domain is `vipersecurity.ch`.** The `admin@viper-security.ch` value in `.env.example` is a stale, unconsumed placeholder (no code reads `.env.example` vars); it gets rewritten to the new domain in the same URL-flip pass as hygiene.
13. **PWA installs made from the old origin are accepted as drifting** to the new origin on next visit (cross-origin redirect; SW can't survive it); no migration is attempted.

## What the builder decides / verifies (not user questions)

- Exact `.htaccess` port: mod_headers conditionals for per-path CSP (`.htaccess` context means `<If "%{REQUEST_URI} =~ ...">` knobs, since `<Location>` doesn't work there), `Header always/unset` handling, `RedirectMatch` for favicon, `RewriteRule` for `/admin/*`, `ErrorDocument 404 /404.html` (confirm Astro emits `404.html`), `AddType application/manifest+json .webmanifest` (or the exact emitted manifest filename), Cache-Control via `<If>`/`<FilesMatch>`, HTTP→HTTPS and `www`→apex `301`s, `DirectoryIndex` behavior for Astro's directory URLs.
- Verify live header parity with `curl -sI` against the Infomaniak deployment before DNS cutover (temporary URL or hosts-file override), comparing against Netlify's current response set.
- GitHub Actions workflow (`.github/workflows/deploy-viper.yml` or similar): Node 22.12.0 (`actions/setup-node` with `.nvmrc`), run the exact build command, `rsync`/scp the `dist` tree into the hosting's web root; `--delete` for stale files but protect `.htaccess` (it ships inside `dist/`). Concurrency group so pushes don't race. Secrets: SSH host, user, key/path, web root (user provides from the Manager — see below).
- Confirm the PWA setup carries no hardcoded old-origin strings: audit `packages/shared/pwa` (`pwaPluginOptions`), service-worker generation, manifest `start_url`/`scope`, and any `define:vars`/script constants. Fix anything pinned to `viper-security.netlify.app`.
- **Pre-flight probes (do these first on the real Infomaniak hosting, with a mandatory stop rule):**
  1. Header-capability probe: deploy a minimal `.htaccess` exercising `Header`/`mod_headers` + `<If "%{REQUEST_URI} =~ …">` conditionals and see whether the strict-CSP shape can be served `.htaccess`-only. **If `Header` directives (or the `If` predicate) are rejected, STOP and come back to the user** — Infomaniak support or panel-level header config would be needed; the core approach would then change.
  2. Shell probe over SSH: confirm the shell exists (`ssh`, activation may be needed per Manager), and whether `rsync` is present (`which rsync`). If absent, fall back to SFTP/lftp mirroring in the workflow.
  3. Web-root isolation: confirm from the Manager/SSH the exact docroot directory for the viper site is dedicated (not shared with other content on the hosting); verify it is empty (or contains only Infomaniak stub files) before any `--delete`-style sync.
  4. Probe over the hosting's temporary HTTPS URL (`curl -sI` headers map parity vs today's Netlify responses). If the plan's temporary URL doesn't serve TLS, header parity moves to right after cert issuance/post-DNS as an explicit fallback (accepting the flipped-then-verified ordering for that one step).
- Netlify old-site redirect mechanics per decision 9/10 above: repo-edit redirect in `sites/viper/netlify.toml`, push (that deploy is intentionally the old site's last), then pause the viper project's auto-deploy; at teardown, revert commit + flip CMS auth per decision 8.
- Deployment smoke test checklist (during each phase, documented in the plan): headers, page 200s, images, `/admin` login write-round-trip is optional but a login is mandatory, SW update ("No pending updates" vs stale), sitemap/robots/JSON-LD `og:url` is the new domain, `curl` CSP both on `/` and `/admin/`.

## DNS / cutover order (runbook skeleton for the plan)

1. Pre-flight on Infomaniak: confirm SSH access works (activate if needed), note SSH hostname/user/web root, set up the deploy key, run a first GitHub Actions deploy, browse the hosting's temporary/test URL.
2. Request the Let's Encrypt cert in the Manager for `vipersecurity.ch` (+www); if issuance needs DNS first, flip DNS and request immediately after (minutes for issuance, brief unencrypted window acceptable; sites already send `Strict-Transport-Security` only over TLS).
3. Point DNS in the Infomaniak zone: A records (apex) / CNAME for `www` → the hosting per the Manager's "connect domain to hosting" instructions; keep TTL small ahead of the change.
4. Email: enable the Mail service / kSuite on the domain; verify MX/SPF/DKIM/DMARC records appear in the zone (auto-inserted for Infomaniak-registered domains — confirm, else add manually); create the user's mailbox(es); user does a send/receive round-trip; run the Manager's DNS diagnostic.
5. Global URL flip in the repo (site.ts, robots.txt, content.yaml, env example, .htaccess canonicalization) goes live via the pipeline.
6. Post-flip verification against the checklist; fix forward.
7. Old-site redirect: push the `sites/viper/netlify.toml` catch-all 301 (decision 9), confirm `viper-security.netlify.app/some-path` → `https://vipersecurity.ch/some-path` on all methods/paths, **then pause the viper project's auto-deploy** (decision 10). DBC's auto-deploy stays on.
8. Search Console: add + verify the new domain, submit the sitemap; note redirect does the rest.
9. Calendar: **teardown of the Netlify viper site at cutover + 60 days** (user confirms). Teardown sequence (one session): (a) switch CMS auth off Netlify per decision 8 (token login or Sveltia Authenticator) and verify a fresh login from `vipersecurity.ch/admin`, (b) revert commit for the old-site 301, (c) repo cleanup commit per decision 11, (d) delete the Netlify site (keeps DBC).
10. CMS auth check confirmation along the way: at first deploy on the new origin, verify `/admin` login (GitHub button with `site_domain` set) BEFORE cutover if a temporary HTTPS URL allows it, otherwise immediately after DNS flip — an editor locked out is an anti-goal.

## Rollback

- **Before the old-site 301 is enabled:** DNS records point back at Netlify (or Infomaniak records disabled) — the Netlify site keeps serving its last real deploy the entire window.
- **After the 301 is live:** reverting DNS alone now loops (old domain → new domain is a mirror of what we're rolling back). The correct order is: (1) revert/republish the old-site redirect (revert commit in `sites/viper/netlify.toml`, and if the viper auto-deploy was paused, re-enable it or trigger a deploy — GitHub Actions or the pause can't block a Netlify API deploy), (2) verify `viper-security.netlify.app` serves content 200s again, (3) then point DNS back at Netlify. The Netlify site remains deployed the whole time — that is why it isn't deleted early.
- If HTTPS/cert or email are mid-issue at rollback time, nothing else needs undoing: DNS revert restores the previously working site.

## What only the user can supply

1. Infomaniak Manager values for CI: SSH hostname (`ssh.cluster0XX…`), SSH username, the web-root path for the viper site on the hosting, and whether SSH is active (they may need to activate it: Manager → Web Hosting → SSH access). They paste these on request (or activate SSH and generate the key first); the builder then wires them as GitHub secrets with proposed names `INFOMANIAK_SSH_HOST`, `INFOMANIAK_SSH_USER`, `INFOMANIAK_SSH_KEY`, `INFOMANIAK_WEB_ROOT`.
2. Their mailbox choice (which addresses to create at Infomaniak, e.g. `info@vipersecurity.ch`).
3. Final go/no-go for DNS switch and for the eventual Netlify deletion (60 days later), including the teardown-day CMS-auth choice (token login vs Sveltia Authenticator, decision 8).
