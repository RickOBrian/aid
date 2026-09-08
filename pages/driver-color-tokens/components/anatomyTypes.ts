export type AnatomyValueKind =
  | 'semantic-token'
  | 'platform-convention'
  | 'raw-value'
  | 'hardcode';

export interface AnatomyProperty {
  property: string;
  kind: AnatomyValueKind;
  /** Semantic token path or CSS custom property name when kind is semantic-token. */
  tokenRef?: string;
  /** Static description when value is not mode-dependent. */
  staticValue?: string;
  /** File path or symbol where the value is authored. */
  source?: string;
  note?: string;
}

export interface AnatomyZone {
  id: string;
  order: number;
  label: string;
  /** CSS selector scoped to the anatomy stage root. */
  targetSelector: string;
  summary?: string;
  properties: AnatomyProperty[];
}

export interface AnatomySchema {
  componentId: string;
  zones: AnatomyZone[];
}

export type DriverColorMode = 'day' | 'night';

export interface ResolvedAnatomyProperty extends AnatomyProperty {
  resolvedValue: string;
}
