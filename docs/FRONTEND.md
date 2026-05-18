# NexaMarket Frontend

The frontend is wired for real services only:

- MetaMask wallet connection on Injective EVM Testnet.
- Supabase upload through backend API routes.
- Supabase-backed marketplace listings.
- Injective EVM smart contract calls for project registration and purchases.
- Download links returned only by the backend after wallet signature and
  on-chain access verification.

## Main Files

| Path | Purpose |
| --- | --- |
| `src/lib/wallet.ts` | MetaMask connection, Injective EVM network switch, balance reads, message signing |
| `src/lib/injectiveContract.ts` | Ethers contract calls for `registerProject` and `purchase` |
| `src/hooks/useProjectCatalog.ts` | Reads public listings from `/api/projects` |
| `src/app/upload/page.tsx` | Uploads file, saves metadata, registers project on-chain |
| `src/app/project/[id]/page.tsx` | Purchases and requests verified download URLs |
| `contracts/NexaMarketAccess.sol` | Solidity contract for Injective EVM |

There is no mock wallet, mock balance, mock project catalog, or mock blockchain
access fallback.
