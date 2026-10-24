import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { I18nProvider } from './i18n'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { CartDrawer } from './components/layout/CartDrawer'
import { AuthModal } from './components/layout/AuthModal'
import { Preloader } from './components/layout/Preloader'
import { Floaters, Toasts } from './components/layout/Toasts'
import { CursorGlow } from './components/fx/CursorGlow'
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
    const h = setTimeout(go, hash ? 450 : 0)
    return () => clearTimeout(h)
  }, [pathname, hash])
  return null
}

// Red stripe wipe between routes
function PageWrap({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[150] flex"
        initial={false}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            className="h-full flex-1 origin-top bg-red-600"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0, transition: { duration: 0.5, delay: i * 0.04, ease: [0.76, 0, 0.24, 1] } }}
            exit={{ scaleY: 1, originY: 1, transition: { duration: 0.4, delay: i * 0.04, ease: [0.76, 0, 0.24, 1] } }}
          />
        ))}
      </motion.div>
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.15 } }} exit={{ opacity: 0, transition: { delay: 0.3 } }}>
        {children}
      </motion.main>
    </>
  )
}

function AppRoutes({ ready }: { ready: boolean }) {
  const loc = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={loc} key={loc.pathname}>
        <Route path="/" element={<motion.main exit={{ opacity: 0, transition: { duration: 0.3 } }}><Home ready={ready} /></motion.main>} />
        <Route path="/games" element={<PageWrap><Suspense fallback={<div className="h-screen" />}><Catalog /></Suspense></PageWrap>} />
        <Route path="/plus" element={<PageWrap><Suspense fallback={<div className="h-screen" />}><Plus /></Suspense></PageWrap>} />
        <Route path="/game/:id" element={<PageWrap><Suspense fallback={<div className="h-screen" />}><Product /></Suspense></PageWrap>} />
        <Route path="/checkout" element={<PageWrap><Suspense fallback={<div className="h-screen" />}><Checkout /></Suspense></PageWrap>} />
        <Route path="/order/:id" element={<PageWrap><Suspense fallback={<div className="h-screen" />}><Order /></Suspense></PageWrap>} />
        <Route path="*" element={<PageWrap><Suspense fallback={null}><Product /></Suspense></PageWrap>} />
      </Routes>
    </AnimatePresence>
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
