import { motion } from 'motion/react'
import { useState } from 'react'
import { plusTiers, walletCards } from '../data/content'
import { useI18n } from '../i18n'
import { SectionHead } from '../components/fx/Reveal'
import { AnimatedPrice } from '../components/fx/CountUp'
import { TiltCard } from '../components/fx/TiltCard'
import { useStore } from '../store'
import { Icon } from '../components/Icon'

type Dur = 1 | 3 | 12

export function PlusCards() {
  const { t, l, egp, num } = useI18n()
  const [dur, setDur] = useState<Dur>(12)
  const push = useStore((s) => s.pushToast)

  return (
    <section id="plus" className="relative py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead kicker={t.plus.kicker} title={t.plus.title} sub={t.plus.sub} align="center" />

        <div className="mx-auto mb-10 flex w-fit border border-white/15 bg-white/5 p-1">
          {([1, 3, 12] as Dur[]).map((d) => (
            <button key={d} onClick={() => setDur(d)} className="relative px-5 py-2 text-sm font-bold">
              {dur === d && <motion.span layoutId="dur-pill" className="absolute inset-0 bg-red-600" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
              <span className="relative">{num(d)} {d === 1 ? t.plus.month : t.plus.months}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plusTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard max={8} className="h-full">
                <div
                  className={`clip-angle relative flex h-full flex-col gap-5 overflow-hidden border p-7 ${tier.popular ? 'border-red-500 bg-gradient-to-b from-red-900/50 to-night' : 'border-white/10 bg-night'}`}
                >
                  {tier.popular && (
                    <span className="absolute end-0 top-0 bg-red-600 px-3 py-1 text-xs font-bold">{t.plus.popular}</span>
                  )}
                  <div className="flex items-center gap-3" dir="ltr">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full font-display text-lg text-void" style={{ background: tier.color }}>+</span>
                    <div>
                      <div className="text-xs tracking-widest text-white/50">PS PLUS</div>
                      <div className="font-display text-2xl" style={{ color: tier.color }}>{tier.name}</div>
                    </div>
                  </div>
                  <AnimatedPrice value={tier.prices[dur]} className="font-display text-4xl" />
                  <ul className="flex flex-col gap-2 text-sm text-white/70">
                    {tier.perks.map((p, k) => (
                      <li key={k} className="flex items-center gap-2"><span style={{ color: tier.color }}><Icon name="check" className="h-4 w-4" strokeWidth={3} /></span>{l(p)}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => push({ title: t.cart.trophy, body: `PS Plus ${tier.name} · ${num(dur)} ${dur === 1 ? t.plus.month : t.plus.months}` })}
                    className="mt-auto border border-white/20 py-3 font-display text-sm transition-colors hover:border-red-500 hover:bg-red-600"
                  >
                    {t.card.add} +
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-16">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-2xl">{t.plus.cards}</h3>
            <span className="text-sm text-white/50">{t.plus.regions}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {walletCards.map((c, i) => (
              <motion.button
                key={c.usd}
                onClick={() => push({ title: t.cart.trophy, body: `PSN $${c.usd}` })}
                initial={{ opacity: 0, rotateY: 90 }}
                whileInView={{ opacity: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, rotate: i % 2 ? 2 : -2 }}
                className="relative aspect-[1.6] overflow-hidden rounded-xl bg-gradient-to-br from-[#1b2a5a] via-[#0b1030] to-black p-4 text-start ring-1 ring-ice-300/20"
                dir="ltr"
              >
                <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-ice-400/20 blur-xl" />
                <div className="text-[10px] tracking-[0.3em] text-ice-300/80">PLAYSTATION STORE</div>
                <div className="font-display text-3xl text-white sm:text-4xl">${c.usd}</div>
                <div className="absolute bottom-3 left-4 text-sm text-red-400">{egp(c.egp)}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
