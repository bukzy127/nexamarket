# Injective Contract Workflow

This project now has a CosmWasm contract scaffold in
`contracts/nexa-marketplace`. The contract keeps the source of truth for access
rights. Firestore stores metadata and Firebase Storage stores the actual file.

## Contract Responsibilities

- `register_project`: called by the uploader after Firebase upload and metadata
  save. It stores `project_id`, owner wallet, price, timestamps, and grants the
  uploader access.
- `purchase`: called by a buyer with native INJ funds equal to the project
  price. The contract transfers the full amount directly to the project owner
  and grants buyer access.
- `has_access`: queried by the backend before returning a Firebase download
  URL.

No website fee is taken.

## App Flow

1. User connects Keplr or Leap.
2. User uploads through `/upload`.
3. File uploads to Firebase Storage.
4. Metadata is saved through `POST /api/projects`.
5. Frontend calls the contract registration adapter.
6. Buyer clicks `Download / Purchase`.
7. Frontend checks local wallet balance and calls the purchase adapter.
8. Backend records mock/dev purchase through `POST /api/projects/:id/purchase`
   or verifies on-chain access when a contract address is configured.
9. Download requests go through `POST /api/projects/:id/download`.
10. The download route queries Injective `has_access`; if valid, it returns the
    Firebase file URL.

## Environment

```bash
NEXT_PUBLIC_INJECTIVE_NETWORK=testnet
NEXT_PUBLIC_MARKETPLACE_CONTRACT=inj1...
MARKETPLACE_CONTRACT=inj1...
INJECTIVE_LCD_URL=https://testnet.sentry.lcd.injective.network
```

For local development, leaving `MARKETPLACE_CONTRACT` empty enables a mock
chain-access fallback. The route still uses the same access gate, so the UI flow
stays realistic.

## Production Note

The contract is ready as source, but transaction broadcasting still needs the
Injective/CosmJS signing client wired into `src/lib/injectiveContract.ts` after
the contract is compiled, deployed, and the address is available. Until then,
the frontend uses a mock adapter when no contract address is set.
