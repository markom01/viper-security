# Design: Move VIPER Security hosting from Infomaniak Starter to Cloudflare Workers static assets

Date: 2026-10-22
Status: Draft for builder check
Scope: `sites/viper` hosting + deploy pipeline. `sites/dbc` stays on Netlify, untouched.

## Intent and why

`vipersecurity.ch` currently runs on Infomaniak's free **Hébergement Starter** plan: 10 MB disk, 1 GB/month traffic, FTP only. The site already needs 9.63 MB, so the last deploy aborted mid-mirror at 98% quota and left three gallery images 404 on production. The gallery page alone weighs 7.32 MB, which exhausts the monthly traffic cap after roughly 136 visits.

Cloudflare's free tier removes both ceilings: unlimited bandwidth for static assets and 20,000 files. The user chose Cloudflare over upgrading the Infomaniak plan to CHF 10.91/month.

## Goals

1. Serve `https://vipersecurity.ch` (apex canonical) and `https://www.vipersecurity.ch` (301 to apex) from Cloudflare Workers static assets, free plan.
2. Keep behaviour parity: same pages, CSP, security headers, cache rules, PWA, sitemap, 404 handling, Sveltia CMS at `/admin/`.
3. Deploy automatically on push to `main` via GitHub Actions (`wrangler deploy`), replacing the FTP mirror.
4. Remove the 10 MiB quota constraint and the quota guard added in `cc7a6af`.
5. Keep Infomaniak as registrar and email provider; email must keep working through the nameserver move.
6. Keep a rollback path to Infomaniak for the transition window.

## Non-goals

