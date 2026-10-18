import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

const CHARS = '▲●✕■#%&@$RZ0123456789'

export function ScrambleText({ text, className = '', duration = 900 }: { text: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [out, setOut] = useState(text)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const start = performance.now()
    let last = 0
    const tick = (t: number) => {
      if (t - last < 40 && t - start < duration) { raf = requestAnimationFrame(tick); return }
      last = t
      const p = Math.min(1, (t - start) / duration)
      const reveal = Math.floor(p * text.length)
      setOut(
        text
          .split('')
          .map((ch, i) => (i < reveal || ch === ' ' ? ch : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join(''),
      )
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, text, duration])

  return <span ref={ref} className={className}>{out}</span>
}
