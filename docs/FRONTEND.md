# NexaMarket — Frontend Documentation

> A premium, motion-rich Next.js frontend for the **Decentralized Project
> Marketplace** described in the *Project Workflow* and *PID Crypto Space*
> documents. The frontend implements **all user-facing flows** end-to-end with
> mock data, wired against a thin client-side wallet/IPFS layer that swaps in
> the real backend without component changes.

---

## 1. Goals

The frontend has three explicit goals, in order:

1. **Ship every flow described in the PIDs** — wallet auth, upload, browse,
   buy, ownership-gated download, dashboard.
2. **Feel premium.** Smooth scroll, scroll-triggered reveals, parallax hero,
   page-transition fades, animated cards, and a glassmorphism palette.
3. **Stay backend-agnostic.** Wallet/IPFS calls are isolated behind small,
   single-purpose modules in `src/lib/` so dropping in real Injective + IPFS +
   Firebase is a one-file change per concern.

## 2. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 14 (App Router)** | RSC + nested layouts + built-in routing |
| Language | **TypeScript** | Stricter contracts at the wallet/contract boundary |
| Styling | **Tailwind CSS** | Design tokens live in `tailwind.config.ts` |
| Animation | **Framer Motion** + IntersectionObserver | Mix of declarative + lightweight CSS reveals |
| State | **Zustand** | Minimal store for wallet — persisted to `localStorage` |
| Icons | **lucide-react** | Crisp, consistent, tree-shakeable |
| Toasts | **react-hot-toast** | Glassy dark theme matches the app |
| Fonts | **Inter** + **Space Grotesk** | Body / display, loaded via `next/font` |

## 3. Project structure

