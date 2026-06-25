# NexaMarket Backend

The Next.js API routes are the backend boundary. Pinata/IPFS stores project
files and previews, Supabase stores metadata/application data, and the
Injective EVM contract stores access rights.

## API Routes

| Route | Purpose |
| --- | --- |
| `POST /api/storage/pin` | Pins a project file or preview image directly to IPFS |
| `GET /api/projects` | Returns public project metadata from Supabase with private file fields removed |
| `POST /api/projects` | Stores project metadata in the Supabase `projects` table |
| `POST /api/projects/:id/purchase` | Confirms purchase access from Injective EVM |
| `POST /api/projects/:id/download` | Verifies wallet access on-chain, then returns the IPFS gateway URL |
| `GET/POST /api/users/:wallet` | Loads or creates a wallet-linked username |
| `GET /api/dashboard?wallet=...` | Returns purchases, sales, and activity |

Supabase metadata is never trusted for ownership. Download access depends on
`NexaMarketAccess.hasAccess(projectId, wallet)` on Injective EVM.

## Required Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oxjutwwwlfuppdkxihwm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GRnliuxnQ9QpsQapijNNPA_asLPLx6q
PINATA_JWT=your-server-side-pinata-jwt
PINATA_GATEWAY=gateway.pinata.cloud
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0xcE83e305B26DCD1Bea900e9A4b3D00EC88F417be
INJECTIVE_EVM_RPC_URL=https://k8s.testnet.json-rpc.injective.network/
```
