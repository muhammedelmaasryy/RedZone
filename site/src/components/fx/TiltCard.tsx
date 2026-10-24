import type { ReactNode } from 'react'

export function TiltCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  return (
    <div className={`transition-transform duration-200 ease-out hover:-translate-y-1 ${className}`}>
      <div className="relative h-full">{children}</div>
    </div>
  )
}
