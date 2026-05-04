# NexaMarket — Backend Documentation

> The frontend in this repo runs against mock data. This document specifies
> the **production backend** that should sit behind it: smart contracts on
> Injective, Firebase as the off-chain index, IPFS as the file layer, and
> Cloud Functions for glue. Read alongside [`FRONTEND.md`](./FRONTEND.md).

---

## 1. Architecture overview

```
                     ┌──────────────────────────────────────┐
                     │  Next.js Frontend (this repo)        │
                     │   • Wallet connect (Keplr/Leap/MM)   │
                     │   • Upload UI · Marketplace · Detail │
                     │   • Dashboard                        │
                     └─────────┬───────────────┬────────────┘
                               │               │
                  signed tx /  │               │  HTTPS (REST/Firestore SDK)
                  contract msg │               │
                               ▼               ▼
        ┌──────────────────────┐    ┌─────────────────────────────┐
        │ Injective Blockchain │    │ Firebase                    │
        │ ── CosmWasm contract │    │ ── Firestore (metadata)     │
        │    NexaMarketplace   │    │ ── Storage (file mirror)    │
        │ ── INJ payments      │    │ ── Cloud Functions (sync)   │
        │ ── Ownership ledger  │    │ ── Authentication (optional)│
        └──────────┬───────────┘    └──────────┬──────────────────┘
                   │                           │
                   │ event indexer             │ pinning callback
                   ▼                           ▼
                 ┌────────────────────────────────────────┐
                 │   IPFS pinning service (Pinata /       │
                 │   web3.storage) — accessed via         │
                 │   Cloud Functions                      │
                 └────────────────────────────────────────┘
```

Three responsibilities, three sources of truth:

| Layer | Owns | Source of truth for |
| --- | --- | --- |
| **Injective** | Ownership + payments | "Who owns project X?" |
| **Firestore** | Searchable metadata | "What projects exist? Who's listing what?" |
| **IPFS / Storage** | The actual file bytes | "Where do I download the asset?" |

Firestore is **a read-replica** of onchain ownership — it must never be
trusted unilaterally for ownership claims. The frontend always re-checks the
chain before granting a download.

## 2. Smart contract — `nexa-marketplace`

Written in **CosmWasm** (Rust), deployed to Injective. The PID's "Core Smart
Contract Functions" map directly to these messages.

### 2.1 Contract state

```rust
pub struct Project {
    pub project_id: String,         // mirrors Firestore doc id
    pub creator: Addr,              // immutable
    pub owner: Addr,                // changes on purchase / transfer
    pub cid: String,                // IPFS CID
    pub price: Uint128,             // base units (1 INJ = 1e18)
    pub royalty_bps: u16,           // 0–1000 → 0–10%
    pub created_at: u64,
    pub updated_at: u64,
}

PROJECTS:    Map<String, Project>           // project_id → Project
OWNERSHIP:   Map<(Addr, String), bool>      // (owner, project_id) → true
HISTORY:     Map<(String, u64), TransferEvent>  // append-only ledger
CONFIG:      Item<Config>                   // admin, fee_bps, fee_collector
```

### 2.2 Execute messages

```jsonc
// Register a new listing.
{ "register_project": { "project_id": "proj_0001",
                        "cid": "bafy…",
                        "price": "1000000000000000000",   // 1 INJ
                        "royalty_bps": 500 } }            // 5% to creator

// Buy. `funds` must equal `price`.
{ "buy_project":      { "project_id": "proj_0001" } }

// Transfer (owner → owner, e.g. gift). Auth: caller must be current owner.
{ "transfer_ownership": { "project_id": "proj_0001",
                          "new_owner":  "inj1…" } }

// Relist after a buy. Caller must be current owner.
{ "relist": { "project_id": "proj_0001",
              "price":      "1500000000000000000" } }

// Admin only.
{ "update_config":     { "fee_bps": 250, "fee_collector": "inj1…" } }
```

### 2.3 Query messages

```jsonc
{ "get_project":  { "project_id": "proj_0001" } }
{ "list_by_owner":{ "owner": "inj1…", "start_after": null, "limit": 30 } }
{ "list_recent":  { "start_after": null, "limit": 30 } }
{ "history":      { "project_id": "proj_0001" } }
{ "config":       {} }
```

### 2.4 Events emitted

Every state change emits CosmWasm events that the indexer picks up:

| Action | Event type | Attributes |
| --- | --- | --- |
| `register_project` | `wasm-project_registered` | `project_id`, `creator`, `price`, `cid` |
| `buy_project` | `wasm-project_sold` | `project_id`, `seller`, `buyer`, `price`, `royalty`, `fee` |
| `transfer_ownership` | `wasm-project_transferred` | `project_id`, `from`, `to` |
| `relist` | `wasm-project_relisted` | `project_id`, `price` |

