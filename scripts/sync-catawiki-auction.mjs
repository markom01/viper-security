/**
 * Snapshot the DB Custom Garage Catawiki auction lots for the DBC
 * /services/auction/ page.
 *
 * Catawiki has no public API. The listing pages are a Next.js app, so the
 * same data the browser renders is available from `/_next/data/<buildId>`.
 * `impit` supplies a browser TLS fingerprint; plain fetch/curl is blocked by
 * Akamai from datacenter IPs. GitHub Actions runners are blocked even with
 * `impit`, so CI routes the same requests through the Jina AI reader proxy
 * (public pages, cache-busted per request). Set CATAWIKI_DIRECT=1 to force
 * direct `impit` fetching on a runner.
 *
 * Output: sites/dbc/src/data/on-auction.json (committed; Astro reads it at
 * build time, so the Netlify build never calls Catawiki).
 *
 * Usage: npm run sync:auction
 */
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Impit } from "impit";

const JINA_ORIGIN = "https://r.jina.ai/";
const ORIGIN = "https://www.catawiki.com";
// GitHub Actions and other datacenter IPs get HTTP 403 from Akamai even with
// impit's Firefox fingerprint. Jina fetches the same public pages from its own
// IP and returns raw HTML/JSON. Local runs keep using impit direct.
const USE_JINA =
  process.env.CATAWIKI_VIA_JINA === "1" ||
  (process.env.GITHUB_ACTIONS === "true" &&
    process.env.CATAWIKI_DIRECT !== "1");

// Jina blocks anonymous requests from datacenter IPs (HTTP 401 "bad network
// reputation"). CI must send a free API key from jina.ai/reader.
const JINA_API_KEY = process.env.JINA_API_KEY;
if (USE_JINA && !JINA_API_KEY) {
  throw new Error(
    "JINA_API_KEY is required for CI fetching (anonymous Jina requests are blocked from datacenter IPs)",
  );
}
// The DBC site is English. Catawiki's English lot view exposes an
// `autoTranslatedDescription`, so the card copy stays readable even when the
// seller wrote the original listing in Italian.
const LOCALE = "en";
const SELLER = "979497-db-custom-garage";
const AUCTION_TYPE = "311"; // "Asta di auto youngtimer" — cars only.

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "sites/dbc/src/data/on-auction.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0";

const impit = new Impit({ browser: "firefox", timeout: 20000, http3: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, accept, referer) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Cache-bust Jina's own cache; Catawiki ignores the extra `_` query.
      const target = USE_JINA
        ? `${JINA_ORIGIN}${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`
        : url;
      const res = await impit.fetch(target, {
        headers: {
          "User-Agent": UA,
          "Accept-Language": `${LOCALE}-${LOCALE.toUpperCase()},${LOCALE};q=0.9,en;q=0.8`,
          Accept: accept,
          ...(referer ? { Referer: referer } : {}),
          ...(USE_JINA
            ? {
                "X-Return-Format": accept.includes("html") ? "html" : "text",
                Authorization: `Bearer ${JINA_API_KEY}`,
                "X-No-Cache": "true",
              }
            : {}),
        },
        redirect: "manual",
      });
      if (res.status === 404) {
        const err = new Error(`HTTP 404 for ${url}`);
        err.status = 404;
        throw err;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      last = err;
      if (attempt < 3 && err.status !== 404) await sleep(1000 * attempt);
    }
  }
  throw last;
}

async function readBuildId(referer) {
  const html = await fetchText(
    referer,
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    `${ORIGIN}/`,
  );
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("Could not read __NEXT_DATA__");
  const buildId = JSON.parse(match[1]).buildId;
  if (!buildId) throw new Error("Could not read buildId");
  return buildId;
}

async function fetchPageJson(pathWithQuery, referer) {
  const buildId = await readBuildId(referer);
  const url = `${ORIGIN}/_next/data/${buildId}${pathWithQuery}`;
  try {
    return JSON.parse(
      await fetchText(url, "application/json, text/plain, */*", referer),
    );
  } catch (err) {
    if (err.status !== 404) throw err;
    // Build id rotates on deploy: refetch the page once, then retry.
    const fresh = await readBuildId(referer);
    return JSON.parse(
      await fetchText(
        `${ORIGIN}/_next/data/${fresh}${pathWithQuery}`,
        "application/json, text/plain, */*",
        referer,
      ),
    );
  }
}

