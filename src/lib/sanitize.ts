/**
 * Trim and enforce max length on a string input.
 */
export function sanitizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

/**
 * Escape HTML special characters to prevent XSS in emails.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape special characters for Supabase PostgREST ilike patterns.
 * Prevents pattern injection in search queries.
 */
export function escapePostgrestPattern(value: string): string {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}
