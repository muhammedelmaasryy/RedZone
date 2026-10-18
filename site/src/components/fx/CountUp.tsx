import { animate, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n'

export function CountUp({ to, decimals = 0, suffix = '', className = '' }: { to: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [v, setV] = useState(0)
  const { lang } = useI18n()

  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: setV })
    return () => c.stop()
  }, [inView, to])

  const fmt = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return <span ref={ref} className={className}>{fmt.format(v)}{suffix}</span>
}

export function AnimatedPrice({ value, className = '' }: { value: number; className?: string }) {
  const [v, setV] = useState(value)
  const prev = useRef(value)
  const { egp } = useI18n()
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.6, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    prev.current = value
    return () => c.stop()
  }, [value])
  return <span className={className}>{egp(v)}</span>
}
