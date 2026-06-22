import './PhoneMockup.css'

import type { CSSProperties, ReactNode } from 'react'

interface PhoneMockupProps {
  children: ReactNode
  className?: string
  bg?: string
  scale?: number
  style?: CSSProperties
}

export function PhoneMockup({
  children,
  className = '',
  bg = 'var(--diagram-surface)',
  scale = 1,
  style,
}: PhoneMockupProps) {
  return (
    <div
      className={`phone-mockup ${className}`.trim()}
      style={
        {
          '--phone-scale': scale,
          '--phone-bg': bg,
          ...style,
        } as CSSProperties
      }
    >
      <div className="phone-mockup__shell">
        <div className="phone-mockup__status">
          <span className="phone-mockup__time">9:41</span>
          <span className="phone-mockup__island" aria-hidden="true" />
          <span className="phone-mockup__icons" aria-hidden="true">
            <span className="phone-mockup__signal" />
            <span className="phone-mockup__wifi" />
            <span className="phone-mockup__battery" />
          </span>
        </div>
        <div className="phone-mockup__screen">{children}</div>
        <div className="phone-mockup__home" aria-hidden="true" />
      </div>
    </div>
  )
}
