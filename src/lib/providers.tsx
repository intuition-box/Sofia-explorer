import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { BrowserRouter } from 'react-router-dom'
import { configureClient } from '@0xsofia/dashboard-graphql'
import { PRIVY_APP_ID, GRAPHQL_URL } from '../config'
import { CartProvider } from '../hooks/useCart'
import { ViewAsProvider } from '../hooks/useViewAs'

// Use proxied URL in dev to avoid CORS
configureClient({ apiUrl: GRAPHQL_URL })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      throwOnError: false,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'google'],
        appearance: { theme: 'dark' },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <ViewAsProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </ViewAsProvider>
        </CartProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
