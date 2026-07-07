-- The Council — Supabase schema
-- Run in Supabase SQL editor or via migration tool

-- Profiles (mirrors Clerk user)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  email text,
  display_name text,
  preferred_language text default 'en',
  plan text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Decisions
create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  anonymous_session_id text,
  question text not null,
  category text,
  emotional_weight text,
  main_fear text,
  language text default 'en',
  created_at timestamptz default now()
);

create index if not exists decisions_user_id_idx on decisions(user_id);
create index if not exists decisions_anon_idx on decisions(anonymous_session_id);

-- Debates (LLM response)
create table if not exists debates (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid references decisions(id) on delete cascade,
  model_provider text default 'groq',
  model_name text,
  response_json jsonb not null,
  used_fallback boolean default false,
  token_estimate int,
  created_at timestamptz default now()
);

-- Verdicts
create table if not exists verdicts (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid unique references decisions(id) on delete cascade,
  yes_count int default 0,
  no_count int default 0,
  depends_count int default 0,
  dominant_result text,
  dominant_persona text,
  summary text,
  final_question text,
  created_at timestamptz default now()
);

-- Public shares
create table if not exists shares (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid references decisions(id) on delete cascade,
  public_slug text unique not null,
  share_type text default 'link',
  created_at timestamptz default now()
);

create index if not exists shares_slug_idx on shares(public_slug);

-- User preferences
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references profiles(id) on delete cascade,
  include_name_in_share_card boolean default false,
  motion_preference text default 'system',
  theme text default 'dark',
  memory_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table decisions enable row level security;
alter table debates enable row level security;
alter table verdicts enable row level security;
alter table shares enable row level security;
alter table user_preferences enable row level security;

-- Profiles: users read/update own row (by clerk_user_id match via JWT — service role bypasses for API)
create policy "profiles_select_own" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (true);

-- Decisions: authenticated users see own; anon insert allowed via service role only
create policy "decisions_select_own" on decisions for select using (true);

-- Shares: public read by slug (safe fields only via view/API)
create policy "shares_public_read" on shares for select using (true);

-- Service role used server-side only; tighten policies when Clerk JWT wired to Supabase auth
