# Cloudflare cutover runbook — vipersecurity.ch

Date: 2026-10-22
Spec: `docs/superpowers/specs/2026-10-22-cloudflare-workers-hosting-design.md`

Console steps are manual. The agent has no Infomaniak or Cloudflare login. Execute the phases in order; do not skip a gate.

## Phase 0 — Prerequisites

1. Cloudflare account, with `vipersecurity.ch` added as a zone (free plan).
2. Infomaniak Manager access: DNS zone export and nameserver settings.
3. Cloudflare API token scoped to **Workers Scripts: Edit** plus **Account: Read**.
4. GitHub repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
5. Current Infomaniak zone exported as BIND/text. This is the only reliable source for the DKIM selectors.

## Phase 1 — Copy the zone (before any nameserver change)

In the Cloudflare DNS tab, create every record from the export:

| Type  | Name                                     | Value                                   | Proxy                      |
| ----- | ---------------------------------------- | --------------------------------------- | -------------------------- |
| MX    | `@`                                      | `mta-gw.infomaniak.ch` priority 5       | n/a                        |
| TXT   | `@`                                      | `v=spf1 include:spf.infomaniak.ch -all` | n/a                        |
| TXT   | `_dmarc`                                 | `v=DMARC1; p=reject;`                   | n/a                        |
| CNAME | DKIM selectors from the export           | values from the export                  | **DNS only (grey cloud)**  |
| CNAME | `autodiscover` / `autoconfig` if present | values from the export                  | **DNS only**               |
| A     | `@`                                      | `128.65.195.180`                        | **DNS only** until Phase 4 |

Rules:

- DKIM CNAMEs must be grey-cloud. Proxying breaks DKIM.
- Do not delete the apex `A` record yet; it keeps the Infomaniak site live while nameservers change.
- DMARC is `p=reject`. A missing DKIM record will reject outbound mail silently.

Verify the copied records from a machine with DNS access:

```bash
node -e 'const d=require("dns").promises;(async()=>{console.log("NS",await d.resolveNs("vipersecurity.ch"));console.log("MX",await d.resolveMx("vipersecurity.ch"));console.log("SPF",await d.resolveTxt("vipersecurity.ch"));console.log("DMARC",await d.resolveTxt("_dmarc.vipersecurity.ch"));})()'
```

Before the switch this still returns Infomaniak nameservers; that is expected. Confirm the records exist in the Cloudflare dashboard.

## Phase 2 — First deploy to workers.dev

1. Push to `main` (or run **Deploy VIPER** manually). The workflow builds, runs `sites/viper/scripts/prepare-cloudflare-dist.mjs`, then `wrangler deploy`.
2. Note the `*.workers.dev` hostname printed by `wrangler`.
3. Verify before touching DNS:

```bash
BASE=https://viper-security.<account>.workers.dev
curl -sI "$BASE/" | grep -ci '^content-security-policy'        # 1
curl -sI "$BASE/admin/" | grep -ci '^content-security-policy'  # 1
curl -sI "$BASE/.htaccess" | head -1                            # 404
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/admin/"         # 200
```

Also confirm `/`, `/gallery/`, `/services/armored-vehicles/` render and the gallery images load. `wrangler deployments list` should show the deploy.

## Phase 3 — Switch nameservers

1. In the Infomaniak Manager, replace `nsany1.infomaniak.com` / `nsany2.infomaniak.com` with the two Cloudflare nameservers.
2. Wait for delegation. Check with the Node command above: `NS` must return the Cloudflare pair.
3. Confirm MX, SPF, DMARC, and each DKIM selector still resolve. The records now come from Cloudflare.

At this point `https://vipersecurity.ch` still serves from Infomaniak through the grey-cloud apex `A` record. Nothing is broken yet.

## Phase 4 — Email gate (hard stop)

1. Send a mail from a mailbox on `vipersecurity.ch` to an external address (Gmail or similar).
2. Send a mail from that external address to a mailbox on `vipersecurity.ch`.
3. In the received message source, confirm `spf=pass` and `dkim=pass` (and `dmarc=pass`) in `Authentication-Results`.
4. Do not continue until both directions pass. If DKIM fails, restore the missing selector record and retest.

## Phase 5 — Attach the domain

1. Workers & Pages → `viper-security` → Settings → Domains & Routes → **Add custom domain** → `www.vipersecurity.ch`. Test it.
2. Delete the apex `A 128.65.195.180` record. A few seconds of apex downtime is accepted.
3. Add the apex custom domain `vipersecurity.ch` to the same Worker. Cloudflare creates the flattened record.
4. SSL/TLS → Edge Certificates → enable **Always Use HTTPS**.
5. Rules → Redirect Rules → create a 301: when `http.host eq "www.vipersecurity.ch"`, dynamic redirect to `concat("https://vipersecurity.ch", http.request.uri.path)`, preserve the query string.
6. If the zone was proxied during the transition, keep SSL/TLS mode **Full (strict)** only while the origin certificate is valid; after the apex swap there is no origin.

## Phase 6 — Final acceptance

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://vipersecurity.ch/
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.vipersecurity.ch/
curl -sI https://vipersecurity.ch/ | grep -ci '^content-security-policy'        # 1
curl -sI https://vipersecurity.ch/admin/ | grep -ci '^content-security-policy'  # 1
curl -sI https://vipersecurity.ch/sw.js | grep -i '^cache-control'              # no-cache
curl -sI https://vipersecurity.ch/manifest.webmanifest | grep -i '^content-type'
curl -sI https://vipersecurity.ch/.htaccess | head -1                            # 404
```

Also check:

- `/admin/` loads Sveltia CMS and its hash routes work (`/admin/#/collections/...`).
- Unknown path returns the branded 404 with status 404.
- `sitemap-index.xml` and `robots.txt` load over https.
- PWA install prompt still works; `sw.js` updates after a deploy.
- Gallery lightbox and contact links work.

## Rollback

- DNS: set nameservers back to `nsany1.infomaniak.com` and `nsany2.infomaniak.com`.
- Cloudflare-only: `wrangler rollback` or redeploy a previous commit.
- Infomaniak snapshot: run **Deploy VIPER (Infomaniak FTP fallback)** while `dist` is still under 9.5 MiB. This stops being possible after the first content growth.

## Decommission (after ~30 days green)

1. Delete `.github/workflows/deploy-viper-ftp-fallback.yml` and the Infomaniak FTP secrets.
2. Cancel the paid Infomaniak hosting package if one exists; keep the domain and mail.
3. Leave `sites/viper/netlify.toml` and `public/_headers` in place while the old `viper-security.netlify.app` 301 is still wanted.
