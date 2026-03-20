![Sofia Banner](public/banniere%202.png)

# Sofia Explorer

Behavioral reputation dashboard for the [Sofia](https://0xsofia.com) browser extension — a Web3 protocol that tracks browsing intents, connects social platforms, and builds verifiable reputation profiles on-chain via the [Intuition](https://intuition.systems) protocol.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5.7 |
| Build | Vite 6.3 (SWC) |
| Styling | Tailwind CSS v4 (oklch) + shadcn/ui |
| Auth | Privy (wallet, Google OAuth) |
| Server State | React Query v5 |
| GraphQL | graphql-request 7.1 + graphql-codegen |
| On-chain | Viem v2 — Intuition Mainnet (chain 1155, TRUST token) |

## Getting Started

```bash
pnpm install
pnpm dev            # Dev server on http://localhost:5173 (auto-open)
pnpm build          # tsc -b && vite build → dist/
```

### Environment Variables

```env
VITE_PRIVY_APP_ID=        # Privy app ID for Web3 auth
VITE_PRIVY_CLIENT_ID=     # Privy client ID
VITE_OG_BASE_URL=         # OG image service URL (default: sofia-og.vercel.app)
```

### GraphQL Package

```bash
cd packages/graphql
pnpm codegen        # Generate TS types + React Query hooks from .graphql files
pnpm build          # Bundle with tsup
```

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  Header (56px fixed) — logo, search, cart, theme, auth        │
├──────────┬──────────────────────────┬──────────────────────────┤
│ Sidebar  │     Main Content         │     RightSidebar         │
│ (262px)  │     (zoom: 1.25)         │     (320px)              │
│          │                          │                          │
│ Nav      │   ┌──────────────────┐   │  Suggested Accounts      │
│ Interests│   │   Page Router    │   │  Trending Platforms      │
│ Season   │   │                  │   │  Recent Activity         │
│ Countdown│   │  14 pages        │   │                          │
│          │   └──────────────────┘   │  (hidden on /profile/*   │
│          │                          │   and when cart is open)  │
└──────────┴──────────────────────────┴──────────────────────────┘
```

### Data Flow

```
GraphQL (Intuition indexer) / RPC (on-chain events) / localStorage
  → Services (src/services/)      — fetch + transform data
  → Hooks (src/hooks/)            — React state + caching via React Query
  → Components (src/components/)  — presentation only
```

**Key rule**: Components never call services directly — always go through hooks.

### Provider Stack (outer → inner)

```
PrivyProvider → QueryClientProvider → CartProvider → BrowserRouter
   (auth)        (server state)       (cart ctx)     (routing)
```

## On-chain Integration

Sofia operates on **Intuition Mainnet** (chain ID 1155), a purpose-built chain for knowledge graphs.

| Parameter | Value |
|-----------|-------|
| RPC | `https://rpc.intuition.systems` |
| GraphQL Indexer | `https://mainnet.intuition.sh/v1/graphql` |
| Explorer | `https://explorer.intuition.systems` |
| Native Token | TRUST |
| SofiaFeeProxy | `0x26F81d723Ad1648194FAA4b7E235105Fd1212c6c` |

### Core Concepts

- **Atoms**: On-chain entities (platforms, users, concepts) with associated vaults
- **Triples**: Relationships between atoms (e.g. `[Spotify] —has tag→ [Music & Audio]`)
- **Vaults**: Each atom/triple has a vault where users can deposit TRUST (Buy) or withdraw (Sell)
- **Predicates**: Relationship types — TRUSTS, DISTRUST, VISITS_FOR_WORK, VISITS_FOR_LEARNING, VISITS_FOR_FUN, VISITS_FOR_INSPIRATION

### Deposit Flow

```
User clicks Buy/Sell → CartDrawer → WeightModal (amount selection)
  → depositService → SofiaFeeProxy contract → on-chain transaction
```

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Live feed (All Activity / My Circle toggle) — LandingPage if not authenticated | Public |
| `/leaderboard` | Alpha testers + season pool rankings | Public |
| `/profile` | Reputation overview: EthCC wallet, top claims, interests, last activity | Protected |
| `/profile/interest/:domainId` | Domain deep-dive: niches, trending platforms, debate claims | Protected |
| `/profile/interest/:domainId/platforms` | Platform connections for a domain | Protected |
| `/profile/interest/:domainId/niches` | Niche selection for a domain | Protected |
| `/profile/domains` | Global domain selection | Protected |
| `/platforms` | Full catalog of 140 platforms | Protected |
| `/streaks` | Streak leaderboard by daily certifications | Protected |
| `/vote` | Card-based voting on debate claims (support/oppose) | Protected |
| `/scores` | Reputation scores (coming soon) | Protected |

**Protected routes** use `usePrivy()` — redirect to `/` if not authenticated.

## Key Features

### Activity Feed
Real-time feed of on-chain certifications with intention filtering (Trust, Distrust, Work, Learning, Fun, Inspiration). Toggle between global activity and trust circle (wallets you follow).

### Reputation Profile
Multi-domain reputation scoring based on platform connections, niche selections, and on-chain activity. Domains include Tech & Dev, Web3 & Crypto, Gaming, Music & Audio, and 10 others.

### 140 Platform Connections
Each platform has a connection strategy based on its `authType`:

| authType | Button | Method |
|----------|--------|--------|
| `oauth2` / `oauth1` | Connect | OAuth popup flow via sofia-mastra backend |
| `siwe` | Link Wallet | Sign-In With Ethereum |
| `siwf` | Link Farcaster | Sign-In With Farcaster |
| `public` (non-web3) | Add Username | Manual username input + verification |
| `public` (web3) | Analyze | Auto-analyze with wallet address |
| `none` | — | No connection possible |

### EthCC Wallet Integration
Link an EthCC embedded wallet on the profile page to aggregate cross-wallet signals.

### Streak System
Tracks consecutive days of on-chain deposits via the SofiaFeeProxy contract. Leaderboard ranks users by longest active streak.

### Season Pool
Seasonal staking with PnL% tracking. Current season: **Beta** (Feb 21 – Apr 5, 2026).

### Debate / Vote
Card-based voting interface on curated claims (SOFIA_CLAIMS + INTUITION_FEATURED_CLAIMS). Users support or oppose with TRUST deposits. Market cap and position counts displayed per claim.

### Profile Sharing
OG image generation via `sofia-og.vercel.app` with reputation stats, plus Twitter/X share intent.

## Platform Atoms

Each platform in the catalog needs to exist as an **atom** on Intuition, linked to its categories via **"has tag" triples**:

```
[Spotify atom] —has tag→ [Music & Audio atom]
[Spotify atom] —has tag→ [Tech & Dev atom]
```

See [scripts/README.md](scripts/README.md) for the complete atom creation guide, including:
- IPFS pinning via `pinThing` GraphQL mutation
- Batch atom creation via `SofiaFeeProxy.createAtoms`
- Triple creation via `SofiaFeeProxy.createTriples`
- Cost estimation and dry-run mode

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/create-platform-atoms.mjs` | Create platform + category atoms and "has tag" triples on-chain |
| `scripts/check-urls.mjs` | Verify all platform website URLs resolve correctly |
| `scripts/fix-missing-websites.mjs` | Add missing `website` fields to platforms in the catalog |

## Project Structure

```
src/
├── pages/              # 14 route-level components
├── hooks/              # 27 custom React hooks
├── services/           # 25 data services
├── components/
│   ├── ui/             # 50 shadcn/ui primitives
│   ├── profile/        # 15 profile feature components
│   ├── styles/         # 19 component CSS files (BEM-like: .sb-, .hdr-, .pp-, .pg-)
│   └── *.tsx           # Layout + feature components (Sidebar, Header, CartDrawer, etc.)
├── config/             # Static data
│   ├── platformCatalog.ts   # 140 platforms with URLs, OAuth, categories (~2700 lines)
│   ├── taxonomy.ts          # 14 domains → 88 categories → 300+ niches (~2000 lines)
│   ├── signalMatrix.ts      # Signal weights per domain/platform (~900 lines)
│   ├── debateConfig.ts      # Curated debate claims
│   └── intentions.ts        # Browser intent categories
├── config.ts           # Global config (URLs, season, predicates, contract addresses)
├── lib/                # Providers + contract ABIs
├── types/              # TypeScript type definitions
└── styles/             # Global CSS tokens (globals.css)

packages/
└── graphql/            # @0xsofia/dashboard-graphql (local package)
    ├── src/queries/    # 10 .graphql query files
    ├── src/fragments/  # Shared GraphQL fragments
    └── src/generated/  # Auto-generated types + React Query hooks

scripts/                # Platform atom creation & URL verification
public/
└── favicons/           # 140 platform favicons
```

## Design System

| Property | Value |
|----------|-------|
| Color system | oklch via CSS custom properties (`src/styles/globals.css`) |
| Root font-size | **18px** (1rem = 18px, not the standard 16px) |
| Dark mode | CSS class-based (`.dark` on `<html>`, detected before render) |
| Font | Roboto (300, 400, 500, 700, 900) via Google Fonts |
| Support color | `#10B981` (green) |
| Oppose color | `#EF4444` (red) |
| Layout transitions | 0.35–0.45s cubic-bezier on sidebar/drawer toggles |
| Path alias | `@/` → `./src/` |

### Season Config

Season parameters are in `src/config.ts` — update for each new season:
- `SEASON_NAME`, `SEASON_START`, `SEASON_END`, `SEASON_START_BLOCK`
- `SEASON_POOL_TERM_ID`, `SEASON_POOL_CURVE_ID`

## License

Private — All rights reserved.
