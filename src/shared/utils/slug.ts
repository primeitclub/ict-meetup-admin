/**
 * Convert a human title into a URL-safe slug.
 *   "ICT Meetup 2026!"   → "ict-meetup-2026"
 *   "Café — Spécial"     → "cafe-special"
 *   "  multiple   spaces "→ "multiple-spaces"
 */
export function createSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD") // split accented chars into base + combining marks
    .replace(/[̀-ͯ]/g, "") // drop the combining marks (U+0300..U+036F)
    .replace(/[^a-z0-9\s-]/g, "") // drop everything that isn't alnum/space/-
    .replace(/\s+/g, "-") // collapse whitespace runs into a single -
    .replace(/-+/g, "-") // collapse hyphen runs
    .replace(/^-+|-+$/g, ""); // trim leading/trailing -
}
