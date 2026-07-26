import type { LoadedToken } from '../../src/tokens/types';

export interface TokensOverviewProps {
  tokens: LoadedToken[];
  uiKitId: string;
}

function isColorValue(value: string): boolean {
  return (
    value.startsWith('#')
    || value.startsWith('rgb')
    || value.startsWith('hsl')
  );
}

function TokenRow({ token, showDarkColumn }: { token: LoadedToken; showDarkColumn: boolean }) {
  const isLegacy = token.source === 'legacy';

  return (
    <tr className={isLegacy ? 'token-row token-row--legacy' : 'token-row'}>
      <td>
        <code>{token.name}</code>
        {isLegacy && (
          <span className="token-badge token-badge--legacy" title={token.deviation || undefined}>
            LEGACY
          </span>
        )}
      </td>
      <td>
        <span className="token-source">{token.source}</span>
      </td>
      <td>
        <div className="token-value-cell">
          {isColorValue(token.value) && (
            <span
              className="token-swatch"
              style={{ background: token.value }}
              aria-hidden="true"
            />
          )}
          <code>{token.value}</code>
        </div>
      </td>
      {showDarkColumn && (
        <td>
          {token.valueDark ? (
            <div className="token-value-cell">
              {isColorValue(token.valueDark) && (
                <span
                  className="token-swatch"
                  style={{ background: token.valueDark }}
                  aria-hidden="true"
                />
              )}
              <code>{token.valueDark}</code>
            </div>
          ) : (
            '—'
          )}
        </td>
      )}
      <td className="token-deviation">
        {isLegacy && token.deviation ? token.deviation : '—'}
      </td>
    </tr>
  );
}

export function TokensOverview({ tokens, uiKitId }: TokensOverviewProps) {
  const grouped = {
    core: tokens.filter((t) => t.source === 'core'),
    semantic: tokens.filter((t) => t.source === 'semantic'),
    legacy: tokens.filter((t) => t.source === 'legacy'),
  };
  const showDarkColumn = tokens.some((t) => Boolean(t.valueDark));

  return (
    <div className="tokens-overview" data-ui-kit={uiKitId}>
      <style>{`
        .tokens-overview {
          font-family: system-ui, sans-serif;
          color: var(--text-primary, #111);
          background: var(--bg-base-main, #f7f7f8);
          padding: 24px;
          min-height: 100vh;
        }
        .tokens-overview h2 { margin: 24px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary, #666); }
        .tokens-overview table { width: 100%; border-collapse: collapse; background: var(--bg-card-main, #fff); border: 1px solid var(--line-default, #e5e5ea); border-radius: 8px; overflow: hidden; }
        .tokens-overview th, .tokens-overview td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--line-default, #e5e5ea); font-size: 13px; vertical-align: middle; }
        .tokens-overview th { background: var(--bg-base-main-secondary, #efeff2); font-weight: 600; }
        .token-row--legacy { background: rgba(245, 158, 11, 0.08); }
        .token-badge--legacy {
          display: inline-block; margin-left: 8px; padding: 2px 6px; border-radius: 4px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
          background: #FEF3C7; color: #92400E; cursor: help;
        }
        .token-source { font-size: 11px; text-transform: uppercase; color: var(--text-secondary, #666); }
        .token-value-cell { display: flex; align-items: center; gap: 8px; }
        .token-swatch { width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--line-default, #e5e5ea); flex-shrink: 0; }
        .token-deviation { color: var(--text-secondary, #666); max-width: 280px; }
      `}</style>

      <h1 style={{ margin: '0 0 4px', fontSize: 20 }}>Tokens — {uiKitId}</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--text-secondary, #666)', fontSize: 14 }}>
        Core и semantic без пометки · legacy с бейджем LEGACY и подсказкой deviation
      </p>

      {(['core', 'semantic', 'legacy'] as const).map((layer) => (
        grouped[layer].length > 0 && (
          <section key={layer}>
            <h2>{layer}</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Source</th>
                  <th>Light value</th>
                  {showDarkColumn && <th>Dark value</th>}
                  <th>Deviation</th>
                </tr>
              </thead>
              <tbody>
                {grouped[layer].map((token) => (
                  <TokenRow key={`${layer}-${token.name}`} token={token} showDarkColumn={showDarkColumn} />
                ))}
              </tbody>
            </table>
          </section>
        )
      ))}
    </div>
  );
}
