-- Block 1: tenant users (uses phone_number PK from public.users)
create table nano_tenant_users (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references nano_tenants(id) on delete cascade,
  user_phone  text references users(phone_number) on delete set null,
  email       text not null,
  role        text default 'member'
    check (role in ('owner','admin','member')),
  invited_at  timestamptz default now(),
  accepted_at timestamptz,
  created_at  timestamptz default now()
);

create index on nano_tenant_users (tenant_id);
