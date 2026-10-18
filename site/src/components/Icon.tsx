import type { SVGProps } from 'react'

const paths = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  shield: <><path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  chat: <path d="M4 5h16v11H9l-5 4V5Z" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  checks: <><path d="m2 12 4.5 4.5L15 8" /><path d="m11 16 1 .5L21 8" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4" /></>,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" /><circle cx="12" cy="13" r="3.5" /></>,
  phone: <><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18h2" /></>,
  store: <><path d="M4 9 5.5 4h13L20 9" /><path d="M4 9h16v2a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0A3 3 0 0 1 4 11V9ZM5 13v7h14v-7" /></>,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>,
  upload: <><path d="M12 15V4M7 9l5-5 5 5" /><path d="M4 15v5h16v-5" /></>,
  box: <><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" /><path d="m4 7 8 4 8-4M12 11v10" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
  flame: <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.6 2.2-4.8.3 1.6 1 2.6 2 3C10.8 8.6 11 5.8 12 3Z" />,
  gamepad: <><path d="M7 7h10a4 4 0 0 1 4 4l.5 4.5a2.5 2.5 0 0 1-4.5 1.7L15 15H9l-2 2.2a2.5 2.5 0 0 1-4.5-1.7L3 11a4 4 0 0 1 4-4Z" /><path d="M7 10v3M5.5 11.5h3M15.5 11h.01M17.5 13h.01" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.6" /><path d="M20 4v4.6h-4.6" /></>,
} as const

export type IconName = keyof typeof paths

export function Icon({ name, className = 'h-4 w-4', strokeWidth = 2, ...rest }: { name: IconName } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  const filled = name === 'star' || name === 'flame'
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
