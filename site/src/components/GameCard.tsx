import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { genreLabel, minPrice, type Game } from '../data/games'
import { useI18n } from '../i18n'
import { GameCover } from './GameCover'
import { TiltCard } from './fx/TiltCard'

export function GameCard({ game, className = '' }: { game: Game; className?: string }) {
  const { t, l, egp, num } = useI18n()
  const price = minPrice(game)
  const fill = Math.min(1, game.slotsLeft / 10)

  return (
    <TiltCard className={className} max={10}>
      <Link
        to={`/game/${game.id}`}
        draggable={false}
        className="group clip-angle relative flex h-full flex-col overflow-hidden border border-white/10 bg-night/80 transition-colors duration-300 hover:border-red-500/70"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.div className="h-full w-full" whileHover={{ scale: 1.07 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <GameCover game={game} className="h-full w-full" />
          </motion.div>
          <div className="absolute start-3 top-3 flex flex-col items-start gap-1.5">
            {game.discount && (
              <span className="clip-angle-sm bg-red-600 px-2 py-1 font-display text-xs text-white">-{num(game.discount)}%</span>
            )}
            {game.badge && (
              <span
                className={`px-2 py-1 font-condensed text-sm leading-none tracking-wider uppercase ${
                  game.badge === 'preorder' ? 'bg-ice-300 text-void' : game.badge === 'hot' ? 'bg-white text-red-700' : 'bg-void/80 text-ice-300 ring-1 ring-ice-300/50'
                }`}
              >
                {game.badge === 'preorder' ? t.card.preorder : game.badge === 'hot' ? `🔥 ${t.card.hot}` : t.card.new}
              </span>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-red-600/0 opacity-0 transition-all duration-300 group-hover:bg-red-900/30 group-hover:opacity-100">
            <span className="translate-y-4 border border-white bg-void/70 px-4 py-2 font-display text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
              {t.card.add} +
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="text-xs text-ice-300/60">{l(genreLabel[game.genre])}</div>
          <h3 className="line-clamp-1 font-body text-base font-bold text-white" dir="ltr" style={{ textAlign: 'start' }}>
            {game.title}
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              <div className="text-[11px] text-ice-200/50">{t.card.from}</div>
              <div className="font-display text-lg text-red-500">{egp(price)}</div>
            </div>
            <div className="text-end">
              <div className="text-[11px] text-ice-200/50">
                {num(game.slotsLeft)} {t.card.slotsLeft}
              </div>
              <div className="mt-1 h-1 w-16 overflow-hidden bg-white/10">
                <motion.div
                  className={`h-full ${game.slotsLeft <= 3 ? 'bg-red-500' : 'bg-ice-400'}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${fill * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </TiltCard>
  )
}
