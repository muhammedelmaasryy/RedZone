import { motion } from 'motion/react'
import { useState } from 'react'
import type { Game } from '../data/games'
import { PSShape } from './fx/Shapes'

// Real cover art lives in /public/games/<id>/cover.webp. The generated artwork below is the
// fallback if an image is missing or fails to load.
export function GameCover({ game, className = '', big = false, priority = false }: { game: Game; className?: string; big?: boolean; priority?: boolean }) {
  const { from, to, accent, shape } = game.cover
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <div className={`relative overflow-hidden bg-night ${className}`} dir="ltr">
        <img
          src={`/games/${game.id}/cover.webp`}
          alt={game.title}
          width={600}
          height={900}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute top-1.5 left-1.5 flex gap-1 sm:top-2 sm:left-2">
          {game.platforms.map((p) => (
            <span key={p} className="bg-black/75 px-1.5 py-0.5 font-display text-[9px] leading-none text-white backdrop-blur-sm sm:text-[10px]">
              {p.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`noise relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(155deg, ${from} 0%, ${to} 78%)` }}
      dir="ltr"
    >
      <div className="stripes-bg absolute inset-0 opacity-40 mix-blend-overlay" />
      <motion.div
        className="absolute -end-[18%] -top-[12%] w-[85%]"
        style={{ color: accent }}
        animate={{ rotate: shape === 'circle' ? 0 : [0, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PSShape shape={shape} weight={1.2} className="w-full opacity-60 drop-shadow-[0_0_18px_currentColor]" />
      </motion.div>
      <PSShape shape={shape} weight={3} className="absolute bottom-[38%] left-[10%] w-[18%] text-white/40" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
        <div className="mb-1 flex gap-1">
          {game.platforms.map((p) => (
            <span key={p} className="bg-white/90 px-1.5 py-0.5 font-display text-[10px] leading-none text-black">
              {p.toUpperCase()}
            </span>
          ))}
        </div>
        <div className={`font-display leading-[0.95] text-white uppercase ${big ? 'text-3xl sm:text-5xl' : 'text-base sm:text-xl'}`} style={{ textShadow: `0 0 24px ${accent}66` }}>
          {game.short}
        </div>
      </div>
    </div>
  )
}
