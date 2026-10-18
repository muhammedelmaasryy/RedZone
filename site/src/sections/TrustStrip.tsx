import { games } from '../data/games'
import { useI18n } from '../i18n'
import { Marquee } from '../components/fx/Marquee'
import { PSShape } from '../components/fx/Shapes'

export function TrustStrip() {
  const { t } = useI18n()
  const chips = [
    { icon: '⚡', label: t.trust.delivery },
    { icon: '🛡️', label: t.trust.warranty },
    { icon: '🔐', label: t.trust.noPass },
    { icon: '💬', label: t.trust.support },
  ]
  return (
    <section className="relative z-10 -mt-10">
      <div className="-skew-y-2 bg-red-600 py-3 shadow-[0_0_60px_rgba(229,0,0,0.5)]">
        <Marquee speed={35}>
          {[...chips, ...chips].map((c, i) => (
            <span key={i} className="flex items-center gap-3 font-display text-lg whitespace-nowrap text-white uppercase">
              <span>{c.icon}</span> {c.label}
              <PSShape shape={(['triangle', 'circle', 'cross', 'square'] as const)[i % 4]} className="h-5 w-5 text-white/70" />
            </span>
          ))}
        </Marquee>
      </div>
      <div className="mt-2 skew-y-1 border-y border-white/10 bg-night py-3">
        <Marquee speed={55} reverse>
          {games.map((g) => (
            <span key={g.id} className="font-display text-2xl whitespace-nowrap text-white/15 uppercase transition-colors hover:text-red-500 sm:text-3xl">
              {g.short} <span className="text-red-600/60">✕</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
