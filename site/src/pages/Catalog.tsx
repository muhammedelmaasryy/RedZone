import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { games, genreLabel, minPrice, type Game, type Genre, type Platform } from '../data/games'
import { useI18n } from '../i18n'
import { useDebounce } from '../lib/hooks'
import { GameCard } from '../components/GameCard'
import { GameCover } from '../components/GameCover'
import { Chevrons } from '../components/fx/Shapes'
import { Icon } from '../components/Icon'

type SlotFilter = 'all' | 'primary' | 'secondary' | 'full'
type Sort = 'popular' | 'low' | 'high' | 'new'

const SORTS: Record<Sort, (a: Game, b: Game) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  low: (a, b) => minPrice(a) - minPrice(b),
  high: (a, b) => minPrice(b) - minPrice(a),
  new: (a, b) => b.added - a.added,
}

const SEARCH_DEBOUNCE_MS = 350

function Pills<T extends string>({
  value,
  options,
  onChange,
  id,
}: {
  value: T
  options: { v: T; label: string }[]
  onChange: (v: T) => void
  id: string
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className="relative border border-white/10 px-3 py-1.5 text-xs sm:text-sm">
          {value === o.v && (
            <motion.span
              layoutId={`pill-${id}`}
              className="absolute inset-0 bg-red-600"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className={`relative ${value === o.v ? 'text-white' : 'text-white/60 hover:text-white'}`}>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

function matches(g: Game, q: string, platform: Platform | 'all', slot: SlotFilter, genre: Genre | 'all') {
  if (q && !`${g.title} ${g.short}`.toLowerCase().includes(q.toLowerCase())) return false
  if (platform !== 'all' && !g.platforms.includes(platform)) return false
  if (genre !== 'all' && g.genre !== genre) return false
  if (slot !== 'all') {
    const keys = Object.keys(g.prices)
    if (slot === 'full') return keys.includes('full')
    const suffix = slot === 'primary' ? 'Primary' : 'Secondary'
    return keys.some((k) => k.endsWith(suffix) && (platform === 'all' || k.startsWith(platform)))
  }
  return true
}

export default function Catalog() {
  const { t, l, num, egp } = useI18n()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const dq = useDebounce(q.trim(), SEARCH_DEBOUNCE_MS)
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [slot, setSlot] = useState<SlotFilter>('all')
  const [genre, setGenre] = useState<Genre | 'all'>('all')
  const [sort, setSort] = useState<Sort>('popular')
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setParams(dq ? { q: dq } : {}, { replace: true })
  }, [dq, setParams])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const list = useMemo(
    () => games.filter((g) => matches(g, dq, platform, slot, genre)).sort(SORTS[sort]),
    [dq, platform, slot, genre, sort],
  )

  const genres = Array.from(new Set(games.map((g) => g.genre)))
  const activeCount = [platform !== 'all', slot !== 'all', genre !== 'all', sort !== 'popular'].filter(Boolean).length
  const pending = q.trim() !== dq
  const reset = () => {
    setQ('')
    setPlatform('all')
    setSlot('all')
    setGenre('all')
    setSort('popular')
  }

  return (
    <div className="relative min-h-screen pt-24 pb-24 sm:pt-28">
      <div className="stripes-bg pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-30 [mask-image:linear-gradient(black,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <Chevrons className="mb-3 text-red-600" />
          <h1 className="font-display text-4xl sm:text-7xl">{t.catalog.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/60 sm:mt-3 sm:text-base">{t.catalog.sub}</p>
        </motion.div>

        {/* Static Search & Filters Bar directly above the games grid (not floating/sticky) */}
        <div ref={boxRef} className="relative z-20 mb-6 border border-white/15 bg-night/90 p-3 sm:mb-8 sm:p-4">
          <div className="flex items-center gap-2">
            <div
              className={`relative flex flex-1 items-center border bg-void transition-colors ${
                open ? 'border-red-500 shadow-[0_0_24px_rgba(229,0,0,0.25)]' : 'border-white/15'
              }`}
            >
              <svg
                className="pointer-events-none absolute start-4 h-4 w-4 text-white/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
                placeholder={t.catalog.search}
                className="w-full bg-transparent px-4 py-3 ps-11 text-sm text-white placeholder:text-white/30 focus:outline-none sm:text-base"
                aria-expanded={open}
              />
              <AnimatePresence>
                {pending && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="me-3 flex shrink-0 items-center gap-2 text-xs text-white/40"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="h-3.5 w-3.5 rounded-full border-2 border-red-500 border-t-transparent"
                    />
                    <span className="hidden sm:inline">{t.catalog.searching}</span>
                  </motion.span>
                )}
                {q && !pending && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => setQ('')}
                    className="me-3 text-white/40 hover:text-white"
                    aria-label="Clear"
                  >
                    <Icon name="x" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className={`relative flex h-[46px] shrink-0 items-center gap-2 border px-3 text-sm transition-colors sm:px-4 ${
                open
                  ? 'border-red-500 bg-red-600 text-white'
                  : 'border-white/15 bg-void text-white/80 hover:border-white/40'
              }`}
              aria-label={t.catalog.filters}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              <span className="hidden sm:inline">{t.catalog.filters}</span>
              {activeCount > 0 && (
                <motion.span
                  key={activeCount}
                  initial={{ scale: 1.6 }}
                  animate={{ scale: 1 }}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-red-700"
                >
                  {num(activeCount)}
                </motion.span>
              )}
            </button>
          </div>

          {/* Inline/Dropdown filters panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -12, scaleY: 0.96 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -12, scaleY: 0.96 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ originY: 0 }}
                className="clip-angle absolute inset-x-0 top-full mt-2 max-h-[70vh] overflow-y-auto border border-white/15 bg-night p-4 shadow-[0_30px_80px_rgba(0,0,0,0.85)] sm:p-6"
                data-lenis-prevent
              >
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div className="flex flex-col gap-4 text-sm">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-white/40">{t.catalog.platform}</span>
                      <Pills
                        id="plat"
                        value={platform}
                        onChange={setPlatform}
                        options={[
                          { v: 'all', label: t.catalog.all },
                          { v: 'ps5', label: 'PS5' },
                          { v: 'ps4', label: 'PS4' },
                        ]}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-white/40">{t.catalog.slot}</span>
                      <Pills
                        id="slot"
                        value={slot}
                        onChange={setSlot}
                        options={[
                          { v: 'all', label: t.catalog.all },
                          { v: 'primary', label: t.slots.primary },
                          { v: 'secondary', label: t.slots.secondary },
                          { v: 'full', label: t.slots.full },
                        ]}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-white/40">{t.catalog.genre}</span>
                      <Pills
                        id="genre"
                        value={genre}
                        onChange={setGenre}
                        options={[
                          { v: 'all', label: t.catalog.all },
                          ...genres.map((g) => ({ v: g, label: l(genreLabel[g]) })),
                        ]}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-white/40">{t.catalog.sort}</span>
                      <Pills
                        id="sort"
                        value={sort}
                        onChange={setSort}
                        options={(Object.keys(t.catalog.sorts) as Sort[]).map((s) => ({
                          v: s,
                          label: t.catalog.sorts[s],
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-white/40">
                      {t.catalog.quick} · {num(list.length)}
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      <AnimatePresence initial={false} mode="popLayout">
                        {list.slice(0, 4).map((g) => (
                          <motion.li
                            key={g.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                          >
                            <Link
                              to={`/game/${g.id}`}
                              className="flex items-center gap-3 border border-transparent p-1.5 hover:border-red-500/50 hover:bg-white/5"
                            >
                              <GameCover game={g} className="h-12 w-9 shrink-0 [&_div.font-display]:!text-[8px]" />
                              <span
                                className="flex-1 truncate text-sm font-bold"
                                dir="ltr"
                                style={{ textAlign: 'start' }}
                              >
                                {g.title}
                              </span>
                              <span className="font-display text-xs text-red-400">{egp(minPrice(g))}</span>
                            </Link>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                      {list.length === 0 && <li className="py-4 text-sm text-white/40">{t.catalog.empty}</li>}
                    </ul>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <button onClick={reset} className="text-sm text-white/50 hover:text-red-400">
                    {t.catalog.reset}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="clip-angle-sm bg-red-600 px-5 py-2 font-display text-xs text-white hover:bg-red-500"
                  >
                    {t.catalog.done} ({num(list.length)})
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-white/50">
          <span>
            <motion.b
              key={list.length}
              initial={{ scale: 1.6, color: '#ff1a1a' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="inline-block font-display"
            >
              {num(list.length)}
            </motion.b>{' '}
            {t.catalog.results}
          </span>
          {(activeCount > 0 || q) && (
            <button onClick={reset} className="hover:text-red-400">
              {t.catalog.reset}
            </button>
          )}
        </div>

        <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((g, i) => (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.04 } }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(6px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <GameCard game={g} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center text-white/50">
            <Icon name="gamepad" className="mx-auto mb-4 h-14 w-14 text-ice-400" strokeWidth={1.5} />
            {t.catalog.empty}
          </motion.div>
        )}
      </div>
    </div>
  )
}
