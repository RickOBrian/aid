import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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

function tokensRoot(): string {
  return join(process.cwd(), 'tokens');
}

function readJsonFile(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function readLayerJsonFiles(uiKitId: UiKitId, layer: 'core' | 'semantic'): unknown[] {
  const dir = join(tokensRoot(), uiKitId, layer);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJsonFile(join(dir, file)))
    .filter((data) => data != null);
}

function readLegacyFile(uiKitId: UiKitId): unknown {
  const path = join(tokensRoot(), uiKitId, 'legacy', 'legacy-tokens.json');
  if (!existsSync(path)) return null;
  return readJsonFile(path);
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

/** Node / build entry — читает JSON с диска. */
export function loadTokens(uiKitId: string): TokenBundle {
  if (!SUPPORTED_UI_KITS.includes(uiKitId as UiKitId)) {
    throw new Error(`Unknown uiKitId: ${uiKitId}`);
  }

  const kitId = uiKitId as UiKitId;
  const tokens: LoadedToken[] = [];
  const validationWarnings: string[] = [];

  for (const data of readLayerJsonFiles(kitId, 'core')) {
    const { tokens: parsed, warnings } = parseTokenEntries(data, 'core');
    validationWarnings.push(...warnings);
    tokens.push(...parsed.map((entry) => toLoadedToken(entry, 'core')));
  }

  for (const data of readLayerJsonFiles(kitId, 'semantic')) {
    const { tokens: parsed, warnings } = parseTokenEntries(data, 'semantic');
    validationWarnings.push(...warnings);
    tokens.push(...parsed.map((entry) => toLoadedToken(entry, 'semantic')));
  }

  const legacyData = readLegacyFile(kitId);
  if (legacyData != null) {
    const legacy = parseLegacyEntries(legacyData);
    tokens.push(...legacy.map((entry) => toLoadedToken(entry, 'legacy')));
  }

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
