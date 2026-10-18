import type { ElementType } from 'react'

// RGB-split glitch: plays one burst when `active` turns on, then again on hover.
export function GlitchText({ text, as: Tag = 'span', className = '', active = true }: { text: string; as?: ElementType; className?: string; active?: boolean }) {
  return (
    <Tag className={`glitch ${className}`} data-text={text} data-active={active || undefined}>
      {text}
    </Tag>
  )
}
