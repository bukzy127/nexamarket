# Firebase Storage Workflow

IPFS is paused for now. NexaMarket currently treats Firebase Storage as the file
layer for uploaded construction assets.

## Current Flow

1. A connected user opens `/upload`.
2. The user selects or drops a project file.
3. `uploadToFirebaseStorage()` uploads the file to Firebase Storage when
   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is configured.
4. If no bucket is configured, the helper returns a mock Firebase-style URL so
   the frontend flow can still be tested locally.
5. The listing metadata is saved through `POST /api/projects`.
6. The Firebase file URL is stored on the project as `fileUrl`.
7. The uploader is registered on the Injective access contract.
8. `/project/[id]` asks `POST /api/projects/:id/download` for the URL.
9. The download route verifies contract access before returning `fileUrl`.

## Files Added

- `src/lib/firebaseStorage.ts` uploads files to Firebase Storage or returns a
  local mock URL when Firebase is not configured.
- `src/hooks/useProjectCatalog.ts` stores uploaded listings, tracks purchases,
  and exposes ownership checks used by the marketplace, dashboard, and project
  detail page.
- `src/app/api/projects/*` saves metadata and gates Firebase download URLs.
- `contracts/nexa-marketplace` stores Injective ownership/access rights.

## Environment

Add this variable when connecting real Firebase Storage:

```bash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

The current direct upload path requires Firebase Storage rules that allow the
browser upload. For production, move upload authorization to Firebase Auth or a
server route before accepting real customer files.

## Access Rule In The UI

The file link is returned only when:

- the backend verifies `has_access` from the Injective contract, or
- local dev mode verifies the mock access mirror when no contract address is
  configured.

Firestore is metadata only. It must never be trusted by itself for access.
