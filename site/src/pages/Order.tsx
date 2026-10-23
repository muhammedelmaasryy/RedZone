import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { operators, WHATSAPP } from '../data/content'
import { gameById, slotLabel } from '../data/games'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { FakeQR } from '../components/FakeQR'
import { GameCover } from '../components/GameCover'
import { MagneticButton } from '../components/fx/MagneticButton'
import { Icon } from '../components/Icon'

// Delivery flow:
// Stage 1: Mandatory Game Account Instructions & Rules (after payment, before QR/PIN)
// Stage 2: Submit Console Sign-In via either QR Code or PIN Code
// Stage 3: Operator Approving
// Stage 4: Delivered & Confirmed
type Stage = 1 | 2 | 3 | 4
type SignInMode = 'qr' | 'pin'
const QR_TTL = 120

export default function Order() {
  const { id } = useParams()
  const { t, l, num, egp } = useI18n()
  const order = useStore((s) => s.order)
  const user = useStore((s) => s.user)

  const [stage, setStage] = useState<Stage>(1)
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [rulesErr, setRulesErr] = useState(false)
  const [signInMode, setSignInMode] = useState<SignInMode>('qr')
  const [ttl, setTtl] = useState(QR_TTL)
  const [code, setCode] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [cam, setCam] = useState<'off' | 'on' | 'denied'>('off')
  const [confirmed, setConfirmed] = useState(false)

  const topRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const operator = operators[(id?.charCodeAt(4) ?? 0) % operators.length]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [stage])

  useEffect(() => {
    if (stage !== 2) return
    const h = setInterval(() => setTtl((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(h)
  }, [stage])

  useEffect(() => {
    if (stage !== 3) return
    const h = setTimeout(() => {
      setStage(4)
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#ff1a1a', '#bdc9e7', '#ffffff', '#22c55e'],
      })
    }, 3800)
    return () => clearTimeout(h)
  }, [stage])

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
    setCam('off')
  }
  useEffect(() => () => streamRef.current?.getTracks().forEach((tr) => tr.stop()), [])

  const openCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = s
      setCam('on')
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = s
      })
    } catch {
      setCam('denied')
    }
  }

  const proceedToSignIn = () => {
    if (!rulesAccepted) {
      setRulesErr(true)
      setTimeout(() => setRulesErr(false), 600)
      return
    }
    setTtl(QR_TTL)
    setStage(2)
  }

  const submitSignIn = () => {
    stopCam()
    setStage(3)
  }

  const simulatePin = () => {
    setPinCode('849205')
    setTimeout(() => {
      stopCam()
      setStage(3)
    }, 350)
  }

  const restart = () => {
    stopCam()
    setStage(1)
    setRulesAccepted(false)
    setConfirmed(false)
    setCode('')
    setPinCode('')
  }

  const items = order?.items ?? []
  const first = items[0] ? gameById(items[0].gameId) : gameById('fc27')
  const slot = items[0]?.slot ?? 'ps5Primary'
  const customerName = order?.name ?? user?.name
  const customerPhone = order?.phone ?? user?.phone

  return (
    <div ref={topRef} className="relative min-h-screen pt-28 pb-24">
      <div className="stripes-bg pointer-events-none absolute inset-x-0 top-0 h-[400px] opacity-25 [mask-image:linear-gradient(black,transparent)]" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <div className="text-sm text-white/50">{t.order.id}</div>
            <h1 className="font-display text-4xl sm:text-5xl" dir="ltr">
              {id}
            </h1>
            {customerName && (
              <div className="mt-1 flex items-center gap-2 text-xs text-ice-300">
                <Icon name="user" className="h-3.5 w-3.5 text-red-500" />
                <span>{customerName}</span>
                {customerPhone && (
                  <span className="font-mono text-white/50" dir="ltr">
                    · {customerPhone}
                  </span>
                )}
              </div>
            )}
          </div>
          {first && (
            <div className="flex items-center gap-3 border border-white/10 bg-night p-2 pe-4">
              <GameCover game={first} className="h-14 w-11" />
              <div className="text-sm">
                <div className="font-bold" dir="ltr" style={{ textAlign: 'start' }}>
                  {first.short}
                  {items.length > 1 ? ` +${items.length - 1}` : ''}
                </div>
                <div className="text-xs text-ice-300">{l(slotLabel[slot])}</div>
                {order && <div className="text-xs text-white/50">{egp(order.total)}</div>}
              </div>
            </div>
          )}
        </motion.div>

        {/* Stepper */}
        <div className="mb-10 grid grid-cols-5 gap-1 sm:gap-2">
          {t.order.steps.map((s, i) => {
            const done = i < stage || (i === 4 && stage === 4)
            const active = i === stage && stage !== 4
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="relative h-1.5 overflow-hidden bg-white/10">
                  <motion.div
                    className="absolute inset-y-0 start-0 bg-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: done ? '100%' : active ? '50%' : '0%' }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <div className={`text-[10px] sm:text-xs ${done ? 'text-white' : active ? 'text-red-400' : 'text-white/30'}`}>
                  <span className="inline-flex items-center gap-1">
                    {done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
                    {s}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="clip-angle relative min-h-[460px] overflow-hidden border border-white/10 bg-night p-5 sm:p-10">
          <AnimatePresence mode="wait">
            {/* ===============================================================
                STAGE 1: MANDATORY GAME ACCOUNT INSTRUCTIONS BEFORE QR / PIN
               =============================================================== */}
            {stage === 1 && (
              <motion.div
                key="s1-rules"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="flex flex-col gap-6"
              >
                {/* Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-500/50 bg-red-600/20 text-red-500 shadow-[0_0_25px_rgba(229,0,0,0.3)]">
                      <Icon name="gamepad" className="h-6 w-6" />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl text-white sm:text-3xl">{t.order.rulesTitle}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-ice-300 sm:text-sm">{t.order.rulesSub}</p>
                    </div>
                  </div>
                </div>

                {/* 2-Column Grid for Primary Rules & General Terms */}
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Section 1: Primary Account Rules */}
                  <div className="flex flex-col gap-3.5 border border-ice-300/25 bg-void/70 p-5">
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-ice-300/15 text-ice-300">
                        <Icon name="shield" className="h-4 w-4" />
                      </span>
                      <h3 className="font-display text-base text-ice-300 sm:text-lg">{t.order.primaryTitle}</h3>
                    </div>
                    <ul className="flex flex-col gap-3 text-sm leading-relaxed text-white/85">
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                          <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span>{t.order.primaryRules[0]}</span>
                      </li>
                      <li className="flex items-start gap-2.5 border-s-2 border-ice-300 bg-ice-300/5 py-1.5 ps-2.5 pe-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ice-300/20 text-ice-300">
                          <Icon name="users" className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-semibold text-white">{t.order.primaryRules[1]}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                          <Icon name="ban" className="h-3.5 w-3.5" />
                        </span>
                        <span>{t.order.primaryRules[2]}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                          <Icon name="x" className="h-3.5 w-3.5" />
                        </span>
                        <span>{t.order.primaryRules[3]}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Section 2: General & Critical Terms */}
                  <div className="flex flex-col gap-3.5 border border-red-500/30 bg-void/70 p-5">
                    <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-600/20 text-red-500">
                        <Icon name="alert" className="h-4 w-4" />
                      </span>
                      <h3 className="font-display text-base text-red-400 sm:text-lg">{t.order.generalTitle}</h3>
                    </div>
                    <ul className="flex flex-col gap-3 text-sm leading-relaxed text-white/85">
                      <li className="flex items-start gap-2.5 border-s-2 border-red-500 bg-red-600/10 py-1.5 ps-2.5 pe-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                          <Icon name="refresh" className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-semibold text-white">{t.order.generalRules[0]}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                          <Icon name="ban" className="h-3.5 w-3.5" />
                        </span>
                        <span>{t.order.generalRules[1]}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                          <Icon name="lock" className="h-3.5 w-3.5" />
                        </span>
                        <span>{t.order.generalRules[2]}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                          <Icon name="x" className="h-3.5 w-3.5" />
                        </span>
                        <span>{t.order.generalRules[3]}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 3: Before Formatting or Selling Console */}
                <div className="border border-red-500/40 bg-gradient-to-r from-blood/80 via-night to-blood/80 p-5">
                  <div className="flex items-center gap-2.5 font-display text-lg text-red-400">
                    <Icon name="alert" className="h-5 w-5 text-red-500" />
                    <span>{t.order.formatTitle}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-white/80">{t.order.formatIntro}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-3 border border-white/10 bg-void/80 p-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-600/20 text-red-400">
                        <Icon name="video" className="h-5 w-5" />
                      </span>
                      <div className="text-xs leading-relaxed sm:text-sm">
                        <div className="font-bold text-ice-300">{t.order.formatPrimaryLabel}</div>
                        <div className="mt-0.5 text-white/80">{t.order.formatPrimaryText}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border border-white/10 bg-void/80 p-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-ice-300/15 text-ice-300">
                        <Icon name="users" className="h-5 w-5" />
                      </span>
                      <div className="text-xs leading-relaxed sm:text-sm">
                        <div className="font-bold text-ice-300">{t.order.formatSecondaryLabel}</div>
                        <div className="mt-0.5 text-white/80">{t.order.formatSecondaryText}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2.5 border border-red-500/40 bg-red-600/15 px-4 py-3 text-xs font-bold text-red-200 sm:text-sm">
                    <Icon name="alert" className="h-5 w-5 shrink-0 text-red-400" />
                    <span>{t.order.formatWarning}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70 sm:text-sm">
                    <span>{t.order.formatFooter}</span>
                    <a
                      href={WHATSAPP}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 border border-ice-300/30 bg-white/5 px-3 py-1.5 text-xs font-bold text-ice-300 transition hover:border-red-500 hover:text-white"
                    >
                      <Icon name="chat" className="h-3.5 w-3.5 text-red-500" />
                      <span>{t.order.askWhatsapp}</span>
                    </a>
                  </div>
                </div>

                {/* Mandatory Acceptance Checkbox & Continue CTA */}
                <div className="flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <motion.label
                    animate={rulesErr ? { x: [0, -10, 10, -6, 6, 0] } : {}}
                    className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-white"
                  >
                    <input
                      type="checkbox"
                      checked={rulesAccepted}
                      onChange={(e) => setRulesAccepted(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 transition ${
                        rulesAccepted
                          ? 'border-red-500 bg-red-600 text-white'
                          : rulesErr
                            ? 'border-red-500 bg-red-500/20'
                            : 'border-white/35 bg-void'
                      }`}
                    >
                      {rulesAccepted && <Icon name="check" className="h-4 w-4" strokeWidth={3} />}
                    </span>
                    <span>{t.order.acceptCheck}</span>
                  </motion.label>

                  <button
                    type="button"
                    onClick={proceedToSignIn}
                    className={`clip-angle-sm inline-flex items-center justify-center gap-2 px-6 py-4 font-display text-sm tracking-wide text-white transition ${
                      rulesAccepted
                        ? 'bg-red-600 shadow-[0_0_30px_rgba(229,0,0,0.45)] hover:bg-red-500'
                        : 'bg-white/10 text-white/50 hover:bg-white/15'
                    }`}
                  >
                    <span>{t.order.acceptBtn}</span>
                    <span className="rtl:rotate-180">→</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ===============================================================
                STAGE 2: CONSOLE SIGN-IN SUBMISSION (QR CODE OR PIN CODE)
               =============================================================== */}
            {stage === 2 && (
              <motion.div
                key="s2-signin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-6"
              >
                {/* Top Bar: QR Code vs PIN Code Mode Switcher + Review Rules Button */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex border border-white/15 bg-void p-1">
                    <button
                      type="button"
                      onClick={() => setSignInMode('qr')}
                      className="relative flex items-center gap-2 px-5 py-2.5 font-display text-xs sm:text-sm"
                    >
                      {signInMode === 'qr' && (
                        <motion.span
                          layoutId="signin-mode-pill"
                          className="absolute inset-0 bg-red-600 shadow-[0_0_20px_rgba(229,0,0,0.4)]"
                          transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                        />
                      )}
                      <Icon
                        name="qr"
                        className={`relative z-10 h-4 w-4 ${signInMode === 'qr' ? 'text-white' : 'text-ice-300'}`}
                      />
                      <span className={`relative z-10 ${signInMode === 'qr' ? 'text-white' : 'text-white/60'}`}>
                        {t.order.modeQr}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopCam()
                        setSignInMode('pin')
                      }}
                      className="relative flex items-center gap-2 px-5 py-2.5 font-display text-xs sm:text-sm"
                    >
                      {signInMode === 'pin' && (
                        <motion.span
                          layoutId="signin-mode-pill"
                          className="absolute inset-0 bg-red-600 shadow-[0_0_20px_rgba(229,0,0,0.4)]"
                          transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                        />
                      )}
                      <Icon
                        name="key"
                        className={`relative z-10 h-4 w-4 ${signInMode === 'pin' ? 'text-white' : 'text-ice-300'}`}
                      />
                      <span className={`relative z-10 ${signInMode === 'pin' ? 'text-white' : 'text-white/60'}`}>
                        {t.order.modePin}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      stopCam()
                      setStage(1)
                    }}
                    className="inline-flex items-center gap-2 border border-ice-300/25 bg-white/5 px-3.5 py-2 text-xs font-semibold text-ice-300 transition hover:border-red-500 hover:text-white"
                  >
                    <Icon name="shield" className="h-4 w-4 text-red-500" />
                    <span>{t.order.viewRules}</span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {signInMode === 'qr' ? (
                    /* ----------------- OPTION A: QR CODE MODE ----------------- */
                    <motion.div
                      key="mode-qr"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.25 }}
                      className="grid items-center gap-8 md:grid-cols-2"
                    >
                      <div className="flex flex-col gap-4">
                        <h2 className="font-display text-2xl sm:text-3xl">{t.order.scanTitle}</h2>
                        <p className="text-sm leading-relaxed text-white/60">{t.order.scanSub}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-white/50">{t.order.expires}</span>
                          <div className="relative h-12 w-12">
                            <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
                              <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,.1)" strokeWidth="4" fill="none" />
                              <motion.circle
                                cx="20"
                                cy="20"
                                r="17"
                                stroke={ttl < 30 ? '#ff1a1a' : '#a9bcf0'}
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                pathLength={1}
                                strokeDasharray="1 1"
                                animate={{ strokeDashoffset: 1 - ttl / QR_TTL }}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center font-display text-xs">
                              {num(ttl)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <MagneticButton onClick={submitSignIn} strength={0.15}>
                            {t.order.simulate}
                          </MagneticButton>
                          {cam !== 'on' && (
                            <MagneticButton onClick={openCam} variant="ghost" strength={0.15}>
                              <Icon name="camera" /> {t.order.openCam}
                            </MagneticButton>
                          )}
                        </div>
                        {cam === 'denied' && <p className="text-sm text-red-400">{t.order.camDenied}</p>}
                        <div className="mt-2">
                          <div className="mb-1 text-xs text-white/40">{t.order.manual}</div>
                          <div className="flex gap-2" dir="ltr">
                            <input
                              value={code}
                              onChange={(e) => setCode(e.target.value.toUpperCase())}
                              maxLength={8}
                              placeholder="XXX-XXX"
                              className="flex-1 border border-white/15 bg-void px-4 py-2 font-mono tracking-widest focus:border-red-500 focus:outline-none"
                            />
                            <button
                              onClick={() => code.length >= 4 && submitSignIn()}
                              className="bg-white/10 px-4 text-sm hover:bg-red-600"
                            >
                              {t.order.manualBtn}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl bg-black">
                        {cam === 'on' ? (
                          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0b1a3a] to-black p-10">
                            <FakeQR seed={(id?.length ?? 3) * 7} className="w-full rounded opacity-90" />
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-6">
                          {[
                            'top-0 left-0 border-t-4 border-l-4',
                            'top-0 right-0 border-t-4 border-r-4',
                            'bottom-0 left-0 border-b-4 border-l-4',
                            'bottom-0 right-0 border-b-4 border-r-4',
                          ].map((c) => (
                            <span key={c} className={`absolute h-8 w-8 border-red-500 ${c}`} />
                          ))}
                          <motion.div
                            className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_16px_#ff1a1a]"
                            animate={{ top: ['2%', '98%', '2%'] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* ----------------- OPTION B: PIN CODE MODE ----------------- */
                    <motion.div
                      key="mode-pin"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                      className="grid items-center gap-8 md:grid-cols-2"
                    >
                      <div className="flex flex-col gap-4">
                        <h2 className="font-display text-2xl sm:text-3xl">{t.order.pinTitle}</h2>
                        <p className="text-sm leading-relaxed text-white/60">{t.order.pinSub}</p>

                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-white/50">{t.order.expires}</span>
                          <div className="relative h-12 w-12">
                            <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
                              <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,.1)" strokeWidth="4" fill="none" />
                              <motion.circle
                                cx="20"
                                cy="20"
                                r="17"
                                stroke={ttl < 30 ? '#ff1a1a' : '#a9bcf0'}
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                pathLength={1}
                                strokeDasharray="1 1"
                                animate={{ strokeDashoffset: 1 - ttl / QR_TTL }}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center font-display text-xs">
                              {num(ttl)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-1 flex flex-col gap-2">
                          <label className="text-xs font-semibold text-ice-300">{t.order.pinLabel}</label>
                          <div className="flex gap-2" dir="ltr">
                            <input
                              value={pinCode}
                              onChange={(e) => setPinCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                              maxLength={8}
                              placeholder="849205"
                              autoFocus
                              className="w-full border border-ice-300/30 bg-void px-4 py-3.5 text-center font-mono text-2xl font-bold tracking-[0.38em] text-white placeholder:text-white/15 focus:border-red-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => pinCode.length >= 4 && submitSignIn()}
                            disabled={pinCode.length < 4}
                            className={`clip-angle-sm flex-1 px-6 py-3.5 font-display text-sm tracking-wide text-white transition ${
                              pinCode.length >= 4
                                ? 'bg-red-600 shadow-[0_0_25px_rgba(229,0,0,0.4)] hover:bg-red-500'
                                : 'cursor-not-allowed bg-white/10 text-white/35'
                            }`}
                          >
                            {t.order.pinSubmit}
                          </button>
                          <MagneticButton onClick={simulatePin} variant="ghost" strength={0.15}>
                            {t.order.pinSimulate}
                          </MagneticButton>
                        </div>
                      </div>

                      {/* Visual Console PIN HUD Preview Card */}
                      <div className="relative mx-auto flex aspect-square w-full max-w-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-ice-300/25 bg-gradient-to-br from-[#140308] via-void to-black p-6 shadow-2xl">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/40 bg-red-600/15 text-red-500 shadow-[0_0_25px_rgba(229,0,0,0.3)]">
                          <Icon name="key" className="h-7 w-7" />
                        </div>
                        <div className="font-mono text-xs tracking-[0.25em] text-ice-300 uppercase" dir="ltr">
                          PSN PIN VERIFICATION
                        </div>

                        {/* 6 Segmented PIN Display Slots */}
                        <div className="mt-5 grid grid-cols-6 gap-2" dir="ltr">
                          {Array.from({ length: 6 }).map((_, idx) => {
                            const ch = pinCode[idx] ?? ''
                            const isCurrent = idx === pinCode.length
                            return (
                              <div
                                key={idx}
                                className={`flex h-12 w-9 items-center justify-center rounded border font-mono text-lg font-bold transition ${
                                  ch
                                    ? 'border-red-500 bg-red-600/20 text-white shadow-[0_0_12px_rgba(229,0,0,0.35)]'
                                    : isCurrent
                                      ? 'border-ice-300 bg-white/5 text-ice-300'
                                      : 'border-white/15 bg-void text-white/30'
                                }`}
                              >
                                {ch || '•'}
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] text-white/60">
                          <Icon name="shield" className="h-3.5 w-3.5 text-red-500" />
                          <span>{t.hero.s2Badge}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ===============================================================
                STAGE 3: OPERATOR APPROVING SIGN-IN
               =============================================================== */}
            {stage === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex min-h-[380px] flex-col items-center justify-center gap-6 text-center"
              >
                <div className="relative">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-red-500"
                      animate={{ scale: [1, 2.6], opacity: [0.7, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                    />
                  ))}
                  <img src="/brand/favicon.png" alt="" className="relative h-24 w-24 rounded-full ring-4 ring-red-600" />
                </div>
                <div className="font-display text-xl sm:text-2xl">{t.order.approving}</div>
                <div className="flex items-center gap-2 text-sm text-white/50">{operator} · Red Zone</div>
                <div className="h-1.5 w-64 overflow-hidden bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-700 to-red-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3.6, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            )}

            {/* ===============================================================
                STAGE 4: DELIVERED & WARRANTY STARTED
               =============================================================== */}
            {stage === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[380px] flex-col items-center justify-center gap-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-[0_0_60px_rgba(34,197,94,0.6)]"
                >
                  <Icon name="check" className="h-12 w-12" strokeWidth={3} />
                </motion.div>
                <h2 className="font-display text-3xl sm:text-4xl">{t.order.done}</h2>
                <p className="text-sm text-white/50">
                  {t.order.operator} {operator}
                </p>
                <AnimatePresence mode="wait">
                  {!confirmed ? (
                    <motion.div key="btn" exit={{ opacity: 0, scale: 0.8 }}>
                      <MagneticButton onClick={() => setConfirmed(true)}>{t.order.confirm}</MagneticButton>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="ok"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-md border border-green-500/40 bg-green-500/10 px-5 py-3 text-green-300"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon name="shield" className="h-5 w-5 shrink-0" />
                        {t.order.confirmed}
                      </span>
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <button
                    onClick={() => setStage(1)}
                    className="inline-flex items-center gap-1.5 text-ice-300 hover:text-white"
                  >
                    <Icon name="shield" className="h-3.5 w-3.5" />
                    {t.order.viewRules}
                  </button>
                  <button
                    onClick={restart}
                    className="inline-flex items-center gap-1.5 text-white/50 hover:text-white"
                  >
                    <Icon name="refresh" className="h-3.5 w-3.5" />
                    {t.order.restart}
                  </button>
                  <Link to="/games" className="text-red-400 hover:text-red-300">
                    {t.order.shop}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
