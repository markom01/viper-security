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

import { fetchMakes, fetchModels } from "./nhtsa.js";

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

// Per-make model data cache: keyed by NHTSA make id → all model names plus
// the years each model was offered (built by probing every year in the
// canonical range against the year-scoped models endpoint — the same ~
// `${YEARS.length}`-call probe the booking form's `loadModels` ran inline).
// Both the form and the CMS widget consume this, so a make's model/year map
// is fetched once per page load. Cache fills only on success; empty lookups
// retry.
const modelsByMake = new Map();

/**
 * All models for a NHTSA make id, the years each model was offered, and the
 * union of years the make itself was offered. The union is the CMS widget's
 * middle fallback: legacy entries often carry marketing trim names
 * (`F-150 Super Snake`, `Aventador SVJ`) that vPic does not list, and a
 * make-wide year list still beats an empty type-ahead.
 * @param {number} makeId
 * @returns {Promise<{ names: string[]; yearsByModel: Record<string, number[]>; years: number[] }>}
 */
export async function loadMakeModels(makeId) {
  if (modelsByMake.has(makeId)) return modelsByMake.get(makeId);
  const years = vehicleYears();
  const modelP = fetchModels(makeId);
  const yearP = Promise.all(
    years.map((y) =>
      fetchModels(makeId, y).then((rows) => ({
        y,
        names: rows.map((m) => m.name),
      })),
    ),
  );
  const [models, yrRows] = await Promise.all([modelP, yearP]);
  /** @type {Record<string, number[]>} */
  const yearsByModel = {};
  /** @type {number[]} */
  const makeYears = [];
  for (const row of yrRows) {
    if (!row.names.length) continue;
    makeYears.push(row.y);
    for (const nm of row.names) {
      if (!yearsByModel[nm]) yearsByModel[nm] = [];
      yearsByModel[nm].push(row.y);
    }
  }
  const out = {
    names: modelNamesFrom(models),
    yearsByModel,
    years: [...new Set(makeYears)].sort((a, b) => a - b),
  };
  if (out.names.length) modelsByMake.set(makeId, out);
  return out;
}
