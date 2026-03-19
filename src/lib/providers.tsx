import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { BrowserRouter } from 'react-router-dom'
import { configureClient } from '@0xsofia/dashboard-graphql'
import { PRIVY_APP_ID, GRAPHQL_URL } from '../config'
import { CartProvider } from '../hooks/useCart'

// Use proxied URL in dev to avoid CORS
configureClient({ apiUrl: GRAPHQL_URL })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
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
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </CartProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}
