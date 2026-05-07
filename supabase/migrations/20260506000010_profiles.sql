-- profiles table: one row per Supabase auth user
create table if not exists profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  phone               text,
  email               text,
  name                text,
  business_name       text,
  business_prompt     text,
  plan                text not null default 'free'
                        check (plan in ('free','starter','growth','scale')),
  custom_domain       text,
  subdomain           text unique,
  stripe_customer_id  text unique,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- index for Stripe customer lookups
create index on profiles (stripe_customer_id) where stripe_customer_id is not null;

-- RLS: users can only see/edit their own profile
alter table profiles enable row level security;

create policy "profiles: read own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: insert own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on profiles for update
  using (auth.uid() = id);

create policy "profiles: delete own"
  on profiles for delete
  using (auth.uid() = id);
