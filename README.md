# NexaMarket

A decentralized project marketplace built with **Next.js**, **Supabase**,
**MetaMask**, and **Injective EVM Testnet**.

> Supabase upload/access workflow is documented in
> [`docs/SUPABASE_WORKFLOW.md`](./docs/SUPABASE_WORKFLOW.md).
> Injective access and purchase flow is documented in
> [`docs/INJECTIVE_CONTRACT_WORKFLOW.md`](./docs/INJECTIVE_CONTRACT_WORKFLOW.md).

## Quick start

```bash
npm install
npm run dev
```

App boots at <http://localhost:3000>.

## What's in here

| Path | What it is |
| --- | --- |
| `src/app/` | Next.js App Router pages: landing, marketplace, upload, dashboard, project detail |
| `src/app/api/` | Backend routes for Supabase upload, metadata save, purchase confirmation, and access-gated downloads |
| `src/components/` | UI building blocks |
| `src/lib/` | Wallet, Supabase, Injective EVM, and server helpers |
| `src/hooks/useProjectCatalog.ts` | Supabase-backed public listing catalog |
| `contracts/NexaMarketAccess.sol` | Solidity smart contract for Injective EVM access control and direct owner payments |
| `src/hooks/useWallet.ts` | MetaMask wallet state and real INJ balance |
| `src/types/` | Shared TypeScript types |
| `docs/FRONTEND.md` | Frontend architecture reference |
| `docs/BACKEND.md` | Backend architecture and API contract |

## Tech

- Next.js 14 (App Router) · TypeScript · React 18
- Supabase Storage and Supabase database
- MetaMask on Injective EVM Testnet
- Ethers.js contract calls
- Zustand for wallet state
- Lucide icons + react-hot-toast

See [`docs/FRONTEND.md`](./docs/FRONTEND.md) for the full breakdown.
