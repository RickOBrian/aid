import { SWITCH_TOKEN_STYLE } from './switchTokens';

/**
 * Switch — Surface View. Controls group.
 *
 * Figma source: 🕓 Wilhelm Library, node 9872:15
 * (https://www.figma.com/design/9yNZhsbTfqC8Nv3JFlVtBq/%F0%9F%95%93-Wilhelm-Library?node-id=9872-15)
 *
 * Naming: `Switch` is a pre-approved exception to the Role+Entity formula
 * (see `.cursorrules`). `Toggle` is a recognized alias, not a separate
 * component.
 *
 * Tokens: Controls · Checked / Unchecked / Key, Strokes · Primary
 * (`pages/driver-color-tokens/data.ts`). Day → light mode, Night → dark mode
 * (`products/driver/product.json` → `colorModeMapping`).
 *
 * States: default, hover (Web only), focus-visible, disabled, loading.
 * `error` / `indeterminate` / `skeleton` are intentionally not implemented —
 * no product scenario and no Figma variant for them.
 *
 * Disabled visual: opacity 40% per the repo-wide rule ("Disabled = opacity
 * 40% + неинтерактивен", `.cursorrules`) — overrides the literal 50% shown
 * in the Figma mockup, which predates this governance rule.
 *
 * Accessibility: native `<button role="switch">`, keyboard support (Enter /
 * Space) comes from the native button element, `focus-visible` ring, 44×44px
 * minimum interactive target (visual track stays 40×24 per Figma).
 */

const SWITCH_STYLE = `
${SWITCH_TOKEN_STYLE}
.ds-switch-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.ds-switch-root:disabled,
.ds-switch-root[aria-disabled="true"] {
  cursor: default;
}
.ds-switch-root:disabled {
  opacity: 0.4;
}
.ds-switch__visual {
  position: relative;
  width: 40px;
  height: 24px;
  flex-shrink: 0;
}
.ds-switch__track {
  position: absolute;
  top: 2px;
  left: 4px;
  width: 32px;
  height: 20px;
  border-radius: 999px;
  background-color: var(--ds-switch-unchecked);
  transition: background-color 0.15s ease;
  box-shadow: 0 0 0 0 var(--ds-switch-stroke);
}
.ds-switch-root[aria-checked="true"] .ds-switch__track {
  background-color: var(--ds-switch-checked);
}
.ds-switch-root[aria-busy="true"] .ds-switch__track {
  background-color: var(--ds-switch-unchecked);
}
@media (hover: hover) {
  .ds-switch-root:not(:disabled):not([aria-disabled="true"]):hover .ds-switch__track {
    box-shadow: 0 0 0 2px var(--ds-switch-stroke);
  }
}
.ds-switch-root:focus-visible .ds-switch__track {
  box-shadow: 0 0 0 2px var(--ds-switch-stroke);
  outline: none;
}
.ds-switch__knob {
  position: absolute;
  top: 4px;
  left: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--ds-switch-key);
  transform: translateX(0);
  transition: transform 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ds-switch-root[aria-checked="true"] .ds-switch__knob {
  transform: translateX(12px);
}
.ds-switch__loader {
  width: 12px;
  height: 12px;
  color: var(--ds-switch-checked);
  animation: ds-switch-spin 0.8s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .ds-switch__track,
  .ds-switch__knob {
    transition-duration: 0.01ms;
  }
  .ds-switch__loader {
    animation-duration: 1.6s;
  }
}
@keyframes ds-switch-spin {
  to {
    transform: rotate(360deg);
  }
}
`;

function SwitchLoaderIcon() {
  return (
    <svg
      className="ds-switch__loader"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.3749 2.78133C7.68709 2.27382 6.85478 2 6 2V0C7.28217 0 8.53063 0.410734 9.56235 1.17199C10.5941 1.93325 11.3548 3.00499 11.733 4.23011C12.1112 5.45523 12.087 6.76929 11.664 7.97966C11.241 9.19003 10.4413 10.2331 9.38227 10.9558C8.32323 11.6786 7.06051 12.0431 5.77921 11.9959C4.4979 11.9488 3.26541 11.4924 2.2624 10.6936C1.25939 9.89494 0.538615 8.79593 0.205737 7.55772C-0.127141 6.31952 -0.0546155 5.00724 0.412682 3.81325L2.27512 4.54217C1.96359 5.33816 1.91524 6.21301 2.13716 7.03848C2.35908 7.86395 2.83959 8.59663 3.50827 9.1291C4.17694 9.66157 4.9986 9.96584 5.85281 9.99729C6.70701 10.0287 7.54882 9.78574 8.25485 9.30389C8.96087 8.82204 9.49397 8.12669 9.776 7.31977C10.058 6.51286 10.0742 5.63682 9.82201 4.82007C9.56987 4.00333 9.06272 3.28883 8.3749 2.78133Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface SwitchProps {
  /** Controlled checked value. */
  checked: boolean;
  /** Called with the next checked value when the user toggles the switch. */
  onChange?: (checked: boolean) => void;
  /** Hard-disabled: not interactive, opacity 40%. */
  isDisabled?: boolean;
  /** Transitional busy state (e.g. pending server confirmation). Blocks toggling but stays focusable. */
  isLoading?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Switch({
  checked,
  onChange,
  isDisabled = false,
  isLoading = false,
  id,
  name,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: SwitchProps) {
  const isInteractive = !isDisabled && !isLoading;

  return (
    <>
      <style>{SWITCH_STYLE}</style>
      <button
        type="button"
        role="switch"
        id={id}
        name={name}
        className={className ? `ds-switch-root ${className}` : 'ds-switch-root'}
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-busy={isLoading || undefined}
        aria-disabled={isLoading && !isDisabled ? true : undefined}
        disabled={isDisabled}
        onClick={() => {
          if (!isInteractive) {
            return;
          }
          onChange?.(!checked);
        }}
        onKeyDown={(event) => {
          // Defensive fallback: native <button> already toggles on Enter/Space
          // via the browser's default action on trusted key events. Handled
          // explicitly too, matching WAI-ARIA switch authoring practices.
          if (!isInteractive) {
            return;
          }
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            onChange?.(!checked);
          }
        }}
      >
        <span className="ds-switch__visual" data-node-id="9872:15">
          <span className="ds-switch__track" />
          <span className="ds-switch__knob">{isLoading && <SwitchLoaderIcon />}</span>
        </span>
      </button>
    </>
  );
}
