// Shared HTML escape — every user-supplied string MUST flow through this
// before being interpolated into a template literal that's assigned to
// innerHTML (friend_name, intro_text, message, closing_line, photo captions,
// anything that came from the form or from the DB). Without this, a name
// like "<b>test</b>" would be rendered as a bold tag instead of literal text.
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}