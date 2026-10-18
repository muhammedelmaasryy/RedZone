import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

export const rise: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} transition={{ delay }}>
      {children}
    </motion.div>
  )
}

export function SectionHead({ kicker, title, sub, align = 'start' }: { kicker: string; title: string; sub?: string; align?: 'start' | 'center' }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      className={`mb-10 flex flex-col gap-3 ${align === 'center' ? 'items-center text-center' : ''}`}
    >
      <motion.div variants={rise} className="flex items-center gap-3 text-red-500">
        <span className="h-px w-10 bg-red-500" />
        <span className="font-condensed text-xl tracking-[0.2em] uppercase">{kicker}</span>
      </motion.div>
      <motion.h2 variants={rise} className="font-display text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
        {title}
      </motion.h2>
      {sub && <motion.p variants={rise} className="max-w-xl text-base text-ice-200/70">{sub}</motion.p>}
    </motion.div>
  )
}
