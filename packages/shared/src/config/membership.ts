/**
 * Compute the membership value line from live data — never hardcoded.
 *
 * The note ("Gold ≈ €87.50/hr — 27% below the hourly rate…") is derived from
 * the pricing collection's base hourly rate and each tier's price/hours, so a
 * change to either stays in sync automatically.
 */

export interface Tier {
  name?: string;
  price?: string;
  hours?: number;
}

export interface HourlyRate {
  name?: string;
  price?: string;
}

/** Strip currency formatting from a price string → number. */
export function parsePrice(price?: string): number {
  if (!price) return 0;
  const n = Number(String(price).replace(/[^0-9.,-]/g, "").replace(",", ""));
  return Number.isFinite(n) ? n : 0;
}

/** First hourly rate's price as the base rate for comparison. */
export function baseHourly(rates?: HourlyRate[]): number {
  return parsePrice(rates?.[0]?.price);
}

/**
 * Build a "value" sentence from live data:
 *   "Members save up to 39% vs the €120/hr hourly rate."
 * Falls back to an empty string when data is missing.
 */
export function membershipValueNote(
  tiers?: Tier[],
  rates?: HourlyRate[],
): string {
  const base = baseHourly(rates);
  if (!base) return "";

  const savings = (tiers || [])
    .map((t) => {
      const price = parsePrice(t.price);
      const hours = t.hours || 0;
      if (!price || !hours) return 0;
      const effective = price / hours;
      return base > effective ? Math.round(((base - effective) / base) * 100) : 0;
    })
    .filter((pct) => pct > 0);

  if (!savings.length) return "";
  const max = Math.max(...savings);
  return `Members save up to ${max}% compared to the €${base}/hr hourly rate.`;
}
