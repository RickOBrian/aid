import './GuideFrame.css'

import type { ReactNode } from 'react'
import './GuideFrame.css'

interface GuideFrameProps {
  id: string
  children: ReactNode
  wide?: boolean
  className?: string
}

export function GuideFrame({ id, children, wide = false, className = '' }: GuideFrameProps) {
  return (
    <article
      id={id}
      className={`guide-frame ${wide ? 'guide-frame--wide' : ''} ${className}`.trim()}
    >
      {children}
    </article>
  )
}

interface GuideHeaderProps {
  title: ReactNode
  numbered?: boolean
  number?: string
}

export function GuideHeader({ title, numbered = false, number }: GuideHeaderProps) {
  return (
    <header className="guide-frame__header">
      {numbered && number ? (
        <h1 className="guide-frame__title guide-frame__title--numbered">
          <span className="guide-frame__number">{number}.</span> {title}
        </h1>
      ) : (
        <h1 className="guide-frame__title">{title}</h1>
      )}
    </header>
  )
}

interface GuideBlockProps {
  children: ReactNode
  className?: string
}

export function GuideBlock({ children, className = '' }: GuideBlockProps) {
  return <section className={`guide-frame__block ${className}`.trim()}>{children}</section>
}

export function GuideLead({ children }: { children: ReactNode }) {
  return <p className="guide-frame__lead">{children}</p>
}

export function GuideHeading({ children }: { children: ReactNode }) {
  return <h2 className="guide-frame__heading">{children}</h2>
}

export function GuideText({ children }: { children: ReactNode }) {
  return <div className="guide-frame__text">{children}</div>
}
