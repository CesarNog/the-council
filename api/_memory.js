/** Pinecone memory foundation — server-side only, optional. */

export function isPineconeConfigured() {
  return !!(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME);
}

export function createMemorySummary({ question, verdict, category, emotionalWeight, mainFear }) {
  const parts = [category, emotionalWeight, mainFear].filter(Boolean);
  const ctx = parts.length ? ` (${parts.join(", ")})` : "";
  return `Decision${ctx}: ${String(question).slice(0, 120)} → ${String(verdict).slice(0, 200)}`;
}

export async function upsertMemory(_record) {
  if (!isPineconeConfigured()) return { ok: false, skipped: true };
  // Placeholder — wire @pinecone-database/pinecone when memory opt-in enabled
  return { ok: false, skipped: true, reason: "not_implemented" };
}

export async function searchMemories(_userId, _query, _limit = 5) {
  if (!isPineconeConfigured()) return [];
  return [];
}

export async function deleteUserMemories(_userId) {
  if (!isPineconeConfigured()) return { ok: false, skipped: true };
  return { ok: true, deleted: 0 };
}
