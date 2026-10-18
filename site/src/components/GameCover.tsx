import { motion } from 'motion/react'
import type { Game } from '../data/games'
import { PSShape } from './fx/Shapes'

// Stylized generated cover art. Real box art can replace this later.
export function GameCover({ game, className = '', big = false }: { game: Game; className?: string; big?: boolean }) {
  const { from, to, accent, shape } = game.cover
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
