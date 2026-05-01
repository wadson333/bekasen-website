/**
 * Server-side HTML sanitization wrapper around isomorphic-dompurify.
 * Used to scrub client-submitted message content (project_messages, contact form)
 * before persisting or rendering.
 */
import DOMPurify from "isomorphic-dompurify";

const MAX_MESSAGE_LENGTH = 2000;

/**
 * Strip all HTML and limit length. Use for plain-text user-generated content
 * (chat messages, contact form fields).
 */
export function sanitizePlainText(input: string, maxLength = MAX_MESSAGE_LENGTH): string {
  if (typeof input !== "string") return "";
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  return stripped.slice(0, maxLength).trim();
}

/**
 * Allow a small set of safe inline tags (bold, italic, links). Use only for
 * admin-authored content where a basic rich-text experience is needed.
 */
export function sanitizeRichText(input: string): string {
  if (typeof input !== "string") return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "a", "br", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}
