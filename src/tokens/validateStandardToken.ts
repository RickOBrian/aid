import type { RawTokenEntry, TokenSource } from './types';

/** Дефисная нотация DS: lowercase, цифры, дефисы; без точек и слэшей. */
const STANDARD_TOKEN_NAME = /^[a-z][a-z0-9-]*$/;

export function isStandardTokenName(name: string): boolean {
  return STANDARD_TOKEN_NAME.test(name);
}

export function validateStandardToken(
  name: string,
  source: Exclude<TokenSource, 'legacy'>,
): string | null {
  if (!name.trim()) {
    return `${source}: пустое имя токена`;
  }
  if (!isStandardTokenName(name)) {
    return `${source} «${name}»: имя не соответствует дефисной нотации`;
  }
  return null;
}

export function parseTokenEntries(
  entries: unknown,
  source: Exclude<TokenSource, 'legacy'>,
): { tokens: RawTokenEntry[]; warnings: string[] } {
  if (!Array.isArray(entries)) {
    return { tokens: [], warnings: [`${source}: ожидался JSON-массив`] };
  }

  const tokens: RawTokenEntry[] = [];
  const warnings: string[] = [];

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    const name = String(row.name ?? '').trim();
    const value = String(row.value ?? '').trim();
    if (!name || !value) continue;

    const warning = validateStandardToken(name, source);
    if (warning) warnings.push(warning);

    tokens.push({
      name,
      value,
      reference: row.reference != null ? String(row.reference) : undefined,
    });
  }

  return { tokens, warnings };
}

export function parseLegacyEntries(entries: unknown): RawTokenEntry[] {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      return {
        name: String(row.name ?? '').trim(),
        value: String(row.value ?? '').trim(),
        valueDark: row.valueDark != null ? String(row.valueDark).trim() : undefined,
        status: row.status != null ? String(row.status) : 'legacy',
        refactorNeeded: Boolean(row.refactorNeeded),
        deviation: row.deviation != null ? String(row.deviation) : '',
      };
    })
    .filter((entry) => entry.name && entry.value);
}
