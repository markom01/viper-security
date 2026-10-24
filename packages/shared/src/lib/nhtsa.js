// NHTSA vPic vehicle lookups shared by the booking-form vehicle cascade
// (BookingForm.astro / DropdownInput.astro) and the Sveltia CMS vehicle field.
// Dependency-free on purpose: Task 9 bundles this file with esbuild.
//
// Callers own their caches, sorting and state machines — these helpers only
// wrap the raw fetches and tolerate network/parse failures with empty results,
// exactly like the inline code they replaced.

export const nhtsaApi = "https://vpic.nhtsa.dot.gov/api/vehicles";

/**
 * @typedef {{ name: string; id: number }} NhtsaMake
 * @typedef {{ name: string; years: number[] }} NhtsaModel
 */

/** @type {(r: Response) => Promise<any>} */
const jf = (r) => r.json();

/**
 * Makes for a vehicle type. "other" is free-text in the booking form and has
 * no NHTSA list, so it resolves to []. Duplicate names keep the first id.
 * @param {"car" | "motorcycle" | "other"} type
 * @returns {Promise<NhtsaMake[]>}
 */
export async function fetchMakes(type) {
  if (type === "other") return [];
  /** @type {Map<string, number>} */
  const ids = new Map();
  try {
    const d = await fetch(
      `${nhtsaApi}/GetMakesForVehicleType/${type}?format=json`,
    ).then(jf);
    for (const r of d.Results || [])
      if (!ids.has(r.MakeName)) ids.set(r.MakeName, r.MakeId);
  } catch {
    /* offline — empty */
  }
  return [...ids.entries()].map(([name, id]) => ({ name, id }));
}

/**
 * Resolve a make name against an already-fetched make list.
 * @param {NhtsaMake[]} makes
 * @param {string} name
 * @returns {Promise<number | null>}
 */
export async function fetchMakeId(makes, name) {
  const hit = makes.find((m) => m.name === name);
  return hit ? hit.id : null;
}

/**
 * Models for a make, optionally scoped to one model year.
 * `years` carries the queried year(s): `[year]` when given, `[]` otherwise.
 * @param {number} makeId
 * @param {number} [year]
 * @returns {Promise<NhtsaModel[]>}
 */
export async function fetchModels(makeId, year) {
  // The year-scoped endpoint is GetModelsForMakeIdYear (the paged
  // GetModelsForMakeId route does not accept a trailing year; it 404s).
  const url = year
    ? `${nhtsaApi}/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`
    : `${nhtsaApi}/GetModelsForMakeId/${makeId}?format=json`;
  const d = await fetch(url)
    .then(jf)
    .catch(() => ({ Results: [] }));
  /** @type {NhtsaModel[]} */
  const out = [];
  const seen = new Set();
  for (const r of d.Results || []) {
    const name = r.Model_Name;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push({ name, years: year ? [year] : [] });
  }
  return out;
}
