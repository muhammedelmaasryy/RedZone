import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { I18nProvider } from './i18n'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { CartDrawer } from './components/layout/CartDrawer'
import { AuthModal } from './components/layout/AuthModal'
import { Floaters, Toasts } from './components/layout/Toasts'
import { CursorGlow } from './components/fx/CursorGlow'
import { Preloader } from './components/layout/Preloader'
import Home from './pages/Home'

const Catalog = lazy(() => import('./pages/Catalog'))
const Plus = lazy(() => import('./pages/Plus'))
const Product = lazy(() => import('./pages/Product'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Order = lazy(() => import('./pages/Order'))

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const go = () => {
      if (hash) {
        const el = document.querySelector(hash) as HTMLElement | null
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          return
        }
      }
      window.scrollTo(0, 0)
    }
    const h = setTimeout(go, hash ? 150 : 0)
    return () => clearTimeout(h)
  }, [pathname, hash])
  return null
}

function AppRoutes({ ready }: { ready: boolean }) {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home ready={ready} />} />
        <Route path="/games" element={<Suspense fallback={<div className="min-h-screen" />}><Catalog /></Suspense>} />
        <Route path="/plus" element={<Suspense fallback={<div className="min-h-screen" />}><Plus /></Suspense>} />
        <Route path="/game/:id" element={<Suspense fallback={<div className="min-h-screen" />}><Product /></Suspense>} />
        <Route path="/checkout" element={<Suspense fallback={<div className="min-h-screen" />}><Checkout /></Suspense>} />
        <Route path="/order/:id" element={<Suspense fallback={<div className="min-h-screen" />}><Order /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<div className="min-h-screen" />}><Product /></Suspense>} />
      </Routes>
    </main>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)

  return (
    <I18nProvider>
      <BrowserRouter>
        <ScrollManager />
        {!ready && <Preloader onDone={() => setReady(true)} />}
        <CursorGlow />
        <Navbar />
        <AppRoutes ready={ready} />
        <Footer />
        <CartDrawer />
        <AuthModal />
        <Toasts />
        <Floaters />
      </BrowserRouter>
    </I18nProvider>
  )
}
