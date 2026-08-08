/**
 * resolveLabels — CMS-driven UI labels.
 *
 * Sections resolve their label tree through this helper instead of reading
 * STRINGS directly. Any `pageContent.labels` entry (flat, dot-path keys, e.g.
 * "fleet.subheadline") overrides the matching STRINGS value. When a site has
 * no `labels` in CMS (VIPER today), it falls back to STRINGS unchanged — so
 * existing content is untouched, only the CMS supplies overrides.
 *
 * Usage in a section  : const s = resolveLabels(pageContent, STRINGS);
 * Call-site invariant : s.nav.home, s.fleet.subheadline, ... unchanged.
 *
 * The return type is the SAME literal shape as `strings` (generic `T`), so
 * callers keep full key access (s.nav.chauffeur, s.stepNumber[0]) — the merge
 * only replaces values at existing keys, it never adds or removes keys.
 */

/** A leaf value: a single string, or an array of strings (e.g. STRINGS.stepNumber). */
type LabelLeaf = string | string[];
/** A label tree: nested objects of leaves/trees. */
type LabelTree = { [key: string]: LabelLeaf | LabelTree };

/**
 * Merge CMS label overrides (flat dot-path keys) over the STRINGS tree.
 * Only keys that already exist in `strings` are overridden — a CMS label for
 * a path with no STRINGS default is ignored, keeping the tree shape stable.
 */
export function resolveLabels<T extends LabelTree>(
  pageContent: { labels?: Record<string, unknown> } | undefined,
  strings: T,
): T {
  const labels = pageContent?.labels;
  if (!labels) return strings;

  const merged = { ...strings };
  for (const [path, value] of Object.entries(labels)) {
    if (typeof value !== "string" || value === "") continue;
    const parts = path.split(".");
    let depth = merged as LabelTree;
    let ok = true;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!depth[part] || typeof depth[part] !== "object") {
        ok = false;
        break;
      }
      depth = depth[part] as LabelTree;
    }
    if (ok && depth[parts[parts.length - 1]] !== undefined) {
      depth[parts[parts.length - 1]] = value;
    }
  }
  return merged;
}
