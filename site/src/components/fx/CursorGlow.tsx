import { useEffect, useRef } from 'react'
import { useFinePointer } from '../../lib/hooks'

export function CursorGlow() {
  const fine = useFinePointer()
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fine) return
    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return

    const move = (e: PointerEvent) => {
      const tx = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      dot.style.transform = tx
      ring.style.transform = tx
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
    }
  }, [fine])

  if (!fine) return null
  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-3 -ml-3 h-6 w-6 border border-red-500/75 transition-transform duration-75 ease-out will-change-transform"
      />
      <div
        ref={dotRef}
        aria-hidden
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-[3px] -ml-[3px] h-1.5 w-1.5 rounded-full bg-white will-change-transform"
      />
    </>
  )
}
