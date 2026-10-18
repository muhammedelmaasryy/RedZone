import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { operators } from '../data/content'
import { gameById, slotLabel } from '../data/games'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { FakeQR } from '../components/FakeQR'
import { GameCover } from '../components/GameCover'
import { MagneticButton } from '../components/fx/MagneticButton'
import { Icon } from '../components/Icon'

// Simulated live delivery: reserved → waiting QR → approving → delivered.
type Stage = 1 | 2 | 3 | 4
const QR_TTL = 120

export default function Order() {
  const { id } = useParams()
  const { t, l, num, egp } = useI18n()
  const order = useStore((s) => s.order)
  const [stage, setStage] = useState<Stage>(1)
  const [ttl, setTtl] = useState(QR_TTL)
  const [code, setCode] = useState('')
  const [cam, setCam] = useState<'off' | 'on' | 'denied'>('off')
  const [confirmed, setConfirmed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const operator = operators[(id?.charCodeAt(4) ?? 0) % operators.length]

  useEffect(() => {
    if (stage !== 1) return
    const h = setTimeout(() => setStage(2), 1600)
    return () => clearTimeout(h)
  }, [stage])

  useEffect(() => {
    if (stage !== 2) return
    setTtl(QR_TTL)
    const h = setInterval(() => setTtl((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(h)
  }, [stage])

  useEffect(() => {
    if (stage !== 3) return
    const h = setTimeout(() => {
      setStage(4)
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 }, colors: ['#ff1a1a', '#bdc9e7', '#ffffff', '#22c55e'] })
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
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = s })
    } catch {
      setCam('denied')
    }
  }

  const scanned = () => { stopCam(); setStage(3) }
  const restart = () => { setStage(1); setConfirmed(false); setCode('') }

  const items = order?.items ?? []
  const first = items[0] ? gameById(items[0].gameId) : gameById('fc27')
  const slot = items[0]?.slot ?? 'ps5Primary'

  return (
    <div className="relative min-h-screen pt-28 pb-24">
      <div className="stripes-bg pointer-events-none absolute inset-x-0 top-0 h-[400px] opacity-25 [mask-image:linear-gradient(black,transparent)]" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-white/50">{t.order.id}</div>
            <h1 className="font-display text-4xl sm:text-5xl" dir="ltr">{id}</h1>
          </div>
          {first && (
            <div className="flex items-center gap-3 border border-white/10 bg-night p-2 pe-4">
              <GameCover game={first} className="h-14 w-11" />
              <div className="text-sm">
                <div className="font-bold" dir="ltr" style={{ textAlign: 'start' }}>{first.short}{items.length > 1 ? ` +${items.length - 1}` : ''}</div>
                <div className="text-xs text-ice-300">{l(slotLabel[slot])}</div>
                {order && <div className="text-xs text-white/50">{egp(order.total)}</div>}
              </div>
            </div>
          )}
        </motion.div>

        {/* stepper */}
        <div className="mb-10 grid grid-cols-5 gap-1 sm:gap-2">
          {t.order.steps.map((s, i) => {
            const done = i < stage || (i === 4 && stage === 4)
            const active = i === stage && stage !== 4
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="relative h-1.5 overflow-hidden bg-white/10">
                  <motion.div className="absolute inset-y-0 start-0 bg-red-500" initial={{ width: 0 }} animate={{ width: done ? '100%' : active ? '50%' : '0%' }} transition={{ duration: 0.6 }} />
                </div>
                <div className={`text-[10px] sm:text-xs ${done ? 'text-white' : active ? 'text-red-400' : 'text-white/30'}`}>
                  <span className="inline-flex items-center gap-1">{done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}{s}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="clip-angle relative min-h-[460px] overflow-hidden border border-white/10 bg-night p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {stage === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="flex min-h-[380px] flex-col items-center justify-center gap-6 text-center">
                <div className="relative h-24 w-24">
                  <motion.span className="absolute inset-0 border-4 border-red-500" animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} style={{ borderRadius: '30%' }} />
                  <span className="absolute inset-4 flex items-center justify-center rounded-full bg-red-600"><Icon name="gamepad" className="h-8 w-8" /></span>
                </div>
                <div className="font-display text-2xl">{t.order.steps[1]}…</div>
              </motion.div>
            )}

            {stage === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid items-center gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <h2 className="font-display text-2xl sm:text-3xl">{t.order.scanTitle}</h2>
                  <p className="text-sm leading-relaxed text-white/60">{t.order.scanSub}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white/50">{t.order.expires}</span>
                    <div className="relative h-12 w-12">
                      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
                        <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,.1)" strokeWidth="4" fill="none" />
                        <motion.circle cx="20" cy="20" r="17" stroke={ttl < 30 ? '#ff1a1a' : '#a9bcf0'} strokeWidth="4" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" animate={{ strokeDashoffset: 1 - ttl / QR_TTL }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-display text-xs">{num(ttl)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <MagneticButton onClick={scanned} strength={0.15}>{t.order.simulate}</MagneticButton>
                    {cam !== 'on' && <MagneticButton onClick={openCam} variant="ghost" strength={0.15}><Icon name="camera" /> {t.order.openCam}</MagneticButton>}
                  </div>
                  {cam === 'denied' && <p className="text-sm text-red-400">{t.order.camDenied}</p>}
                  <div className="mt-2">
                    <div className="mb-1 text-xs text-white/40">{t.order.manual}</div>
                    <div className="flex gap-2" dir="ltr">
                      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} placeholder="XXX-XXX" className="flex-1 border border-white/15 bg-void px-4 py-2 font-mono tracking-widest focus:border-red-500 focus:outline-none" />
                      <button onClick={() => code.length >= 4 && scanned()} className="bg-white/10 px-4 text-sm hover:bg-red-600">{t.order.manualBtn}</button>
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
                    {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((c) => (
                      <span key={c} className={`absolute h-8 w-8 border-red-500 ${c}`} />
                    ))}
                    <motion.div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_16px_#ff1a1a]" animate={{ top: ['2%', '98%', '2%'] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />
                  </div>
                </div>
              </motion.div>
            )}

            {stage === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="flex min-h-[380px] flex-col items-center justify-center gap-6 text-center">
                <div className="relative">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-red-500" animate={{ scale: [1, 2.6], opacity: [0.7, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }} />
                  ))}
                  <img src="/brand/favicon.png" alt="" className="relative h-24 w-24 rounded-full ring-4 ring-red-600" />
                </div>
                <div className="font-display text-xl sm:text-2xl">{t.order.approving}</div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  {operator} · Red Zone
                </div>
                <div className="h-1.5 w-64 overflow-hidden bg-white/10">
                  <motion.div className="h-full bg-gradient-to-r from-red-700 to-red-500" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3.6, ease: 'easeInOut' }} />
                </div>
              </motion.div>
            )}

            {stage === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[380px] flex-col items-center justify-center gap-6 text-center">
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-[0_0_60px_rgba(34,197,94,0.6)]">
                  <Icon name="check" className="h-12 w-12" strokeWidth={3} />
                </motion.div>
                <h2 className="font-display text-3xl sm:text-4xl">{t.order.done}</h2>
                <p className="text-sm text-white/50">{t.order.operator} {operator}</p>
                <AnimatePresence mode="wait">
                  {!confirmed ? (
                    <motion.div key="btn" exit={{ opacity: 0, scale: 0.8 }}>
                      <MagneticButton onClick={() => setConfirmed(true)}>{t.order.confirm}</MagneticButton>
                    </motion.div>
                  ) : (
                    <motion.p key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md border border-green-500/40 bg-green-500/10 px-5 py-3 text-green-300">
                      <span className="inline-flex items-center gap-2"><Icon name="shield" className="h-5 w-5 shrink-0" />{t.order.confirmed}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="flex gap-4 text-sm">
                  <button onClick={restart} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white"><Icon name="refresh" className="h-3.5 w-3.5" />{t.order.restart}</button>
                  <Link to="/games" className="text-red-400 hover:text-red-300">{t.order.shop}</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
