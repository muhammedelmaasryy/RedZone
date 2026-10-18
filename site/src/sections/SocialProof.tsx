import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { faqs, reviews } from '../data/content'
import { useI18n } from '../i18n'
import { CountUp } from '../components/fx/CountUp'
import { Marquee } from '../components/fx/Marquee'
import { SectionHead } from '../components/fx/Reveal'
import { MagneticButton } from '../components/fx/MagneticButton'
import { PSShape, StripedCircle } from '../components/fx/Shapes'
import { Icon } from '../components/Icon'

export function Counters() {
  const { t } = useI18n()
  const items = [
    { to: 5200, suffix: '+', label: t.counters.customers },
    { to: 54, suffix: '', label: t.counters.games },
    { to: 3, suffix: '', label: t.counters.minutes },
    { to: 4.9, suffix: '/5', label: t.counters.rating, dec: 1 },
  ]
  return (
    <section className="relative border-y border-white/10 bg-night py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-1 text-center"
          >
            <CountUp to={it.to} decimals={it.dec ?? 0} suffix={it.suffix} className="font-display text-4xl text-red-500 text-glow sm:text-6xl" />
            <span className="text-sm text-white/60">{it.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Bubble({ r }: { r: (typeof reviews)[number] }) {
  const { l } = useI18n()
  return (
    <div className="w-[300px] shrink-0 rounded-2xl rounded-ss-none bg-[#202c33] p-4 text-start shadow-lg sm:w-[340px]">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-800 text-sm font-bold">{r.name[0]}</span>
        <div className="leading-tight">
          <div className="text-sm font-bold text-[#53bdeb]">{r.name}</div>
          <div className="text-[11px] text-white/40">{l(r.city)} · {r.game}</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-white/90">{l(r.text)}</p>
      <div className="mt-1 text-end text-[10px] text-white/40" dir="ltr"><span className="inline-flex items-center gap-1">{r.time} <Icon name="checks" className="h-3.5 w-3.5 text-[#53bdeb]" /></span></div>
    </div>
  )
}

export function Reviews() {
  const { t, dir } = useI18n()
  return (
    <section className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead kicker={t.reviews.kicker} title={t.reviews.title} />
      </div>
      <div className="flex flex-col gap-5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <Marquee speed={50}>
          {reviews.map((r, i) => <div key={i} dir={dir}><Bubble r={r} /></div>)}
        </Marquee>
        <Marquee speed={60} reverse>
          {[...reviews].reverse().map((r, i) => <div key={i} dir={dir}><Bubble r={r} /></div>)}
        </Marquee>
      </div>
    </section>
  )
}

export function FAQ() {
  const { t, l } = useI18n()
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="relative py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative">
          <SectionHead kicker={t.faq.kicker} title={t.faq.title} />
          <StripedCircle className="hidden h-40 w-40 opacity-80 lg:block" />
        </div>
        <ul className="flex flex-col gap-3">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <motion.li
                key={i}
                layout
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`clip-angle border transition-colors ${isOpen ? 'border-red-500/70 bg-red-950/30' : 'border-white/10 bg-white/[0.02]'}`}
              >
                <button onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-start">
                  <span className="font-bold text-white">{l(f.q)}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-red-500">
                    <PSShape shape="cross" className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 leading-relaxed text-white/65">{l(f.a)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function CTABand() {
  const { t } = useI18n()
  return (
    <section className="relative overflow-hidden py-24">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center"
      >
        <img src="/brand/favicon.png" alt="" className="h-24 w-24 rounded-full ring-4 ring-red-600 glow" />
        <h2 className="font-display text-4xl leading-tight sm:text-6xl">{t.cta.title}</h2>
        <p className="text-white/60">{t.cta.sub}</p>
        <MagneticButton to="/games">{t.cta.btn} <span className="rtl:rotate-180">→</span></MagneticButton>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(229,0,0,0.25),transparent_60%)]" />
    </section>
  )
}
