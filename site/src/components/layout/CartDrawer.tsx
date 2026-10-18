import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { gameById, slotLabel } from '../../data/games'
import { useI18n } from '../../i18n'
import { cartTotal, PLUS_ADDON_PRICE, useStore } from '../../store'
import { GameCover } from '../GameCover'
import { MagneticButton } from '../fx/MagneticButton'
import { AnimatedPrice } from '../fx/CountUp'

export function CartDrawer() {
  const { t, l, egp, dir } = useI18n()
  const { cart, cartOpen, setCartOpen, removeFromCart } = useStore()
  const nav = useNavigate()
  const from = dir === 'rtl' ? '-100%' : '100%'

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: from }}
            animate={{ x: 0 }}
            exit={{ x: from }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed inset-y-0 end-0 z-[61] flex w-full max-w-md flex-col border-s border-red-900/60 bg-night"
            data-lenis-prevent
          >
            <div className="stripes-bg flex items-center justify-between border-b border-white/10 px-5 py-5">
              <h3 className="font-display text-2xl">{t.cart.title}</h3>
              <button onClick={() => setCartOpen(false)} className="h-9 w-9 border border-white/20 hover:border-red-500" aria-label={t.common.close}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 flex flex-col items-center gap-4 text-center text-white/50">
                  <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-6xl">🎮</motion.div>
                  {t.cart.empty}
                </motion.div>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {cart.map((c) => {
                      const g = gameById(c.gameId)!
                      return (
                        <motion.li
                          key={c.key}
                          layout
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
                          className="flex gap-3 border border-white/10 bg-white/[0.03] p-3"
                        >
                          <GameCover game={g} className="h-20 w-16 shrink-0" />
                          <div className="flex flex-1 flex-col">
                            <div className="text-sm font-bold" dir="ltr" style={{ textAlign: 'start' }}>{g.title}</div>
                            <div className="text-xs text-ice-300">{l(slotLabel[c.slot])}</div>
                            {c.addPlus && <div className="text-xs text-white/50">+ PS Plus ({egp(PLUS_ADDON_PRICE)})</div>}
                            <div className="mt-auto flex items-center justify-between">
                              <span className="font-display text-red-500">{egp(c.price + (c.addPlus ? PLUS_ADDON_PRICE : 0))}</span>
                              <button onClick={() => removeFromCart(c.key)} className="text-xs text-white/40 hover:text-red-400">{t.cart.remove}</button>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-white/10 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-white/60">{t.cart.total}</span>
                  <AnimatedPrice value={cartTotal(cart)} className="font-display text-2xl text-white" />
                </div>
                <div className="w-full [&>div]:w-full">
                  <MagneticButton strength={0.15} onClick={() => { setCartOpen(false); nav('/checkout') }}>
                    {t.cart.checkout} →
                  </MagneticButton>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
