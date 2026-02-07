import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import Admin from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error("🚨 GLOBAL ERROR TERDETEKSI:", error.message)
      console.error("🔍 Query Key yang bermasalah:", query.queryKey)
    }
  })
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Admin />
    </QueryClientProvider>
  </StrictMode>
)
