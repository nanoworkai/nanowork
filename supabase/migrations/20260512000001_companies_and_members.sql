-- Create companies table
create table if not exists companies (
  id         uuid primary key default gen_random_uuid(),
  user_id   uuid references auth.users(id) on delete cascade,
  name       text not null,
  slug       text unique,
  plan       text default 'free',
  status     text default 'active',
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create company_members table
create table if not exists company_members (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid references companies(id) on delete cascade,
  user_id            uuid references auth.users(id) on delete cascade,
  role               text default 'member',
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  unique (company_id, user_id)
);

-- Enable row level security
alter table companies       enable row level security;
alter table company_members enable row level security;

-- Policies for companies
create policy "users manage own companies"
  on companies for all using (user_id = auth.uid());

-- Policies for company_members
create policy "members read own memberships"
  on company_members for select using (user_id = auth.uid());

create policy "owners manage company members"
  on company_members for all using (
    exists (
      select 1 from companies
      where companies.id = company_members.company_id
      and companies.user_id = auth.uid()
    )
  );

-- Create indexes
create index if not exists companies_user_id_idx on companies(user_id);
create index if not exists companies_slug_idx on companies(slug);
create index if not exists company_members_company_id_idx on company_members(company_id);
create index if not exists company_members_user_id_idx on company_members(user_id);

-- Updated at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_companies_updated_at before update on companies
  for each row execute function update_updated_at_column();

create trigger update_company_members_updated_at before update on company_members
  for each row execute function update_updated_at_column();
