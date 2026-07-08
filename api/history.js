import { requireUser } from "./auth.js";
import { methodNotAllowed } from "./_http.js";
import { isSupabaseConfigured, getSupabaseAdmin, upsertProfileFromUser } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  if (!isSupabaseConfigured()) return res.status(503).json({ error: "supabase_not_configured" });

  const auth = await requireUser(req, res);
  if (!auth) return;

  const profile = await upsertProfileFromUser(auth.user);
  if (!profile?.id) return res.status(200).json({ items: [], source: "kv_fallback" });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("decisions")
    .select("id, question, created_at, verdicts(summary, dominant_result)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("history: supabase read failed", error.message);
    return res.status(502).json({ error: "history_unavailable" });
  }

  return res.status(200).json({ items: data || [], source: "supabase" });
}
