export function ScrambleText({
  text,
  className = '',
}: {
  text: string
  className?: string
  duration?: number
}) {
  return <span className={className}>{text}</span>
}
