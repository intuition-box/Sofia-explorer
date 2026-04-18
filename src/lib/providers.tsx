import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { PrivyProvider } from '@privy-io/react-auth'
import { BrowserRouter } from 'react-router-dom'
import { configureClient } from '@0xsofia/dashboard-graphql'
import { PRIVY_APP_ID, GRAPHQL_URL } from '../config'
import { CartProvider } from '../hooks/useCart'
import { ViewAsProvider } from '../hooks/useViewAs'

// Use proxied URL in dev to avoid CORS
configureClient({ apiUrl: GRAPHQL_URL })

const CACHE_MAX_AGE = 24 * 60 * 60 * 1000 // 24h

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // gcTime must be >= maxAge for the persister to keep entries
      gcTime: CACHE_MAX_AGE,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      throwOnError: false,
    },
  },
})

// Persist React Query cache to localStorage so scores (and other fetched data)
// show up instantly on reload, before Privy finishes re-authenticating and the
// background refetch completes.
const persister =
  typeof window !== 'undefined'
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: 'sofia-rq-cache',
      })
    : undefined

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'google'],
        appearance: { theme: 'dark' },
      }}
    >
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={
          persister
            ? { persister, maxAge: CACHE_MAX_AGE }
            : { persister: undefined as any, maxAge: CACHE_MAX_AGE }
        }
      >
        <CartProvider>
          <ViewAsProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </ViewAsProvider>
        </CartProvider>
      </PersistQueryClientProvider>
    </PrivyProvider>
  )
}
