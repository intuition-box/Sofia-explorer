/**
 * SubscriptionManager — single source of truth for real-time data.
 *
 * Opens one WebSocket connection (via the graphql-ws client in
 * @0xsofia/dashboard-graphql) and subscribes to the wallet-scoped
 * queries we care about. Each delta is pushed into the React Query
 * cache via queryClient.setQueryData(), so components that consume
 * those query keys re-render without triggering a fetch.
 *
 * No GraphQL strings live in this file — we import the generated
 * DocumentNodes from the @0xsofia/dashboard-graphql package and
 * render them to strings with graphql#print().
 *
 * Phase 1: positions only. Events and trust subscriptions come in Phase 2.
 */

import { print } from 'graphql'
import type { QueryClient } from '@tanstack/react-query'
import {
  getWsClient,
  disposeWsClient,
  WatchUserPositionsDocument,
  type WatchUserPositionsSubscription,
  type WatchUserPositionsSubscriptionVariables,
} from '@0xsofia/dashboard-graphql'

type Unsubscribe = () => void

export class SubscriptionManager {
  private queryClient: QueryClient
  private walletAddress: string | null = null
  private subscriptions = new Map<string, Unsubscribe>()

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient
  }

  /**
   * Open subscriptions for the given wallet. If already connected to the
   * same wallet, does nothing. If connected to a different wallet, tears
   * down the previous session first.
   */
  connect(walletAddress: string) {
    const normalized = walletAddress.toLowerCase()
    if (this.walletAddress === normalized) return
    this.disconnect()
    this.walletAddress = normalized
    this.subscribePositions()
  }

  /** Close all subscriptions and reset. Does NOT dispose the shared WS client. */
  disconnect() {
    for (const unsub of this.subscriptions.values()) {
      try { unsub() } catch { /* ignore */ }
    }
    this.subscriptions.clear()
    this.walletAddress = null
  }

  /** Nuclear option — dispose the shared WS client too. Use on full logout. */
  shutdown() {
    this.disconnect()
    disposeWsClient()
  }

  // ─────────────────────────────────────────────────────────
  // Subscriptions
  // ─────────────────────────────────────────────────────────

  private subscribePositions() {
    if (!this.walletAddress) return

    const variables: WatchUserPositionsSubscriptionVariables = {
      accountId: this.walletAddress,
    }

    const unsub = getWsClient().subscribe<WatchUserPositionsSubscription>(
      {
        query: print(WatchUserPositionsDocument),
        variables,
      },
      {
        next: ({ data }) => {
          if (!data) return
          this.onPositionsUpdate(data)
        },
        error: (err) => {
          console.error('[WS positions] error', err)
        },
        complete: () => {
          console.log('[WS positions] complete')
        },
      },
    )

    this.subscriptions.set('positions', unsub)
  }

  // ─────────────────────────────────────────────────────────
  // Cache writers (to be expanded in Phase 2)
  // ─────────────────────────────────────────────────────────

  private onPositionsUpdate(data: WatchUserPositionsSubscription) {
    const positions = data.positions ?? []
    const count = positions.length

    // Phase 1: only the canonical key. Derivations feed the existing
    // per-view query keys in Phase 2 (see derivations.ts).
    this.queryClient.setQueryData(
      ['positions', this.walletAddress],
      positions,
    )

    if (import.meta.env.DEV) {
      console.log(`[WS positions] ${count} positions for ${this.walletAddress?.slice(0, 8)}…`)
    }
  }
}
