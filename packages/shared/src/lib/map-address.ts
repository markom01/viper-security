// Derive footer address lines from the Google Maps embed URL (`map_embed_url`)
// so the street/city is a single source of truth instead of hardcoded duplication.
//
// Expected shape: https://www.google.com/maps?q=<place, street, number, postcode, city, country>&output=embed
// `URLSearchParams.get("q")` already decodes `+` → space and %XX escapes.

const STREET_ABBREVIATIONS: Array<[RegExp, string]> = [
  [/\bCam\.\s*/g, "Camino "],
  [/\bAv\.\s*/g, "Avenida "],
  [/\bCtra\.\s*/g, "Carretera "],
  [/\bC\/\s*/g, "Calle "],
];

function expandStreetAbbreviations(line: string): string {
  return STREET_ABBREVIATIONS.reduce((acc, [re, full]) => acc.replace(re, full), line);
}

/**
 * Parse `q` from a Google Maps embed URL into display address lines.
 * - Drops a leading place/business name (first segment without digits) since
 *   `footer_company_name` renders separately.
 * - Merges a lone house number ("6") onto the street segment.
 * - Expands common Spanish street abbreviations on the street line.
 * - Folds trailing [postcode, city, country] into "postcode city - country".
 * Returns [] when the URL is missing/invalid or has no `q` param.
 */
export function addressLinesFromMapEmbedUrl(embedUrl?: string): string[] {
  let q: string | null = null;
  try {
    q = new URL(embedUrl || "").searchParams.get("q");
  } catch {
    return [];
  }
  if (!q) return [];

  const rawParts = q
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!rawParts.length) return [];

  // Leading place name (e.g. "DB Custom Garage Design") carries no digits —
  // the company name field owns that line, so drop it from the address.
  const parts =
    rawParts.length > 3 && !/\d/.test(rawParts[0]) ? rawParts.slice(1) : rawParts;

  // A segment may already pair postcode + city ("29651 Málaga" when the
  // share URL joins them with a space instead of a comma) — split those so
  // the house-number merge and trailing fold below see a uniform shape.
  const split: string[] = [];
  for (const part of parts) {
    const m = part.match(/^(\d{4,5})\s+(.+)$/);
    if (m) split.push(m[1], m[2]);
    else split.push(part);
  }

  // Merge a standalone house number onto the street ("Cam. de Campanales", "6").
  // The previous segment must not already end in a digit, so postcodes ("29651")
  // never glue onto the street line.
  const merged: string[] = [];
  for (const part of split) {
    const prev = merged[merged.length - 1];
    if (/^\d+[A-Za-z]?$/.test(part) && prev !== undefined && !/\d$/.test(prev)) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${part}`;
    } else {
      merged.push(part);
    }
  }

  const expanded = merged.map((line, i) =>
    i === 0 ? expandStreetAbbreviations(line) : line,
  );

  // Fold trailing postcode + city + country onto one line.
  if (expanded.length >= 3) {
    const [postcode, city, country] = expanded.slice(-3);
    if (/^\d{4,5}$/.test(postcode)) {
      return [...expanded.slice(0, -3), `${postcode} ${city} - ${country}`];
    }
  }

  return expanded;
}
