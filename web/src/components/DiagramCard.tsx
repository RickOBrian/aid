import './DiagramCard.css'

import type { ReactNode } from 'react'

type DiagramCardVariant = 'default' | 'dont' | 'do' | 'okay'

interface DiagramCardProps {
  title?: string
  children: ReactNode
  variant?: DiagramCardVariant
  footer?: ReactNode
  className?: string
}

const CHIP_LABELS: Record<Exclude<DiagramCardVariant, 'default'>, string> = {
  dont: "Don't",
  do: 'Do',
  okay: "It's okay",
}

export function DiagramCard({
  title,
  children,
  variant = 'default',
  footer,
  className = '',
}: DiagramCardProps) {
  return (
    <div
      className={`diagram-card diagram-card--${variant} ${className}`.trim()}
    >
      {variant !== 'default' ? (
        <span className={`diagram-card__chip diagram-card__chip--${variant}`}>
          {CHIP_LABELS[variant]}
        </span>
      ) : null}

      {title ? <p className="diagram-card__title">{title}</p> : null}

      <div className="diagram-card__rows">{children}</div>

      {footer ? <p className="diagram-card__footer">{footer}</p> : null}
    </div>
  )
}
