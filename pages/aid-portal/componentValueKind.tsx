/**
 * Shared value-kind marking for component review pages.
 *
 * Persefona `Badge` Success / Info / Warning / Error (presentbook-6 §1.2); the
 * Anatomy Inspector chips (`AnatomyInspector.tsx`) use the same tones so a
 * token reference and a raw/exception value read the same way everywhere.
 */

export type ComponentValueKind =
  | 'semantic-token'
  | 'platform-convention'
  | 'raw-value'
  | 'hardcode';

const VALUE_KIND_LABEL: Record<ComponentValueKind, string> = {
  'semantic-token': 'Semantic token',
  'platform-convention': 'Platform convention',
  'raw-value': 'Raw / geometry',
  hardcode: 'Hardcode',
};

export const COMPONENT_VALUE_KIND_STYLE = `
.ds-vkind {
  display: inline-block;
  padding: var(--pf-spacing-4) var(--pf-spacing-8);
  border-radius: var(--pf-radius-pill);
  font: var(--pf-font-label-s);
  white-space: nowrap;
}
.ds-vkind--semantic-token {
  background: var(--pf-bg-accent-status-success-main);
  color: var(--pf-text-success);
}
.ds-vkind--platform-convention {
  background: var(--pf-bg-accent-status-info-main);
  color: var(--pf-text-info);
}
.ds-vkind--raw-value {
  background: var(--pf-bg-accent-status-warning-main);
  color: var(--pf-text-warning);
}
.ds-vkind--hardcode {
  background: var(--pf-bg-accent-status-error-main);
  color: var(--pf-text-error);
}
`;

export function ValueKindChip({ kind }: { kind: ComponentValueKind }) {
  return <span className={`ds-vkind ds-vkind--${kind}`}>{VALUE_KIND_LABEL[kind]}</span>;
}
