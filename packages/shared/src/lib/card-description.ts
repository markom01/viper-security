/**
 * Card excerpt: the first ten non-empty lines of a listing description.
 * Line breaks are preserved so source bullet points stay on their own line.
 */
export function cardDescription(description: unknown, maxLines = 10): string {
  return String(description ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxLines)
    .join("\n");
}
