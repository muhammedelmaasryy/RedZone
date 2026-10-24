import { AnimatePresence, motion } from 'motion/react'
import { WHATSAPP } from '../../data/content'
import { useStore } from '../../store'
import { Icon } from '../Icon'

// "Trophy unlocked" style toasts (add-to-cart) — PS notification look.
export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed top-20 end-4 z-[90] flex w-[min(340px,calc(100vw-2rem))] flex-col gap-2 sm:top-24">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className="clip-angle flex items-center gap-3 border border-white/10 bg-steel-800/95 p-3 shadow-2xl"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ice-300 to-ice-400 text-void">
              <Icon name="trophy" className="h-5 w-5" />
            </div>
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

// Floating WhatsApp button.
export function Floaters() {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-4 end-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="relative h-7 w-7" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
      </svg>
    </a>
  )
}
