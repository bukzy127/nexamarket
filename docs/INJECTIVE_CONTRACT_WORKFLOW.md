# Injective EVM Contract Workflow

NexaMarket uses MetaMask with Injective EVM Testnet.

## Contract

`contracts/NexaMarketAccess.sol`

Functions:

- `registerProject(projectId, price, metadataRef)` registers the uploader as
  owner and grants uploader access.
- `purchase(projectId)` requires exact INJ payment and transfers all funds
  directly to the owner.
- `hasAccess(projectId, wallet)` is the read-only access check used by the
  backend before returning Supabase download URLs.

No platform fee is taken.

## Runtime Flow

1. User connects MetaMask.
2. App switches MetaMask to Injective EVM Testnet.
3. User uploads a file to Supabase Storage.
4. Backend saves project metadata to the Supabase `projects` table.
5. Frontend calls `registerProject(projectId, price, metadataRef)` on Injective
   EVM, using the Supabase file URL as `metadataRef`.
6. Buyer clicks `Download / Purchase`.
7. Frontend calls `purchase(projectId)` with exact INJ value.
8. Backend confirms `hasAccess(projectId, buyer)`.
9. Download route returns the Supabase file URL only after contract access is
   true.

## Injective EVM Testnet

- Chain ID: `1439`
- Hex chain ID: `0x59f`
- RPC: `https://k8s.testnet.json-rpc.injective.network/`
- Explorer: `https://testnet.blockscout.injective.network/`
- Faucet: `https://testnet.faucet.injective.network/`
