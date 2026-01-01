# Base Social Trade – AI Agent Instructions

**Project Overview:** A Next.js dApp for swapping tokens on Base, with Farcaster integration for social sharing and XP rewards.

## Architecture

### Core Pages
- **`/`** (Home) – Displays Base chain block number via Viem public client to verify connectivity
- **`/swap`** – Full token swap interface with wallet connection, slippage control, quote preview, and execution

### Key Components
- **`WalletConnect`** – OnchainKit's ConnectWallet button + Wagmi hooks for address/connection state
- **`ShareTrade`** – Shares trade on Farcaster via Warpcast compose URL; triggers XP endpoint
- **`XPBadge`** – Displays user's cumulative XP earned from sharing trades

### Web3 Stack
- **Wagmi** – React hooks for wallet interaction (`useAccount`, `useWalletClient`)
- **Viem** – Low-level Ethereum utilities (public client, contract writing, BigInt)
- **OnchainKit** – Coinbase wallet components and utilities
- **Providers** (`app/providers.tsx`) – Root wrapper with WagmiProvider, QueryClientProvider, OnchainKitProvider

### Swap Flow
1. User enters ETH amount → "Preview Swap" fetches quote from `getQuote()`
2. Quote displays output amount, fee (0.3%), price impact (0.4%) + slippage slider (0.1%–5%)
3. "Swap Now" calls `buildSwapParams()` → constructs Uniswap V3 exact input params
4. `walletClient.writeContract()` sends tx to Uniswap router (0x2626...) with WETH→USDC
5. On success, "Share Trade + Earn XP" button available → opens Farcaster + calls POST `/api/xp` (+50 XP)

## File Structure

```
lib/
  ├─ base.ts          # Viem publicClient for Base chain
  ├─ swap.ts          # buildSwapParams(), getQuote(), SWAP_ROUTER, swapAbi
  └─ farcaster.ts     # shareToFarcaster(text, embedUrl) → Warpcast URL

components/
  ├─ WalletConnect.tsx # useAccount + ConnectWallet button
  ├─ ShareTrade.tsx    # Share button + XP POST
  ├─ XPBadge.tsx       # Displays current XP from GET /api/xp
  └─ ... (others)

app/
  ├─ page.tsx          # Home with publicClient.getBlockNumber()
  ├─ layout.tsx        # Root layout wrapping Providers
  ├─ providers.tsx     # WagmiProvider, OnchainKit, React Query setup
  ├─ swap/
  │  └─ page.tsx       # Swap page with full flow
  └─ api/
     ├─ og/trade/      # (Placeholder for OG image generation)
     └─ xp/            # POST/GET in-memory XP tracking
```

## Key Constants
- **SWAP_ROUTER:** `0x2626664c2603336E57B271c5C0b26F421741e481` (Uniswap V3 on Base)
- **WETH:** `0x4200000000000000000000000000000000000006` (tokenIn default)
- **USDC:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (tokenOut example)
- **Fee tier:** 3000 (0.3%)

## Development

### Setup & Run
```bash
npm install
npm run dev  # http://localhost:3000
```

### Build
```bash
npm run build
```

### Key Libraries
- `viem` – Chain interactions, contract writing, public client
- `wagmi@2` – React hooks for Web3 (useAccount, useWalletClient)
- `@coinbase/onchainkit` – OnchainKit wallet UI
- `@tanstack/react-query` – Data fetching (integrated via Providers)
- `@uniswap/v3-periphery` – Uniswap V3 router (for future expansion)

### TypeScript Target
- **tsconfig.json** target: **ES2020** (required for BigInt literals like `0n`)

## Patterns

### Swap Execution
```tsx
const params = buildSwapParams({ tokenOut, user: address, amount, slippage })
await walletClient.writeContract({
  address: SWAP_ROUTER,
  abi: swapAbi,
  functionName: 'exactInputSingle',
  args: [params],
  account: address,
  value: params.amountIn
})
```

### Error Handling
- Catch Viem errors → `e?.shortMessage` for user-friendly messages
- Use `setPending(true/false)` to disable buttons during tx confirmation

### State Management
- Swap page uses local React state (amount, quote, loading, pending, slippage, error)
- XP displayed via client-side fetch on component mount

## Immediate Next Steps for AI Agents

1. **Implement OG image generation** – `app/api/og/trade/route.ts` (currently JSON placeholder)
2. **Database persistence** – Replace in-memory XP with persistent storage (Supabase, Firebase, etc.)
3. **Quote integration** – Replace mock `getQuote()` with real pricing oracle (e.g., 1inch, 0x API)
4. **Transaction monitoring** – Add toast notifications or modal for pending/success/error states
5. **Token list** – Allow user to select any ERC-20 on Base instead of hard-coded USDC

## Deploy
- Vercel (recommended for Next.js): `npm run build` produces `.next/` production bundle
- Environment variables: Add `.env.local` for RPC endpoints if needed (currently using public endpoints)
