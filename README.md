# NexaMarket

A decentralized project marketplace built on **Injective**, with **Firebase
Storage** for the current file layer and Firebase-ready metadata flows. This
repository contains the **Next.js frontend** for the project.

> IPFS is intentionally paused for now. The active upload/access workflow is
> documented in [`docs/FIREBASE_STORAGE_WORKFLOW.md`](./docs/FIREBASE_STORAGE_WORKFLOW.md).
> Injective access and purchase flow is documented in
> [`docs/INJECTIVE_CONTRACT_WORKFLOW.md`](./docs/INJECTIVE_CONTRACT_WORKFLOW.md).

> Backend (smart contracts, Firebase Storage rules, Firestore wiring, Cloud
> Functions) is documented in [`docs/BACKEND.md`](./docs/BACKEND.md) and
> intentionally **not** included in this repo.

## Quick start

```bash
npm install
npm run dev
```

App boots at <http://localhost:3000>.

## What's in here

| Path | What it is |
| --- | --- |
| `src/app/` | Next.js App Router pages — landing, marketplace, upload, dashboard, project detail |
| `src/app/api/projects/` | Backend routes for metadata save, purchase mirror, and access-gated downloads |
| `src/components/` | All UI building blocks — premium motion + reveal-on-scroll baked in |
| `src/lib/` | Frontend-only helpers: wallet detection, Firebase upload adapter, mock data |
| `src/hooks/useProjectCatalog.ts` | Local listing + purchase catalog used to gate Firebase file links |
| `contracts/nexa-marketplace/` | CosmWasm smart contract for Injective access control and direct owner payments |
| `src/hooks/useWallet.ts` | Zustand store for wallet state — persisted to `localStorage` |
| `src/types/` | Shared TypeScript types |
| `docs/FRONTEND.md` | Full frontend architecture & component reference |
| `docs/BACKEND.md` | Backend architecture, contract schema, API contract |

## Tech

- Next.js 14 (App Router) · TypeScript · React 18
- Tailwind CSS (custom dark palette)
- Framer Motion + IntersectionObserver for scroll/transition effects
- Zustand for wallet state
- Lucide icons + react-hot-toast

See [`docs/FRONTEND.md`](./docs/FRONTEND.md) for the full breakdown.
