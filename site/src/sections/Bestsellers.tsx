import { motion, useMotionValue, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { games } from '../data/games'
import { useI18n } from '../i18n'
import { GameCard } from '../components/GameCard'
import { SectionHead } from '../components/fx/Reveal'
import { MagneticButton } from '../components/fx/MagneticButton'

function Arrow({ forward, disabled, onClick }: { forward: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={forward ? 'Next' : 'Previous'}
      className="flex h-11 w-11 items-center justify-center border border-white/20 bg-white/5 transition-colors hover:border-red-500 hover:bg-red-600 disabled:pointer-events-none disabled:opacity-30"
    >
      <span className={forward ? 'rtl:rotate-180' : 'ltr:rotate-180'}>→</span>
    </button>
  )
}

// Native horizontal scroller: touch swipe, trackpad, shift+wheel, mouse drag and arrow buttons all work.
export function Bestsellers() {
  const { t, dir } = useI18n()
  const rail = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false, x: 0, left: 0 })
  const [edges, setEdges] = useState({ start: true, end: false })
  const progress = useMotionValue(0)
  const bar = useSpring(progress, { stiffness: 200, damping: 30 })
  const list = [...games].sort((a, b) => b.popularity - a.popularity).slice(0, 10)

  const update = useCallback(() => {
    const el = rail.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    // scrollLeft is negative in RTL (Chrome/Firefox/Safari)
    const pos = Math.abs(el.scrollLeft)
    progress.set(max > 0 ? pos / max : 1)
    setEdges({ start: pos < 4, end: pos > max - 4 })
  }, [progress])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, dir])

  const step = (forward: boolean) => {
    const el = rail.current
    if (!el) return
    const amount = el.clientWidth * 0.8 * (forward ? 1 : -1) * (dir === 'rtl' ? -1 : 1)
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !rail.current) return
    drag.current = { active: true, moved: false, x: e.clientX, left: rail.current.scrollLeft }
    rail.current.style.scrollSnapType = 'none'
  }
  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d.active || !rail.current) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 5) d.moved = true
    rail.current.scrollLeft = d.left - dx
  }
  const onUp = () => {
    if (!drag.current.active) return
    drag.current.active = false
    if (rail.current) rail.current.style.scrollSnapType = ''
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead kicker={t.best.kicker} title={t.best.title} />
          <div className="mb-6 flex items-center gap-2 sm:mb-10">
            <div className="hidden gap-2 sm:flex">
              <Arrow forward={false} disabled={edges.start} onClick={() => step(false)} />
              <Arrow forward disabled={edges.end} onClick={() => step(true)} />
            </div>
            <MagneticButton to="/games" variant="ghost">{t.best.all} <span className="rtl:rotate-180">→</span></MagneticButton>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: dir === 'rtl' ? -80 : 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          ref={rail}
          onScroll={update}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false } }}
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 select-none sm:scroll-px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] sm:gap-5 sm:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] md:cursor-grab md:active:cursor-grabbing"
        >
          {list.map((g) => (
            <GameCard key={g.id} game={g} className="w-[150px] shrink-0 snap-start sm:w-[240px] lg:w-[260px]" />
          ))}
        </div>
      </motion.div>

      <div className="mx-auto mt-4 flex max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="relative h-0.5 flex-1 overflow-hidden bg-white/10">
          <motion.div style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-red-500 rtl:origin-right" />
        </div>
        <span className="flex items-center gap-2 text-xs tracking-[0.3em] text-white/40 uppercase">
          <motion.span animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>⟷</motion.span> {t.best.drag}
        </span>
      </div>
    </section>
  )
}
