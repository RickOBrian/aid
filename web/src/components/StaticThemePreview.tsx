import './StaticThemePreview.css'

interface TokenPreviewRow {
  label: string
  color: string
}

interface ThemePanelProps {
  title: string
  theme: 'light' | 'dark'
  rows: TokenPreviewRow[]
}

function ThemePanel({ title, theme, rows }: ThemePanelProps) {
  return (
    <div className={`static-theme-preview__panel static-theme-preview__panel--${theme}`}>
      <p className="static-theme-preview__title">{title}</p>
      <div className={`static-theme-preview__phone static-theme-preview__phone--${theme}`}>
        <div className="static-theme-preview__statusbar">
          <span>9:41</span>
        </div>
        <ul className="static-theme-preview__list">
          {rows.map((row) => (
            <li key={row.label} className="static-theme-preview__item">
              <span
                className="static-theme-preview__icon"
                style={{ background: row.color }}
                aria-hidden="true"
              />
              <span className="static-theme-preview__label">{row.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function StaticThemePreview() {
  return (
    <div className="static-theme-preview">
      <ThemePanel
        title="light"
        theme="light"
        rows={[
          { label: 'main', color: '#7b2be0' },
          { label: 'main-static', color: '#7b2be0' },
          { label: 'main-staticwm', color: '#7b2be0' },
        ]}
      />
      <ThemePanel
        title="dark"
        theme="dark"
        rows={[
          { label: 'main', color: '#ad85ff' },
          { label: 'main-static', color: '#7b2be0' },
          { label: 'main-staticwm', color: '#7b2be0' },
        ]}
      />
      <ThemePanel
        title="light wm"
        theme="light"
        rows={[
          { label: 'main', color: '#27313f' },
          { label: 'main-static', color: '#27313f' },
          { label: 'main-staticwm', color: '#7b2be0' },
        ]}
      />
      <ThemePanel
        title="dark wm"
        theme="dark"
        rows={[
          { label: 'main', color: '#6f6a65' },
          { label: 'main-static', color: '#6f6a65' },
          { label: 'main-staticwm', color: '#7b2be0' },
        ]}
      />
    </div>
  )
}
