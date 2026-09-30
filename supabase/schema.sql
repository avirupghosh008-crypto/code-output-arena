-- Output Arena schema for Supabase (PostgreSQL + Auth + Realtime)
-- Run in the SQL editor of your project.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 32),
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  weekly_xp integer not null default 0,
  weekly_correct integer not null default 0,
  weekly_answered integer not null default 0,
  weekly_time_ms bigint not null default 0,
  week_start date not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  track text not null,
  correct boolean not null,
  time_ms integer not null,
  xp integer not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.leaderboard enable row level security;
alter table public.attempts enable row level security;

create policy "profiles are readable" on public.profiles
  for select using (true);
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "leaderboard readable" on public.leaderboard
  for select using (true);
create policy "users upsert own leaderboard" on public.leaderboard
  for insert with check (auth.uid() = user_id);
create policy "users update own leaderboard" on public.leaderboard
  for update using (auth.uid() = user_id);

create policy "users read own attempts" on public.attempts
  for select using (auth.uid() = user_id);
create policy "users insert own attempts" on public.attempts
  for insert with check (auth.uid() = user_id);

alter publication supabase_realtime add table public.leaderboard;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
