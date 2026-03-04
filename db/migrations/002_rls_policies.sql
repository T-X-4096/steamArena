-- db/migrations/002_rls_policies.sql
-- Enables RLS and adds public SELECT policies on all 6 content tables.
-- The anon key (used by the frontend) can only READ data.
-- All writes come through the Cloudflare Worker using service_role, which bypasses RLS.
-- Run this in your Supabase SQL editor.

-- ─── Enable RLS ───────────────────────────────────────────────────────────────

alter table teams             enable row level security;
alter table featured_streams  enable row level security;
alter table live_streams      enable row level security;
alter table news_articles     enable row level security;
alter table highlights        enable row level security;
alter table tournaments       enable row level security;

-- ─── Drop any old permissive policies (idempotent re-run safety) ──────────────

drop policy if exists "Public can read teams"             on teams;
drop policy if exists "Public can read featured_streams"  on featured_streams;
drop policy if exists "Public can read live_streams"      on live_streams;
drop policy if exists "Public can read news_articles"     on news_articles;
drop policy if exists "Public can read highlights"        on highlights;
drop policy if exists "Public can read tournaments"       on tournaments;

-- ─── Public read-only SELECT policies ────────────────────────────────────────
-- using (true) = any visitor (including unauthenticated anon) can SELECT.
-- No INSERT / UPDATE / DELETE policies are added here because all writes
-- are done by the Worker using service_role, which bypasses RLS entirely.

create policy "Public can read teams"
    on teams for select using (true);

create policy "Public can read featured_streams"
    on featured_streams for select using (true);

create policy "Public can read live_streams"
    on live_streams for select using (true);

create policy "Public can read news_articles"
    on news_articles for select using (true);

create policy "Public can read highlights"
    on highlights for select using (true);

create policy "Public can read tournaments"
    on tournaments for select using (true);
