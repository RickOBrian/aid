import './GuideBadge.css'

interface GuideBadgeProps {
  variant: 'do' | 'dont'
}

export function GuideBadge({ variant }: GuideBadgeProps) {
  return (
    <span className={`guide-badge guide-badge--${variant}`}>
      {variant === 'do' ? 'Do' : "Don't"}
    </span>
  )
}
