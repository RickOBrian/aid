import { BADGE_DOT_TOKEN_STYLE } from './badgeDotTokens';

/**
 * BadgeDot — Surface View. Indicators group.
 *
 * Figma source: WB AID Driver Components, node 89:4216 (named
 * "mini_notification" in Figma; canonical name `BadgeDot` per Role+Entity).
 * Alias `MiniNotification` kept for lookup, not a separate component.
 *
 * Tokens: Icons · Warning (fill) — theme-independent
 * (`pages/driver-color-tokens/data.ts`). Geometry: space-8 (8×8px),
 * border-radius 50% (radius-4 equivalent on a circle).
 *
 * States: non-interactive display element — no hover/pressed/focused,
 * no disabled/loading (no product scenario, no Figma variant).
 *
 * Accessibility: purely decorative when parent already conveys notification
 * state — pass `aria-hidden`. When standalone, supply `aria-label`
 * (e.g. "Есть непрочитанные уведомления").
 */

const BADGE_DOT_STYLE = `
${BADGE_DOT_TOKEN_STYLE}
.ds-badge-dot-root {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--ds-badge-dot-bg);
  flex-shrink: 0;
}
`;

export interface BadgeDotProps {
  id?: string;
  className?: string;
  /** Full context for screen readers when the dot conveys information on its own. */
  'aria-label'?: string;
  /** Set when the dot is decorative and parent element already announces state. */
  'aria-hidden'?: boolean;
}

export function BadgeDot({
  id,
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: BadgeDotProps) {
  return (
    <>
      <style>{BADGE_DOT_STYLE}</style>
      <span
        id={id}
        className={className ? `ds-badge-dot-root ${className}` : 'ds-badge-dot-root'}
        role={ariaHidden ? undefined : 'img'}
        aria-label={ariaHidden ? undefined : ariaLabel}
        aria-hidden={ariaHidden ? true : undefined}
        data-node-id="89:4216"
      />
    </>
  );
}
