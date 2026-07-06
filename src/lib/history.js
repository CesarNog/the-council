const KEY = "council:history";
const MAX = 10;

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export function loadHistory() { return read(); }

export function saveToHistory({ id, question, headline, timestamp = Date.now() }) {
  const list = read().filter(h => h.question !== question);
  list.unshift({ id, question, headline, timestamp });
  write(list.slice(0, MAX));
}

export function clearHistory() {
  try { localStorage.removeItem(KEY); } catch {}
}
