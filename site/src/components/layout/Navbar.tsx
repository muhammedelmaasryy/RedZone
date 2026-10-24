import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useStore } from '../../store'
import { Crosses } from '../fx/Shapes'
import { Icon } from '../Icon'

function LangToggle() {
  const { lang, toggle } = useI18n()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="relative flex h-9 w-[84px] items-center border border-white/20 bg-white/5 p-1 font-display text-xs"
      dir="ltr"
    >
      <span
        className={`absolute top-1 bottom-1 left-1 w-[38px] bg-red-600 transition-transform duration-200 ease-out ${
          lang === 'ar' ? 'translate-x-[38px]' : 'translate-x-0'
        }`}
      />
      <span className={`relative z-10 flex-1 text-center ${lang === 'en' ? 'text-white' : 'text-white/50'}`}>EN</span>
      <span className={`relative z-10 flex-1 text-center ${lang === 'ar' ? 'text-white' : 'text-white/50'}`}>AR</span>
    </button>
  )
}

export function Navbar() {
  const { t } = useI18n()
  const cart = useStore((s) => s.cart)
  const setCartOpen = useStore((s) => s.setCartOpen)
  const user = useStore((s) => s.user)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const [solid, setSolid] = useState(false)
  const [menu, setMenu] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    const onScroll = () => {
      const isSolid = window.scrollY > 40
      setSolid((prev) => (prev !== isSolid ? isSolid : prev))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/games', label: t.nav.games },
    { to: '/plus', label: t.nav.plus },
  ]

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
          solid || menu ? 'border-b border-white/10 bg-void/90 backdrop-blur-md' : ''
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
          <Link to="/" className="flex items-center gap-3" data-cursor="hover">
            <img
              src="/brand/favicon.png"
              alt="Red Zone"
              width={48}
              height={48}
              className="h-10 w-10 rounded-full ring-2 ring-ice-300 transition-transform duration-200 hover:scale-105 sm:h-12 sm:w-12"
            />
            <div className="leading-none" dir="ltr">
              <div className="font-display text-lg tracking-wide sm:text-xl">
                <span className="text-red-600">RED</span> <span className="text-ice-300">ZONE</span>
              </div>
              <div className="font-condensed text-xs tracking-[0.35em] text-ice-300/80">STORE</div>
            </div>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'text-white' : 'text-white/60 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && (
                        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-ice-300 shadow-[0_0_12px_rgba(189,201,231,0.7)]" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <LangToggle />
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className={`flex h-10 items-center gap-2 border px-2.5 text-xs font-bold transition active:scale-95 ${
                user
                  ? 'border-ice-300/40 bg-ice-300/10 text-ice-200 hover:border-red-500'
                  : 'border-white/20 bg-white/5 text-white/80 hover:border-red-500 hover:text-white'
              }`}
              aria-label={user ? user.name : t.auth.navSignIn}
            >
              <Icon name="user" className="h-4 w-4 text-red-500" />
              <span className="hidden max-w-[96px] truncate sm:inline">
                {user ? user.name.split(' ')[0] : t.auth.navSignIn}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center border border-white/20 bg-white/5 transition hover:border-red-500 active:scale-95"
              aria-label={t.nav.cart}
              id="cart-button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
                <circle cx="10" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -end-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-white/20 lg:hidden"
              aria-label="Menu"
            >
              <span
                className={`h-0.5 w-5 bg-white transition-transform duration-200 ${
                  menu ? 'translate-y-1 rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 w-5 bg-white transition-transform duration-200 ${
                  menu ? '-translate-y-1 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="stripes-bg fixed inset-0 z-40 flex flex-col justify-center bg-blood px-8 lg:hidden"
          >
            <ul className="flex flex-col gap-2">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setMenu(false)}
                    className="font-display text-4xl text-white hover:text-red-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-xs text-white/40">{loc.pathname}</div>
            <Crosses className="mt-10 text-red-500" count={6} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
