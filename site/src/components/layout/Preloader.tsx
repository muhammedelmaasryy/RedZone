import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { waitSceneReady } from '../../lib/sceneReady'
import { PSShape } from '../fx/Shapes'

// Logo artwork: dark maroon field crossed by a red band (~ -11deg, ~37% of the logo height).
// The screen recreates that field so the logo's background fills the whole viewport.
const LOGO_SIZE = 'min(82vw, 60vh)'

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => (img.decode ? img.decode().catch(() => {}).then(() => resolve()) : resolve())
    img.onerror = () => resolve()
    img.src = src
  })
}

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const minTime = reduce ? 300 : 1800
    const start = performance.now()
    let raf = 0
    let finished = false
    // fill to 90% on a timer, last 10% once assets + 3D scene are warm
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / minTime)
      setProgress((v) => (finished ? v : Math.max(v, Math.round((1 - Math.pow(1 - p, 3)) * 90))))
      if (!finished) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    Promise.all([
      new Promise((r) => setTimeout(r, minTime)),
      preloadImage('/brand/mascot.webp'),
      preloadImage('/brand/favicon.png'),
      document.fonts?.ready ?? Promise.resolve(),
      waitSceneReady(5000),
    ]).then(() => {
      finished = true
      setProgress(100)
      setTimeout(() => setShow(false), 280)
    })
    return () => { finished = true; cancelAnimationFrame(raf) }
  }, [])

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div key="pre" className="fixed inset-0 z-[200] overflow-hidden" exit={{ pointerEvents: 'none' }}>
          {/* full-screen logo field, split in panels for the exit wipe */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 h-full overflow-hidden"
              style={{ left: `${(i * 100) / 6}%`, width: `${100 / 6 + 0.3}%`, originY: 0 }}
              exit={{ scaleY: 0, transition: { duration: 0.6, delay: i * 0.05, ease: [0.76, 0, 0.24, 1] } }}
            >
              <div className="absolute top-0 h-screen w-screen bg-blood" style={{ left: `${(-i * 100) / 6}vw` }}>
                <div
                  className="absolute top-1/2 left-1/2 w-[300vw]"
                  style={{
                    height: `calc(${LOGO_SIZE} * 0.37)`,
                    transform: 'translate(-50%, -50%) rotate(-11.3deg)',
                    background: 'linear-gradient(90deg, #a30001 0%, #c80000 35%, #e10000 65%, #d30001 100%)',
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,0,0,0.55)_100%)]" />
              </div>
            </motion.div>
          ))}

          <motion.div
            className="relative z-10 flex h-full flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.35 } }}
          >
            <div className="absolute top-[8vh] flex gap-5 text-ice-300" dir="ltr">
              {(['triangle', 'circle', 'cross', 'square'] as const).map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0.15, y: 10 }}
                  animate={{ opacity: [0.15, 1, 0.6], y: 0, color: ['#bdc9e7', '#ffffff', '#bdc9e7'] }}
                  transition={{ delay: 0.1 + i * 0.15, duration: 0.8 }}
                >
                  <PSShape shape={s} className="h-7 w-7 sm:h-8 sm:w-8" />
                </motion.div>
              ))}
            </div>

            <motion.img
              src="/brand/logo.webp"
              alt="Red Zone Store"
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                maskImage: 'radial-gradient(circle at center, black 52%, transparent 71%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 52%, transparent 71%)',
              }}
              className="object-cover"
            />

            <div className="absolute bottom-[9vh] flex w-64 flex-col items-center gap-3" dir="ltr">
              <div className="h-4 w-full rounded-full border-2 border-ice-300/80 p-0.5">
                <div className="h-full rounded-full bg-ice-300 transition-[width] duration-200 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex w-full justify-between font-condensed text-lg tracking-[0.3em] text-white/70">
                <span>LOADING</span>
                <span className="text-ice-300">{progress}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
