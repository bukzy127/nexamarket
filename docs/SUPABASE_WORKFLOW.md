# Supabase Workflow

Supabase stores both project files and project metadata.

## Flow

1. User connects MetaMask on Injective EVM Testnet.
2. User uploads a project file.
3. `POST /api/storage/upload` uploads the file to the Supabase Storage bucket
   configured by `NEXT_PUBLIC_SUPABASE_BUCKET`.
4. The upload route returns the public Supabase file URL.
5. `POST /api/projects` saves project metadata to the Supabase `projects`
   table, including the file URL, owner wallet, price, and timestamps.
6. The frontend calls `registerProject(projectId, price, metadataRef)` on the
   Injective EVM contract. `metadataRef` is the Supabase file URL.
7. Public project listing responses remove `fileUrl` and `storagePath`.
8. `POST /api/projects/:id/download` checks on-chain access before returning
   the Supabase file URL.

Download access is decided by `NexaMarketAccess.hasAccess(projectId, wallet)`,
not by metadata alone.

## Supabase Setup

Create a public Storage bucket named `project-files`.

Create the metadata table:

```sql
create table if not exists public.projects (
  id bigint primary key,
  title text not null,
  description text not null,
  category text not null,
  price numeric not null,
  owner text not null,
  creator text,
  rating numeric default 0,
  reviews integer default 0,
  tags jsonb default '[]'::jsonb,
  preview text not null,
  featured boolean default false,
  sales integer default 0,
  file_url text,
  file_name text,
  file_size bigint,
  storage_provider text default 'supabase',
  storage_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

For development with the publishable key, enable row-level security and allow
public reads/writes for this project table and bucket:

```sql
alter table public.projects enable row level security;

grant usage on schema public to anon;
grant select, insert, update on table public.projects to anon;

create policy "Allow public project reads"
on public.projects
for select
to anon
using (true);

create policy "Allow public project inserts"
on public.projects
for insert
to anon
with check (true);

create policy "Allow public project updates"
on public.projects
for update
to anon
using (true)
with check (true);

create policy "Allow public uploads to project-files"
on storage.objects
for insert
to anon
with check (bucket_id = 'project-files');

create policy "Allow public reads from project-files"
on storage.objects
for select
to anon
using (bucket_id = 'project-files');
```

These policies are intentionally simple for testnet/student development. Before
production, restrict writes with proper authentication and validation.
