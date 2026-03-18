import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { BrowserRouter } from 'react-router-dom'
import { PRIVY_APP_ID } from '../config'
import { CartProvider } from '../hooks/useCart'

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
        loginMethods: ['wallet'],
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
