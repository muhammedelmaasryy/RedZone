import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, type ReactNode, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useFinePointer } from '../../lib/hooks'

type Props = {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  href?: string
  to?: string
  target?: string
  variant?: 'red' | 'ghost' | 'ice'
  disabled?: boolean
  type?: 'button' | 'submit'
}

const styles = {
  red: 'bg-red-600 text-white hover:bg-red-500 glow',
  ghost: 'border border-white/25 bg-white/5 text-white hover:border-red-500 hover:text-red-300 backdrop-blur',
  ice: 'bg-ice-300 text-void hover:bg-white',
}

export function MagneticButton({ children, className = '', strength = 0.35, onClick, href, to, target, variant = 'red', disabled, type = 'button' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })

  const move = (e: MouseEvent) => {
    if (!fine || !ref.current || disabled) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const leave = () => { x.set(0); y.set(0) }

  const inner = (
    <motion.span
      style={{ x, y }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className={`clip-angle relative inline-flex w-full items-center justify-center gap-2 overflow-hidden px-5 py-3 font-display text-xs sm:px-7 sm:py-3.5 sm:text-sm tracking-wide uppercase transition-colors duration-200 ${styles[variant]} ${disabled ? 'pointer-events-none opacity-40' : ''} ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.span>
  )

  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className="group inline-block">
      {to ? (
        <Link to={to} onClick={onClick} className="block">{inner}</Link>
      ) : href ? (
        <a href={href} target={target} rel={target ? 'noreferrer' : undefined} onClick={onClick} className="block">
          {inner}
        </a>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} className="block w-full">
          {inner}
        </button>
      )}
    </div>
  )
}
