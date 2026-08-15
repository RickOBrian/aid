export interface SpacingToken {
  id: string;
  name: string;
  valuePx: number;
  valuePxLabel: string;
  valueRemLabel: string;
}

export const spacingCollection = {
  collectionName: 'spacing-sem',
  artifact: 'Spacing/Semantic',
} as const;

/** Spacing tokens — значения из Figma (space table, base 16px). */
export const spacingTokens: SpacingToken[] = [
  { id: 'space-0', name: 'space-0', valuePx: 0, valuePxLabel: '0', valueRemLabel: '0' },
  { id: 'space-2', name: 'space-2', valuePx: 2, valuePxLabel: '2', valueRemLabel: '0.125' },
  { id: 'space-4', name: 'space-4', valuePx: 4, valuePxLabel: '4', valueRemLabel: '0.25' },
  { id: 'space-6', name: 'space-6', valuePx: 6, valuePxLabel: '6', valueRemLabel: '0.375' },
  { id: 'space-8', name: 'space-8', valuePx: 8, valuePxLabel: '8', valueRemLabel: '0.5' },
  { id: 'space-10', name: 'space-10', valuePx: 10, valuePxLabel: '10', valueRemLabel: '0.625' },
  { id: 'space-12', name: 'space-12', valuePx: 12, valuePxLabel: '12', valueRemLabel: '0.75' },
  { id: 'space-16', name: 'space-16', valuePx: 16, valuePxLabel: '16', valueRemLabel: '1' },
  { id: 'space-20', name: 'space-20', valuePx: 20, valuePxLabel: '20', valueRemLabel: '1.25' },
  { id: 'space-24', name: 'space-24', valuePx: 24, valuePxLabel: '24', valueRemLabel: '1.5' },
  { id: 'space-32', name: 'space-32', valuePx: 32, valuePxLabel: '32', valueRemLabel: '2' },
  { id: 'space-40', name: 'space-40', valuePx: 40, valuePxLabel: '40', valueRemLabel: '2.5' },
  { id: 'space-48', name: 'space-48', valuePx: 48, valuePxLabel: '48', valueRemLabel: '3' },
  { id: 'space-64', name: 'space-64', valuePx: 64, valuePxLabel: '64', valueRemLabel: '4' },
  { id: 'space-80', name: 'space-80', valuePx: 80, valuePxLabel: '80', valueRemLabel: '5' },
  { id: 'space-96', name: 'space-96', valuePx: 96, valuePxLabel: '96', valueRemLabel: '6' },
  { id: 'space-128', name: 'space-128', valuePx: 128, valuePxLabel: '128', valueRemLabel: '8' },
];

export function spacingPreviewHeight(token: SpacingToken): string {
  return `${token.valuePx}px`;
}
