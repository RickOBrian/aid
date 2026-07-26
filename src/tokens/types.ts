export type UiKitId = 'ui-kit-a' | 'ui-kit-b' | 'sutochno';

export type TokenSource = 'core' | 'semantic' | 'legacy';

export interface LoadedToken {
  name: string;
  value: string;
  valueDark?: string;
  source: TokenSource;
  reference?: string;
  status?: string;
  refactorNeeded?: boolean;
  deviation?: string;
}

export interface TokenBundle {
  uiKitId: UiKitId;
  tokens: LoadedToken[];
  byName: Record<string, LoadedToken>;
  cssVariables: Record<string, string>;
  validationWarnings: string[];
}

export interface RawTokenEntry {
  name: string;
  value: string;
  reference?: string;
  status?: string;
  refactorNeeded?: boolean;
  deviation?: string;
}

export interface LegacyTokenEntry {
  name: string;
  value: string;
  valueDark?: string;
  status: 'legacy';
  refactorNeeded: boolean;
  deviation: string;
}
