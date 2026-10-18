import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { finalPrice, gameById, games, genreLabel, slotLabel, slotNotice, slotsForPlatform, type Platform, type SlotType } from '../data/games'
import { useI18n } from '../i18n'
import { useCountdown } from '../lib/hooks'
import { PLUS_ADDON_PRICE, useStore } from '../store'
import { GameCover } from '../components/GameCover'
import { GameCard } from '../components/GameCard'
import { MagneticButton } from '../components/fx/MagneticButton'
import { AnimatedPrice } from '../components/fx/CountUp'
import { Crosses } from '../components/fx/Shapes'

type Fly = { from: DOMRect; to: DOMRect } | null

export default function Product() {
  const { id = '' } = useParams()
  const game = gameById(id)
  const { t, l, egp, num } = useI18n()
  const nav = useNavigate()
  const addToCart = useStore((s) => s.addToCart)
  const pushToast = useStore((s) => s.pushToast)
  const coverRef = useRef<HTMLDivElement>(null)
  const [fly, setFly] = useState<Fly>(null)

  const [platform, setPlatform] = useState<Platform>(game?.platforms[0] ?? 'ps5')
  const slots = useMemo(() => (game ? slotsForPlatform(game, platform) : []), [game, platform])
  const [slot, setSlot] = useState<SlotType>(slots[0] ?? 'ps5Primary')
  const [addPlus, setAddPlus] = useState(false)
  useEffect(() => { if (!slots.includes(slot)) setSlot(slots[0]) }, [slots, slot])

  const { scrollY } = useScroll()
  const coverY = useTransform(scrollY, [0, 600], [0, 80])
  const coverRot = useTransform(scrollY, [0, 600], [-4, 4])

  const release = useMemo(() => (game?.releaseDate ? new Date(game.releaseDate).getTime() : 0), [game])
  const cd = useCountdown(release)

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-20">
        <div className="font-display text-6xl text-red-600">404</div>
        <Link to="/games" className="text-white/60 hover:text-white">{t.product.back}</Link>
      </div>
    )
  }

  const price = finalPrice(game, slot) ?? 0
  const base = game.prices[slot] ?? 0
  const total = price + (addPlus ? PLUS_ADDON_PRICE : 0)
  const related = games.filter((g) => g.id !== game.id && (g.genre === game.genre || g.popularity > 85)).slice(0, 4)

  const add = (goCheckout = false) => {
    addToCart({ gameId: game.id, slot, price, addPlus })
    const btn = document.getElementById('cart-button')
    if (coverRef.current && btn && !goCheckout) setFly({ from: coverRef.current.getBoundingClientRect(), to: btn.getBoundingClientRect() })
    pushToast({ title: t.cart.trophy, body: `${game.short} · ${l(slotLabel[slot])}` })
    if (goCheckout) nav('/checkout')
  }

  return (
    <div className="relative pt-24 pb-24">
      <div className="absolute inset-x-0 top-0 h-[700px] overflow-hidden">
        <div className="absolute inset-0 opacity-50 blur-3xl" style={{ background: `radial-gradient(circle at 30% 30%, ${game.cover.from}, transparent 60%)` }} />
        <div className="stripes-bg absolute inset-0 opacity-30 [mask-image:linear-gradient(black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Link to="/games" className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <span className="rtl:rotate-180">←</span> {t.product.back}
        </Link>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div style={{ y: coverY }} className="relative">
            <motion.div
              ref={coverRef}
              initial={{ opacity: 0, scale: 0.85, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ rotate: coverRot }}
              className="mx-auto max-w-[420px]"
            >
              <GameCover game={game} big className="clip-angle aspect-[4/5] w-full shadow-[0_40px_100px_rgba(0,0,0,0.7)]" />
            </motion.div>
            <Crosses className="mx-auto mt-6 w-fit text-red-600/70" count={6} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.7 }} className="flex flex-col gap-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-white/10 px-2 py-1 text-ice-300">{l(genreLabel[game.genre])}</span>
                <span className="text-yellow-400">★ {num(game.rating)}</span>
                {game.discount && <span className="bg-red-600 px-2 py-1 font-display text-xs">-{num(game.discount)}%</span>}
              </div>
              <h1 className="font-display text-4xl leading-tight sm:text-5xl" dir="ltr" style={{ textAlign: 'start' }}>{game.title}</h1>
              <p className="mt-3 max-w-xl text-white/60">{l(game.blurb)}</p>
            </div>

            {game.releaseDate && cd.diff > 0 && (
              <div className="clip-angle-sm flex items-center gap-3 border border-ice-300/40 bg-ice-300/10 px-4 py-3 text-sm text-ice-300">
                <span className="relative flex h-2.5 w-2.5"><span className="absolute h-full w-full animate-ping rounded-full bg-ice-300" /><span className="relative h-2.5 w-2.5 rounded-full bg-ice-300" /></span>
                {t.product.preorderIn} <b className="font-display text-white">{num(cd.d)}</b> {t.product.days} · <span dir="ltr" className="font-mono">{String(cd.h).padStart(2, '0')}:{String(cd.m).padStart(2, '0')}:{String(cd.s).padStart(2, '0')}</span>
              </div>
            )}

            {game.platforms.length > 1 && (
              <div>
                <div className="mb-2 text-sm text-white/50">{t.product.console}</div>
                <div className="flex w-fit border border-white/15 bg-white/5 p-1" dir="ltr">
                  {game.platforms.map((p) => (
                    <button key={p} onClick={() => setPlatform(p)} className="relative px-6 py-2 font-display text-sm">
                      {platform === p && <motion.span layoutId="p-plat" className="absolute inset-0 bg-ice-300" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                      <span className={`relative ${platform === p ? 'text-void' : 'text-white/60'}`}>{p.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 text-sm text-white/50">{t.product.choose}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {slots.map((s) => {
                  const p = finalPrice(game, s)!
                  const active = s === slot
                  return (
                    <button key={s} onClick={() => setSlot(s)} className="clip-angle relative overflow-hidden border border-white/10 p-4 text-start">
                      {active && <motion.span layoutId="slot-bg" className="absolute inset-0 border-2 border-red-500 bg-red-600/15" transition={{ type: 'spring', stiffness: 450, damping: 35 }} />}
                      <div className="relative flex items-center justify-between gap-2">
                        <span className="font-bold">{l(slotLabel[s])}</span>
                        <span className={`h-4 w-4 rounded-full border-2 ${active ? 'border-red-500 bg-red-500 shadow-[0_0_10px_#ff1a1a]' : 'border-white/30'}`} />
                      </div>
                      <div className="relative mt-1 font-display text-lg text-red-400">{egp(p)}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={slot}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="border-s-4 border-ice-400 bg-ice-300/5 p-4 text-sm"
              >
                <div className="mb-1 font-bold text-ice-300">{t.product.notice}</div>
                <div className="text-white/70">{l(slotNotice[slot])}</div>
              </motion.div>
            </AnimatePresence>

            <label className="flex cursor-pointer items-center gap-3 border border-white/10 p-4 hover:border-white/30">
              <input type="checkbox" checked={addPlus} onChange={(e) => setAddPlus(e.target.checked)} className="peer sr-only" />
              <span className="flex h-6 w-6 items-center justify-center border-2 border-white/30 peer-checked:border-red-500 peer-checked:bg-red-600">
                {addPlus && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>}
              </span>
              <span className="flex-1 text-sm">{t.product.addPlus}</span>
              <span className="font-display text-sm text-white/70">+{egp(PLUS_ADDON_PRICE)}</span>
            </label>

            <ul className="flex flex-col gap-2 text-sm text-white/60">
              <li className="flex items-center gap-2">🛡️ {t.product.warranty}</li>
              <li className="flex items-center gap-2">⚡ {t.product.delivery}</li>
              <li className="flex items-center gap-2">📦 {num(game.slotsLeft)} {t.card.slotsLeft}</li>
            </ul>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {base !== price && <div className="text-sm text-white/40 line-through">{egp(base)}</div>}
                <AnimatedPrice value={total} className="font-display text-4xl text-white" />
              </div>
              <div className="flex gap-3">
                <MagneticButton variant="ghost" onClick={() => add(false)} strength={0.2}>{t.product.add}</MagneticButton>
                <MagneticButton onClick={() => add(true)} strength={0.2}>{t.product.buy}</MagneticButton>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-28">
          <h2 className="mb-8 font-display text-3xl">{t.product.related}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {fly && (
          <motion.div
            key="fly"
            className="pointer-events-none fixed z-[95] overflow-hidden"
            initial={{ left: fly.from.left, top: fly.from.top, width: fly.from.width, height: fly.from.height, opacity: 1, rotate: 0 }}
            animate={{ left: fly.to.left, top: fly.to.top, width: fly.to.width, height: fly.to.height, opacity: 0.4, rotate: 20 }}
            transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
            onAnimationComplete={() => setFly(null)}
          >
            <GameCover game={game} className="h-full w-full" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
