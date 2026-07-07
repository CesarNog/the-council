import { createClient } from "@supabase/supabase-js";

let _admin = null;

/** Server-side Supabase client (service role). Returns null if not configured. */
export function getSupabaseAdmin() {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _admin;
}

export function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Upsert profile from Council user object. */
export async function upsertProfileFromUser(user) {
  const sb = getSupabaseAdmin();
  if (!sb || !user?.sub) return null;
  const clerkId = user.clerkId || user.sub.replace(/^clerk:/, "");
  const row = {
    clerk_user_id: clerkId,
    email: user.email || null,
    display_name: user.name || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sb.from("profiles").upsert(row, { onConflict: "clerk_user_id" }).select().single();
  if (error) {
    console.error("supabase: upsert profile failed", error.message);
    return null;
  }
  return data;
}

/** Persist decision + debate + verdict after council generation. */
export async function persistDecisionBundle({ userId, question, language, decisionContext, debate, publicSlug }) {
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  const { data: decision, error: dErr } = await sb.from("decisions").insert({
    user_id: userId || null,
    question,
    category: decisionContext?.decisionCategory || null,
    emotional_weight: decisionContext?.emotionalWeight || null,
    main_fear: decisionContext?.mainFear || null,
    language: language || "en",
  }).select().single();

  if (dErr) {
    console.error("supabase: insert decision failed", dErr.message);
    return null;
  }

  await sb.from("debates").insert({
    decision_id: decision.id,
    model_provider: "groq",
    model_name: "openai/gpt-oss-120b",
    response_json: debate,
    used_fallback: !!debate.offline,
  });

  const yes = debate.votes?.filter(v => v.v === "yes").length || 0;
  const no = debate.votes?.filter(v => v.v === "no").length || 0;
  const depends = debate.votes?.filter(v => v.v === "depends").length || 0;
  let dominant = "depends";
  if (yes > no && yes > depends) dominant = "yes";
  else if (no > yes && no > depends) dominant = "no";

  await sb.from("verdicts").insert({
    decision_id: decision.id,
    yes_count: yes,
    no_count: no,
    depends_count: depends,
    dominant_result: dominant,
    summary: debate.verdict || null,
    final_question: debate.question || null,
  });

  if (publicSlug) {
    await sb.from("shares").insert({ decision_id: decision.id, public_slug: publicSlug });
  }

  return decision.id;
}

/** Fetch authenticated user decision history. */
export async function fetchUserDecisions(profileId, limit = 20) {
  const sb = getSupabaseAdmin();
  if (!sb || !profileId) return [];
  const { data, error } = await sb
    .from("decisions")
    .select("id, question, created_at, verdicts(summary, dominant_result)")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("supabase: fetch history failed", error.message);
    return [];
  }
  return data || [];
}
