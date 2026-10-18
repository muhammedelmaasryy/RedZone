import type { ReactNode } from 'react'

export function Marquee({ children, reverse = false, speed = 40, className = '' }: { children: ReactNode; reverse?: boolean; speed?: number; className?: string }) {
  return (
    <div className={`group flex overflow-hidden ${className}`} dir="ltr">
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className="rz-marquee flex shrink-0 items-center gap-6 pe-6 group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
