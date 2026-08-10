/**
 * Escape JSON for safe injection into a raw-text `<script>` element.
 * JSON.stringify does NOT escape `<`, so a CMS-authored `</script>` would
 * break out of the element. These Unicode escapes decode back to identical
 * JSON — only the raw-text boundary becomes impossible to hit.
 * Use before `set:html` or `{interpolation}` of serialized CMS data.
 */
export function jsonEscape(json: string): string {
  const ls = String.fromCharCode(0x2028);
  const ps = String.fromCharCode(0x2029);
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(ls)
    .join("\\u2028")
    .split(ps)
    .join("\\u2029");
}
