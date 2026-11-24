/**
 * Snapshot the DB Custom Garage Catawiki auction lots for the DBC
 * /services/auction/ page.
 *
 * Catawiki has no public API. Each listing page is a Next.js app whose
 * `__NEXT_DATA__` script contains the lot, bid and image data the browser
 * renders. Local runs read that HTML directly with `impit` (Firefox TLS
 * fingerprint). Datacenter IPs are blocked by Catawiki, so CI uses Firecrawl's
 * keyless `/v2/scrape` endpoint, which returns the same raw HTML from its own
 * infrastructure. No API key is needed. Override with CATAWIKI_DIRECT=1.
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

const FIRECRAWL_SCRAPE = "https://api.firecrawl.dev/v2/scrape";
const ORIGIN = "https://www.catawiki.com";
// GitHub runners get HTTP 403 from Catawiki even with impit's Firefox
// fingerprint. Firecrawl keyless returns the same raw HTML without a key.
const USE_FIRECRAWL =
  process.env.CATAWIKI_VIA_FIRECRAWL === "1" ||
  (process.env.GITHUB_ACTIONS === "true" &&
    process.env.CATAWIKI_DIRECT !== "1");

// The DBC site is English. Catawiki's English lot view exposes an
// `autoTranslatedDescription`, so the card copy stays readable even when the
// seller wrote the original listing in Italian.
const LOCALE = "en";
const SELLER = "979497-db-custom-garage";
const AUCTION_TYPE = "311"; // Youngtimer car auction — cars only.

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "sites/dbc/src/data/on-auction.json");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0";

const impit = new Impit({ browser: "firefox", timeout: 20000, http3: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pull `props.pageProps` out of a Catawiki Next.js HTML page. */
function nextDataProps(html, url) {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error(`Could not read __NEXT_DATA__ from ${url}`);
  const data = JSON.parse(match[1]);
  return data?.props?.pageProps ?? {};
}

async function fetchPageProps(url) {
  if (USE_FIRECRAWL) {
    const res = await fetch(FIRECRAWL_SCRAPE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["rawHtml"] }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.success) {
      throw new Error(
        `Firecrawl scrape failed for ${url}: ${payload.error ?? `HTTP ${res.status}`}`,
      );
    }
    return nextDataProps(payload.data?.rawHtml ?? "", url);
  }

  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await impit.fetch(url, {
        headers: {
          "User-Agent": UA,
          "Accept-Language": `${LOCALE}-${LOCALE.toUpperCase()},${LOCALE};q=0.9,en;q=0.8`,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Referer: `${ORIGIN}/`,
        },
        redirect: "manual",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return nextDataProps(await res.text(), url);
    } catch (err) {
      last = err;
      if (attempt < 3) await sleep(1000 * attempt);
    }
  }
  throw last;
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

const sellerUrl = `${ORIGIN}/${LOCALE}/u/${SELLER}?auction_type=${AUCTION_TYPE}`;
const sellerProps = await fetchPageProps(sellerUrl);
const cards = sellerProps.lots ?? [];

console.log(
  `Catawiki seller ${SELLER}, auction_type=${AUCTION_TYPE}: ${sellerProps.total ?? cards.length} lot(s)`,
);

const now = Date.now();
const lots = [];
for (const [index, card] of cards.entries()) {
  const detail = await fetchPageProps(
    card.url ?? `${ORIGIN}/${LOCALE}/l/${card.id}`,
  );
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
