# NexaMarket

A decentralized project marketplace built on **Injective**, with **IPFS** for
file storage and **Firebase** for fast metadata queries. This repository
contains the **Next.js frontend** for the project.

> Backend (smart contracts, IPFS pinning service, Firestore wiring, Cloud
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
| `src/components/` | All UI building blocks — premium motion + reveal-on-scroll baked in |
| `src/lib/` | Frontend-only helpers: wallet detection, IPFS URL builder, mock data |
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
