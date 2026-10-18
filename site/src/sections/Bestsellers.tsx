import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { games } from '../data/games'
import { useI18n } from '../i18n'
import { GameCard } from '../components/GameCard'
import { SectionHead } from '../components/fx/Reveal'
import { MagneticButton } from '../components/fx/MagneticButton'

export function Bestsellers() {
  const { t, dir } = useI18n()
  const track = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [limit, setLimit] = useState(0)
  const list = [...games].sort((a, b) => b.popularity - a.popularity).slice(0, 10)

  useEffect(() => {
    const calc = () => {
      if (track.current && wrap.current) setLimit(Math.max(0, track.current.scrollWidth - wrap.current.clientWidth))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  return (
    <section className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead kicker={t.best.kicker} title={t.best.title} />
          <div className="mb-10">
            <MagneticButton to="/games" variant="ghost">{t.best.all} <span className="rtl:rotate-180">→</span></MagneticButton>
          </div>
        </div>
      </div>
      <div ref={wrap} className="mx-auto max-w-7xl overflow-visible px-4 sm:px-6">
        <motion.div
          ref={track}
          drag="x"
          dragConstraints={dir === 'rtl' ? { left: 0, right: limit } : { left: -limit, right: 0 }}
          dragElastic={0.12}
          className="flex w-max cursor-grab gap-5 active:cursor-grabbing"
          initial={{ opacity: 0, x: dir === 'rtl' ? -80 : 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {list.map((g) => (
            <GameCard key={g.id} game={g} className="w-[230px] shrink-0 sm:w-[260px]" />
          ))}
        </motion.div>
      </div>
      <div className="mx-auto mt-6 flex max-w-7xl items-center gap-3 px-4 text-xs tracking-[0.3em] text-white/40 uppercase sm:px-6">
        <motion.span animate={{ x: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>⟷</motion.span> {t.best.drag}
      </div>
    </section>
  )
}
