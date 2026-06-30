# Supabase Metadata Workflow

Supabase stores metadata and application data only. Project packages and preview
images are stored on IPFS through Pinata.

## Runtime flow

1. The browser sends the selected project file and required preview images to
   `POST /api/storage/pin`.
2. The server pins each file directly to Pinata without exposing `PINATA_JWT`.
3. `POST /api/projects` saves the returned CIDs, gateway URLs, and project
   metadata in the `projects` table.
4. The frontend registers the project on Injective EVM using the project CID as
   the contract metadata reference.
5. Public project responses expose preview images but remove the project-file
   CID and gateway URL.
6. `POST /api/projects/:id/download` verifies `hasAccess(projectId, wallet)`
   before returning the project-file gateway URL.
7. Profiles, purchases, and wallet-relevant activities are stored in the
   `profiles`, `purchases`, and `activities` tables.

Run [`supabase/feature_update.sql`](../supabase/feature_update.sql) in the
Supabase SQL editor before using usernames, dashboard history, or notifications.
