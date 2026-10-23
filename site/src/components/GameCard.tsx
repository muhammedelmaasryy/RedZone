import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { genreLabel, minPrice, type Game } from '../data/games'
import { useI18n } from '../i18n'
import { GameCover } from './GameCover'
import { TiltCard } from './fx/TiltCard'
import { Icon } from './Icon'

function minBasePrice(game: Game) {
  const vals = Object.values(game.prices).filter((v): v is number => v != null)
  return Math.min(...vals)
}

export function GameCard({
  game,
  rank,
  className = '',
}: {
  game: Game
  rank?: number
  className?: string
}) {
  const { t, l, egp, num } = useI18n()
  const price = minPrice(game)
  const oldPrice = game.discount ? minBasePrice(game) : null
  const fill = Math.min(1, game.slotsLeft / 10)

  return (
    <TiltCard className={className} max={10}>
      <Link
        to={`/game/${game.id}`}
        draggable={false}
        className="group clip-angle relative flex h-full flex-col overflow-hidden border border-white/10 bg-night/80 transition-colors duration-300 hover:border-ice-300/70"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <motion.div
            className="h-full w-full"
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <GameCover game={game} className="h-full w-full" />
          </motion.div>

          {/* Optional Top-5 Bestseller Rank Badge (#1 .. #5) */}
          {rank != null && (
            <div
              className="clip-angle-sm absolute top-2 left-2 flex h-8 min-w-8 items-center justify-center border border-ice-300/60 bg-void/90 px-2 font-display text-xs text-white shadow-[0_0_20px_rgba(229,0,0,0.45)] sm:top-2.5 sm:left-2.5 sm:h-9 sm:min-w-9 sm:text-sm"
              dir="ltr"
            >
              <span className="text-red-500">#</span>
              <span>{num(rank)}</span>
            </div>
          )}

          {/* Discount & Status Badges */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1 sm:top-2.5 sm:right-2.5 sm:gap-1.5">
            {game.discount && (
              <span className="clip-angle-sm bg-red-600 px-1.5 py-0.5 font-display text-[10px] text-white shadow-[0_0_16px_rgba(229,0,0,0.5)] sm:px-2.5 sm:py-1 sm:text-xs">
                -{num(game.discount)}%
              </span>
            )}
            {game.badge && (
              <span
                className={`px-1.5 py-1 font-condensed text-xs leading-none tracking-wider uppercase sm:px-2 sm:text-sm ${
                  game.badge === 'preorder'
                    ? 'bg-ice-300 text-void'
                    : game.badge === 'hot'
                      ? 'bg-white text-red-700'
                      : 'bg-void/80 text-ice-300 ring-1 ring-ice-300/50'
                }`}
              >
                {game.badge === 'preorder' ? (
                  t.card.preorder
                ) : game.badge === 'hot' ? (
                  <span className="flex items-center gap-1">
                    <Icon name="flame" className="h-3 w-3" />
                    {t.card.hot}
                  </span>
                ) : (
                  t.card.new
                )}
              </span>
            )}
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-red-600/0 opacity-0 transition-all duration-300 group-hover:bg-red-900/30 group-hover:opacity-100">
            <span className="translate-y-4 border border-white bg-void/70 px-4 py-2 font-display text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
              {t.card.add} +
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-2.5 sm:gap-2 sm:p-4">
          <div className="text-[10px] text-ice-300/60 sm:text-xs">{l(genreLabel[game.genre])}</div>
          <h3
            className="line-clamp-1 font-body text-xs font-bold text-white sm:text-base"
            dir="ltr"
            style={{ textAlign: 'start' }}
          >
            {game.title}
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div>
              <div className="text-[9px] text-ice-200/50 sm:text-[11px]">{t.card.from}</div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-display text-sm text-red-500 sm:text-lg">{egp(price)}</span>
                {oldPrice != null && (
                  <span className="text-[10px] text-white/40 line-through sm:text-xs">
                    {egp(oldPrice)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-end">
              <div className="text-[9px] text-ice-200/50 sm:text-[11px]">
                {num(game.slotsLeft)} {t.card.slotsLeft}
              </div>
              <div className="mt-1 ms-auto h-1 w-10 overflow-hidden bg-white/10 sm:w-16">
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
