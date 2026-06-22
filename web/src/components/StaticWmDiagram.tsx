import { GuideBadge } from './GuideBadge'
import './StaticWmDiagram.css'

type ModeKey = 'light' | 'dark' | 'lightWm' | 'darkWm'

interface SwatchCell {
  hex: string
  color: string
}

interface TokenTableRow {
  name: string
  nameHighlight?: string
  tokenVariant?: 'default' | 'success' | 'error'
  modes: Record<ModeKey, SwatchCell>
}

interface StaticWmTableProps {
  variant: 'do' | 'dont'
  rows: TokenTableRow[]
}

const MODE_LABELS: Record<ModeKey, string> = {
  light: 'light',
  dark: 'dark',
  lightWm: 'light wm',
  darkWm: 'dark wm',
}

const MODE_ORDER: ModeKey[] = ['light', 'dark', 'lightWm', 'darkWm']

function StaticWmTable({ variant, rows }: StaticWmTableProps) {
  return (
    <div className={`static-wm-diagram__card static-wm-diagram__card--${variant}`}>
      <div className="static-wm-diagram__card-header">
        <p className="static-wm-diagram__label">bg-accent-additional-...</p>
        <GuideBadge variant={variant} />
      </div>
      <div className="static-wm-diagram__grid">
        <div className="static-wm-diagram__header-row">
          <span className="static-wm-diagram__header-cell" />
          {MODE_ORDER.map((mode) => (
            <span key={mode} className="static-wm-diagram__header-cell">
              {MODE_LABELS[mode]}
            </span>
          ))}
        </div>
        {rows.map((row) => (
          <div key={row.name + (row.nameHighlight ?? '')} className="static-wm-diagram__body-row">
            <div
              className={`static-wm-diagram__token static-wm-diagram__token--${row.tokenVariant ?? 'default'}`}
            >
              {row.nameHighlight ? (
                <>
                  {row.name}
                  <span className="static-wm-diagram__token-highlight">
                    {row.nameHighlight}
                  </span>
                </>
              ) : (
                row.name
              )}
            </div>
            {MODE_ORDER.map((mode) => (
              <div key={mode} className="static-wm-diagram__cell">
                <div
                  className="static-wm-diagram__swatch"
                  style={{ background: row.modes[mode].color }}
                />
                <span className="static-wm-diagram__hex">{row.modes[mode].hex}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function StaticWmDiagramRussia() {
  return (
    <StaticWmTable
      variant="do"
      rows={[
        {
          name: 'russia-main',
          tokenVariant: 'default',
          modes: {
            light: { hex: '#E0462B', color: '#e0462b' },
            dark: { hex: '#FFAE19', color: '#ffae19' },
            lightWm: { hex: '#27313F', color: '#27313f' },
            darkWm: { hex: '#6F6A65', color: '#6f6a65' },
          },
        },
        {
          name: 'russia-main-static',
          tokenVariant: 'success',
          modes: {
            light: { hex: '#E0462B', color: '#e0462b' },
            dark: { hex: '#E0462B', color: '#e0462b' },
            lightWm: { hex: '#27313F', color: '#27313f' },
            darkWm: { hex: '#6F6A65', color: '#6f6a65' },
          },
        },
        {
          name: 'russia-main-staticwm',
          tokenVariant: 'success',
          modes: {
            light: { hex: '#E0462B', color: '#e0462b' },
            dark: { hex: '#E0462B', color: '#e0462b' },
            lightWm: { hex: '#E0462B', color: '#e0462b' },
            darkWm: { hex: '#E0462B', color: '#e0462b' },
          },
        },
      ]}
    />
  )
}

export function StaticWmDiagramJapan() {
  return (
    <StaticWmTable
      variant="do"
      rows={[
        {
          name: 'japan-main',
          tokenVariant: 'default',
          modes: {
            light: { hex: '#FB30D6', color: '#fb30d6' },
            dark: { hex: '#FFA9D8', color: '#ffa9d8' },
            lightWm: { hex: '#27313F', color: '#27313f' },
            darkWm: { hex: '#6F6A65', color: '#6f6a65' },
          },
        },
        {
          name: 'japan-main-staticwm',
          tokenVariant: 'success',
          modes: {
            light: { hex: '#FB30D6', color: '#fb30d6' },
            dark: { hex: '#FFA9D8', color: '#ffa9d8' },
            lightWm: { hex: '#FB30D6', color: '#fb30d6' },
            darkWm: { hex: '#FB30D6', color: '#fb30d6' },
          },
        },
      ]}
    />
  )
}

export function StaticWmDiagramStaticCompare() {
  return (
    <div className="static-wm-diagram__pair">
      <StaticWmTable
        variant="do"
        rows={[
          {
            name: 'russia-main',
            tokenVariant: 'default',
            modes: {
              light: { hex: '#E0462B', color: '#e0462b' },
              dark: { hex: '#FFAE19', color: '#ffae19' },
              lightWm: { hex: '#27313F', color: '#27313f' },
              darkWm: { hex: '#6F6A65', color: '#6f6a65' },
            },
          },
          {
            name: 'russia-main-static',
            tokenVariant: 'success',
            modes: {
              light: { hex: '#E0462B', color: '#e0462b' },
              dark: { hex: '#E0462B', color: '#e0462b' },
              lightWm: { hex: '#E0462B', color: '#e0462b' },
              darkWm: { hex: '#E0462B', color: '#e0462b' },
            },
          },
        ]}
      />
      <StaticWmTable
        variant="dont"
        rows={[
          {
            name: 'russia-main',
            nameHighlight: '-staticwm',
            tokenVariant: 'error',
            modes: {
              light: { hex: '#E0462B', color: '#e0462b' },
              dark: { hex: '#E0462B', color: '#e0462b' },
              lightWm: { hex: '#E0462B', color: '#e0462b' },
              darkWm: { hex: '#E0462B', color: '#e0462b' },
            },
          },
        ]}
      />
    </div>
  )
}