function specValue(specs, id) {
  return specs?.find((s) => s.specificationId === id)?.value ?? null;
}

function endLabel(ms) {
  if (!ms) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Rome",
  }).format(new Date(ms));
}

function normalizeLot(detail, card, order) {
  const lot = detail.lotDetailsData ?? {};
  const bid = detail.biddingBlockResponse ?? {};
  const auction = detail.auction ?? {};
  const specs = lot.specifications ?? [];

  const make = specValue(specs, 909);
  const model = specValue(specs, 994);
  const year = specValue(specs, 1049);
  const price =
    bid.localizedCurrentBidAmount ?? bid.localizedStartBidAmount ?? null;
  const ends = endLabel(bid.biddingEndTime);
  const title =
    [year, make, model].filter(Boolean).join(" ") || lot.lotTitle || card.title;

  return {
    id: String(lot.lotId ?? card.id),
    url: card.url ?? `${ORIGIN}/${LOCALE}/l/${lot.lotId ?? card.id}`,
    name: title,
    type: ends
      ? `${auction.title ?? "Catawiki"} · ends ${ends}`
      : (auction.title ?? "Catawiki"),
    description:
      (lot.autoTranslatedDescription ?? lot.description ?? "")
        .replace(/\r\n/g, "\n")
        .trim() || undefined,
    price: typeof price === "number" ? price : undefined,
    images: (lot.images ?? [])
      .map((i) => i.large ?? i.medium ?? i.id)
      .filter(Boolean),
    vehicle: {
      ...(make ? { make } : {}),
      ...(model ? { model } : {}),
      ...(year ? { year } : {}),
    },
    order,
  };
}

const sellerPath = `/${LOCALE}/u/${SELLER}`;
const sellerPage = `${ORIGIN}${sellerPath}?auction_type=${AUCTION_TYPE}`;
const sellerData = await fetchPageJson(
  `${sellerPath}.json?segments=${encodeURIComponent(SELLER)}&auction_type=${AUCTION_TYPE}`,
  sellerPage,
);
const page = sellerData.pageProps ?? {};
const cards = page.lots ?? [];

console.log(
  `Catawiki seller ${SELLER}, auction_type=${AUCTION_TYPE}: ${page.total ?? cards.length} lot(s)`,
);

const now = Date.now();
const lots = [];
for (const [index, card] of cards.entries()) {
  const detailData = await fetchPageJson(
    `/${LOCALE}/l/${card.id}.json?lotId=${card.id}`,
    `${ORIGIN}/${LOCALE}/l/${card.id}`,
  );
  const detail = detailData.pageProps ?? {};
  const bid = detail.biddingBlockResponse ?? {};
  const ended =
    bid.closed ||
    bid.sold ||
    detail.lotDetailsData?.isClosed ||
    (bid.biddingEndTime && bid.biddingEndTime <= now);
  if (ended) {
    console.log(`  skip ${card.id} (closed)`);
    continue;
  }
  lots.push(normalizeLot(detail, card, index));
  await sleep(250);
}

let previous = null;
try {
  previous = JSON.parse(await readFile(OUT, "utf8"));
} catch {
  // First run, or an unreadable/old snapshot: write a fresh one.
}

const unchanged =
  previous?.seller === SELLER &&
  previous?.auctionType === AUCTION_TYPE &&
  JSON.stringify(previous?.lots) === JSON.stringify(lots);

if (unchanged) {
  console.log(`No listing changes; kept ${OUT}`);
  process.exit(0);
}

const payload = {
  syncedAt: new Date().toISOString(),
  seller: SELLER,
  auctionType: AUCTION_TYPE,
  lots,
};

await mkdir(dirname(OUT), { recursive: true });
const tmp = `${OUT}.tmp`;
await writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
await rename(tmp, OUT);

console.log(`Wrote ${lots.length} open lot(s) to ${OUT}`);
