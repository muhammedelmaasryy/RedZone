import { motion } from 'motion/react'
import { useMemo } from 'react'

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={7} height={7} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="white" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
    </g>
  )
}

// Decorative QR-like grid (not a real code) used in the delivery demos.
export function FakeQR({ seed = 3, size = 21, className = '', animate = true }: { seed?: number; size?: number; className?: string; animate?: boolean }) {
  const cells = useMemo(() => {
    let a = seed * 9301 + 49297
    const rnd = () => ((a = (a * 9301 + 49297) % 233280) / 233280)
    const out: { x: number; y: number }[] = []
    const finder = (x: number, y: number) =>
      (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) if (!finder(x, y) && rnd() > 0.52) out.push({ x, y })
    return out
  }, [seed, size])

  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className={`bg-white text-black ${className}`} shapeRendering="crispEdges">
      <Finder x={0} y={0} />
      <Finder x={size - 7} y={0} />
      <Finder x={0} y={size - 7} />
      {cells.map((c, i) =>
        animate ? (
          <motion.rect
            key={i}
            x={c.x}
            y={c.y}
            width={1}
            height={1}
            fill="currentColor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (c.x + c.y) * 0.02 }}
          />
        ) : (
          <rect key={i} x={c.x} y={c.y} width={1} height={1} fill="currentColor" />
        ),
      )}
    </svg>
  )
}
