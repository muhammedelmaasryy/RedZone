import { motion } from 'motion/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { plusTiers, walletCards } from '../data/content'
import { games } from '../data/games'
import { useI18n } from '../i18n'
import { useStore } from '../store'
import { GameCard } from '../components/GameCard'
import { AnimatedPrice } from '../components/fx/CountUp'
import { SectionHead } from '../components/fx/Reveal'
import { Chevrons } from '../components/fx/Shapes'
import { TiltCard } from '../components/fx/TiltCard'
import { Icon } from '../components/Icon'

type Dur = 1 | 3 | 12

const ONLINE_GAME_IDS = ['fc27', 'bo7', 'gta6', 'eldenNR', 'gt7', 'tekken8', 'mk1', 'nba2k27']

export default function Plus() {
  const { t, l, lang, egp, num } = useI18n()
  const [dur, setDur] = useState<Dur>(12)
  const nav = useNavigate()
  const { addToCart, pushToast, user, setAuthOpen } = useStore()

  const onlineGames = ONLINE_GAME_IDS.map((id) => games.find((g) => g.id === id)).filter(
    (g): g is NonNullable<typeof g> => g != null,
  )

  const handleAddPlusTier = (
    tier: (typeof plusTiers)[number],
    buyNow = false,
  ) => {
    const durLabel = `${num(dur)} ${dur === 1 ? t.plus.month : t.plus.months}`
    addToCart({
      gameId: `plus-${tier.id}-${dur}m`,
      slot: 'ps5Primary',
      price: tier.prices[dur],
      addPlus: false,
      customTitle: `PS Plus ${tier.name}`,
      customSubtitle: durLabel,
      customAccent: tier.color,
    })
    pushToast({
      title: t.cart.added,
      body: `PS Plus ${tier.name} · ${durLabel}`,
    })
    if (buyNow) {
      if (user) nav('/checkout')
      else setAuthOpen(true, '/checkout')
    }
  }

  const handleAddWalletCard = (c: (typeof walletCards)[number]) => {
    addToCart({
      gameId: `psn-card-${c.usd}`,
      slot: 'full',
      price: c.egp,
      addPlus: false,
      customTitle: `PSN Card $${c.usd}`,
      customSubtitle: lang === 'ar' ? 'كارت شحن محفظة بلايستيشن' : 'PlayStation Store Wallet Top-Up',
      customAccent: '#a9bcf0',
    })
    pushToast({
      title: t.cart.added,
      body: `PSN $${c.usd} · ${egp(c.egp)}`,
    })
  }

  return (
    <div className="relative min-h-screen pt-24 pb-24 sm:pt-28">
      <div className="stripes-bg pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-25 [mask-image:linear-gradient(black,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="mb-3 flex justify-center">
            <Chevrons className="text-red-600" />
          </div>
          <span className="font-condensed text-lg tracking-[0.25em] text-ice-300 uppercase">
            {t.plus.kicker}
          </span>
          <h1 className="mt-1 font-display text-4xl sm:text-6xl">{t.plus.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/65 sm:text-base">{t.plus.sub}</p>
        </motion.div>

        {/* Duration Selector (1 / 3 / 12 Months) */}
        <div className="mx-auto mb-10 flex w-fit border border-white/15 bg-white/5 p-1">
          {([1, 3, 12] as Dur[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDur(d)}
              className="relative px-5 py-2 text-sm font-bold text-white"
            >
              {dur === d && (
                <motion.span
                  layoutId="dur-pill"
                  className="absolute inset-0 bg-red-600"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative">
                {num(d)} {d === 1 ? t.plus.month : t.plus.months}
              </span>
            </button>
          ))}
        </div>

        {/* 3 PS Plus Membership Tiers (Essential, Extra, Premium) */}
        <div className="grid gap-6 md:grid-cols-3">
          {plusTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard max={8} className="h-full">
                <div
                  className={`clip-angle relative flex h-full flex-col gap-5 overflow-hidden border p-6 sm:p-7 ${
                    tier.popular
                      ? 'border-red-500 bg-gradient-to-b from-red-900/50 to-night shadow-[0_20px_60px_rgba(229,0,0,0.2)]'
                      : 'border-white/10 bg-night'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute end-0 top-0 bg-red-600 px-3 py-1 text-xs font-bold text-white">
                      {t.plus.popular}
                    </span>
                  )}
                  <div className="flex items-center gap-3" dir="ltr">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full font-display text-xl text-void"
                      style={{ background: tier.color }}
                    >
                      +
                    </span>
                    <div>
                      <div className="text-xs tracking-widest text-white/50">PLAYSTATION PLUS</div>
                      <div className="font-display text-2xl" style={{ color: tier.color }}>
                        {tier.name}
                      </div>
                    </div>
                  </div>

                  <div>
                    <AnimatedPrice value={tier.prices[dur]} className="font-display text-4xl text-white" />
                    <div className="mt-1 text-xs text-ice-300/70">
                      {num(dur)} {dur === 1 ? t.plus.month : t.plus.months} · PS5 &amp; PS4
                    </div>
                  </div>

                  <ul className="flex flex-col gap-2.5 text-sm text-white/75">
                    {tier.perks.map((p, k) => (
                      <li key={k} className="flex items-center gap-2">
                        <span style={{ color: tier.color }}>
                          <Icon name="check" className="h-4 w-4" strokeWidth={3} />
                        </span>
                        {l(p)}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-col gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => handleAddPlusTier(tier, true)}
                      className="clip-angle-sm bg-red-600 py-3 font-display text-xs text-white transition-colors hover:bg-red-500 sm:text-sm"
                    >
                      {t.product.buy} →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPlusTier(tier, false)}
                      className="border border-white/20 bg-white/5 py-2.5 font-display text-xs text-white transition-colors hover:border-red-500 hover:bg-red-600/20 sm:text-sm"
                    >
                      {t.product.add} +
                    </button>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* PSN Store Wallet Gift Cards */}
        <div className="mt-16 border-t border-white/10 pt-14">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">{t.plus.cards}</h2>
              <p className="mt-1 text-sm text-white/50">{t.plus.regions}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {walletCards.map((c, i) => (
              <motion.button
                key={c.usd}
                type="button"
                onClick={() => handleAddWalletCard(c)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="group relative aspect-[1.55] overflow-hidden rounded-xl border border-ice-300/25 bg-gradient-to-br from-[#1b2a5a] via-[#0b1030] to-black p-4 text-start transition hover:border-red-500"
                dir="ltr"
              >
                <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-ice-400/20 blur-xl" />
                <div className="text-[10px] tracking-[0.28em] text-ice-300/80">PLAYSTATION STORE</div>
                <div className="mt-1 font-display text-3xl text-white sm:text-4xl">${c.usd}</div>
                <div className="absolute bottom-3 inset-x-4 flex items-center justify-between">
                  <span className="font-display text-sm text-red-400 sm:text-base">{egp(c.egp)}</span>
                  <span className="rounded bg-red-600 px-2 py-0.5 font-display text-[10px] text-white group-hover:bg-red-500">
                    {t.card.add} +
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* PS Plus Online Multiplayer & Co-Op Games Section */}
        <div className="mt-16 border-t border-white/10 pt-14">
          <SectionHead
            kicker="PS PLUS ONLINE"
            title={lang === 'ar' ? 'أقوى ألعاب الأونلاين والملتي بلاير' : 'Top Online Multiplayer Games'}
            sub={
              lang === 'ar'
                ? 'استمتع باللعب أونلاين مع صحابك في أشهر ألعاب الكورة والشوتر والقتال.'
                : 'Jump into online multiplayer with your PS Plus membership across our most popular titles.'
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {onlineGames.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
