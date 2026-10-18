import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { games, genreLabel, minPrice, type Genre, type Platform } from '../data/games'
import { useI18n } from '../i18n'
import { GameCard } from '../components/GameCard'
import { Chevrons } from '../components/fx/Shapes'

type SlotFilter = 'all' | 'primary' | 'secondary' | 'full'
type Sort = 'popular' | 'low' | 'high' | 'new'

function Pills<T extends string>({ value, options, onChange, id }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; id: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className="relative px-3.5 py-1.5 text-sm">
          {value === o.v && <motion.span layoutId={`pill-${id}`} className="absolute inset-0 bg-red-600" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
          <span className={`relative ${value === o.v ? 'text-white' : 'text-white/60 hover:text-white'}`}>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export default function Catalog() {
  const { t, l, num } = useI18n()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [platform, setPlatform] = useState<Platform | 'all'>('all')
  const [slot, setSlot] = useState<SlotFilter>('all')
  const [genre, setGenre] = useState<Genre | 'all'>('all')
  const [sort, setSort] = useState<Sort>('popular')

  const list = useMemo(() => {
    const res = games.filter((g) => {
      if (q && !g.title.toLowerCase().includes(q.toLowerCase())) return false
      if (platform !== 'all' && !g.platforms.includes(platform)) return false
      if (genre !== 'all' && g.genre !== genre) return false
      if (slot !== 'all') {
        const keys = Object.keys(g.prices)
        if (slot === 'full' && !keys.includes('full')) return false
        if (slot === 'primary' && !keys.some((k) => k.endsWith('Primary') && (platform === 'all' || k.startsWith(platform)))) return false
        if (slot === 'secondary' && !keys.some((k) => k.endsWith('Secondary') && (platform === 'all' || k.startsWith(platform)))) return false
      }
      return true
    })
    const by = { popular: (a: typeof games[0], b: typeof games[0]) => b.popularity - a.popularity, low: (a: typeof games[0], b: typeof games[0]) => minPrice(a) - minPrice(b), high: (a: typeof games[0], b: typeof games[0]) => minPrice(b) - minPrice(a), new: (a: typeof games[0], b: typeof games[0]) => b.added - a.added }
    return res.sort(by[sort])
  }, [q, platform, slot, genre, sort])

  const genres = Array.from(new Set(games.map((g) => g.genre)))
  const reset = () => { setQ(''); setPlatform('all'); setSlot('all'); setGenre('all'); setSort('popular') }

  return (
    <div className="relative min-h-screen pt-28 pb-24">
      <div className="stripes-bg pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-30 [mask-image:linear-gradient(black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <Chevrons className="mb-4 text-red-600" />
          <h1 className="font-display text-5xl sm:text-7xl">{t.catalog.title}</h1>
          <p className="mt-3 max-w-xl text-white/60">{t.catalog.sub}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="clip-angle sticky top-16 z-30 mb-10 flex flex-col gap-4 border border-white/10 bg-night/90 p-4 backdrop-blur-xl sm:top-20 sm:p-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.catalog.search}
                className="w-full border border-white/15 bg-void px-4 py-3 ps-11 text-white placeholder:text-white/30 focus:border-red-500 focus:outline-none"
              />
              <svg className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="border border-white/15 bg-void px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none">
              {(Object.keys(t.catalog.sorts) as Sort[]).map((s) => <option key={s} value={s}>{t.catalog.sorts[s]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-3 text-sm lg:flex-row lg:items-center lg:gap-8">
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-white/40">{t.catalog.platform}</span>
              <Pills id="plat" value={platform} onChange={setPlatform} options={[{ v: 'all', label: t.catalog.all }, { v: 'ps5', label: 'PS5' }, { v: 'ps4', label: 'PS4' }]} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-white/40">{t.catalog.slot}</span>
              <Pills id="slot" value={slot} onChange={setSlot} options={[{ v: 'all', label: t.catalog.all }, { v: 'primary', label: t.slots.primary }, { v: 'secondary', label: t.slots.secondary }, { v: 'full', label: t.slots.full }]} />
            </div>
          </div>
          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto text-sm">
            <span className="w-20 shrink-0 text-white/40">{t.catalog.genre}</span>
            <Pills id="genre" value={genre} onChange={setGenre} options={[{ v: 'all', label: t.catalog.all }, ...genres.map((g) => ({ v: g, label: l(genreLabel[g]) }))]} />
          </div>
        </motion.div>

        <div className="mb-5 flex items-center justify-between text-sm text-white/50">
          <span><motion.b key={list.length} initial={{ scale: 1.6, color: '#ff1a1a' }} animate={{ scale: 1, color: '#ffffff' }} className="inline-block font-display">{num(list.length)}</motion.b> {t.catalog.results}</span>
          <button onClick={reset} className="hover:text-red-400">{t.catalog.reset}</button>
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
            <div className="mb-4 text-5xl">👾</div>
            {t.catalog.empty}
          </motion.div>
        )}
      </div>
    </div>
  )
}
