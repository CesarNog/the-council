# Memory Architecture (Pinecone)

Optional vector memory for future "Memory Echoes".

## Env vars

```
PINECONE_API_KEY=
PINECONE_INDEX_NAME=council-memory
```

## Principles

- Server-side only (`api/_memory.js`)
- User opt-in via `user_preferences.memory_enabled`
- Index **summaries**, not raw debates by default
- `deleteUserMemories(userId)` for GDPR

## API (placeholder)

- `createMemorySummary()` — safe text extraction
- `upsertMemory()` — not wired until opt-in UX ships
- `searchMemories()` — returns [] when unconfigured

## Object shape

```json
{
  "user_id": "uuid",
  "decision_id": "uuid",
  "category": "career",
  "summary": "...",
  "emotional_weight": "...",
  "main_fear": "...",
  "created_at": "ISO8601"
}
```
