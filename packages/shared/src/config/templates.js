/**
 * Template string resolver for location and site name placeholders.
 *
 * Location placeholders (from booking_data):
 *   {location1}      → spain short_label   (e.g. "Marbella")
 *   {location2}      → italy short_label   (e.g. "Milano")
 *   {location1_full} → spain label         (e.g. "Costa del Sol — Marbella")
 *   {location2_full} → italy label         (e.g. "Northern Italy & Alps — Milano")
 *   {location1_name} → spain region        (e.g. "Costa del Sol")
 *   {location2_name} → italy region        (e.g. "Northern Italy & Alps")
 *
 * Site name:
 *   {site_name}     → siteName parameter   (e.g. "VIPER Security")
 *
 * Vehicle name:
 *   {vehicle}       → vehicleName parameter (e.g. "Mercedes-Benz S-Class")
 *
 * @param {string} str - String containing placeholders
 * @param {object|undefined} bd - booking_data object from page-content (may be undefined)
 * @param {string} [siteName] - Site/brand name for {site_name} placeholder
 * @param {string} [vehicleName] - Vehicle name for {vehicle} placeholder
 * @returns {string} Resolved string
 */
export function resolveTemplates(str, bd, siteName, vehicleName) {
  if (!str) return '';
  const s = bd?.spain || {};
  const i = bd?.italy || {};
  const map = {
    '{location1}': s.short_label || '',
    '{location2}': i.short_label || '',
    '{location1_full}': s.label || '',
    '{location2_full}': i.label || '',
    '{location1_name}': s.region || '',
    '{location2_name}': i.region || '',
    '{site_name}': siteName || '',
    '{vehicle}': vehicleName || '',
  };
  let result = str;
  for (const [key, value] of Object.entries(map)) {
    if (value) {
      result = result.replaceAll(key, value);
    }
  }
  return result;
}
