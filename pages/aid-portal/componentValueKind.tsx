/**
 * Shared value-kind marking for component review pages.
 *
 * Palette matches the Anatomy Inspector chips (`AnatomyInspector.tsx`) so a
 * token reference and a raw/exception value read the same way everywhere on
 * the page.
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
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
}
.ds-vkind--semantic-token {
  background: #e8f5e9;
  color: #2e7d32;
}
.ds-vkind--platform-convention {
  background: #e3f2fd;
  color: #1565c0;
}
.ds-vkind--raw-value {
  background: #fff3e0;
  color: #e65100;
}
.ds-vkind--hardcode {
  background: #ffebee;
  color: #c62828;
}
`;

export function ValueKindChip({ kind }: { kind: ComponentValueKind }) {
  return <span className={`ds-vkind ds-vkind--${kind}`}>{VALUE_KIND_LABEL[kind]}</span>;
}
