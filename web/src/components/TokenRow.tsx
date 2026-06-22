import './TokenRow.css'

import type { ReactNode } from 'react'

interface TokenRowProps {
  token: string
  color: string
  hex?: string
  alias?: string
  trailing?: ReactNode
  badgeVariant?: 'default' | 'error' | 'success'
  className?: string
}

export function TokenRow({
  token,
  color,
  hex,
  alias,
  trailing,
  badgeVariant = 'default',
  className = '',
}: TokenRowProps) {
  return (
    <div className={`token-row ${className}`.trim()}>
      <div
        className={`token-row__badge token-row__badge--${badgeVariant}`}
      >
        {token}
      </div>

      <div className="token-row__swatch-group">
        <div
          className="token-row__swatch"
          style={{ background: color }}
          aria-hidden="true"
        />
        <span className="token-row__hex">{alias ?? hex ?? ''}</span>
      </div>

      {trailing ? (
        <>
          <span className="token-row__arrow" aria-hidden="true">
            →
          </span>
          <div className="token-row__trailing">{trailing}</div>
        </>
      ) : null}
    </div>
  )
}
