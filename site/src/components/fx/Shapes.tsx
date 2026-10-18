import type { SVGProps } from 'react'
import type { Shape } from '../../data/games'

type P = Omit<SVGProps<SVGSVGElement>, 'stroke'> & { shape: Shape; weight?: number }

export function PSShape({ shape, weight = 2.5, ...rest }: P) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {shape === 'triangle' && <path d="M20 6 L35 32 H5 Z" />}
      {shape === 'circle' && <circle cx="20" cy="20" r="14" />}
      {shape === 'cross' && <path d="M8 8 L32 32 M32 8 L8 32" />}
      {shape === 'square' && <rect x="7" y="7" width="26" height="26" rx="1.5" />}
    </svg>
  )
}

export function Chevrons({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 28" className="h-6 w-4" style={{ opacity: 1 - i * 0.18 }}>
          <path d="M14 2 L4 14 L14 26" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
      ))}
    </div>
  )
}

export function Crosses({ count = 5, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`flex gap-1.5 ${className}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 12 12" className="h-3 w-3">
          <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="2.6" />
        </svg>
      ))}
    </div>
  )
}

export function StripedCircle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <defs>
        <clipPath id="sc-clip"><circle cx="40" cy="40" r="38" /></clipPath>
      </defs>
      <circle cx="40" cy="40" r="38" fill="#e50000" />
      <g clipPath="url(#sc-clip)" stroke="#fff" strokeWidth="3.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={36 + i * 8} y1="-10" x2={6 + i * 8} y2="90" />
        ))}
      </g>
    </svg>
  )
}