- No changes to page content, design, components, or the DBC site.
- No move away from Sveltia CMS or its GitHub backend.
- No Cloudflare Pages project (Workers static assets is Cloudflare's recommended path for new projects; static asset requests are free and unlimited).
- No image-optimization/responsive pipeline in this change (separate follow-up; gallery is 7.32 MB per visit).
- No Cloudflare Web Analytics, R2, or Functions.
- No changes to the Netlify 301 for `viper-security.netlify.app` (that config lives in Netlify, not this repo).

## Anti-goals (a failure even if the site "technically works")

- Email breakage: DMARC is currently `p=reject`, so a missed DKIM record can silently reject outbound mail.
- Two `Content-Security-Policy` headers on any response (browsers enforce the intersection, which would break `/admin/`).
- `/admin/*` losing its SPA rewrite.
- `.htaccess` reachable over HTTP and served as text.
- Losing `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or the manifest MIME type.
- A deploy that silently uploads a partial site (the failure mode that broke the gallery).

## Verified facts (2026-10-22)

Current DNS at Infomaniak (`nsany1/nsany2.infomaniak.com`):

| Record           | Value                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| apex `A`         | `128.65.195.180`                                                                                                                              |
| `MX`             | `mta-gw.infomaniak.ch` priority 5                                                                                                             |
| `TXT` apex (SPF) | `v=spf1 include:spf.infomaniak.ch -all`                                                                                                       |
| `TXT _dmarc`     | `v=DMARC1; p=reject;`                                                                                                                         |
| DKIM             | CNAMEs exist per the migration spec (3 records); selectors are **not enumerable from public DNS** — export the zone in the Infomaniak Manager |

Current build:

| Metric              | Value                                   | Cloudflare limit           |
| ------------------- | --------------------------------------- | -------------------------- |
| `dist` size         | 9,630,000 bytes                         | none (assets storage free) |
| files               | 103                                     | 20,000                     |
| largest file        | 0.51 MB                                 | 25 MiB                     |
| CSP header length   | 392 chars (site), 452 chars (`/admin/`) | 2,000 chars/header         |
| header rules needed | ~8                                      | 100                        |

Relevant files today:

- `sites/viper/netlify.toml` — canonical CSP for both scopes, cache rules, redirects (Netlify only).
- `sites/viper/public/_headers` — non-CSP headers (HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy).
- `sites/viper/public/.htaccess` + `public/admin/.htaccess` — live source of truth for the current Apache host.
- `.github/workflows/deploy-viper.yml` — build + size guard + `lftp` FTP mirror.

## Decisions

| Decision       | Value                                                                    | Owner                                     |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| Host           | Cloudflare Workers static assets, free plan                              | user                                      |
| Canonical host | apex `vipersecurity.ch` (unchanged)                                      | agent (user delegated "pick recommended") |
| DNS            | move nameservers to Cloudflare, recreate all zone records including mail | agent                                     |
| Deploy         | GitHub Actions builds, `wrangler deploy` uploads `sites/viper/dist`      | agent                                     |
| Rollback       | revert nameservers + manual FTP workflow kept for the transition window  | agent                                     |

## How it works

### Worker config

`sites/viper/wrangler.toml`:

```toml
name = "viper-security"
compatibility_date = "2026-10-22"

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

No `main` script: every request is a static asset request, so nothing is billed or rate-limited by Workers request quotas.

`sites/viper/public/.assetsignore` keeps Apache artifacts out of the upload:

```
**/.htaccess
**/.ftpquota
```

### Headers (`sites/viper/deploy/cloudflare/_headers`)

The existing `sites/viper/public/_headers` must stay Netlify-compatible because the `viper-security.netlify.app` project still serves a catch-all 301 from this repo. Cloudflare files therefore live in `sites/viper/deploy/cloudflare/` and are copied into `dist/` by the deploy workflow.

Cloudflare merges every matching rule, so `/*` plus `/admin/*` would emit two CSP headers. The admin block must **detach** the inherited CSP before setting its own:

```
/*
  Content-Security-Policy: <strict CSP, verbatim from netlify.toml>
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
  ! Content-Type
  Content-Type: application/manifest+json

/admin/*
  ! Content-Security-Policy
  Content-Security-Policy: <lax admin CSP, verbatim from netlify.toml>
```

The `!` detach lines are deliberate; without them the merged rules emit duplicate `Cache-Control`/CSP headers. Verify on the live site that each response carries exactly one CSP and one Cache-Control.

### Redirects (`sites/viper/deploy/cloudflare/_redirects`)

```
/favicon.ico  /favicon.svg  301
/admin/*  /admin/index.html  200
```

The old-domain 301 stays on Netlify. `www → apex` and `http → https` are Cloudflare zone settings, not `_redirects` (domain-level rules are not supported there):

- SSL/TLS → Edge Certificates → **Always Use HTTPS** on.
- Rules → Redirect Rules: if `http.host eq "www.vipersecurity.ch"`, dynamic redirect to `concat("https://vipersecurity.ch", http.request.uri.path)` with 301.

### Deploy pipeline

`.github/workflows/deploy-viper.yml` becomes:

1. checkout, setup-node (`.nvmrc`), `npm ci`
2. build + artifact guards (unchanged)
3. `npx wrangler deploy` from `sites/viper`
4. no size guard, no `lftp`, no FTP secrets

New repository secrets: `CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit) and `CLOUDFLARE_ACCOUNT_ID`.

The FTP workflow is kept as `deploy-viper-ftp-fallback.yml` with `workflow_dispatch` only, so a rollback can republish the Infomaniak copy without a code revert. Delete it after the transition window.

### DNS and email cutover

Order matters because DMARC is `p=reject`.

1. Export the full DNS zone from the Infomaniak Manager (text/BIND export).
2. Add `vipersecurity.ch` to Cloudflare; copy **every** record: MX, SPF, all DKIM CNAMEs, DMARC, autodiscover/autoconfig, any verification TXT.
3. Confirm all mail records exist in the Cloudflare zone before touching nameservers.
4. Change nameservers at Infomaniak to the Cloudflare pair.
5. Verify public DNS resolves MX/SPF/DKIM/DMARC from Cloudflare.
6. Send and receive test mail; confirm DKIM and SPF pass in the received headers.
7. Only then attach the apex custom domain to the Worker and enable `www` redirect + Always Use HTTPS.
8. Remove the old apex `A 128.65.195.180` record after the Cloudflare custom domain is active.

Rollback: set nameservers back to `nsany1.infomaniak.com` / `nsany2.infomaniak.com`; the Infomaniak copy stays deployed via the fallback workflow.

## Acceptance checks

1. `https://vipersecurity.ch/` 200; `http://` → 301 https; `www` → 301 apex (single hop, no loop).
2. `/` has exactly one strict CSP header; `/admin/` has exactly one lax CSP header.
3. HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy present on both scopes.
4. `/_astro/*` and `/images/*` return `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` returns `no-cache`.
5. `/manifest.webmanifest` returns `Content-Type: application/manifest+json`.
6. `/admin/anything` returns 200 with the admin HTML (SPA rewrite).
7. Unknown path returns `/404.html` body with status 404.
8. `/.htaccess` is not served (404).
9. Push to `main` deploys green; `wrangler deployments list` shows the new version; `wrangler rollback` works.
10. Email: inbound and outbound pass, DKIM and SPF pass, DMARC passes.
11. `sitemap-index.xml`, `robots.txt`, PWA install, and the gallery lightbox still work.

## Resolved builder questions (2026-10-22)

| Question               | Resolution                                                                                                                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Who does console work? | The agent has no Infomaniak or Cloudflare login. Repo, CI and a runbook are the deliverable; the user executes every console/DNS gate and confirms it.                                                                                                                   |
| FTP fallback lifetime  | Snapshot only. It works while `dist` stays under 9.5 MiB; after the first content change it may not fit. Primary rollback is `wrangler rollback`/redeploying a previous commit; the FTP workflow is `workflow_dispatch` only and is deleted after the transition window. |
| Old-domain 301         | The Netlify project still serves `/*` → `https://vipersecurity.ch/:splat` (verified live, deploy from 2026-10-18). Its config stays untouched, so Cloudflare headers live in `deploy/cloudflare/` and are copied into `dist/` at deploy time.                            |
| Apex gap at swap       | A few seconds is acceptable. Order: attach `www` first, then replace the apex `A` record with the Worker custom domain. DNS delegation itself overlaps with the Infomaniak origin, so only the apex swap is a short gap.                                                 |
| Email gate             | User runs a real send/receive test and reads `Authentication-Results`; the plan blocks the apex swap until that confirmation.                                                                                                                                            |

## Risks

- **Email during NS move** — mitigated by copying the zone first and testing before/after; rollback is a nameserver change.
- **Header merging** — Cloudflare concatenates matching rules; detach lines are mandatory, and acceptance check 2/4 catches regressions.
- **Cloudflare nameserver delegation** can take minutes to hours; the Infomaniak origin keeps serving until delegation completes. Only the apex custom-domain swap is a few-second gap (accepted).
- **Token scope** — a token with only Workers Scripts:Edit plus Account read is enough; avoid a global API key.
- **Apache artifacts** — `.htaccess` files would be public if uploaded; `.assetsignore` prevents it.

## Left to the builder

- Exact `wrangler` version pin and whether it is a root or site-level devDependency.
- Workflow step details (working directory, `wrangler deploy --config`, concurrency group).
- Test script shape for the acceptance checks (Node DNS queries, since `dig`/`nslookup` are unavailable in this environment).
- Whether to keep or delete `public/.htaccess` after the transition window.
