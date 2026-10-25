// Vehicle-cascade logic shared by the booking-form vehicle fields
// (BookingForm.astro) and the Sveltia nhtsa_vehicle CMS control
// (admin/nhtsa-field.js): the canonical year range, cached make lookups per
// type, and sorted/deduped name helpers. The raw vPic fetches stay in
// ./nhtsa.js — this layer only adds the cache and shape normalization both
// callers want, so the CMS widget reuses the same logic as the page's forms.
//
// Year semantics follow the booking form, which is the behavior source of
// truth: 1992 through the current year + 1, ascending. The CMS control
// consumes the same range reversed as descending strings for its select.
//
// The per-type makes cache is module-level. The booking form therefore shares
// one cache across every .vehicle-fields block on a page instead of caching
// per block, and the CMS widget keeps its own instance in the admin document.
// Successful lists are cached; empty lists are not (except "other", which is
// free-text by design with no NHTSA list), so a failed lookup retries on the
// next call.

import { fetchMakes } from "./nhtsa.js";

/** @typedef {{ name: string; id: number }} NhtsaMake */

export const YEAR_MIN = 1992;

/** Ascending vehicle years: 1992 .. current year + 1 (booking-form semantics). */
export function vehicleYears() {
  const years = [];
  const max = new Date().getFullYear() + 1;
  for (let y = YEAR_MIN; y <= max; y += 1) years.push(y);
  return years;
}

const makesByType = new Map();

/**
 * Raw makes for a vehicle type, cached per type. "other" is free-text and
 * resolves to [] without a request. Returns the `{ name, id }` rows so
 * callers can resolve the NHTSA make id for model lookups.
 * @param {string} type vehicle type ("car" | "motorcycle" | "other")
 */
export async function getMakesRaw(type) {
  if (!type || type === "other") return [];
  if (makesByType.has(type)) return makesByType.get(type);
  /** @type {NhtsaMake[]} */
  const list = await fetchMakes(/** @type {"car" | "motorcycle"} */ (type));
  if (list.length) makesByType.set(type, list);
  return list;
}

/** Sorted make names from raw make rows. */
export function makeNamesFrom(makes) {
  return makes.map((m) => m.name).sort();
}

/** Sorted, deduped model names from fetchModels rows (`{ name, years }`). */
export function modelNamesFrom(models) {
  return [...new Set(models.map((m) => m.name))].sort();
}
