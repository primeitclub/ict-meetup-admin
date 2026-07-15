/**
 * Reduce rich-text editor HTML to the plain text inside it.
 *   "<p>Hello <strong>world</strong></p>" → "Hello world"
 *   "<p>&nbsp;</p>"                       → ""
 *   "<p>One</p><p>Two</p>"                → "One Two"
 *
 * \s covers the non-breaking space Tiptap emits, so it collapses away here.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  const spaced = html.replace(/<\/(p|div|li|h[1-6])>|<br\s*\/?>/gi, " ");
  const body = new DOMParser().parseFromString(spaced, "text/html").body;
  return (body.textContent ?? "").replace(/\s+/g, " ").trim();
}
