import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useI18n } from '../i18n'
import { FakeQR } from '../components/FakeQR'
import { PSShape } from '../components/fx/Shapes'
import { games } from '../data/games'
import { GameCover } from '../components/GameCover'
import { Icon } from '../components/Icon'

// Interactive button-driven QR Delivery story: pay → scan console QR → Red Zone approves → play.
export function DeliveryFlow() {
  const { t, num } = useI18n()
  const [step, setStep] = useState(0)
  const totalSteps = t.how.steps.length
  const barPercent = `${((step + 1) / totalSteps) * 100}%`

  const nextStep = () => setStep((prev) => (prev + 1) % totalSteps)
  const prevStep = () => setStep((prev) => (prev - 1 + totalSteps) % totalSteps)

  return (
    <section id="how" className="relative overflow-hidden border-t border-white/5 py-16 sm:py-24">
      <div className="stripes-bg pointer-events-none absolute inset-0 opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(140,0,1,0.35),transparent_60%)]" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Interactive Steps Column */}
        <div>
          <div className="mb-3 flex items-center gap-3 text-ice-300">
            <span className="h-px w-10 bg-gradient-to-r from-red-500 to-ice-300 rtl:bg-gradient-to-l" />
            <span className="font-condensed text-xl tracking-[0.2em] uppercase">{t.how.kicker}</span>
          </div>
          <h2 className="mb-6 font-display text-3xl leading-tight sm:text-5xl">{t.how.title}</h2>

          <div className="relative flex gap-4 sm:gap-5">
            <div className="relative w-1 shrink-0 bg-white/10">
              <motion.div
                animate={{ height: barPercent }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-x-0 top-0 bg-red-500 glow"
              />
            </div>

            <ol className="flex flex-1 flex-col gap-2.5 sm:gap-3.5">
              {t.how.steps.map((s, i) => {
                const isAct = step === i
                const isDone = step > i
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      className={`group flex w-full items-start gap-3.5 border p-3 text-start transition sm:p-4 ${
                        isAct
                          ? 'border-red-500/80 bg-red-600/15 shadow-[0_0_24px_rgba(229,0,0,0.2)]'
                          : 'border-white/10 bg-night/60 hover:border-white/30 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 font-display text-sm transition ${
                          isAct
                            ? 'border-red-500 bg-red-600 text-white'
                            : isDone
                              ? 'border-red-500/60 bg-red-600/30 text-white'
                              : 'border-white/20 text-white/50 group-hover:border-white/40 group-hover:text-white'
                        }`}
                      >
                        {isDone ? <Icon name="check" className="h-4 w-4" strokeWidth={3} /> : num(i + 1)}
                      </span>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className={`font-display text-base sm:text-lg ${isAct ? 'text-white' : 'text-white/75'}`}>
                            {s.t}
                          </h3>
                          <span className="rounded-full bg-ice-300/10 px-2.5 py-0.5 text-[11px] font-semibold text-ice-300">
                            {t.how.time[i]}
                          </span>
                        </div>
                        <AnimatePresence initial={false}>
                          {isAct && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-1.5 overflow-hidden text-xs leading-relaxed text-white/70 sm:text-sm"
                            >
                              {s.d}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Interactive Step Navigation Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:border-red-500 hover:bg-red-600 sm:text-sm"
              >
                <span className="ltr:rotate-180">→</span>
                <span>{t.how.prevStep}</span>
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="clip-angle-sm inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 font-display text-xs text-white shadow-[0_0_24px_rgba(229,0,0,0.4)] transition hover:bg-red-500 sm:text-sm"
              >
                <span>{t.how.nextStep}</span>
                <span className="rtl:rotate-180">→</span>
              </button>
            </div>

            <span className="font-condensed text-sm tracking-widest text-ice-300 uppercase" dir="ltr">
              {num(step + 1)} / {num(totalSteps)}
            </span>
          </div>

          <p className="mt-5 max-w-md border-s-2 border-ice-400 ps-4 text-xs text-ice-300/80 sm:text-sm">
            {t.how.why}
          </p>
        </div>

        {/* Interactive TV + Phone Stage */}
        <div className="relative mx-auto h-[300px] w-full max-w-[560px] sm:h-[420px]" dir="ltr">
          {/* TV */}
          <div className="absolute top-0 right-0 w-[78%]">
            <div className="relative aspect-video overflow-hidden rounded-md border-[6px] border-[#1a1a1f] bg-[#07070a] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              <AnimatePresence mode="wait">
                {step <= 0 && (
                  <motion.div
                    key="idle"
                    className="absolute inset-0 flex items-center justify-center gap-3"
                    exit={{ opacity: 0 }}
                  >
                    {(['triangle', 'circle', 'cross', 'square'] as const).map((s, i) => (
                      <motion.div
                        key={s}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
                      >
                        <PSShape shape={s} className="h-6 w-6 text-ice-300" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                {(step === 1 || step === 2) && (
                  <motion.div
                    key="qr"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center gap-6 bg-gradient-to-br from-[#0b1a3a] to-[#05050c] p-4"
                  >
                    <div className="hidden text-left text-[10px] text-white/70 sm:block">
                      <div className="mb-1 text-sm font-bold text-white">Sign In</div>
                      Scan the QR code with
                      <br />
                      your mobile device
                      <div className="mt-2 font-mono text-ice-300">Code: RZ7-K2M</div>
                    </div>
                    <div className="relative">
                      <FakeQR seed={7} className="h-24 w-24 rounded sm:h-32 sm:w-32" />
                      {step === 2 && (
                        <motion.div
                          className="absolute inset-0 rounded border-4 border-green-400"
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div
                    key="lib"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-[#2a0000] to-[#050001] p-3"
                  >
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mb-2 flex items-center gap-2 text-[10px] text-white sm:text-xs"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px]">
                        <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                      </span>
                      Signed in · Welcome back
                    </motion.div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {games.slice(0, 4).map((g, i) => (
                        <motion.div
                          key={g.id}
                          initial={{ y: 20, opacity: 0, scale: 0.8 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 + i * 0.1, type: 'spring' }}
                        >
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

          {/* Beam phone → TV */}
          <AnimatePresence>
            {step === 2 && (
              <motion.svg
                key="beam"
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 560 420"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.path
                  d="M 120 260 C 200 180, 260 160, 330 140"
                  fill="none"
                  stroke="#ff1a1a"
                  strokeWidth="3"
                  strokeDasharray="8 10"
                  animate={{ strokeDashoffset: [0, -36] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
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
                  <motion.div
                    key="pay"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full flex-col gap-1.5 p-2 text-[9px]"
                  >
                    <div className="font-bold text-white">Checkout</div>
                    {['Vodafone Cash', 'InstaPay', 'Fawry'].map((m, i) => (
                      <div
                        key={m}
                        className={`rounded border px-1.5 py-1 ${
                          i === 0 ? 'border-red-500 bg-red-600/20' : 'border-white/10'
                        }`}
                      >
                        {m}
                      </div>
                    ))}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.25, type: 'spring' }}
                      className="mt-auto flex flex-col items-center gap-1 rounded bg-green-500/15 p-2 text-green-300"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                        <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      PAID
                    </motion.div>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div
                    key="scan"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative h-full bg-black"
                  >
                    <div className="absolute inset-3 top-8 bottom-12 rounded border-2 border-white/30">
                      {[
                        'top-0 left-0 border-t-4 border-l-4',
                        'top-0 right-0 border-t-4 border-r-4',
                        'bottom-0 left-0 border-b-4 border-l-4',
                        'bottom-0 right-0 border-b-4 border-r-4',
                      ].map((c) => (
                        <span key={c} className={`absolute h-4 w-4 border-red-500 ${c}`} />
                      ))}
                      <FakeQR seed={7} animate={false} className="absolute inset-3 m-auto opacity-80" />
                      <motion.div
                        className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ff1a1a]"
                        animate={{ top: ['5%', '95%', '5%'] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-3 text-center text-[8px] text-white/70">Scanning…</div>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="appr"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-[9px]"
                  >
                    <div className="relative">
                      <motion.span
                        className="absolute inset-0 rounded-full bg-red-500"
                        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      <img src="/brand/favicon.png" className="relative h-10 w-10 rounded-full ring-2 ring-red-500" alt="" />
                    </div>
                    <div className="text-white">Red Zone</div>
                    <div className="text-white/60">Approving…</div>
                    <div className="h-1 w-full overflow-hidden rounded bg-white/10">
                      <motion.div
                        className="h-full bg-red-500"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5 }}
                      />
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-[9px]"
                  >
                    <motion.span
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: 'spring' }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white"
                    >
                      <Icon name="check" className="h-6 w-6" strokeWidth={3} />
                    </motion.span>
                    <div className="font-bold text-white">Delivered</div>
                    <div className="rounded bg-red-600 px-2 py-1 text-white">I&apos;m signed in</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
