import { motion, useMotionValue, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, type PointerEvent } from 'react'
import { games, type Game } from '../data/games'
import { useI18n } from '../i18n'
import { GameCard } from '../components/GameCard'
import { SectionHead } from '../components/fx/Reveal'
import { MagneticButton } from '../components/fx/MagneticButton'

function HorizontalGameRail({
  kicker,
  title,
  sub,
  list,
  showRank = false,
  compact = false,
  headerAction,
  footerAction,
  className = '',
}: {
  kicker: string
  title: string
  sub?: string
  list: Game[]
  showRank?: boolean
  compact?: boolean
  headerAction?: React.ReactNode
  footerAction?: React.ReactNode
  className?: string
}) {
  const { t, dir } = useI18n()
  const rail = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false, x: 0, left: 0 })
  const progress = useMotionValue(0)
  const bar = useSpring(progress, { stiffness: 200, damping: 30 })

  const update = useCallback(() => {
    const el = rail.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const pos = Math.abs(el.scrollLeft)
    progress.set(max > 0 ? pos / max : 1)
  }, [progress])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, dir])

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !rail.current) return
    drag.current = { active: true, moved: false, x: e.clientX, left: rail.current.scrollLeft }
    rail.current.style.scrollSnapType = 'none'
  }
  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d.active || !rail.current) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 5) d.moved = true
    rail.current.scrollLeft = d.left - dx
  }
  const onUp = () => {
    if (!drag.current.active) return
    drag.current.active = false
    if (rail.current) rail.current.style.scrollSnapType = ''
  }

  return (
    <section className={`relative overflow-hidden py-12 sm:py-18 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead kicker={kicker} title={title} sub={sub} />
          {headerAction && <div className="mb-6 sm:mb-10">{headerAction}</div>}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: dir === 'rtl' ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          ref={rail}
          onScroll={update}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.preventDefault()
              e.stopPropagation()
              drag.current.moved = false
            }
          }}
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4 select-none sm:scroll-px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] sm:gap-4 sm:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] md:cursor-grab md:active:cursor-grabbing"
        >
          {list.map((g, i) => (
            <GameCard
              key={g.id}
              game={g}
              rank={showRank ? i + 1 : undefined}
              className={
                compact
                  ? 'w-[132px] shrink-0 snap-start sm:w-[176px] lg:w-[196px]'
                  : 'w-[155px] shrink-0 snap-start sm:w-[220px] lg:w-[240px]'
              }
            />
          ))}
        </div>
      </motion.div>

      <div className="mx-auto mt-3 flex max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="relative h-0.5 flex-1 overflow-hidden bg-white/10">
          <motion.div style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-red-500 rtl:origin-right" />
        </div>
        <span className="flex items-center gap-2 text-xs tracking-[0.3em] text-white/40 uppercase">
          <motion.span animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            ⟷
          </motion.span>{' '}
          {t.best.drag}
        </span>
      </div>

      {footerAction && <div className="mx-auto mt-8 flex max-w-7xl justify-center px-4 sm:px-6">{footerAction}</div>}
    </section>
  )
}

/**
 * 1. CURRENT OFFERS & DISCOUNTS SECTION
 * Showcases all discounted games sorted by highest discount (-45% -> -15%)
 */
export function OffersSection() {
  const { t } = useI18n()
  const offerGames = [...games]
    .filter((g) => g.discount != null && g.discount > 0)
    .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))

  return (
    <HorizontalGameRail
      kicker={t.offers.kicker}
      title={t.offers.title}
      sub={t.offers.sub}
      list={offerGames}
      className="border-t border-white/5 bg-gradient-to-b from-void via-blood/25 to-void"
    />
  )
}

/**
 * 2. NEW RELEASES & PRE-ORDERS SECTION
 * Highlights day-one and hot new releases (GTA VI, FC 27, Black Ops 7, Ghost of Yōtei, RE Requiem, NBA 2K27)
 */
const NEW_RELEASE_IDS = ['gta6', 'fc27', 'bo7', 'yotei', 're9', 'nba2k27']

export function NewReleasesSection() {
  const { t } = useI18n()
  const newReleaseGames = NEW_RELEASE_IDS.map((id) => games.find((g) => g.id === id)).filter(
    (g): g is Game => g != null,
  )

  return (
    <HorizontalGameRail
      kicker={t.newReleases.kicker}
      title={t.newReleases.title}
      sub={t.newReleases.sub}
      list={newReleaseGames}
      className="border-t border-white/5"
    />
  )
}

/**
 * 3. BEST SELLERS (TOP 5) + BUTTON TO NAVIGATE TO ALL PRODUCTS
 * Compact cards (w-[132px] on mobile, w-[176px]–[196px] on desktop) ranked #1 to #5
 */
export function Bestsellers() {
  const { t } = useI18n()
  const top5 = [...games].sort((a, b) => b.popularity - a.popularity).slice(0, 5)

  return (
    <HorizontalGameRail
      kicker={t.best.kicker}
      title={t.best.title}
      sub={t.best.sub}
      list={top5}
      showRank
      compact
      className="border-t border-white/5 bg-gradient-to-b from-void via-night to-void"
      footerAction={
        <MagneticButton to="/games" variant="ice">
          {t.best.all} <span className="rtl:rotate-180">→</span>
        </MagneticButton>
      }
    />
  )
}