### 2.5 Settlement math

On `buy_project`, the contract:

1. Asserts `funds[0].amount == project.price`.
2. `fee = price * config.fee_bps / 10_000` → sent to `fee_collector`.
3. `royalty = price * project.royalty_bps / 10_000` → sent to `creator` (only
   on resales: skipped if `seller == creator`).
4. `seller_proceeds = price - fee - royalty` → sent to current owner.
5. `OWNERSHIP[(old_owner, id)]` removed; `OWNERSHIP[(new_owner, id)] = true`.
6. `project.owner = new_owner`, `project.updated_at = block_time`.
7. Emit `wasm-project_sold`.

### 2.6 Security checklist

- ✅ Reentrancy: CosmWasm is single-execution per call; we still set state
  before bank sends.
- ✅ Integer overflow: `Uint128` checked-math everywhere.
- ✅ Authorization: `transfer_ownership` / `relist` check `info.sender ==
  project.owner`.
- ✅ Replay: nonce comes from the underlying tx; no extra nonce needed.
- ✅ Audit: contract should be audited before mainnet (Halborn / Oak / etc.).

## 3. IPFS pinning

We **never** ship the Pinata JWT to the browser. Uploads go through a
serverless route.

### 3.1 Endpoint: `POST /api/ipfs`

Implemented either as a Next.js Route Handler (`src/app/api/ipfs/route.ts`)
running in a Node runtime, or as a standalone Cloud Function. Either works
because the contract is the same: receive `multipart/form-data`, pin, return
JSON.

| Field | Value |
| --- | --- |
| Method | `POST` |
| Body | `multipart/form-data` with one `file` field |
| Auth | Wallet-signature header (see §6) |
| Response | `{ "cid": "bafy…", "url": "https://gateway.pinata.cloud/ipfs/bafy…", "size": 12345 }` |

### 3.2 Pinata implementation sketch

```ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";   // Pinata SDK needs Node, not Edge

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const upstream = new FormData();
  upstream.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PINATA_JWT!}` },
    body: upstream,
  });
  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }
  const { IpfsHash, PinSize } = await res.json();
  return NextResponse.json({
    cid: IpfsHash,
    url: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${IpfsHash}`,
    size: PinSize,
  });
}
```

### 3.3 Mirror to Firebase Storage (optional but recommended)

For high availability, also upload the file to a private Firebase Storage
bucket. The frontend tries IPFS first; if the gateway 504s, it falls back to
a signed URL on Storage.

## 4. Firestore schema

Collections under the project's Firebase project:

### 4.1 `projects/{projectId}`

```ts
interface ProjectDoc {
  projectId: string;            // same as document id
  title: string;
  description: string;
  category: Category;
  price: string;                // decimal string in INJ
  cid: string;
  previewUrl: string;
  fileBackupUrl?: string;       // Firebase Storage signed download URL
  owner: string;                // bech32 inj1…
  creator: string;
  royaltyBps: number;
  rating: number;
  salesCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Server-generated for full-text search:
  searchTokens: string[];
}
```

Indexes:
- `category ASC, createdAt DESC`
- `owner ASC, updatedAt DESC`
- `creator ASC, createdAt DESC`
- Array-contains on `searchTokens` for prefix search.

### 4.2 `users/{walletAddress}`

```ts
interface UserDoc {
  address: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Timestamp;
}
```

### 4.3 `purchases/{txHash}`

Append-only ledger mirrored from chain events.

```ts
interface PurchaseDoc {
  txHash: string;
  projectId: string;
  buyer: string;
  seller: string;
  price: string;
  fee: string;
  royalty: string;
  blockHeight: number;
  timestamp: Timestamp;
}
```

### 4.4 Security rules (sketch)

```
match /projects/{id} {
  allow read: if true;
  // Writes are server-only (Cloud Function with admin SDK).
  allow write: if false;
}
match /users/{address} {
  allow read: if true;
  allow write: if request.auth.uid == address;   // Firebase custom token
}
match /purchases/{txHash} { allow read: if true; allow write: if false; }
```

## 5. Cloud Functions

### 5.1 `injectiveIndexer`  *(scheduled, every 30s)*

Polls the latest blocks for `nexa-marketplace` events and writes the deltas
into Firestore:

- `wasm-project_registered` → upsert `projects/{id}`.
- `wasm-project_sold` → update `projects/{id}.owner + salesCount + updatedAt`,
  insert `purchases/{txHash}`, send notifications.
- `wasm-project_transferred` / `wasm-project_relisted` → update
  `projects/{id}` accordingly.

A single `state/lastBlock` doc tracks the cursor so restarts are idempotent.

### 5.2 `onPurchaseNotify` *(triggered by `purchases/{txHash}` create)*

Sends emails or web push to seller + buyer if they've opted in.

### 5.3 `signedDownload`  *(HTTPS callable)*

Used for the mirror path. Body: `{ projectId, signature }`. The function:

1. Verifies the signature against the wallet address.
2. Calls the contract's `get_project` query and confirms the signer is
   `project.owner`.
3. Returns a short-lived signed URL for the Storage object.

This is the only path that exposes the backup file; IPFS is public by
design.

## 6. Authentication

### 6.1 Sign-in-with-wallet (SIWE-style)

```
Client → GET  /api/auth/nonce               → { nonce }
Client →      sign message via Keplr/Leap   → signature
Client → POST /api/auth/verify { sig, addr } → { firebaseToken }
Client →      signInWithCustomToken(token)
```

The challenge string:

```
Sign in to NexaMarket
Nonce: 4f7c...
Address: inj1...
```

The verify endpoint validates the signature, mints a Firebase **custom
token** with `uid = addr`, and the SDK uses it for Firestore rules.

### 6.2 Why custom tokens

Firebase Auth doesn't natively understand wallet signatures, but custom
tokens let us reuse all the existing security-rule machinery while keeping
wallet-as-identity intact.

## 7. Environment variables

| Var | Where used | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Frontend | Firebase client SDK config |
| `NEXT_PUBLIC_INJECTIVE_NETWORK` | Frontend + functions | `mainnet` / `testnet` |
| `NEXT_PUBLIC_MARKETPLACE_CONTRACT` | Frontend + functions | `inj1…` contract address |
| `NEXT_PUBLIC_PINATA_GATEWAY` | Frontend | Public gateway domain |
| `PINATA_JWT` | Server-only | Pinata API auth (never exposed to browser) |
| `WEB3_STORAGE_TOKEN` | Server-only | Alternate IPFS provider |
| `FIREBASE_SERVICE_ACCOUNT` | Cloud Functions | Admin SDK creds |

## 8. Data flow walkthroughs

These mirror §1–7 of the Project Workflow PID.

### 8.1 Upload flow

```
User  → /upload UI
         ├─ POST /api/ipfs (file)        → returns CID
         ├─ Wallet signs ExecuteMsg      → broadcast register_project
         └─ Optimistic Firestore insert  (cleaned up by indexer)
Indexer → reads wasm-project_registered  → final upsert into projects/{id}
```

### 8.2 Purchase flow

```
Buyer → Project detail UI
         ├─ Wallet signs ExecuteMsg buy_project + funds
         └─ Tx confirmed
Chain → emits wasm-project_sold
Indexer → updates projects/{id}.owner, inserts purchases/{txHash}
onPurchaseNotify → notifies buyer + seller
```

### 8.3 Download flow

```
Owner → Project detail UI clicks Download
         ├─ Frontend queries chain: get_project.owner == wallet?  ✅
         ├─ If CID present → fetch from IPFS gateway
         └─ Else → callable signedDownload({ projectId, signature })
                  → returns short-lived Storage URL
```

## 9. Testing strategy

| Layer | Tooling |
| --- | --- |
| Smart contract | `cw-multi-test` + `cargo test`; integration via `injectived` localnet |
| Cloud Functions | `firebase-functions-test` + `firebase emulators` |
| Indexer | Replay fixture blocks against an in-memory Firestore mock |
| End-to-end | Playwright against `next dev` + Firebase emulator + mock-chain |

## 10. Deployment

| Component | Target |
| --- | --- |
| Frontend | Vercel or Firebase Hosting |
| Cloud Functions | Firebase (us-central1 by default) |
| Smart contract | `injectived tx wasm store` → `instantiate` → record address into env |
| IPFS | Pinata (paid) or web3.storage (free tier) |
| DNS | Cloudflare → Vercel/Firebase |

## 11. What this repo *doesn't* include

The current repository is **frontend-only** by request. To stand up the
backend, create a sibling project containing:

```
nexamarket-backend/
├── contracts/nexa-marketplace/    ← Rust CosmWasm
├── functions/                     ← Cloud Functions (TS)
│   ├── indexer.ts
│   ├── pinning.ts
│   ├── auth.ts
│   └── notify.ts
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
└── README.md
```

…and follow the message schema in §2 and the Cloud Functions outlined in §5.
