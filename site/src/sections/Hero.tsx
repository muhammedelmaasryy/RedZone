import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent } from 'react'
import { WHATSAPP } from '../data/content'
import { useI18n } from '../i18n'
import { useMediaQuery, webglAvailable } from '../lib/hooks'
import { markSceneReady } from '../lib/sceneReady'
import { GlitchText } from '../components/fx/GlitchText'
import { MagneticButton } from '../components/fx/MagneticButton'
import { ScrambleText } from '../components/fx/ScrambleText'
import { Chevrons, Crosses, PSShape, StripedCircle } from '../components/fx/Shapes'

const HeroScene = lazy(() => import('../components/three/HeroScene'))

const line = {
  hidden: { y: '110%' },
  show: (i: number) => ({ y: '0%', transition: { delay: 0.15 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } }),
}

export function Hero({ ready }: { ready: boolean }) {
  const { t, lang, dir } = useI18n()
  const ref = useRef<HTMLElement>(null)
  const [gl, setGl] = useState(false)
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const small = useMediaQuery('(max-width: 768px)')
  useEffect(() => {
    const ok = webglAvailable() && !reduce
    setGl(ok)
    if (!ok) markSceneReady()
  }, [reduce])
  // pause the WebGL loop when the hero is off screen
  const inView = useInView(ref, { amount: 0.02 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yText = useTransform(scrollYProgress, [0, 1], [0, 160])
  const yMascot = useTransform(scrollYProgress, [0, 1], [0, -80])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 15 })
  const sy = useSpring(my, { stiffness: 60, damping: 15 })
  const rotY = useTransform(sx, [-1, 1], [-10, 10])
  const rotX = useTransform(sy, [-1, 1], [8, -8])
  const tx = useTransform(sx, [-1, 1], [-18, 18])
  const ty = useTransform(sy, [-1, 1], [-12, 12])
  const onMove = (e: PointerEvent) => {
    mx.set((e.clientX / window.innerWidth) * 2 - 1)
    my.set((e.clientY / window.innerHeight) * 2 - 1)
  }

  const anim = ready ? 'show' : 'hidden'

  return (
    <section ref={ref} onPointerMove={onMove} className="noise relative flex items-center overflow-hidden pt-20 sm:min-h-[100svh]">
      {/* backdrop layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#3a0000_0%,#110101_45%,#050001_80%)]" />
      <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <motion.div
        aria-hidden
        className="absolute -end-[20%] top-0 h-full w-[70%] origin-top"
        initial={{ scaleY: 0 }}
        animate={ready ? { scaleY: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        style={{ background: 'repeating-linear-gradient(-55deg, transparent 0 70px, rgba(229,0,0,0.22) 70px 140px)' }}
      />
      {gl && (
        <Suspense fallback={null}>
          <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? (small ? 0.45 : 1) : 0 }} transition={{ duration: 1.2, delay: 0.9 }}>
            <HeroScene lowPower={small} side={small ? 0 : dir === 'rtl' ? -1 : 1} active={inView} />
          </motion.div>
        </Suspense>
      )}

      <div className="pointer-events-none absolute inset-y-0 start-0 w-full bg-gradient-to-r from-void/80 via-void/30 to-transparent lg:w-[60%] rtl:bg-gradient-to-l" />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-void sm:h-32" />

      {/* HUD lines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1000 600" aria-hidden>
        <motion.path
          d="M 640 120 H 960 V 300"
          fill="none" stroke="#bdc9e7" strokeOpacity="0.7" strokeWidth="1.2" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} animate={ready ? { pathLength: 1 } : {}} transition={{ duration: 1.6, delay: 0.6 }}
        />
        <motion.path
          d="M 0 520 H 140"
          fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} animate={ready ? { pathLength: 1 } : {}} transition={{ duration: 1, delay: 1 }}
        />
      </svg>
      <Chevrons className="absolute top-28 start-6 hidden text-ice-400 md:flex" count={5} />
      <Crosses className="absolute bottom-24 end-8 hidden text-ice-300/70 md:flex" count={5} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-3 px-4 pt-2 pb-12 sm:gap-10 sm:px-6 sm:pt-0 sm:pb-24 lg:grid-cols-[1.15fr_1fr]">
        {/* copy */}
        <motion.div style={{ y: yText, opacity: fade }} className="flex flex-col items-start gap-3 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="font-condensed text-base tracking-[0.25em] text-ice-300 uppercase sm:text-lg" dir="ltr">
              <ScrambleText text={t.hero.kicker} />
            </span>
          </motion.div>

          <h1 className="font-display leading-[0.95] text-white" key={lang}>
            {[t.hero.title1, t.hero.title2, t.hero.title3].map((w, i) => (
              <span key={i} className="block overflow-hidden pb-2">
                <motion.span
                  custom={i}
                  variants={line}
                  initial="hidden"
                  animate={anim}
                  className={`block ${i === 0 ? 'text-5xl text-red-600 text-glow sm:text-8xl lg:text-[8.5rem]' : 'text-[1.9rem] sm:text-6xl lg:text-7xl'} ${i === 2 ? 'text-outline-ice' : ''}`}
                >
                  {i === 0 ? <GlitchText text={w} active={ready} /> : w}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="max-w-lg text-sm leading-relaxed text-ice-200/75 sm:text-base lg:text-lg"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.75 }}
            className="flex flex-wrap items-center gap-3"
          >
            <MagneticButton to="/games">{t.hero.cta} <span className="rtl:rotate-180">→</span></MagneticButton>
            <MagneticButton href={WHATSAPP} target="_blank" variant="ghost">{t.hero.cta2}</MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={ready ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1, type: 'spring' }}
            className="clip-angle-sm hidden items-center gap-2 border border-ice-300/40 bg-ice-300/10 px-3 py-2 text-sm text-ice-300 sm:flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="m3 3 18 18" />
            </svg>
            {t.hero.badge}
          </motion.div>
        </motion.div>

        {/* mascot */}
        <motion.div style={{ y: yMascot }} className="relative order-first mx-auto w-full max-w-[250px] sm:max-w-[340px] lg:order-none lg:max-w-[460px]">
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(229,0,0,0.38)_0%,rgba(169,188,240,0.14)_40%,transparent_68%)]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.3, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ rotateX: rotX, rotateY: rotY, x: tx, y: ty, transformPerspective: 900 }}
            className="relative will-change-transform"
          >
            <svg viewBox="0 0 400 440" className="relative w-full">
              <defs>
                <clipPath id="shield">
                  <path d="M200 10 L380 70 V230 C380 330 300 400 200 430 C100 400 20 330 20 230 V70 Z" />
                </clipPath>
              </defs>
              <path d="M200 10 L380 70 V230 C380 330 300 400 200 430 C100 400 20 330 20 230 V70 Z" fill="#ff1a1a" transform="translate(0 0) scale(1)" />
              <g clipPath="url(#shield)">
                <image href="/brand/mascot.webp" x="0" y="20" width="400" height="420" preserveAspectRatio="xMidYMin slice" />
              </g>
              <path d="M200 10 L380 70 V230 C380 330 300 400 200 430 C100 400 20 330 20 230 V70 Z" fill="none" stroke="#ff1a1a" strokeWidth="10" />
              <path d="M200 26 L366 82 V230 C366 320 292 384 200 412 C108 384 34 320 34 230 V82 Z" fill="none" stroke="#bdc9e7" strokeWidth="7" />
            </svg>
            <motion.div
              className="absolute -start-6 top-10 text-red-500"
              animate={{ y: [0, -14, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PSShape shape="triangle" className="h-12 w-12" />
            </motion.div>
            <motion.div
              className="absolute -end-4 top-1/3"
              animate={{ y: [0, 12, 0], rotate: [0, -25, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <StripedCircle className="h-14 w-14" />
            </motion.div>
            <motion.div
              className="absolute -bottom-2 start-8 text-ice-200"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            >
              <PSShape shape="square" className="h-10 w-10" />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.1 }}
            className="relative -mt-6 hidden text-center sm:block"
            dir="ltr"
          >
            <div className="font-display text-5xl leading-none sm:text-6xl">
              <span className="text-red-600 [text-shadow:0_0_30px_rgba(255,26,26,.6)]">RED</span>{' '}
              <span className="text-ice-300">ZONE</span>
            </div>
            <div className="font-condensed text-2xl tracking-[0.5em] text-ice-300">STORE</div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: fade }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:flex flex-col items-center gap-2 text-xs tracking-[0.3em] text-white/50 uppercase"
      >
        {t.hero.scroll}
        <div className="h-10 w-6 rounded-full border border-white/30 p-1">
          <motion.div className="mx-auto h-2 w-1 rounded-full bg-red-500" animate={{ y: [0, 18, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />
        </div>
      </motion.div>
    </section>
  )
}
