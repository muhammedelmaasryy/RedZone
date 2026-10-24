import type { Variants } from 'motion/react'
import type { ReactNode } from 'react'

export const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }

export function Reveal({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return <div className={className}>{children}</div>
}

export function SectionHead({
  kicker,
  title,
  sub,
  align = 'start',
}: {
  kicker: string
  title: string
  sub?: string
  align?: 'start' | 'center'
}) {
  return (
    <div
      className={`mb-6 flex flex-col gap-2 sm:mb-10 sm:gap-3 ${
        align === 'center' ? 'items-center text-center' : ''
      }`}
    >
      <div className="flex items-center gap-3 text-ice-300">
        <span className="h-px w-10 bg-gradient-to-r from-red-500 to-ice-300 rtl:bg-gradient-to-l" />
        <span className="font-condensed text-xl tracking-[0.2em] uppercase">{kicker}</span>
      </div>
      <h2 className="font-display text-3xl leading-tight text-white sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {sub && <p className="max-w-xl text-base text-ice-200/70">{sub}</p>}
    </div>
  )
}
