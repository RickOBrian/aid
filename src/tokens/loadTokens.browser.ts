import {
  parseLegacyEntries,
  parseTokenEntries,
} from './validateStandardToken';
import type {
  LoadedToken,
  TokenBundle,
  TokenSource,
  UiKitId,
} from './types';

const SUPPORTED_UI_KITS: UiKitId[] = ['ui-kit-a', 'ui-kit-b', 'sutochno'];

const coreGlob = import.meta.glob('../../tokens/*/core/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown[]>;

const semanticGlob = import.meta.glob('../../tokens/*/semantic/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown[]>;

const legacyGlob = import.meta.glob('../../tokens/*/legacy/legacy-tokens.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown[]>;

function kitFromPath(path: string): UiKitId | null {
  const match = path.match(/tokens\/([^/]+)\//);
  if (!match) return null;
  const id = match[1];
  return SUPPORTED_UI_KITS.includes(id as UiKitId) ? (id as UiKitId) : null;
}

function toLoadedToken(
  entry: {
    name: string;
    value: string;
    valueDark?: string;
    reference?: string;
    status?: string;
    refactorNeeded?: boolean;
    deviation?: string;
  },
  source: TokenSource,
): LoadedToken {
  return {
    name: entry.name,
    value: entry.value,
    valueDark: entry.valueDark,
    source,
    reference: entry.reference,
    status: entry.status,
    refactorNeeded: entry.refactorNeeded,
    deviation: entry.deviation,
  };
}

function buildCssVariables(tokens: LoadedToken[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const token of tokens) {
    vars[`--${token.name}`] = token.value;
  }
  return vars;
}

function collectLayer(
  glob: Record<string, unknown[]>,
  uiKitId: UiKitId,
  layer: 'core' | 'semantic',
  tokens: LoadedToken[],
  validationWarnings: string[],
): void {
  for (const [path, data] of Object.entries(glob)) {
    const kit = kitFromPath(path);
    if (kit !== uiKitId || !path.includes(`/${layer}/`)) continue;
    const { tokens: parsed, warnings } = parseTokenEntries(data, layer);
    validationWarnings.push(...warnings);
    tokens.push(...parsed.map((entry) => toLoadedToken(entry, layer)));
  }
}

function collectLegacy(
  uiKitId: UiKitId,
  tokens: LoadedToken[],
): void {
  for (const [path, data] of Object.entries(legacyGlob)) {
    const kit = kitFromPath(path);
    if (kit !== uiKitId) continue;
    const legacy = parseLegacyEntries(data);
    tokens.push(...legacy.map((entry) => toLoadedToken(entry, 'legacy')));
  }
}

/** Browser / Vite entry — используется в Storybook preview decorator. */
export function loadTokens(uiKitId: string): TokenBundle {
  if (!SUPPORTED_UI_KITS.includes(uiKitId as UiKitId)) {
    throw new Error(`Unknown uiKitId: ${uiKitId}`);
  }

  const kitId = uiKitId as UiKitId;
  const tokens: LoadedToken[] = [];
  const validationWarnings: string[] = [];

  collectLayer(coreGlob, kitId, 'core', tokens, validationWarnings);
  collectLayer(semanticGlob, kitId, 'semantic', tokens, validationWarnings);
  collectLegacy(kitId, tokens);

  const byName: Record<string, LoadedToken> = {};
  for (const token of tokens) {
    byName[token.name] = token;
  }

  return {
    uiKitId: kitId,
    tokens,
    byName,
    cssVariables: buildCssVariables(tokens),
    validationWarnings,
  };
}

export { SUPPORTED_UI_KITS };
