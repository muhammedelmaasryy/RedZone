import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useStore } from '../../store'
import { Crosses } from '../fx/Shapes'

function LangToggle() {
  const { lang, toggle } = useI18n()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="relative flex h-9 w-[84px] items-center border border-white/20 bg-white/5 p-1 font-display text-xs"
      dir="ltr"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-1 bottom-1 w-[38px] bg-red-600"
        style={{ left: lang === 'en' ? 4 : 'auto', right: lang === 'ar' ? 4 : 'auto' }}
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
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [menu, setMenu] = useState(false)
  const loc = useLocation()

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(v > prev && v > 240 && !menu)
    setSolid(v > 40)
  })
  useEffect(() => setMenu(false), [loc.pathname])

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/games', label: t.nav.games },
    { to: '/#plus', label: t.nav.plus },
    { to: '/#how', label: t.nav.how },
    { to: '/#faq', label: t.nav.faq },
  ]

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid || menu ? 'border-b border-white/10 bg-void/80 backdrop-blur-xl' : ''}`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
          <Link to="/" className="flex items-center gap-3" data-cursor="hover">
            <motion.img
              src="/brand/favicon.png"
              alt="Red Zone"
              className="h-10 w-10 rounded-full ring-2 ring-red-600 sm:h-12 sm:w-12"
              whileHover={{ rotate: -8, scale: 1.08 }}
            />
            <div className="leading-none" dir="ltr">
              <div className="font-display text-lg tracking-wide sm:text-xl">
                <span className="text-red-600">RED</span> <span className="text-ice-300">ZONE</span>
              </div>
              <div className="font-condensed text-xs tracking-[0.35em] text-white/60">STORE</div>
            </div>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm font-semibold transition-colors ${isActive && !l.to.includes('#') ? 'text-white' : 'text-white/60 hover:text-white'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && !l.to.includes('#') && (
                        <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-red-500 glow" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <LangToggle />
            <motion.button
              onClick={() => setCartOpen(true)}
              whileTap={{ scale: 0.9 }}
              className="relative flex h-10 w-10 items-center justify-center border border-white/20 bg-white/5 hover:border-red-500"
              aria-label={t.nav.cart}
              id="cart-button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
                <circle cx="10" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" />
              </svg>
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.span
                    key={cart.length}
                    initial={{ scale: 0 }}
                    animate={{ scale: [1.6, 1] }}
                    exit={{ scale: 0 }}
                    className="absolute -end-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <button
              onClick={() => setMenu((v) => !v)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-white/20 lg:hidden"
              aria-label="Menu"
            >
              <motion.span animate={menu ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} className="h-0.5 w-5 bg-white" />
              <motion.span animate={menu ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} className="h-0.5 w-5 bg-white" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 90% 4%)' }}
            animate={{ clipPath: 'circle(150% at 90% 4%)' }}
            exit={{ clipPath: 'circle(0% at 90% 4%)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="stripes-bg fixed inset-0 z-40 flex flex-col justify-center bg-blood px-8 lg:hidden"
          >
            <ul className="flex flex-col gap-2">
              {links.map((l, i) => (
                <motion.li
                  key={l.to}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                >
                  <Link to={l.to} onClick={() => setMenu(false)} className="font-display text-4xl text-white hover:text-red-500">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <Crosses className="mt-10 text-red-500" count={6} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
