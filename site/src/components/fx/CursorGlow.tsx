import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFinePointer } from '../../lib/hooks'

export function CursorGlow() {
  const fine = useFinePointer()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 500, damping: 40 })
  const ry = useSpring(y, { stiffness: 500, damping: 40 })
  const gx = useSpring(x, { stiffness: 80, damping: 20 })
  const gy = useSpring(y, { stiffness: 80, damping: 20 })
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    if (!fine) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const el = e.target as HTMLElement
      setHover(!!el.closest?.('a,button,[data-cursor="hover"],input,label,select'))
    }
    const d = () => setDown(true)
    const u = () => setDown(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', d)
    window.addEventListener('pointerup', u)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', d)
      window.removeEventListener('pointerup', u)
    }
  }, [fine, x, y])

  if (!fine) return null
  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: gx, y: gy }}
        className="pointer-events-none fixed top-0 left-0 z-0 -mt-[300px] -ml-[300px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(229,0,0,0.13),transparent_60%)]"
      />
      <motion.div
        aria-hidden
        style={{ x: rx, y: ry }}
        animate={{ scale: down ? 0.7 : hover ? 1.9 : 1, rotate: hover ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-3 -ml-3 h-6 w-6 border-2 border-red-500 mix-blend-difference"
      />
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-[3px] -ml-[3px] h-1.5 w-1.5 rounded-full bg-white"
      />
    </>
  )
}
