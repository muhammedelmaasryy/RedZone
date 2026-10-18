import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'
import { finalPrice, gameById } from '../data/games'
import { useI18n } from '../i18n'
import { useCountdown } from '../lib/hooks'
import { GameCover } from '../components/GameCover'
import { MagneticButton } from '../components/fx/MagneticButton'
import { Chevrons } from '../components/fx/Shapes'

function FlipDigit({ value, label }: { value: number; label: string }) {
  const { num } = useI18n()
  const s = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1" dir="ltr">
        {s.split('').map((d, i) => (
          <div key={i} className="relative h-16 w-11 overflow-hidden rounded bg-void ring-1 ring-white/10 sm:h-20 sm:w-14" style={{ perspective: 300 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={d}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center font-display text-3xl text-white sm:text-4xl"
              >
                {num(Number(d))}
              </motion.span>
            </AnimatePresence>
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
          </div>
        ))}
      </div>
      <span className="text-xs tracking-widest text-white/50 uppercase">{label}</span>
    </div>
  )
}

export function DealOfDay() {
  const { t, egp, num } = useI18n()
  const game = gameById('spiderman2')!
  const end = useMemo(() => {
    const d = new Date()
    d.setHours(23, 59, 59, 0)
    return d.getTime()
  }, [])
  const { h, m, s } = useCountdown(end)
  const now = finalPrice(game, 'ps5Primary')!
  const was = game.prices.ps5Primary!

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="clip-angle relative grid overflow-hidden bg-gradient-to-br from-red-700 via-red-800 to-blood md:grid-cols-[1fr_1.2fr]"
        >
          <div className="stripes-bg absolute inset-0 opacity-40" />
          <div className="relative p-6 sm:p-10">
            <GameCover game={game} big className="mx-auto aspect-[2/3] w-full max-w-[260px] -rotate-3 shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:rotate-0" />
          </div>
          <div className="relative flex flex-col justify-center gap-5 p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <Chevrons className="text-white" count={3} />
              <span className="font-condensed text-2xl tracking-[0.25em] text-white/90 uppercase">{t.deal.kicker}</span>
            </div>
            <h3 className="font-display text-4xl leading-none sm:text-5xl">{t.deal.title}</h3>
            <div className="font-body text-xl font-bold" dir="ltr" style={{ textAlign: 'start' }}>{game.title} · PS5 Primary</div>
            <div className="flex items-end gap-4">
              <span className="font-display text-5xl text-white">{egp(now)}</span>
              <span className="pb-1 text-xl text-white/50 line-through">{egp(was)}</span>
              <span className="mb-1 bg-white px-2 py-1 font-display text-sm text-red-700">-{num(game.discount!)}%</span>
            </div>
            <div className="text-sm text-white/70">{t.deal.ends}</div>
            <div className="flex gap-4">
              <FlipDigit value={h} label={t.deal.h} />
              <FlipDigit value={m} label={t.deal.m} />
              <FlipDigit value={s} label={t.deal.s} />
            </div>
            <div className="mt-2">
              <MagneticButton to={`/game/${game.id}`} variant="ice">{t.deal.grab} <span className="rtl:rotate-180">→</span></MagneticButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
