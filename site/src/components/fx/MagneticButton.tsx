import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

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
  ghost: 'border border-ice-300/40 bg-ice-300/5 text-ice-200 hover:border-ice-300 hover:text-white',
  ice: 'bg-ice-300 text-void hover:bg-white',
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  href,
  to,
  target,
  variant = 'red',
  disabled,
  type = 'button',
}: Props) {
  const inner = (
    <span
      className={`clip-angle relative inline-flex w-full items-center justify-center gap-2 overflow-hidden px-5 py-3 font-display text-xs tracking-wide uppercase transition-all duration-200 hover:-translate-y-0.5 active:scale-95 sm:px-7 sm:py-3.5 sm:text-sm ${styles[variant]} ${disabled ? 'pointer-events-none opacity-40' : ''} ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </span>
  )

  return (
    <div className="group inline-block">
      {to ? (
        <Link to={to} onClick={onClick} className="block">
          {inner}
        </Link>
      ) : href ? (
        <a
          href={href}
          target={target}
          rel={target ? 'noreferrer' : undefined}
          onClick={onClick}
          className="block"
        >
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
