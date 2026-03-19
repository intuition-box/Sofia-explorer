![Sofia Banner](public/banniere%202.png)

# Sofia Explorer

Behavioral reputation dashboard for the Sofia browser extension — a Web3 protocol that tracks browsing intents, connects social platforms via OAuth, and builds verifiable reputation profiles on-chain via the [Intuition](https://intuition.systems) protocol.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5.7 |
| Build | Vite 6.3 (SWC) |
| Styling | Tailwind CSS v4 (oklch) + shadcn/ui |
| Auth | Privy (wallet, Google, email) |
| Server State | React Query v5 |
| GraphQL | graphql-request 7.1 + graphql-codegen |
| On-chain | Viem v2 — Intuition Mainnet (chain 1155) |

## Getting Started

```bash
pnpm install
pnpm dev            # Dev server on http://localhost:5173 (auto-open)
pnpm build          # tsc -b && vite build → dist/
```

### GraphQL Package

```bash
cd packages/graphql
pnpm codegen        # Generate TS types + React Query hooks from .graphql files
pnpm build          # Bundle with tsup
```

## Architecture

```
GraphQL (Intuition indexer) / RPC (on-chain events)
  → Services (src/services/)      — fetch + transform
  → Hooks (src/hooks/)            — React state + caching
  → Components (src/components/)  — presentation only
```

Components never call services directly — always through hooks.

### Project Structure

```
src/
├── pages/              # 13 route-level components
├── hooks/              # 26 custom React hooks
├── services/           # 24 data services
├── components/
│   ├── ui/             # 45+ shadcn/ui primitives
│   ├── profile/        # 14 profile feature components
│   ├── styles/         # 19 component CSS files
│   └── *.tsx           # Layout + feature components
├── config/             # Static data (platforms, taxonomy, signals)
├── config.ts           # Global config (URLs, season, predicates)
├── lib/                # Providers + contract ABIs
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

packages/
└── graphql/            # @0xsofia/dashboard-graphql (local package)
    ├── src/queries/    # 10 .graphql query files → 16 generated queries
    ├── src/fragments/  # Shared GraphQL fragments
    └── src/generated/  # Auto-generated types + React Query hooks
```

## Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Dashboard — live feed (All Activity / My Circle) | Public |
| `/leaderboard` | Leaderboard — alpha testers + season pool | Public |
| `/profile` | Profile — top claims, interests, activity | Protected |
| `/profile/interest/:domainId` | Interest — domain deep-dive | Protected |
| `/profile/interest/:domainId/platforms` | Platform connection for domain | Protected |
| `/profile/interest/:domainId/niches` | Niche selection for domain | Protected |
| `/profile/domains` | Global domain selection | Protected |
| `/profile/niches` | Global niche selection | Protected |
| `/platforms` | All 142 platforms catalog | Protected |
| `/scores` | Reputation scores (coming soon) | Protected |
| `/streaks` | Streak leaderboard | Protected |
| `/vote` | Vote on debate claims | Protected |
| `/auth/callback` | OAuth redirect handler | Public |

## Key Features

- **Live Activity Feed** — real-time certifications with intention filtering (Trust, Distrust, Work, Learning, Fun, Inspiration)
- **Trust Circle** — curated feed from trusted wallets
- **Reputation Scoring** — multi-domain scores based on platform connections and niche selections
- **142 Platform Connections** — OAuth, SIWE, username verification strategies
- **Streak Leaderboard** — consecutive daily certification tracking
- **Season Pool** — staking positions with PnL tracking
- **Alpha Tester Leaderboard** — on-chain event aggregation
- **Debate/Vote System** — support/oppose claims with market cap visualization
- **Profile Sharing** — OG image generation + Twitter/X share

## Configuration

### Environment Variables

```env
VITE_PRIVY_APP_ID=        # Privy app ID for Web3 auth
VITE_PRIVY_CLIENT_ID=     # Privy client ID
VITE_OG_BASE_URL=         # OG image service URL (default: sofia-og.vercel.app)
```

### Season Config

Season parameters are in `src/config.ts` — update for each new season:
- `SEASON_NAME`, `SEASON_START`, `SEASON_END`, `SEASON_START_BLOCK`
- `SEASON_POOL_TERM_ID`, `SEASON_POOL_CURVE_ID`

## Design System

- **Colors**: oklch color system with CSS custom properties in `src/styles/globals.css`
- **Root font-size**: 18px
- **Dark mode**: CSS class-based (`.dark` on `<html>`)
- **Font**: Roboto (Google Fonts)
- **Layout**: Fixed three-column (Sidebar 262px + Main content + RightSidebar 320px) with 56px header

## Static Data

| File | Lines | Content |
|------|-------|---------|
| `src/config/platformCatalog.ts` | ~2700 | 142 platform definitions with URLs, OAuth endpoints, categories |
| `src/config/taxonomy.ts` | ~2000 | Domain → Category → Niche hierarchy |
| `src/config/signalMatrix.ts` | ~900 | Signal weights per domain/platform |
