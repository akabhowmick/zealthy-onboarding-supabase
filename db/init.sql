-- -- =========================================================
-- -- Zealthy Onboarding — Database Init (Supabase/Postgres)
-- -- =========================================================
-- -- Safe to run in Supabase SQL Editor. Idempotent where possible.
-- -- This script:
-- --   1) Creates enums, tables, triggers
-- --   2) Seeds a default admin config so pages 2 & 3 aren't empty
-- --   3) Enables RLS with permissive policies for this take-home
-- --   4) Creates a convenient view for the /data page
-- -- =========================================================

-- -- Extensions ------------------------------------------------
-- create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- -- Types -----------------------------------------------------
-- do $$
-- begin
--   if not exists (select 1 from pg_type where typname = 'component_kind') then
--     create type component_kind as enum ('about_me', 'address', 'birthdate');
--   end if;
-- end$$;

-- -- Timestamp helper -----------------------------------------
-- create or replace function set_updated_at()
-- returns trigger language plpgsql as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end$$;

-- -- Tables ----------------------------------------------------

-- -- Page 1: user identity captured (email + password hash)
-- create table if not exists public.users (
--   id uuid primary key default gen_random_uuid(),
--   email text unique not null check (position('@' in email) > 1),
--   password_hash text not null,
--   created_at timestamptz not null default now()
-- );

-- -- Draft/progress & collected fields (steps 2 & 3)
-- create table if not exists public.onboarding_drafts (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null references public.users(id) on delete cascade,
--   step int not null default 2 check (step in (2,3)),  -- "next step" to show user
--   -- Components' data
--   about_me text,
--   birthdate date,
--   street text,
--   city text,
--   state text,
--   zip text,
--   updated_at timestamptz not null default now()
-- );

-- -- Trigger to bump updated_at on write
-- drop trigger if exists trg_onboarding_drafts_updated_at on public.onboarding_drafts;
-- create trigger trg_onboarding_drafts_updated_at
-- before update on public.onboarding_drafts
-- for each row execute function set_updated_at();

-- -- Admin config: which components go on page 2 and page 3
-- create table if not exists public.onboarding_config (
--   id int primary key default 1,
--   page2_components component_kind[] not null default array['birthdate']::component_kind[],
--   page3_components component_kind[] not null default array['address']::component_kind[],
--   updated_at timestamptz not null default now(),
--   -- Guard rails: each page must have at least one component
--   constraint page2_nonempty check (array_length(page2_components, 1) >= 1),
--   constraint page3_nonempty check (array_length(page3_components, 1) >= 1)
-- );

-- drop trigger if exists trg_onboarding_config_updated_at on public.onboarding_config;
-- create trigger trg_onboarding_config_updated_at
-- before update on public.onboarding_config
-- for each row execute function set_updated_at();

-- -- Seed default admin config (keeps pages 2 & 3 non-empty on first run)
-- insert into public.onboarding_config (id, page2_components, page3_components)
-- values (1, array['birthdate']::component_kind[], array['address']::component_kind[])
-- on conflict (id) do nothing;

-- -- View for /data page (read-only convenience)
-- create or replace view public.user_data as
-- select
--   u.email,
--   d.about_me,
--   d.birthdate,
--   nullif(trim(
--     concat_ws(', ',
--       nullif(d.street, ''),
--       nullif(d.city, ''),
--       nullif(d.state, ''),
--       nullif(d.zip, '')
--     )
--   ), '') as address,
--   d.step,
--   u.created_at
-- from public.users u
-- left join public.onboarding_drafts d on d.user_id = u.id
-- order by u.created_at desc;

-- -- Row Level Security ---------------------------------------
-- alter table public.users               enable row level security;
-- alter table public.onboarding_drafts   enable row level security;
-- alter table public.onboarding_config   enable row level security;

-- -- NOTE: For this exercise, the Admin and Data pages are intentionally public.
-- -- We therefore permit the "anon" role to do what's needed.
-- -- In a real app, you'd *tighten* these policies and require auth.

-- -- Users: allow inserts (for page 1 create) and selects (so /data can read the view)
-- drop policy if exists anon_insert_users on public.users;
-- create policy anon_insert_users on public.users
--   for insert to anon
--   with check (true);

-- drop policy if exists anon_select_users on public.users;
-- create policy anon_select_users on public.users
--   for select to anon
--   using (true);

-- -- Drafts: allow upsert/select to save progress and show in /data
-- drop policy if exists anon_all_drafts on public.onboarding_drafts;
-- create policy anon_all_drafts on public.onboarding_drafts
--   for all to anon
--   using (true)
--   with check (true);

-- -- Config: allow select & update without auth (per prompt)
-- drop policy if exists anon_read_config on public.onboarding_config;
-- create policy anon_read_config on public.onboarding_config
--   for select to anon
--   using (true);

-- drop policy if exists anon_update_config on public.onboarding_config;
-- create policy anon_update_config on public.onboarding_config
--   for update to anon
--   using (true)
--   with check (true);

-- -- Optional Indexes -----------------------------------------
-- create index if not exists idx_users_email on public.users (email);
-- create index if not exists idx_drafts_user_id on public.onboarding_drafts (user_id);

-- -- Grants (Supabase usually manages these, but harmless here)
-- grant select, insert, update, delete on all tables in schema public to anon, authenticated;
-- grant select on all views in schema public to anon, authenticated;

-- -- =========================================================
-- -- Done
-- -- =========================================================
