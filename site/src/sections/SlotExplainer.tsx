import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useI18n } from '../i18n'
import { SectionHead } from '../components/fx/Reveal'
import { AnimatedPrice } from '../components/fx/CountUp'
import { PSShape } from '../components/fx/Shapes'

type Mode = 'primary' | 'secondary' | 'full'
type Console = 'ps5' | 'ps4'

const PRICES: Record<Console, Record<Mode, number>> = {
  ps5: { primary: 1500, secondary: 750, full: 2600 },
  ps4: { primary: 1100, secondary: 600, full: 2600 },
}
const FEATURES: Record<Mode, boolean[]> = {
  primary: [true, true, true, true],
  secondary: [false, false, false, true],
  full: [true, true, true, true],
}

export function SlotExplainer() {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('primary')
  const [con, setCon] = useState<Console>('ps5')
  const rows = [t.slots.rows.anyUser, t.slots.rows.offline, t.slots.rows.ownId, t.slots.rows.plusNeeded]
  const modes: { id: Mode; label: string }[] = [
    { id: 'primary', label: t.slots.primary },
    { id: 'secondary', label: t.slots.secondary },
    { id: 'full', label: t.slots.full },
  ]

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="dot-bg absolute end-0 top-10 h-64 w-64 opacity-30 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead kicker={t.slots.kicker} title={t.slots.title} sub={t.slots.sub} />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* controls + visual */}
          <div className="flex flex-col gap-6">
            <div className="flex w-fit border border-white/15 bg-white/5 p-1" dir="ltr">
              {(['ps5', 'ps4'] as const).map((c) => (
                <button key={c} onClick={() => setCon(c)} className="relative px-6 py-2 font-display text-sm">
                  {con === c && <motion.span layoutId="con-pill" className="absolute inset-0 bg-ice-300" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                  <span className={`relative ${con === c ? 'text-void' : 'text-white/60'}`}>{c.toUpperCase()}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className="clip-angle relative flex items-center justify-between overflow-hidden border border-white/10 px-5 py-4 text-start"
                >
                  {mode === m.id && (
                    <motion.span layoutId="mode-bg" className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                  )}
                  <span className="relative font-display text-xl">{m.label}</span>
                  <span className="relative font-condensed text-xl text-white/80">
                    {t.slots.fromPrice} <AnimatedPrice value={Math.round(PRICES[con][m.id] * 0.8)} />
                  </span>
                </button>
              ))}
            </div>

            {/* console illustration */}
            <div className="relative h-44 overflow-hidden border border-white/10 bg-night">
              <div className="stripes-bg absolute inset-0 opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center gap-6">
                <motion.div
                  key={con}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="relative h-28 w-20 rounded-t-[40px] rounded-b-md border-2 border-white/80 bg-gradient-to-b from-white/20 to-white/5"
                  style={con === 'ps4' ? { width: 120, height: 34, borderRadius: 6 } : undefined}
                >
                  <motion.span
                    className="absolute bottom-2 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full"
                    animate={{ backgroundColor: mode === 'secondary' ? ['#a9bcf0', '#2b4c8c', '#a9bcf0'] : ['#ff1a1a', '#8c0001', '#ff1a1a'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
                <div className="flex flex-col items-start gap-1 text-xs">
                  <AnimatePresence mode="wait">
                    <motion.div key={mode + con} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex max-w-[220px] flex-col gap-2">
                      <span className="flex items-center gap-1 text-ice-300">
                        <PSShape shape={mode === 'primary' ? 'circle' : mode === 'secondary' ? 'triangle' : 'square'} className="h-4 w-4" />
                        {modes.find((m) => m.id === mode)!.label} · {con.toUpperCase()}
                      </span>
                      <span className="leading-relaxed text-white/60">
                        {mode === 'secondary' ? t.slots.noteSecondary : t.slots.notePrimary}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* comparison table */}
          <div className="clip-angle border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 sm:p-8">
            <ul className="flex flex-col">
              {rows.map((r, i) => {
                const on = FEATURES[mode][i]
                return (
                  <li key={i} className="flex items-center justify-between gap-4 border-b border-white/10 py-5 last:border-0">
                    <span className="text-white/80">{r}</span>
                    <motion.span
                      key={mode + i}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: i * 0.06 }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 ${
                        i === 3 ? (mode === 'full' ? 'border-white/20 text-white/30' : 'border-ice-400 text-ice-300') : on ? 'border-red-500 bg-red-600/20 text-red-400' : 'border-white/20 text-white/30'
                      }`}
                    >
                      {i === 3 ? (mode === 'full' ? '—' : '!') : on ? '✓' : '✕'}
                    </motion.span>
                  </li>
                )
              })}
              <li className="flex items-center justify-between pt-6">
                <span className="font-condensed text-2xl tracking-wider text-white/60 uppercase">{t.slots.rows.price}</span>
                <AnimatedPrice value={PRICES[con][mode]} className="font-display text-4xl text-red-500 text-glow" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
