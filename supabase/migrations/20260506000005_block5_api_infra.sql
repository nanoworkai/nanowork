-- Block 5: API infrastructure (uses phone_number PK from public.users)
create table nano_api_keys (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references nano_tenants(id) on delete cascade,
  user_phone   text references users(phone_number) on delete cascade,
  name         text not null,
  key_hash     text unique not null,
  key_prefix   text not null,
  scopes       text[] default '{}',
  last_used_at timestamptz,
  expires_at   timestamptz,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

create table nano_api_requests (
  id          uuid primary key default gen_random_uuid(),
  api_key_id  uuid references nano_api_keys(id) on delete set null,
  tenant_id   uuid references nano_tenants(id) on delete set null,
  user_phone  text references users(phone_number) on delete set null,
  method      text,
  endpoint    text,
  status_code int,
  duration_ms int,
  ip_address  text,
  user_agent  text,
  error       text,
  created_at  timestamptz default now()
);

create table nano_webhooks (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references nano_tenants(id) on delete cascade,
  url           text not null,
  events        text[] not null,
  secret        text not null,
  is_active     boolean default true,
  last_fired_at timestamptz,
  created_at    timestamptz default now()
);

create index on nano_api_keys (key_hash);
create index on nano_api_keys (tenant_id);
create index on nano_api_requests (tenant_id, created_at desc);
create index on nano_api_requests (api_key_id);
create index on nano_webhooks (tenant_id);
