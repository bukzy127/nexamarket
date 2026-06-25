-- NexaMarket feature update: IPFS metadata, usernames, purchases, activities.
-- Run this once in the Supabase SQL editor.

alter table public.projects
  add column if not exists owner_username text,
  add column if not exists preview_images jsonb not null default '[]'::jsonb,
  add column if not exists preview_cids jsonb not null default '[]'::jsonb,
  add column if not exists cid text,
  add column if not exists ipfs_url text;

create table if not exists public.profiles (
  wallet_address text primary key,
  username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  project_id bigint not null,
  buyer text not null,
  seller text not null,
  price numeric not null,
  tx_hash text not null unique,
  purchased_at timestamptz not null default now()
);

create index if not exists purchases_buyer_idx
  on public.purchases (buyer, purchased_at desc);
create index if not exists purchases_seller_idx
  on public.purchases (seller, purchased_at desc);
create index if not exists purchases_project_idx
  on public.purchases (project_id);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  type text not null check (type in ('upload', 'purchase', 'sale', 'download')),
  project_id bigint,
  project_title text,
  counterparty text,
  amount numeric,
  tx_hash text,
  created_at timestamptz not null default now(),
  unique (wallet, type, tx_hash)
);

create index if not exists activities_wallet_idx
  on public.activities (wallet, created_at desc);

alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.activities enable row level security;

grant select, insert, update on table public.profiles to anon;
grant select, insert on table public.purchases to anon;
grant select, insert on table public.activities to anon;

drop policy if exists "Allow profile reads" on public.profiles;
create policy "Allow profile reads"
on public.profiles for select to anon using (true);

drop policy if exists "Allow profile writes" on public.profiles;
create policy "Allow profile writes"
on public.profiles for insert to anon with check (true);

drop policy if exists "Allow profile updates" on public.profiles;
create policy "Allow profile updates"
on public.profiles for update to anon using (true) with check (true);

drop policy if exists "Allow purchase reads" on public.purchases;
create policy "Allow purchase reads"
on public.purchases for select to anon using (true);

drop policy if exists "Allow purchase inserts" on public.purchases;
create policy "Allow purchase inserts"
on public.purchases for insert to anon with check (true);

drop policy if exists "Allow activity reads" on public.activities;
create policy "Allow activity reads"
on public.activities for select to anon using (true);

drop policy if exists "Allow activity inserts" on public.activities;
create policy "Allow activity inserts"
on public.activities for insert to anon with check (true);

-- Ask Supabase's PostgREST API to immediately discover the new tables/columns.
notify pgrst, 'reload schema';
