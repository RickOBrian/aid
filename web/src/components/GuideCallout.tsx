import type { ReactNode } from 'react'
import './GuideCallout.css'

interface GuideCalloutProps {
  children: ReactNode
}

export function GuideCallout({ children }: GuideCalloutProps) {
  return (
    <aside className="guide-callout">
      <span className="guide-callout__icon" aria-hidden="true">
        ⚠
      </span>
      <div className="guide-callout__content">{children}</div>
    </aside>
  )
}
