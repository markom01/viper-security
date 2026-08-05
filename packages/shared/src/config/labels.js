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
 */
export function resolveLabels(pageContent, strings) {
  const labels = pageContent?.labels;
  if (!labels) return strings;

  const merged = { ...strings };
  for (const [path, value] of Object.entries(labels)) {
    if (typeof value !== 'string' || value === '') continue;
    const parts = path.split('.');
    let depth = merged;
    let ok = true;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!depth[part] || typeof depth[part] !== 'object') { ok = false; break; }
      depth = depth[part];
    }
    if (ok && depth[parts[parts.length - 1]] !== undefined) {
      depth[parts[parts.length - 1]] = value;
    }
  }
  return merged;
}