```
nexamarket/
├── docs/
│   ├── FRONTEND.md         ← this file
│   └── BACKEND.md          ← backend integration spec
├── public/
├── src/
│   ├── app/                ← App Router pages
│   │   ├── layout.tsx      ← root shell, nav/footer, page transitions
│   │   ├── page.tsx        ← landing
│   │   ├── globals.css     ← tokens, scrollbar, reveal, aurora
│   │   ├── marketplace/page.tsx
│   │   ├── upload/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── project/[id]/page.tsx
│   │   └── not-found.tsx
│   ├── components/         ← All UI building blocks (see §6)
│   ├── hooks/
│   │   └── useWallet.ts    ← Zustand store
│   ├── lib/
│   │   ├── ipfs.ts         ← Gateway URL builder + mock upload
│   │   ├── wallet.ts       ← Keplr/Leap/MetaMask detection + connect
│   │   └── mock.ts         ← Seed projects for the demo
│   └── types/index.ts      ← Project, WalletState, Category, etc.
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## 4. Pages

| Route | File | What it does |
| --- | --- | --- |
| `/` | `app/page.tsx` | Hero, trust strip, feature grid, how-it-works, featured listings, CTA, FAQ |
| `/marketplace` | `app/marketplace/page.tsx` | Searchable, sortable, category-filtered listing grid |
| `/upload` | `app/upload/page.tsx` | Two-column form: dropzone + metadata + preview, with a guided 3-step "uploading → registering → done" state machine |
| `/dashboard` | `app/dashboard/page.tsx` | Wallet-gated overview: balance, owned, created, sales, revenue |
| `/project/[id]` | `app/project/[id]/page.tsx` | Detail page with onchain metadata, ownership-gated **Buy** vs **Download**, related grid |
| `/*` (404) | `app/not-found.tsx` | Branded fallback |

## 5. The "premium feel" — what's actually doing it

The user explicitly asked for **smooth scrolling and transition effects**.
Here's the full list of techniques in use:

### 5.1 Smooth scroll
- `html { scroll-behavior: smooth }` for in-page anchor jumps.
- `scroll-padding-top: 96px` so anchors clear the sticky navbar.

### 5.2 Page transitions
- `<PageTransition>` (`src/components/PageTransition.tsx`) wraps the App
  Router children in `AnimatePresence` keyed on `pathname`. Every route change
  fades + slides 14px → 0 in 450ms with an `easeOutExpo`-ish curve.

### 5.3 Scroll-triggered reveals
- `<Reveal>` (`src/components/Reveal.tsx`) uses **IntersectionObserver** to
  toggle an `is-visible` class. The visual transition lives in `globals.css`
  (`.reveal { opacity:0; transform: translateY(28px); }` →
  `.reveal.is-visible { opacity:1; transform:none; }`) so it's free at runtime.
- Card grids use Framer Motion's `whileInView` with stiffness curves for a
  staggered cascade.

### 5.4 Parallax hero
- `Hero.tsx` reads `useScroll({ target, offset })` and applies `useTransform`
  to drive `y`, `opacity`, and `scale` of the hero block. Result: the title
  drifts away as you scroll into the next section.

### 5.5 Scroll progress bar
- `<ScrollProgress>` is a 2px gradient bar fixed to the top, scaled-X via a
  spring-smoothed `scrollYProgress`. Renders once per page (added to landing,
  marketplace, upload, dashboard, project detail).

### 5.6 Aurora + grid backdrop
- `.aurora` paints two slowly-floating blurred gradient blobs.
- `.grid-bg` overlays a faint linear-grid pattern masked into a radial fade.
- Both are **GPU-friendly** (transform/filter only) and respect
  `prefers-reduced-motion`.

### 5.7 Hover micro-interactions
- Project cards: lift (`translateY -6`), image zoom, ring glow.
- Buttons: gradient shift + box-shadow lift.
- Wallet pulse dot: animated `bg-accent-500/70` ping for "live" state.

### 5.8 Reduced motion
- `@media (prefers-reduced-motion: reduce)` strips all marquee, aurora float,
  and reveal transitions. Users who opt out get a static, accessible site.

## 6. Component reference

| Component | Purpose |
| --- | --- |
| `Navbar` | Sticky, scroll-reactive (transparent → frosted) header. Tracks active route, collapses to hamburger on mobile, owns the wallet entry point. |
| `Footer` | Brand block + nav columns + social row. |
| `WalletButton` | Connect dropdown (Keplr / Leap / MetaMask) → connected pill (address pill, balance, copy, disconnect). |
| `Hero` | Parallax-scrolled title block with gradient shimmer headline + 3-stat strip. |
| `TrustStrip` | Marquee of partner names (Injective, IPFS, Pinata, Firebase, …). |
| `FeatureGrid` | 6-tile feature card grid with hover halos. |
| `HowItWorks` | 4-step flow with a scroll-driven progress line. |
| `FeaturedGrid` | First 6 listings → `<ProjectCard>` cascade. |
| `ProjectCard` | Image + category + rating + price + owner. Used on marketplace, dashboard, related-grid. |
| `CtaBanner` | Gradient call-to-action panel near the footer. |
| `Faq` | Accordion built with `AnimatePresence` height-collapse. |
| `Reveal` | Generic scroll-into-view wrapper. |
| `PageTransition` | Per-route fade. |
| `ScrollProgress` | Top-of-viewport progress bar. |

## 7. Design tokens

Defined in [`tailwind.config.ts`](../tailwind.config.ts):

```ts
colors: {
  ink:   { 950, 900, 800, 700, 600 },  // background scale
  brand: { 50…900 },                   // electric blue
  accent:{ 400, 500, 600 },            // mint/teal
}
fontFamily: { sans: Inter, display: Space Grotesk, mono: SF Mono }
shadow: { glow, ring }
keyframes: { fade-up, float, shimmer, pulse-ring }
```

Backgrounds: `bg-grid-fade`, `bg-noise`. Surface utility classes:
`.glass`, `.card`, `.btn-primary`, `.btn-ghost`, `.input`, `.chip`,
`.grad-text`, `.hr-fade` (defined in `globals.css`).

## 8. Wallet integration (frontend layer)

`src/lib/wallet.ts` exposes:

```ts
detectAvailable(): Promise<WalletType[]>
connect(type): Promise<{ address: string }>
shortAddress(addr): string
```

It tries the real injected provider (`window.keplr`, `window.leap`,
`window.ethereum`) and **falls back to a mock `inj1…` address** in dev so the
UI is fully usable without a wallet installed.

`useWallet` (Zustand) holds:

```ts
{ address, type, balance, connected,
  connect, disconnect, refreshBalance, short }
```

State is persisted to `localStorage` under `nexamarket:wallet`.

> **Where the real backend slots in:** swap `mockBalance()` for a call to
> Injective's bank module, and replace the mock fallback in `connect()` with a
> hard error. No component needs to change.

## 9. IPFS integration (frontend layer)

`src/lib/ipfs.ts`:

```ts
ipfsUrl(cid, path?): string
uploadToIpfs(file): Promise<{ cid, url, size }>
```

The mock `uploadToIpfs` returns a deterministic-looking CID after a short
delay. The real implementation should POST the file to a server route
(`/api/ipfs`) that talks to **Pinata** or **web3.storage** — see
[BACKEND.md §3](./BACKEND.md#3-ipfs-pinning).

## 10. Mock data

`src/lib/mock.ts` ships **12 seeded projects** spanning every category, with
real Unsplash preview images, plausible INJ prices, and synthetic owner
addresses. Plenty for screenshots, demos, and Vercel preview builds.

## 11. Type contracts

All in [`src/types/index.ts`](../src/types/index.ts):

```ts
type Category = "design" | "code" | "ai" | "audio" | "video"
              | "writing" | "research" | "other";

interface Project {
  id, title, description, category,
  price,                // decimal string in INJ
  cid, fileUrl, previewUrl,
  owner, creator,       // bech32 inj1… (or 0x…)
  createdAt, updatedAt, // ISO timestamps
  rating, salesCount,
}

interface WalletState { address, type, balance, connected }
type WalletType = "keplr" | "leap" | "metamask";
```

These mirror the metadata schema from the Project Workflow doc §2 Step 3.

## 12. Accessibility

- All interactive elements use real `<button>`/`<a>` tags with
  `aria-label`s where icon-only.
- Color contrast meets WCAG AA on the dark palette (white/0.55+ for body).
- `prefers-reduced-motion` disables marquee, aurora, reveal transitions.
- Focus rings inherit Tailwind's defaults; inputs have visible focus borders
  via `.input:focus`.

## 13. Performance notes

- Fonts are loaded with `next/font` (no FOUT/FOIT, subset to Latin).
- Images use `next/image` with explicit `sizes`.
- Reveals use IntersectionObserver — no scroll-listener loops.
- Parallax uses `useTransform` (transform-only, GPU-accelerated).
- Animation respects `prefers-reduced-motion`.

## 14. Scripts

```bash
npm run dev        # next dev
npm run build      # next build
npm start          # next start (after build)
npm run lint       # eslint via next lint
npm run typecheck  # tsc --noEmit
```

## 15. Connecting the real backend (one-page summary)

| Concern | File to edit | Replace |
| --- | --- | --- |
| Wallet signing | `src/lib/wallet.ts` | Drop the mock-address fallback; add `signLoginChallenge` against Keplr/Leap. |
| Balance | `src/hooks/useWallet.ts` → `refreshBalance()` | Call Injective `ChainGrpcBankApi.fetchBalance`. |
| IPFS upload | `src/lib/ipfs.ts` → `uploadToIpfs()` | POST to `/api/ipfs` (server route that pins via Pinata). |
| Listings query | `src/lib/mock.ts` callers (marketplace + dashboard + landing) | Replace `MOCK_PROJECTS` with a Firestore `getDocs(collection("projects"))`. |
| Buy / register / transfer | `upload/page.tsx`, `project/[id]/page.tsx` | Build a `MsgExecuteContractCompat` and broadcast via the connected wallet. |

The backend is the larger task — full schema, message routing, and
infrastructure are documented in [`BACKEND.md`](./BACKEND.md).
