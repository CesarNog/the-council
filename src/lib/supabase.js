/** Browser Supabase client — optional; returns null without env vars. */
import { createClient } from "@supabase/supabase-js";

let _client = null;

export function getSupabaseBrowser() {
  if (_client) return _client;
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key);
  return _client;
}

export function isSupabaseBrowserEnabled() {
  return !!(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY);
}
