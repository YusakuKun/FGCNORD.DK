import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@/components/ClerkProvider'
import { isClerkConfigured } from '@/lib/clerk'

if (!isClerkConfigured()) {
  console.warn(
    'VITE_CLERK_PUBLISHABLE_KEY mangler. Discord login på /bliv-medlem vil ikke virke før nøglen er sat.'
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
