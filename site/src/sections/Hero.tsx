import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from 'motion/react'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { WHATSAPP } from '../data/content'
import { games, minPrice } from '../data/games'
import { useI18n } from '../i18n'
import { useMediaQuery, webglAvailable } from '../lib/hooks'
import { markSceneReady } from '../lib/sceneReady'
import { FakeQR } from '../components/FakeQR'
import { GameCover } from '../components/GameCover'
import { Icon } from '../components/Icon'
import { GlitchText } from '../components/fx/GlitchText'
import { MagneticButton } from '../components/fx/MagneticButton'
import { ScrambleText } from '../components/fx/ScrambleText'
import { Chevrons, Crosses, PSShape, StripedCircle } from '../components/fx/Shapes'
import { ReelSpine } from '../components/three/ReelSpine'

const HeroScene = lazy(() => import('../components/three/HeroScene'))

const FEATURED_IDS = ['fc27', 'gta6', 'spiderman2', 'bo7', 'ghost-of-yotei']

const line = {
  hidden: { y: '110%' },
  show: (i: number) => ({
    y: '0%',
    transition: { delay: 0.15 + i * 0.11, duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function Hero({ ready }: { ready: boolean }) {
  const { t, lang, egp, num } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const stage1Ref = useRef<HTMLElement>(null)
  const stage2Ref = useRef<HTMLElement>(null)
  const stage3Ref = useRef<HTMLElement>(null)

  const scrollRef = useRef(0)
  const [activeStage, setActiveStage] = useState(0)
  const [featuredIdx, setFeaturedIdx] = useState(0)

  const small = useMediaQuery('(max-width: 768px)')
  const gl = useMemo(() => webglAvailable(), [])

  useEffect(() => {
    const timer = setTimeout(() => markSceneReady(), 150)
    return () => clearTimeout(timer)
  }, [])

  const inView = useInView(containerRef, { amount: 0.01 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    scrollRef.current = v
    const nextStage = v < 0.34 ? 0 : v < 0.68 ? 1 : 2
    if (nextStage !== activeStage) setActiveStage(nextStage)
  })

  const featuredList = FEATURED_IDS.map((id) => games.find((g) => g.id === id) ?? games[0])
  const featuredGame = featuredList[featuredIdx % featuredList.length]

  const cycleGame = () => {
    setFeaturedIdx((prev) => (prev + 1) % featuredList.length)
  }

  const scrollToStage = (idx: number) => {
    const targets = [stage1Ref.current, stage2Ref.current, stage3Ref.current]
    targets[idx]?.scrollIntoView({ behavior: 'smooth' })
  }

  const anim = ready ? 'show' : 'hidden'

  return (
    <div ref={containerRef} className="noise relative">
      {/* =====================================================================
          LAYER 0 (z-0): 3-STAGE TONAL BACKGROUNDS & ANGLED TRANSITION BANDS
         ===================================================================== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Stage 1 Background (0% -> 33.33%) */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-[radial-gradient(ellipse_at_50%_35%,#3d0000_0%,#120102_55%,#050001_90%)]">
          <div className="grid-bg absolute inset-0 opacity-55 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_78%)]" />
          <div
            className="absolute -end-[18%] top-0 h-full w-[60%]"
            style={{ background: 'repeating-linear-gradient(-55deg, transparent 0 70px, rgba(229,0,0,0.14) 70px 140px)' }}
          />
        </div>

        {/* Stage 2 Background (33.33% -> 66.66%) */}
        <div className="absolute inset-x-0 top-1/3 h-1/3 bg-[radial-gradient(ellipse_at_50%_50%,#2e0408_0%,#120204_58%,#060002_100%)]">
          <div className="stripes-bg absolute inset-0 opacity-15" />
        </div>

        {/* Stage 3 Background (66.66% -> 100%) */}
        <div className="absolute inset-x-0 top-2/3 h-1/3 bg-[radial-gradient(ellipse_at_35%_65%,#42050c_0%,#140205_52%,#050001_90%)]">
          <div className="absolute inset-y-0 start-0 w-full bg-[linear-gradient(125deg,rgba(229,0,0,0.16)_0%,rgba(169,188,240,0.06)_45%,transparent_70%)] lg:w-[62%]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-void" />
        </div>

        {/* Angled Architectural Transition Band 1 -> 2 (Desktop only so mobile stays clean) */}
        <div className="hidden lg:block absolute inset-x-0 top-1/3 h-16 -translate-y-1/2 -skew-y-2 border-y border-ice-300/25 bg-gradient-to-r from-blood/95 via-ember/95 to-night/95 shadow-[0_0_50px_rgba(229,0,0,0.28)]" />

        {/* Angled Architectural Transition Band 2 -> 3 (Desktop only) */}
        <div className="hidden lg:block absolute inset-x-0 top-2/3 h-16 -translate-y-1/2 skew-y-2 border-y border-red-500/25 bg-gradient-to-r from-night/95 via-blood/95 to-ember/95 shadow-[0_0_50px_rgba(169,188,240,0.18)]" />
      </div>

      {/* =====================================================================
          LAYER 1 & 2 (z-20): STICKY VIEWPORT
          - Mobile (< 1024px): True Split Sticky Screen!
            * Top 60% (`h-[60svh]`): 100% unobstructed zoomed-in animation stage
            * Bottom 40% (`h-[40svh]`): Fixed HUD dock that cross-fades between
              Stage 1, 2 & 3 in place — cards NEVER scroll up over the animation!
          - Desktop (>= 1024px): Full 100svh central animation spine flanked by
            left & right editorial columns.
         ===================================================================== */}
      <div className="pointer-events-none sticky top-0 z-20 flex h-[100svh] w-full flex-col overflow-hidden lg:block">
        {gl && (
          <Suspense fallback={null}>
            <div className="absolute inset-x-0 top-0 h-[60svh] opacity-75 lg:inset-0 lg:h-full">
              <HeroScene
                lowPower={small}
                active={inView}
                scrollRef={scrollRef}
                accentHex={featuredGame.cover.accent}
              />
            </div>
          </Suspense>
        )}

        {/* TOP 60% ON MOBILE / FULL 100% ON DESKTOP: Unobstructed Animation Stage */}
        <div className="relative h-[60svh] w-full shrink-0 pt-14 lg:h-full lg:pt-0">
          <ReelSpine
            containerRef={containerRef}
            scrollRef={scrollRef}
            accentHex={featuredGame.cover.accent}
          />
        </div>

        {/* ===================================================================
            MOBILE FIXED BOTTOM HUD DOCK (40svh, < 1024px)
            Stays pinned at the bottom of the screen and cross-fades between
            Stages 1, 2, and 3 so text NEVER covers the top 60% animation!
           =================================================================== */}
        <div className="pointer-events-auto relative z-30 flex h-[40svh] w-full flex-col justify-between border-t border-red-500/30 bg-gradient-to-b from-night/95 via-night/98 to-void px-4 pt-3 pb-4 shadow-[0_-18px_45px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:px-6 lg:hidden">
          {/* Dock Header Bar: Active Stage Kicker + Interactive 1 · 2 · 3 Stage Switcher */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 font-display text-[11px] text-white">
                {num(activeStage + 1)}
              </span>
              <span className="font-condensed text-xs tracking-[0.18em] text-ice-300 uppercase">
                {activeStage === 0
                  ? t.hero.kicker
                  : activeStage === 1
                    ? t.hero.s2Kicker
                    : t.hero.s3Kicker}
              </span>
            </div>

            {/* Interactive Stage Pills */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToStage(idx)}
                  aria-label={`Stage ${idx + 1}`}
                  className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold transition ${
                    activeStage === idx
                      ? 'border-red-500 bg-red-600/25 text-white shadow-[0_0_12px_rgba(229,0,0,0.4)]'
                      : 'border-white/15 bg-white/5 text-white/45'
                  }`}
                >
                  <span className="font-condensed tracking-wider">{num(idx + 1)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cross-Fading Stage Content Body inside the Fixed Dock */}
          <div className="relative flex flex-1 flex-col justify-center overflow-hidden py-1">
            <AnimatePresence mode="wait">
              {activeStage === 0 && (
                <motion.div
                  key="mob-s1"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-2"
                >
                  <h1 className="font-display text-2xl leading-[0.96] text-white sm:text-3xl" key={lang}>
                    <span className="text-red-500 text-glow">{t.hero.title1} </span>
                    <span>{t.hero.title2} </span>
                    <span className="text-outline-ice">{t.hero.title3}</span>
                  </h1>
                  <p className="line-clamp-2 text-xs leading-relaxed text-white/75 sm:text-sm">
                    {t.hero.s1Desc}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2.5">
                    <MagneticButton to="/games">
                      {t.hero.cta} <span className="rtl:rotate-180">→</span>
                    </MagneticButton>
                    <MagneticButton href={WHATSAPP} target="_blank" variant="ghost">
                      {t.hero.cta2}
                    </MagneticButton>
                  </div>
                </motion.div>
              )}

              {activeStage === 1 && (
                <motion.div
                  key="mob-s2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-2"
                >
                  <h2 className="font-display text-2xl leading-none text-white uppercase sm:text-3xl">
                    <span>{t.hero.s2Title1} </span>
                    <span className="text-red-500 text-glow">{t.hero.s2Title2}</span>
                  </h2>
                  <p className="line-clamp-3 text-xs leading-relaxed text-white/75 sm:text-sm">
                    {t.hero.s2Desc}
                  </p>
                  <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ice-300">
                      <Icon name="shield" className="h-3.5 w-3.5 text-red-500" />
                      {t.hero.s2Badge}
                    </span>
                    <a href="#how" className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
                      <span>{t.hero.s2Link}</span>
                      <span className="rtl:rotate-180">→</span>
                    </a>
                  </div>
                </motion.div>
              )}

              {activeStage === 2 && (
                <motion.div
                  key="mob-s3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg leading-none text-white uppercase sm:text-xl">
                      <span>{t.hero.s3Title1} </span>
                      <span className="text-red-500">{t.hero.s3Title2} </span>
                      <span className="text-ice-300">{t.hero.s3Title3}</span>
                    </h2>
                    <span className="font-condensed text-xs tracking-widest text-ice-300" dir="ltr">
                      {num(featuredIdx + 1)} / {num(featuredList.length)}
                    </span>
                  </div>

                  {/* Compact Game Vault Card inside the Mobile Stage 3 Dock */}
                  <div className="flex items-center gap-3 rounded border border-white/15 bg-void/90 p-2.5">
                    <Link to={`/game/${featuredGame.id}`} className="w-14 shrink-0 overflow-hidden rounded sm:w-16">
                      <GameCover game={featuredGame} className="aspect-[2/3] w-full" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-1" dir="ltr">
                        {featuredGame.platforms.map((p) => (
                          <span
                            key={p}
                            className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-ice-200 uppercase"
                          >
                            {p}
                          </span>
                        ))}
                        <span className="ms-1 text-[10px] font-semibold text-red-400">
                          · {t.hero.s3Unlocked}
                        </span>
                      </div>
                      <Link
                        to={`/game/${featuredGame.id}`}
                        className="truncate font-display text-sm text-white hover:text-red-400 sm:text-base"
                        dir="ltr"
                        style={{ textAlign: 'start' }}
                      >
                        {featuredGame.title}
                      </Link>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="text-[11px] text-white/65">
                          {t.card.from}{' '}
                          <span className="font-display text-xs text-ice-300 sm:text-sm">
                            {egp(minPrice(featuredGame))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/game/${featuredGame.id}`}
                            className="clip-angle-sm inline-flex items-center gap-1 bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-500"
                          >
                            <span>{t.product.buy}</span>
                            <span className="rtl:rotate-180">→</span>
                          </Link>
                          <button
                            type="button"
                            onClick={cycleGame}
                            className="rounded border border-white/15 bg-white/5 px-2 py-1 text-[11px] text-ice-300 hover:border-ice-300"
                          >
                            {t.hero.s3Next}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Side Rail Progress Pill (Desktop only, since Mobile has pills in the dock header) */}
        <div className="pointer-events-auto absolute end-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToStage(idx)}
              aria-label={`Stage ${idx + 1}`}
              className={`group flex items-center gap-1.5 transition ${
                activeStage === idx ? 'text-red-500' : 'text-white/45 hover:text-ice-300'
              }`}
            >
              <span className="font-condensed text-xs tracking-[0.18em]">{num(idx + 1)}</span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  activeStage === idx
                    ? 'h-8 w-1 bg-red-500 shadow-[0_0_10px_#ff1a1a]'
                    : 'h-3 w-1 bg-white/25 group-hover:bg-ice-300/60'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          LAYER 3 (z-30): 3-STAGE SCROLL TRACK & DESKTOP EDITORIAL COLUMNS
          - On Mobile (< 1024px): The 3 sections provide the 300svh scroll track
            with zero overlapping DOM nodes (all mobile UI lives in the fixed dock!).
          - On Desktop (>= 1024px): Left & Right flanking columns around the center spine.
         ===================================================================== */}
      <div className="pointer-events-none relative z-30 -mt-[100svh] lg:pointer-events-auto">
        {/* -------------------------------------------------------------------
            STAGE 1: RED ZONE MASCOT SHIELD & SPLITTING DUALSENSE CONTROLLER
           ------------------------------------------------------------------- */}
        <section
          ref={stage1Ref}
          className="relative flex min-h-[100svh] flex-col justify-center lg:pt-20 lg:pb-16"
        >
          <Chevrons className="pointer-events-none absolute top-24 start-6 hidden text-ice-400 lg:flex" count={5} />

          <div className="relative mx-auto hidden w-full max-w-7xl items-center gap-4 px-6 lg:grid lg:grid-cols-[1fr_minmax(360px,480px)_1fr]">
            {/* START COLUMN (Desktop): Giant Stacked Headline + Explore Link */}
            <div className="flex flex-col items-start gap-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={ready ? { opacity: 1, y: 0 } : {}}
                className="flex items-center gap-2.5"
              >
                <span className="font-condensed text-lg tracking-[0.22em] text-ice-300 uppercase" dir="ltr">
                  <ScrambleText text={t.hero.kicker} />
                </span>
              </motion.div>

              <h1 className="font-display leading-[0.92] text-white" key={lang}>
                {[t.hero.title1, t.hero.title2, t.hero.title3].map((w, i) => (
                  <span key={i} className="block overflow-hidden pb-1">
                    <motion.span
                      custom={i}
                      variants={line}
                      initial="hidden"
                      animate={anim}
                      className={`block ${
                        i === 0
                          ? 'text-6xl text-red-600 text-glow xl:text-[6.2rem]'
                          : 'text-4xl xl:text-[4.1rem]'
                      } ${i === 2 ? 'text-outline-ice' : ''}`}
                    >
                      {i === 0 ? <GlitchText text={w} active={ready} /> : w}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={ready ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.75 }}
                className="pt-2"
              >
                <Link
                  to="/games"
                  className="group inline-flex items-center gap-3 border-b border-ice-300/40 pb-1.5 text-sm font-semibold tracking-wide text-ice-200 transition hover:border-red-500 hover:text-white"
                >
                  <span>{t.hero.exploreLink}</span>
                  <span className="transition-transform group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5">
                    →
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* CENTER LANE: Open window on Desktop for the sticky ReelSpine */}
            <div className="pointer-events-none h-[520px]" aria-hidden />

            {/* END COLUMN (Desktop): Number "1" + Editorial Copy + Magnetic CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45, duration: 0.8 }}
            >
              <div className="mb-2 font-display text-6xl leading-none text-ice-300">
                {num(1)}
              </div>
              <div className="mb-1.5 font-condensed text-base tracking-[0.22em] text-red-500 uppercase">
                {t.hero.s1Kicker}
              </div>
              <h2 className="mb-3 font-display text-3xl text-white">
                {t.hero.s1Title}
              </h2>
              <p className="mb-6 max-w-md text-base leading-relaxed text-white/75">
                {t.hero.s1Desc}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton to="/games">
                  {t.hero.cta} <span className="rtl:rotate-180">→</span>
                </MagneticButton>
                <MagneticButton href={WHATSAPP} target="_blank" variant="ghost">
                  {t.hero.cta2}
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            STAGE 2: PLAYSTATION HOLOGRAPHIC QR PORTAL & SMARTPHONE LASER SCAN
           ------------------------------------------------------------------- */}
        <section
          ref={stage2Ref}
          className="relative flex min-h-[100svh] flex-col justify-center lg:py-20"
        >
          <Crosses className="pointer-events-none absolute top-16 end-8 hidden text-ice-300/60 lg:flex" count={5} />

          <div className="relative mx-auto hidden w-full max-w-7xl items-center gap-4 px-6 lg:grid lg:grid-cols-[1fr_minmax(360px,480px)_1fr]">
            {/* START COLUMN (Desktop): Number "2" + "LET IT LOCK IN" + Description */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center gap-4"
            >
              <div>
                <div className="font-display text-7xl leading-none text-ice-300">
                  {num(2)}
                </div>
                <div className="mt-2 flex items-center gap-2 font-condensed text-base tracking-[0.2em] text-red-400 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>{t.hero.s2Kicker}</span>
                </div>
              </div>

              <div>
                <h2 className="font-display text-5xl leading-[0.95] text-white uppercase xl:text-7xl">
                  <span className="block">{t.hero.s2Title1}</span>
                  <span className="block text-red-500 text-glow">{t.hero.s2Title2}</span>
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
                  {t.hero.s2Desc}
                </p>
              </div>
            </motion.div>

            {/* CENTER LANE: Open window on Desktop for Stage 2 QR Portal & Phone Scanner */}
            <div className="pointer-events-none h-[500px]" aria-hidden />

            {/* END COLUMN (Desktop): Live QR Telemetry Card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.75 }}
            >
              <div className="clip-angle relative border border-ice-300/25 bg-night/85 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ice-300">
                    <Icon name="shield" className="h-4 w-4 text-red-500" />
                    <span>{t.hero.s2Badge}</span>
                  </div>
                  <span className="font-mono text-xs text-red-400" dir="ltr">
                    RZ7-K2M
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative shrink-0 rounded border border-red-500/40 bg-void p-1.5">
                    <FakeQR seed={7} className="h-20 w-20" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-white/75">
                    <div className="font-display text-base text-white">
                      {t.how.title}
                    </div>
                    <p className="text-xs leading-relaxed text-white/65">
                      {t.how.why}
                    </p>
                    <a
                      href="#how"
                      className="mt-1 inline-flex items-center gap-2 font-semibold text-ice-300 transition hover:text-red-400"
                    >
                      <span>{t.hero.s2Link}</span>
                      <span className="rtl:rotate-180">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* -------------------------------------------------------------------
            STAGE 3: SWIRLING DATA RIBBONS -> STANDING PS5 CONSOLE & GAME VAULT
           ------------------------------------------------------------------- */}
        <section
          ref={stage3Ref}
          className="relative flex min-h-[100svh] flex-col justify-center lg:py-20"
        >
          <div className="relative mx-auto hidden w-full max-w-7xl items-center gap-4 px-6 lg:grid lg:grid-cols-[1fr_minmax(360px,480px)_1fr]">
            {/* START COLUMN (Desktop): Interactive Unlocked Game Vault Card */}
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7 }}
            >
              <div className="clip-angle relative mx-auto max-w-md border border-white/15 bg-night/90 p-5 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-md">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/20 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
                    <PSShape shape="triangle" className="h-3 w-3" />
                    {t.hero.s3Unlocked}
                  </span>
                  <span className="font-condensed text-sm tracking-widest text-ice-300" dir="ltr">
                    {num(featuredIdx + 1)} / {num(featuredList.length)}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={featuredGame.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-4"
                  >
                    <Link to={`/game/${featuredGame.id}`} className="w-28 shrink-0 overflow-hidden rounded">
                      <GameCover game={featuredGame} className="aspect-[2/3] w-full" />
                    </Link>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-wrap gap-1" dir="ltr">
                        {featuredGame.platforms.map((p) => (
                          <span key={p} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-ice-200 uppercase">
                            {p}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/game/${featuredGame.id}`}
                        className="font-display text-xl leading-tight text-white transition hover:text-red-400"
                      >
                        {featuredGame.title}
                      </Link>
                      <div className="text-xs text-white/65">
                        {t.card.from}{' '}
                        <span className="font-display text-base text-ice-300">
                          {egp(minPrice(featuredGame))}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Link
                          to={`/game/${featuredGame.id}`}
                          className="clip-angle-sm inline-flex items-center gap-1.5 bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-500"
                        >
                          <span>{t.product.buy}</span>
                          <span className="rtl:rotate-180">→</span>
                        </Link>
                        <button
                          type="button"
                          onClick={cycleGame}
                          className="inline-flex items-center gap-1 rounded border border-white/15 px-2.5 py-1.5 text-xs text-ice-300 transition hover:border-ice-300 hover:bg-white/5"
                        >
                          <span>{t.hero.s3Next}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* CENTER LANE: Open window on Desktop for Stage 3 Ribbons & PS5 Console Tower */}
            <div className="pointer-events-none h-[500px]" aria-hidden />

            {/* END COLUMN (Desktop): Number "3" + Stacked "MAKE EVERY GAME YOURS" Headline */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.75 }}
              className="flex flex-col items-start gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-6xl leading-none text-ice-300">
                  {num(3)}
                </span>
                <div className="h-8 w-px bg-white/15" />
                <span className="font-condensed text-lg tracking-[0.2em] text-red-400 uppercase">
                  {t.hero.s3Kicker}
                </span>
              </div>

              <h2 className="font-display text-5xl leading-[0.94] text-white uppercase xl:text-[4.4rem]">
                <span className="block">{t.hero.s3Title1}</span>
                <span className="block text-red-500 text-glow">{t.hero.s3Title2}</span>
                <span className="block text-outline-ice">{t.hero.s3Title3}</span>
              </h2>

              <p className="max-w-md text-base leading-relaxed text-white/75">
                {t.hero.s3Desc}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <MagneticButton to="/games">
                  {t.cta.btn} <span className="rtl:rotate-180">→</span>
                </MagneticButton>
                <button
                  type="button"
                  onClick={cycleGame}
                  aria-label={t.hero.s3Next}
                  className="group flex h-12 w-12 items-center justify-center rounded-full border border-ice-300/35 bg-white/5 text-ice-200 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
                >
                  <span className="text-lg transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
                    →
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          <StripedCircle className="pointer-events-none absolute bottom-10 end-10 hidden h-14 w-14 opacity-60 lg:block" />
        </section>
      </div>
    </div>
  )
}
