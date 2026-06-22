import { GuideBadge } from './GuideBadge'
import './StaticMorphemeDiagram.css'

interface TokenRowProps {
  name: string
  nameHighlight?: string
  lightHex: string
  darkHex: string
  lightColor: string
  darkColor: string
  tokenVariant?: 'default' | 'success' | 'error'
}

function TokenRow({
  name,
  nameHighlight,
  lightHex,
  darkHex,
  lightColor,
  darkColor,
  tokenVariant = 'default',
}: TokenRowProps) {
  return (
    <div className="static-morpheme-diagram__row">
      <div
        className={`static-morpheme-diagram__token static-morpheme-diagram__token--${tokenVariant}`}
      >
        {nameHighlight ? (
          <>
            {name}
            <span className="static-morpheme-diagram__token-highlight">
              {nameHighlight}
            </span>
          </>
        ) : (
          name
        )}
      </div>
      <div className="static-morpheme-diagram__mode-col">
        <div
          className="static-morpheme-diagram__swatch"
          style={{ background: lightColor }}
        />
        <span className="static-morpheme-diagram__hex">{lightHex}</span>
      </div>
      <div className="static-morpheme-diagram__mode-col">
        <div
          className="static-morpheme-diagram__swatch"
          style={{ background: darkColor }}
        />
        <span className="static-morpheme-diagram__hex">{darkHex}</span>
      </div>
    </div>
  )
}

interface ComparisonCardProps {
  variant: 'do' | 'dont'
  rows: TokenRowProps[]
  footer?: string
}

function ComparisonCard({ variant, rows, footer }: ComparisonCardProps) {
  return (
    <div className={`static-morpheme-diagram__card static-morpheme-diagram__card--${variant}`}>
      <div className="static-morpheme-diagram__card-header">
        <p className="static-morpheme-diagram__label">bg-accent-additional-...</p>
        <GuideBadge variant={variant} />
      </div>
      <div className="static-morpheme-diagram__columns">
        <span />
        <span className="static-morpheme-diagram__column-label">light</span>
        <span className="static-morpheme-diagram__column-label">dark</span>
      </div>
      {rows.map((row) => (
        <TokenRow key={row.name + (row.nameHighlight ?? '')} {...row} />
      ))}
      {footer ? (
        <p className="static-morpheme-diagram__footer">{footer}</p>
      ) : null}
    </div>
  )
}

export function StaticMorphemeDiagram() {
  return (
    <div className="static-morpheme-diagram">
      <ComparisonCard
        variant="do"
        rows={[
          {
            name: 'bahamas-main',
            lightHex: '#95E02B',
            darkHex: '#BCBCBC',
            lightColor: '#95e02b',
            darkColor: '#bcbcbc',
          },
          {
            name: 'bahamas-main-static',
            lightHex: '#95E02B',
            darkHex: '#95E02B',
            lightColor: '#95e02b',
            darkColor: '#95e02b',
            tokenVariant: 'success',
          },
        ]}
      />
      <ComparisonCard
        variant="dont"
        rows={[
          {
            name: 'bahamas-main',
            nameHighlight: '-static',
            lightHex: '#95E02B',
            darkHex: '#95E02B',
            lightColor: '#95e02b',
            darkColor: '#95e02b',
            tokenVariant: 'error',
          },
        ]}
        footer="Так как токен один, мы не пишем морфему -static"
      />
    </div>
  )
}
