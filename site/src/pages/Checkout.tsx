import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState, type DragEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { WALLET_NUMBER } from '../data/content'
import { gameById, slotLabel } from '../data/games'
import { useI18n } from '../i18n'
import { cartTotal, PLUS_ADDON_PRICE, useStore, type PayMethod } from '../store'
import { GameCover } from '../components/GameCover'
import { MagneticButton } from '../components/fx/MagneticButton'
import { AnimatedPrice } from '../components/fx/CountUp'
import { PaymentStrip } from '../components/PaymentLogos'

const METHOD_STYLE: Record<PayMethod, { color: string; icon: string }> = {
  vf: { color: '#e60000', icon: '📱' },
  instapay: { color: '#a855f7', icon: '⚡' },
  fawry: { color: '#ffd200', icon: '🏪' },
  card: { color: '#a9bcf0', icon: '💳' },
}

export default function Checkout() {
  const { t, l, egp } = useI18n()
  const nav = useNavigate()
  const { cart, placeOrder } = useStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState<PayMethod>('vf')
  const [receipt, setReceipt] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const [terms, setTerms] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const fawryRef = useMemo(() => String(Math.floor(100000000 + Math.random() * 899999999)), [])

  const total = cartTotal(cart)
  const valid = name.trim().length > 1 && /^01[0125]\d{8}$/.test(phone.replace(/\s/g, ''))

  const onFile = (f?: File | null) => { if (f) setReceipt(f.name) }
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]) }

  const pay = () => {
    if (!valid || !terms) { setErr(true); setTimeout(() => setErr(false), 600); return }
    setBusy(true)
    setTimeout(() => {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors: ['#ff1a1a', '#e50000', '#bdc9e7', '#ffffff'] })
      const o = placeOrder({ method, name })
      nav(`/order/${o.id}`)
    }, 1800)
  }

  if (cart.length === 0 && !busy) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 pt-20 text-center">
        <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-7xl">🎮</motion.div>
        <p className="text-white/60">{t.cart.empty}</p>
        <MagneticButton to="/games">{t.hero.cta}</MagneticButton>
      </div>
    )
  }

  const methods: PayMethod[] = ['vf', 'instapay', 'fawry', 'card']

  return (
    <div className="relative min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 font-display text-4xl sm:text-6xl">{t.checkout.title}</motion.h1>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-8">
            {/* details */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="clip-angle border border-white/10 bg-night p-6">
              <h2 className="mb-4 flex items-center gap-3 font-display text-xl"><span className="flex h-7 w-7 items-center justify-center bg-red-600 text-sm">1</span>{t.checkout.info}</h2>
              <motion.div animate={err ? { x: [0, -10, 10, -6, 6, 0] } : {}} className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-white/50">{t.checkout.name}</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="border border-white/15 bg-void px-4 py-3 focus:border-red-500 focus:outline-none" />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-white/50">{t.checkout.phone}</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" dir="ltr" placeholder="01xxxxxxxxx" className="border border-white/15 bg-void px-4 py-3 text-start placeholder:text-white/20 focus:border-red-500 focus:outline-none" />
                </label>
              </motion.div>
              <AnimatePresence>
                {err && !valid && <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-sm text-red-400">{t.checkout.required}</motion.p>}
              </AnimatePresence>
            </motion.section>

            {/* method */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="clip-angle border border-white/10 bg-night p-6">
              <h2 className="mb-4 flex items-center gap-3 font-display text-xl"><span className="flex h-7 w-7 items-center justify-center bg-red-600 text-sm">2</span>{t.checkout.method}</h2>
              <div className="grid grid-cols-2 gap-3">
                {methods.map((m) => (
                  <motion.button
                    key={m}
                    onClick={() => setMethod(m)}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex items-center gap-3 overflow-hidden border border-white/10 p-4 text-start"
                  >
                    {method === m && <motion.span layoutId="pay-sel" className="absolute inset-0 border-2" style={{ borderColor: METHOD_STYLE[m].color, background: `${METHOD_STYLE[m].color}18` }} transition={{ type: 'spring', stiffness: 450, damping: 35 }} />}
                    <span className="relative text-2xl">{METHOD_STYLE[m].icon}</span>
                    <span className="relative text-sm font-bold">{t.checkout.methods[m]}</span>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={method} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-5">
                    {(method === 'vf' || method === 'instapay') && (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm text-white/60">{t.checkout.wallet}</p>
                        <div className="flex items-center justify-between border border-dashed border-white/20 bg-void px-4 py-3" dir="ltr">
                          <span className="font-mono text-xl tracking-widest">{method === 'vf' ? WALLET_NUMBER : 'redzone@instapay'}</span>
                          <button onClick={() => navigator.clipboard?.writeText(method === 'vf' ? WALLET_NUMBER : 'redzone@instapay')} className="text-xs text-red-400 hover:text-red-300">COPY</button>
                        </div>
                        <label
                          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
                          onDragLeave={() => setDrag(false)}
                          onDrop={onDrop}
                          className={`flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed p-6 text-center text-sm transition-colors ${drag ? 'border-red-500 bg-red-600/10' : receipt ? 'border-green-500/60 bg-green-500/5' : 'border-white/15 hover:border-white/40'}`}
                        >
                          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
                          <motion.span animate={drag ? { y: -6, scale: 1.2 } : { y: 0, scale: 1 }} className="text-3xl">{receipt ? '✅' : '🧾'}</motion.span>
                          <span className={receipt ? 'text-green-300' : 'text-white/60'}>{receipt ? `${t.checkout.uploaded}: ${receipt}` : t.checkout.upload}</span>
                        </label>
                      </div>
                    )}
                    {method === 'fawry' && (
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-white/50">{t.checkout.fawryRef}</span>
                        <div className="flex gap-1" dir="ltr">
                          {fawryRef.split('').map((d, i) => (
                            <motion.span key={i} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex h-12 w-9 items-center justify-center bg-[#ffd200] font-display text-xl text-black">{d}</motion.span>
                          ))}
                        </div>
                        <p className="text-sm text-white/50">{t.checkout.fawryHint}</p>
                      </div>
                    )}
                    {method === 'card' && (
                      <div className="flex flex-col gap-3" dir="ltr">
                        <motion.div initial={{ rotateY: -30 }} animate={{ rotateY: 0 }} className="relative aspect-[1.7] w-full max-w-[320px] overflow-hidden rounded-xl bg-gradient-to-br from-red-700 via-blood to-black p-5 shadow-2xl">
                          <div className="stripes-bg absolute inset-0 opacity-40" />
                          <div className="relative flex h-full flex-col justify-between">
                            <div className="flex justify-between"><span className="h-7 w-10 rounded bg-yellow-300/80" /><span className="font-black text-white italic">VISA</span></div>
                            <div className="font-mono text-lg tracking-widest">•••• •••• •••• 4242</div>
                            <div className="flex justify-between text-xs text-white/70"><span>{name || 'CARD HOLDER'}</span><span>12/29</span></div>
                          </div>
                        </motion.div>
                        <input placeholder="Card number" className="border border-white/15 bg-void px-4 py-3 focus:border-red-500 focus:outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                          <input placeholder="MM/YY" className="border border-white/15 bg-void px-4 py-3 focus:border-red-500 focus:outline-none" />
                          <input placeholder="CVC" className="border border-white/15 bg-void px-4 py-3 focus:border-red-500 focus:outline-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.section>
          </div>

          {/* summary */}
          <motion.aside initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="h-fit lg:sticky lg:top-28">
            <div className="clip-angle border border-red-900/60 bg-gradient-to-b from-blood to-night p-6">
              <h2 className="mb-4 font-display text-xl">{t.checkout.summary}</h2>
              <ul className="mb-5 flex flex-col gap-3">
                {cart.map((c) => {
                  const g = gameById(c.gameId)!
                  return (
                    <li key={c.key} className="flex items-center gap-3">
                      <GameCover game={g} className="h-14 w-11 shrink-0" />
                      <div className="flex-1 text-sm">
                        <div className="font-bold" dir="ltr" style={{ textAlign: 'start' }}>{g.short}</div>
                        <div className="text-xs text-white/50">{l(slotLabel[c.slot])}{c.addPlus ? ' + PS Plus' : ''}</div>
                      </div>
                      <span className="font-display text-sm">{egp(c.price + (c.addPlus ? PLUS_ADDON_PRICE : 0))}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-white/60">{t.cart.total}</span>
                <AnimatedPrice value={total} className="font-display text-3xl text-red-500" />
              </div>
              <label className="mt-4 flex items-center gap-2 text-xs text-white/60">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="accent-red-600" />
                {t.checkout.terms}
              </label>
              <div className="mt-5 w-full [&>div]:w-full">
                <MagneticButton onClick={pay} strength={0.12} disabled={busy}>
                  {busy ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                      {t.checkout.processing}
                    </span>
                  ) : (
                    <>{t.checkout.pay} · {egp(total)}</>
                  )}
                </MagneticButton>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-white/50">🔒 {t.checkout.secure}</p>
              <PaymentStrip className="mt-4" />
            </div>
            <Link to="/games" className="mt-4 block text-center text-sm text-white/40 hover:text-white">{t.order.shop}</Link>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
