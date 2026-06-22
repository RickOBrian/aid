import './DiagramCallout.css'

import type { CSSProperties } from 'react'

interface DiagramCalloutProps {
  label: string
  sublabel?: string
  description?: string
  direction?: 'left' | 'right'
  className?: string
  style?: CSSProperties
  fadedPrefix?: string
}

export function DiagramCallout({
  label,
  sublabel,
  description,
  direction = 'left',
  className = '',
  style,
  fadedPrefix,
}: DiagramCalloutProps) {
  return (
    <div
      className={`diagram-callout diagram-callout--${direction} ${className}`.trim()}
      style={style}
    >
      <p className="diagram-callout__label">
        {fadedPrefix ? (
          <>
            <span className="diagram-callout__prefix">{fadedPrefix}</span>
            {label}
          </>
        ) : (
          label
        )}
      </p>
      {sublabel ? <p className="diagram-callout__sublabel">{sublabel}</p> : null}
      {description ? <p className="diagram-callout__description">{description}</p> : null}
      <span className="diagram-callout__line" aria-hidden="true" />
    </div>
  )
}
