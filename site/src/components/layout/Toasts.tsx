import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { recentOrders, WHATSAPP } from '../../data/content'
import { useI18n } from '../../i18n'
import { useStore } from '../../store'

// "Trophy unlocked" style toasts (add-to-cart) — PS notification look.
export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed top-20 end-4 z-[90] flex w-[min(340px,calc(100vw-2rem))] flex-col gap-2 sm:top-24">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80 }}
            className="clip-angle flex items-center gap-3 border border-white/10 bg-steel-800/95 p-3 shadow-2xl backdrop-blur"
          >
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.15 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 text-xl"
            >
              🏆
            </motion.div>
            <div className="min-w-0">
              <div className="text-xs text-ice-300">{t.title}</div>
              <div className="truncate text-sm font-bold text-white">{t.body}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Social-proof ticker bottom-start + floating WhatsApp button bottom-end.
export function Floaters() {
  const { l, lang } = useI18n()
  const [i, setI] = useState(-1)

  useEffect(() => {
    const first = setTimeout(() => setI(0), 9000)
    const id = setInterval(() => setI((v) => (v + 1) % recentOrders.length), 14000)
    return () => { clearTimeout(first); clearInterval(id) }
  }, [])
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (i < 0) return
    setVisible(true)
    const h = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(h)
  }, [i])

  const o = i >= 0 ? recentOrders[i] : null
  return (
    <>
      <div className="pointer-events-none fixed bottom-4 start-4 z-[80] hidden sm:block">
        <AnimatePresence>
          {visible && o && (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="flex items-center gap-3 border border-white/10 bg-night/95 px-4 py-3 text-sm shadow-2xl backdrop-blur"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-white/80">
                {lang === 'ar'
                  ? <><b className="text-white">{o.name}</b> اشترى {o.game} · {l(o.slot)} <span className="text-white/40">منذ {o.mins} د</span></>
                  : <><b className="text-white">{o.name}</b> bought {o.game} · {l(o.slot)} <span className="text-white/40">{o.mins}m ago</span></>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.a
        href={WHATSAPP}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 3, type: 'spring' }}
        whileHover={{ scale: 1.1, rotate: -8 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-4 end-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_0_30px_rgba(37,211,102,0.5)]"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-30" />
        <svg viewBox="0 0 24 24" className="relative h-7 w-7" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
        </svg>
      </motion.a>
    </>
  )
}
