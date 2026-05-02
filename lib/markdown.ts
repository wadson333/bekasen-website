import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

// Renders user-supplied markdown to a sanitized HTML string. Used by the
// public blog post detail and (later) page_contents-driven sections.
//
// Pipeline:
//   1. marked parses the markdown deterministically (no async features used)
//   2. DOMPurify strips any unsafe tags/attributes (XSS-safe by default)
//
// The output is meant for `dangerouslySetInnerHTML`. Wrap the consumer in a
// `prose` Tailwind container or a custom CSS scope for typography styling.
export function renderMarkdown(input: string): string {
  if (!input) return "";

  // marked.parse can return Promise<string> when async extensions are on; we
  // disable them so the result is always a sync string.
  const raw = marked.parse(input, { async: false }) as string;

  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      "p",
      "a",
      "br",
      "hr",
      "strong",
      "em",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "del",
      "ins",
      "sup",
      "sub",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "loading", "width", "height"],
    ADD_ATTR: ["target", "rel"],
  });
}
