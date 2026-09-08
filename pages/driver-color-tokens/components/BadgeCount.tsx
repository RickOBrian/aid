import { BADGE_COUNT_TOKEN_STYLE } from './badgeCountTokens';

/**
 * BadgeCount — Surface View. Indicators group.
 *
 * Figma source: 🤑 WB AID Driver Components, node 89:4214 (named "Counter" in
 * Figma; requested by name "Counter" — renamed to `BadgeCount` per the
 * Role+Entity naming formula already documented for this exact pattern
 * (fon + число) in `ds-component-architecture-guide.md`, confirmed by
 * Principal Designer. `Counter` kept as an alias for lookup, not a separate
 * component.
 *
 * Tokens: Fields · Warning (background), Texts · Primary light ind (text
 * color) — both theme-independent (`pages/driver-color-tokens/data.ts`).
 * Geometry: radius-12, space-6 / space-2 padding, shadow-1, typography
 * subtitle-2 (Roboto Medium 14/16, tracking 0.1) — all semantic tokens,
 * referenced directly, not duplicated as component-level tokens.
 *
 * States: non-interactive display element — no hover/pressed/focused
 * (nothing to click), no disabled/loading (no product scenario, no Figma
 * variant). The only variable dimension is the formatted value length
 * (1 digit / 2 digits / overflow via `max`).
 *
 * Accessibility: plain text content is read by screen readers as-is;
 * `aria-label` lets the caller supply full context (e.g. "10 непрочитанных
 * сообщений") when the bare number is ambiguous out of visual context.
 */

const BADGE_COUNT_STYLE = `
${BADGE_COUNT_TOKEN_STYLE}
.ds-badge-count-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: 12px;
  background-color: var(--ds-badge-count-bg);
  box-shadow: 0px 0px 1px 0px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.12);
}
.ds-badge-count-root .ds-badge-count__value {
  margin: 0;
  font-family: 'Roboto', system-ui, sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 0.1px;
  color: var(--ds-badge-count-text);
  text-align: center;
  white-space: nowrap;
}
`;

export interface BadgeCountProps {
  /** Numeric count to display. */
  value: number;
  /** Values above `max` render as `\`\${max}+\``. Pass `Infinity` to disable capping. Defaults to 99. */
  max?: number;
  id?: string;
  className?: string;
  /** Full context for screen readers (e.g. "10 непрочитанных сообщений"). Defaults to the visible number. */
  'aria-label'?: string;
}

export function formatBadgeCountValue(value: number, max = 99): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  return value > max ? `${max}+` : String(value);
}

export function BadgeCount({
  value,
  max = 99,
  id,
  className,
  'aria-label': ariaLabel,
}: BadgeCountProps) {
  const label = formatBadgeCountValue(value, max);

  return (
    <>
      <style>{BADGE_COUNT_STYLE}</style>
      <div
        id={id}
        className={className ? `ds-badge-count-root ${className}` : 'ds-badge-count-root'}
        aria-label={ariaLabel}
        data-node-id="89:4214"
      >
        <span className="ds-badge-count__value">{label}</span>
      </div>
    </>
  );
}
