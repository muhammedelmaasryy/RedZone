import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { PSShape } from '../fx/Shapes'

// PS-style boot sequence: shapes light up, logo reveals, pill bar fills, stripes wipe out.
export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const total = reduce ? 300 : 2200
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total)
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setTimeout(() => setShow(false), 250)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div key="pre" className="fixed inset-0 z-[200] flex items-center justify-center" exit={{ pointerEvents: 'none' }}>
          {/* stripe wipe panels */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 h-full bg-void"
              style={{ left: `${(i * 100) / 6}%`, width: `${100 / 6 + 0.3}%` }}
              exit={{ scaleY: 0, transition: { duration: 0.6, delay: i * 0.05, ease: [0.76, 0, 0.24, 1] } }}
              initial={{ originY: 0 }}
            />
          ))}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-8"
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 0.35 } }}
          >
            <div className="flex gap-5 text-ice-300" dir="ltr">
              {(['triangle', 'circle', 'cross', 'square'] as const).map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0.1, y: 10 }}
                  animate={{ opacity: [0.1, 1, 0.5], y: 0, color: ['#bdc9e7', '#ff1a1a', '#bdc9e7'] }}
                  transition={{ delay: 0.1 + i * 0.15, duration: 0.8 }}
                >
                  <PSShape shape={s} className="h-8 w-8" />
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ clipPath: 'inset(50% 50% 50% 50%)', scale: 1.2 }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
              transition={{ delay: 0.5, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
              className="relative"
            >
              <img src="/brand/logo.webp" alt="Red Zone Store" className="h-44 w-44 rounded-full object-cover ring-4 ring-red-600 glow sm:h-56 sm:w-56" />
            </motion.div>
            <div className="flex w-64 flex-col items-center gap-3" dir="ltr">
              <div className="h-4 w-full rounded-full border-2 border-ice-300/80 p-0.5">
                <div className="h-full rounded-full bg-ice-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex w-full justify-between font-condensed text-lg tracking-[0.3em] text-white/60">
                <span>LOADING</span>
                <span className="text-red-500">{progress}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
