import { AnimatePresence, motion, useInView } from 'motion/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { WHATSAPP } from '../data/content'
import { games, minPrice } from '../data/games'
import { useI18n } from '../i18n'
import { markSceneReady } from '../lib/sceneReady'
import { FakeQR } from '../components/FakeQR'
import { GameCover } from '../components/GameCover'
import { Icon } from '../components/Icon'
import { GlitchText } from '../components/fx/GlitchText'
import { MagneticButton } from '../components/fx/MagneticButton'
import { ScrambleText } from '../components/fx/ScrambleText'
import { Chevrons, Crosses, PSShape, StripedCircle } from '../components/fx/Shapes'
import { ReelSpine } from '../components/three/ReelSpine'

const FEATURED_IDS = ['fc27', 'gta6', 'spiderman2', 'bo7', 'yotei']
const AUTO_PLAY_MS = 7000
const STAGE_EASE = [0.22, 1, 0.36, 1] as const

const line = {
  hidden: { y: '110%' },
  show: (i: number) => ({
    y: '0%',
    transition: { delay: 0.15 + i * 0.11, duration: 0.85, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export function Hero({ ready }: { ready: boolean }) {
  const { t, lang, dir, egp, num } = useI18n()
  const containerRef = useRef<HTMLElement>(null)
  const stageAreaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef(0)
  const activeStageRef = useRef(0)

  const [activeStage, setActiveStage] = useState(0)
  const [featuredIdx, setFeaturedIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Desktop mouse drag state
  const mouseDragRef = useRef<{
    active: boolean
    startX: number
    baseP: number
    scrubbing: boolean
  }>({
    active: false,
    startX: 0,
    baseP: 0,
    scrubbing: false,
  })

  const inView = useInView(containerRef, { amount: 0.05 })

  useEffect(() => {
    const timer = setTimeout(() => markSceneReady(), 150)
    return () => clearTimeout(timer)
  }, [])

  const selectStage = useCallback((idx: number, pauseAuto = true) => {
    const clamped = ((idx % 3) + 3) % 3
    activeStageRef.current = clamped
    setActiveStage(clamped)
    scrollRef.current = clamped * 0.5
    if (pauseAuto) setAutoPlay(false)
  }, [])

  const stepStage = useCallback((delta: number, pauseAuto = true) => {
    const next = ((activeStageRef.current + delta) % 3 + 3) % 3
    activeStageRef.current = next
    setActiveStage(next)
    scrollRef.current = next * 0.5
    if (pauseAuto) setAutoPlay(false)
  }, [])

  // Gentle auto-advance every 7s until the user interacts with the Hero
  useEffect(() => {
    if (!ready || !autoPlay || !inView) return
    const timer = setTimeout(() => {
      stepStage(1, false)
    }, AUTO_PLAY_MS)
    return () => clearTimeout(timer)
  }, [ready, autoPlay, inView, activeStage, stepStage])

  // Non-passive native Touch & Wheel listeners on the Hero section so scrolling inside the Hero
  // locks to the Hero animation (e.preventDefault()) and does NOT scroll the whole page!
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let touchActive = false
    let startX = 0
    let startY = 0
    let baseP = 0
    let startedOnStageCanvas = false
    let gestureMode: 'undecided' | 'hero-scrub' | 'page-scroll' = 'undecided'
    let wheelCooldown = 0

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('a,button')) return
      const touch = e.touches[0]
      if (!touch) return

      touchActive = true
      startX = touch.clientX
      startY = touch.clientY
      baseP = scrollRef.current
      startedOnStageCanvas = Boolean(stageAreaRef.current?.contains(target))
      gestureMode = 'undecided'
    }

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!touchActive) return
      const touch = e.touches[0]
      if (!touch) return

      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (gestureMode === 'undecided') {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return

        const isHoriz = Math.abs(dx) >= Math.abs(dy)
        const swipingDown = dy < 0 // finger moves up -> scrolling down
        const swipingUp = dy > 0 // finger moves down -> scrolling up

        // If the user touches directly on the Hero animation stage, OR swipes horizontally,
        // OR scrolls vertically while not yet at the exit boundary, lock 100% inside the Hero!
        if (
          startedOnStageCanvas ||
          isHoriz ||
          (swipingDown && baseP < 0.98) ||
          (swipingUp && baseP > 0.02 && window.scrollY <= 10)
        ) {
          gestureMode = 'hero-scrub'
          setAutoPlay(false)
        } else {
          gestureMode = 'page-scroll'
        }
      }

      if (gestureMode === 'hero-scrub') {
        // Prevent the browser from scrolling the page while scrubbing inside the Hero!
        if (e.cancelable) e.preventDefault()

        const signX = dir === 'rtl' ? 1 : -1
        const primaryDelta =
          Math.abs(dx) >= Math.abs(dy)
            ? (dx * signX) / Math.max(220, window.innerWidth * 0.48)
            : -dy / Math.max(240, window.innerHeight * 0.42)

        const nextP = Math.max(0, Math.min(1, baseP + primaryDelta * 0.55))
        scrollRef.current = nextP

        const nearestStage = nextP < 0.25 ? 0 : nextP < 0.75 ? 1 : 2
        if (nearestStage !== activeStageRef.current) {
          activeStageRef.current = nearestStage
          setActiveStage(nearestStage)
        }
      }
    }

    const handleTouchEnd = (e: globalThis.TouchEvent) => {
      if (!touchActive) return
      touchActive = false
      if (gestureMode !== 'hero-scrub') return

      const touch = e.changedTouches[0]
      const dx = touch ? touch.clientX - startX : 0
      const dy = touch ? touch.clientY - startY : 0
      const signX = dir === 'rtl' ? 1 : -1

      const startStage = Math.round(baseP * 2)
      let targetStage = Math.round(scrollRef.current * 2)

      if (Math.abs(dx) >= Math.abs(dy)) {
        if (dx * signX > 32) targetStage = Math.min(2, startStage + 1)
        else if (dx * signX < -32) targetStage = Math.max(0, startStage - 1)
      } else {
        if (dy < -32) targetStage = Math.min(2, startStage + 1)
        else if (dy > 32) targetStage = Math.max(0, startStage - 1)
      }

      selectStage(targetStage, true)
    }

    const handleWheel = (e: globalThis.WheelEvent) => {
      if (window.scrollY > 16) return
      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0
      const curStage = activeStageRef.current

      if ((goingDown && curStage < 2) || (goingUp && curStage > 0)) {
        if (e.cancelable) e.preventDefault()
        const now = performance.now()
        if (now - wheelCooldown < 650) return
        if (Math.abs(e.deltaY) < 12) return
        wheelCooldown = now
        selectStage(curStage + (goingDown ? 1 : -1), true)
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    el.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
      el.removeEventListener('wheel', handleWheel)
    }
  }, [dir, selectStage])

  // Desktop mouse drag support on the Hero
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch' || (e.target as HTMLElement).closest('a,button')) return
    mouseDragRef.current = {
      active: true,
      startX: e.clientX,
      baseP: scrollRef.current,
      scrubbing: false,
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch') return
    const g = mouseDragRef.current
    if (!g.active) return
    const dx = e.clientX - g.startX
    if (Math.abs(dx) > 10) {
      g.scrubbing = true
      setAutoPlay(false)
      const signX = dir === 'rtl' ? 1 : -1
      const nextP = Math.max(0, Math.min(1, g.baseP + ((dx * signX) / 420) * 0.5))
      scrollRef.current = nextP
    }
  }

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch') return
    const g = mouseDragRef.current
    if (!g.active) return
    g.active = false
    if (!g.scrubbing) return
    const dx = e.clientX - g.startX
    const signX = dir === 'rtl' ? 1 : -1
    if (dx * signX > 45) selectStage(Math.min(2, activeStage + 1), true)
    else if (dx * signX < -45) selectStage(Math.max(0, activeStage - 1), true)
    else selectStage(Math.round(scrollRef.current * 2), true)
  }

  const featuredList = FEATURED_IDS.map((id) => games.find((g) => g.id === id) ?? games[0])
  const featuredGame = featuredList[featuredIdx % featuredList.length]

  const cycleGame = () => {
    setFeaturedIdx((prev) => (prev + 1) % featuredList.length)
  }

  const anim = ready ? 'show' : 'hidden'

  return (
    <section
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="noise relative h-[100svh] w-full overflow-hidden select-none"
    >
      {/* =====================================================================
          LAYER 0 (z-0): DYNAMIC STAGE-SYNCHRONIZED RADIAL BACKGROUNDS
         ===================================================================== */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{
            opacity: activeStage === 0 ? 1 : 0,
            background: 'radial-gradient(ellipse at 50% 35%, #3d0000 0%, #120102 55%, #050001 90%)',
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{
            opacity: activeStage === 1 ? 1 : 0,
            background: 'radial-gradient(ellipse at 50% 50%, #2e0408 0%, #120204 58%, #060002 100%)',
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-out"
          style={{
            opacity: activeStage === 2 ? 1 : 0,
            background: 'radial-gradient(ellipse at 35% 65%, #42050c 0%, #140205 52%, #050001 90%)',
          }}
        />
        <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_78%)]" />
        <div className="stripes-bg absolute inset-0 opacity-15" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-void" />
      </div>

      {/* =====================================================================
          SIDE NAVIGATION BUTTONS (LEFT & RIGHT EDGES OF THE HERO SECTION)
          Placed cleanly on the sides of the Hero section for both phone & desktop
         ===================================================================== */}
      <button
        type="button"
        onClick={() => stepStage(-1, true)}
        aria-label="Previous stage"
        className="pointer-events-auto absolute start-2.5 top-[34%] z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-night/80 text-white shadow-[0_0_20px_rgba(0,0,0,0.7)] transition hover:border-red-500 hover:bg-red-600 active:scale-95 sm:start-5 sm:h-12 sm:w-12 lg:top-1/2"
      >
        <span className="text-base sm:text-lg ltr:rotate-180">→</span>
      </button>

      <button
        type="button"
        onClick={() => stepStage(1, true)}
        aria-label="Next stage"
        className="pointer-events-auto absolute end-2.5 top-[34%] z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-night/80 text-white shadow-[0_0_20px_rgba(0,0,0,0.7)] transition hover:border-red-500 hover:bg-red-600 active:scale-95 sm:end-5 sm:h-12 sm:w-12 lg:top-1/2"
      >
        <span className="text-base sm:text-lg rtl:rotate-180">→</span>
      </button>

      {/* =====================================================================
          LAYER 1 (z-10): 4K 60/120FPS CANVAS INTERACTIVE REEL SPINE
         ===================================================================== */}
      <div className="relative z-10 flex h-full w-full flex-col lg:block">
        {/* TOP 64% ON MOBILE / FULL 100% ON DESKTOP: Unobstructed 3D Animation Stage
            touch-none on the animation stage ensures scrolling your finger on the
            animation NEVER scrolls the page outside the Hero! */}
        <div
          ref={stageAreaRef}
          className="pointer-events-auto relative h-[64svh] w-full shrink-0 touch-none pt-14 lg:h-full lg:pt-0"
        >
          <ReelSpine
            scrollRef={scrollRef}
            accentHex={featuredGame.cover.accent}
            active={inView}
          />
        </div>

        {/* ===================================================================
            MOBILE BOTTOM DOCK (36svh, < 1024px)
            Clean content dock without the 1, 2, 3 tab boxes or bottom buttons
           =================================================================== */}
        <div className="pointer-events-auto relative z-30 flex h-[36svh] w-full flex-col justify-center border-t border-red-500/30 bg-gradient-to-b from-night/98 via-void to-void px-4 py-3 shadow-[0_-18px_45px_rgba(0,0,0,0.88)] sm:px-6 lg:hidden">
          <div className="relative flex flex-1 flex-col justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {activeStage === 0 && (
                <motion.div
                  key="mob-s1"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.55, ease: STAGE_EASE }}
                  className="flex flex-col gap-2"
                >
                  <span className="font-condensed text-xs tracking-[0.18em] text-ice-300 uppercase">
                    {t.hero.kicker}
                  </span>
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
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.55, ease: STAGE_EASE }}
                  className="flex flex-col gap-2"
                >
                  <span className="font-condensed text-xs tracking-[0.18em] text-ice-300 uppercase">
                    {t.hero.s2Kicker}
                  </span>
                  <h2 className="font-display text-2xl leading-none text-white uppercase sm:text-3xl">
                    <span>{t.hero.s2Title1} </span>
                    <span className="text-red-500 text-glow">{t.hero.s2Title2}</span>
                  </h2>
                  <p className="line-clamp-2 text-xs leading-relaxed text-white/75 sm:text-sm">
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
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.55, ease: STAGE_EASE }}
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
                  <div className="flex items-center gap-3 rounded border border-white/15 bg-void/90 p-2">
                    <Link to={`/game/${featuredGame.id}`} className="w-12 shrink-0 overflow-hidden rounded sm:w-14">
                      <GameCover game={featuredGame} className="aspect-[2/3] w-full" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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
                        className="truncate font-display text-sm text-white hover:text-red-400"
                        dir="ltr"
                        style={{ textAlign: 'start' }}
                      >
                        {featuredGame.title}
                      </Link>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="text-[11px] text-white/65">
                          {t.card.from}{' '}
                          <span className="font-display text-xs text-ice-300">
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
      </div>

      {/* =====================================================================
          LAYER 2 (z-30): DESKTOP SINGLE-SCREEN HORIZONTAL STAGE OVERLAY (>= 1024px)
          Left & Right editorial columns transition horizontally around the
          central 3D ReelSpine, controlled by the side buttons or dragging!
         ===================================================================== */}
      <div className="pointer-events-none absolute inset-0 z-30 hidden flex-col justify-center pt-20 pb-8 lg:flex">
        <Chevrons className="pointer-events-none absolute top-24 start-6 text-ice-400" count={5} />
        <Crosses className="pointer-events-none absolute top-24 end-8 text-ice-300/60" count={5} />
        <StripedCircle className="pointer-events-none absolute bottom-10 end-10 h-14 w-14 opacity-60" />

        {/* Main 3-Column Editorial Stage Window */}
        <div className="relative mx-auto flex flex-1 w-full max-w-7xl items-center px-16">
          <AnimatePresence mode="wait">
            {activeStage === 0 && (
              <motion.div
                key="desk-s1"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.68, ease: STAGE_EASE }}
                className="pointer-events-auto grid w-full grid-cols-[1fr_minmax(340px,440px)_1fr] items-center gap-4"
              >
                {/* START COLUMN: Giant Stacked Headline + Explore Link */}
                <div className="flex flex-col items-start gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-condensed text-lg tracking-[0.22em] text-ice-300 uppercase" dir="ltr">
                      <ScrambleText text={t.hero.kicker} />
                    </span>
                  </div>

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
                              ? 'text-6xl text-red-600 text-glow xl:text-[5.8rem]'
                              : 'text-4xl xl:text-[3.8rem]'
                          } ${i === 2 ? 'text-outline-ice' : ''}`}
                        >
                          {i === 0 ? <GlitchText text={w} active={ready} /> : w}
                        </motion.span>
                      </span>
                    ))}
                  </h1>

                  <div className="pt-2">
                    <Link
                      to="/games"
                      className="group inline-flex items-center gap-3 border-b border-ice-300/40 pb-1.5 text-sm font-semibold tracking-wide text-ice-200 transition hover:border-red-500 hover:text-white"
                    >
                      <span>{t.hero.exploreLink}</span>
                      <span className="transition-transform group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5">
                        →
                      </span>
                    </Link>
                  </div>
                </div>

                {/* CENTER LANE: Open window for the 3D ReelSpine */}
                <div className="pointer-events-none h-[460px]" aria-hidden />

                {/* END COLUMN: Editorial Copy + Magnetic CTAs */}
                <div>
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
                </div>
              </motion.div>
            )}

            {activeStage === 1 && (
              <motion.div
                key="desk-s2"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.68, ease: STAGE_EASE }}
                className="pointer-events-auto grid w-full grid-cols-[1fr_minmax(340px,440px)_1fr] items-center gap-4"
              >
                {/* START COLUMN: "LET IT LOCK IN" + Description */}
                <div className="flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-2 font-condensed text-base tracking-[0.2em] text-red-400 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>{t.hero.s2Kicker}</span>
                  </div>

                  <div>
                    <h2 className="font-display text-5xl leading-[0.95] text-white uppercase xl:text-6xl">
                      <span className="block">{t.hero.s2Title1}</span>
                      <span className="block text-red-500 text-glow">{t.hero.s2Title2}</span>
                    </h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
                      {t.hero.s2Desc}
                    </p>
                  </div>
                </div>

                {/* CENTER LANE: Open window for Stage 2 QR Portal & Phone Scanner */}
                <div className="pointer-events-none h-[460px]" aria-hidden />

                {/* END COLUMN: Live QR Telemetry Card */}
                <div>
                  <div className="clip-angle relative border border-ice-300/25 bg-night/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
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
                </div>
              </motion.div>
            )}

            {activeStage === 2 && (
              <motion.div
                key="desk-s3"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.68, ease: STAGE_EASE }}
                className="pointer-events-auto grid w-full grid-cols-[1fr_minmax(340px,440px)_1fr] items-center gap-4"
              >
                {/* START COLUMN: Interactive Unlocked Game Vault Card */}
                <div>
                  <div className="clip-angle relative mx-auto max-w-md border border-white/15 bg-night/90 p-5 shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
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
                </div>

                {/* CENTER LANE: Open window for Stage 3 Ribbons & PS5 Console Tower */}
                <div className="pointer-events-none h-[460px]" aria-hidden />

                {/* END COLUMN: Stacked "MAKE EVERY GAME YOURS" Headline */}
                <div className="flex flex-col items-start gap-4">
                  <span className="font-condensed text-lg tracking-[0.2em] text-red-400 uppercase">
                    {t.hero.s3Kicker}
                  </span>

                  <h2 className="font-display text-5xl leading-[0.94] text-white uppercase xl:text-[4.1rem]">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
