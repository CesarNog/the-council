/** First given name for greetings — avoids full legal/display strings. */
export function firstName(name) {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0];
}
