import './TokenName.css'

import type { ReactNode } from 'react'

export interface TokenPart {
  text: string
  highlight?: boolean
}

/** @deprecated Use TokenPart */
export type TokenSegment = TokenPart

interface TokenNameProps {
  parts?: TokenPart[]
  /** @deprecated Use parts */
  segments?: TokenPart[]
  children?: ReactNode
  size?: 'md' | 'lg'
  /** @deprecated Use size="md" for inline token display */
  variant?: 'inline' | 'card'
  className?: string
}

export function TokenName({
  parts,
  segments,
  children,
  size,
  variant,
  className = '',
}: TokenNameProps) {
  const tokenParts = parts ?? segments
  const sizeClass =
    variant === 'card'
      ? 'token-name--card'
      : variant === 'inline' || size === undefined
        ? 'token-name--md'
        : `token-name--${size}`

  return (
    <p className={`token-name ${sizeClass} ${className}`.trim()}>
      {tokenParts
        ? tokenParts.map((part, index) => (
            <span
              key={index}
              className={
                part.highlight
                  ? 'token-name__part token-name__part--highlight'
                  : 'token-name__part'
              }
            >
              {part.text}
            </span>
          ))
        : children}
    </p>
  )
}

export function buildTokenParts(token: string, highlight: string): TokenPart[] {
  const index = token.indexOf(highlight)
  if (index === -1) {
    return [{ text: token }]
  }

  return [
    { text: token.slice(0, index) },
    { text: highlight, highlight: true },
    { text: token.slice(index + highlight.length) },
  ]
}

/** @deprecated Use buildTokenParts */
export const buildTokenSegments = buildTokenParts
