import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import Admin from './App'

const queryClient = new QueryClient({
  defaultOption: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Admin />
    </QueryClientProvider>
  </StrictMode>
)
