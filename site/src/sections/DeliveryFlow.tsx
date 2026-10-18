import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { FakeQR } from '../components/FakeQR'
import { PSShape } from '../components/fx/Shapes'
import { games } from '../data/games'
import { GameCover } from '../components/GameCover'

// Pinned scroll story: pay → scan console QR → Red Zone approves → play.
export function DeliveryFlow() {
  const { t, num } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => setStep(Math.min(3, Math.floor(p * 4.2))))
  const bar = useTransform(scrollYProgress, [0, 0.95], ['0%', '100%'])

  return (
    <section id="how" ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="stripes-bg absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(140,0,1,0.35),transparent_60%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pt-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* steps */}
          <div>
            <div className="mb-3 flex items-center gap-3 text-red-500">
              <span className="h-px w-10 bg-red-500" />
              <span className="font-condensed text-xl tracking-[0.2em] uppercase">{t.how.kicker}</span>
            </div>
            <h2 className="mb-6 font-display text-3xl leading-tight sm:text-5xl">{t.how.title}</h2>
            <div className="relative flex gap-5">
              <div className="relative w-1 shrink-0 bg-white/10">
                <motion.div style={{ height: bar }} className="absolute inset-x-0 top-0 bg-red-500 glow" />
              </div>
              <ol className="flex flex-col gap-3 sm:gap-5">
                {t.how.steps.map((s, i) => (
                  <motion.li
                    key={i}
                    animate={{ opacity: step === i ? 1 : step > i ? 0.55 : 0.3, x: step === i ? 8 : 0 }}
                    className="flex gap-4"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 font-display ${step >= i ? 'border-red-500 bg-red-600 text-white' : 'border-white/20 text-white/40'}`}>
                      {step > i ? '✓' : num(i + 1)}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg sm:text-xl">{s.t}</h3>
                        <span className="rounded-full bg-ice-300/10 px-2 py-0.5 text-[11px] text-ice-300">{t.how.time[i]}</span>
                      </div>
                      <AnimatePresence initial={false}>
                        {step === i && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden text-sm leading-relaxed text-white/60"
                          >
                            {s.d}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
            <p className="mt-6 hidden max-w-md border-s-2 border-ice-400 ps-4 text-sm text-ice-300/80 sm:block">{t.how.why}</p>
          </div>

          {/* stage */}
          <div className="relative mx-auto h-[300px] w-full max-w-[560px] sm:h-[420px]" dir="ltr">
            {/* TV */}
            <div className="absolute top-0 right-0 w-[78%]">
              <div className="relative aspect-video overflow-hidden rounded-md border-[6px] border-[#1a1a1f] bg-[#07070a] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                <AnimatePresence mode="wait">
                  {step <= 0 && (
                    <motion.div key="idle" className="absolute inset-0 flex items-center justify-center gap-3" exit={{ opacity: 0 }}>
                      {(['triangle', 'circle', 'cross', 'square'] as const).map((s, i) => (
                        <motion.div key={s} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}>
                          <PSShape shape={s} className="h-6 w-6 text-ice-300" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  {(step === 1 || step === 2) && (
                    <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center gap-6 bg-gradient-to-br from-[#0b1a3a] to-[#05050c] p-4">
                      <div className="hidden text-left text-[10px] text-white/70 sm:block">
                        <div className="mb-1 text-sm font-bold text-white">Sign In</div>
                        Scan the QR code with<br />your mobile device
                        <div className="mt-2 font-mono text-ice-300">Code: RZ7-K2M</div>
                      </div>
                      <div className="relative">
                        <FakeQR seed={7} className="h-24 w-24 rounded sm:h-32 sm:w-32" />
                        {step === 2 && (
                          <motion.div className="absolute inset-0 rounded border-4 border-green-400" initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />
                        )}
                      </div>
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div key="lib" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-br from-[#2a0000] to-[#050001] p-3">
                      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-2 flex items-center gap-2 text-[10px] text-white sm:text-xs">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px]">✓</span>
                        Signed in · Welcome back
                      </motion.div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {games.slice(0, 4).map((g, i) => (
                          <motion.div key={g.id} initial={{ y: 20, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.1, type: 'spring' }}>
                            <GameCover game={g} className="aspect-[3/4] w-full [&_div.font-display]:!text-[9px]" />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mx-auto h-3 w-24 bg-[#1a1a1f]" />
              <div className="mx-auto h-1.5 w-40 rounded-full bg-[#1a1a1f]" />
            </div>

            {/* beam phone → TV */}
            <AnimatePresence>
              {step === 2 && (
                <motion.svg key="beam" className="absolute inset-0 h-full w-full" viewBox="0 0 560 420" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.path
                    d="M 120 260 C 200 180, 260 160, 330 140"
                    fill="none"
                    stroke="#ff1a1a"
                    strokeWidth="3"
                    strokeDasharray="8 10"
                    animate={{ strokeDashoffset: [0, -36] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                    style={{ filter: 'drop-shadow(0 0 6px #ff1a1a)' }}
                  />
                </motion.svg>
              )}
            </AnimatePresence>

            {/* Phone */}
            <motion.div
              animate={{ rotate: step === 1 ? -4 : 0, y: step === 1 ? -10 : 0 }}
              className="absolute bottom-0 left-0 w-[34%] max-w-[170px] rounded-[22px] border-[5px] border-[#1a1a1f] bg-[#0b0b10] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
            >
              <div className="relative aspect-[9/17] overflow-hidden rounded-[16px] bg-night">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="pay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-1.5 p-2 text-[9px]">
                      <div className="font-bold text-white">Checkout</div>
                      {['Vodafone Cash', 'InstaPay', 'Fawry'].map((m, i) => (
                        <div key={m} className={`rounded border px-1.5 py-1 ${i === 0 ? 'border-red-500 bg-red-600/20' : 'border-white/10'}`}>{m}</div>
                      ))}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring' }}
                        className="mt-auto flex flex-col items-center gap-1 rounded bg-green-500/15 p-2 text-green-300"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">✓</span>
                        PAID
                      </motion.div>
                    </motion.div>
                  )}
                  {step === 1 && (
                    <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full bg-black">
                      <div className="absolute inset-3 top-8 bottom-12 rounded border-2 border-white/30">
                        {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((c) => (
                          <span key={c} className={`absolute h-4 w-4 border-red-500 ${c}`} />
                        ))}
                        <FakeQR seed={7} animate={false} className="absolute inset-3 m-auto opacity-80" />
                        <motion.div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ff1a1a]" animate={{ top: ['5%', '95%', '5%'] }} transition={{ duration: 1.8, repeat: Infinity }} />
                      </div>
                      <div className="absolute inset-x-0 bottom-3 text-center text-[8px] text-white/70">Scanning…</div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="appr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-[9px]">
                      <div className="relative">
                        <motion.span className="absolute inset-0 rounded-full bg-red-500" animate={{ scale: [1, 2.2], opacity: [0.6, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />
                        <img src="/brand/favicon.png" className="relative h-10 w-10 rounded-full ring-2 ring-red-500" alt="" />
                      </div>
                      <div className="text-white">Red Zone</div>
                      <div className="text-white/60">Approving…</div>
                      <div className="h-1 w-full overflow-hidden rounded bg-white/10">
                        <motion.div className="h-full bg-red-500" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} />
                      </div>
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-[9px]">
                      <motion.span initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring' }} className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-xl text-white">✓</motion.span>
                      <div className="font-bold text-white">Delivered</div>
                      <div className="rounded bg-red-600 px-2 py-1 text-white">I'm signed in</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
