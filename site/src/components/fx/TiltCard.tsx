import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef, type ReactNode, type PointerEvent } from 'react'
import { useFinePointer } from '../../lib/hooks'

export function TiltCard({ children, className = '', max = 12 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 180, damping: 18 })
  const sy = useSpring(py, { stiffness: 180, damping: 18 })
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const gx = useTransform(sx, (v) => `${v * 100}%`)
  const gy = useTransform(sy, (v) => `${v * 100}%`)
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 55%)`

  const move = (e: PointerEvent) => {
    if (!fine || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const leave = () => { px.set(0.5); py.set(0.5) }

  return (
    <div style={{ perspective: 900 }} className={className}>
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        style={fine ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
        className="relative h-full"
      >
        {children}
        {fine && <motion.div style={{ background: glare }} className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay" />}
      </motion.div>
    </div>
  )
}
