export const REGISTRY_DECISIONS = [
  'mapped',
  'ignored',
  'hardcoded',
  'candidate',
  'value_fix_proposed',
] as const;

export type RegistryDecision = (typeof REGISTRY_DECISIONS)[number];

export type RegistryTokenCategory = 'colors' | 'typography';

/**
 * Входная запись от плагина. Помимо machine-полей (см. RegistryFileEntry)
 * содержит transient review-projection metadata — используется ТОЛЬКО для
 * рендера человекочитаемого GitHub PR body (см. pullRequestBody.ts).
 *
 * ВАЖНО: transient-поля НЕ должны попадать в RegistryFileEntry /
 * decisions-registry.json. Единственная точка, где это гарантируется —
 * buildProposedEntries в proposeDecision.ts, которая явно whitelist'ит
 * только machine-поля при записи в реестр.
 */
export interface ProposedEntryInput {
  signature: string;
  decision: RegistryDecision;
  category?: RegistryTokenCategory;
  targetVariableId?: string;
  targetVariableName?: string;
  targetStyleId?: string;
  targetStyleName?: string;
  mismatchedProperties?: string[];
  comment?: string;
  /** fileKey библиотеки, в которой выбран токен (плагин 1.4.0+). */
  targetLibraryFileKey?: string;

  // --- Transient review-projection metadata (PR body only) ---
  sourceProperty?: string;
  sourceBindingType?: string;
  sourceName?: string;
  sourceDisplayValue?: string;
  nodePath?: string;
  nodeName?: string;
  occurrenceCount?: number;
  targetCollectionName?: string;
  targetModeName?: string;
  targetDisplayValue?: string;
  proposedModeName?: string;
  currentLibraryValue?: string;
  proposedValue?: string;
  /** Название библиотеки — только для PR body. */
  targetLibraryName?: string;
}

export interface ProposeDecisionRequestBody {
  sharedSecret: string;
  proposedBy: string;
  entries: ProposedEntryInput[];
}

export interface RegistryFileEntry {
  signature: string;
  decision: RegistryDecision;
  category?: RegistryTokenCategory;
  targetVariableId?: string;
  targetVariableName?: string;
  targetStyleId?: string;
  targetStyleName?: string;
  mismatchedProperties?: string[];
  comment?: string;
  /** fileKey библиотеки, в которой выбран токен (плагин 1.4.0+). Нет — запись до 1.4.0. */
  targetLibraryFileKey?: string;
  proposedBy?: string;
  proposedAt?: string;
  status?: 'approved' | 'stale';
  approvedBy?: string;
  approvedAt?: string;
}

export interface RegistryFileContent {
  schemaVersion: string;
  registryVersion: number;
  updatedAt: string;
  entries: RegistryFileEntry[];
}

export interface RegistryFileOnGitHub extends RegistryFileContent {
  sha: string;
}

export interface RegistryConfig {
  owner: string;
  repo: string;
  path: string;
  reviewer: string;
}
